"""Cowork session scanner.

Cowork stores session transcripts on disk under
``~/Library/Application Support/Claude/local-agent-mode-sessions/<workspace>/<account>/local_<session>/audit.jsonl``.

The schema is *almost* identical to Claude Code's project JSONLs — same
``message.usage.{input_tokens, output_tokens, cache_creation_input_tokens,
cache_read_input_tokens}`` shape, same streaming-snapshot behavior keyed by
``message.id`` — but with two cosmetic differences:

1. Snake_case top-level keys: ``session_id``, ``parent_uuid``, ``parent_tool_use_id``
   instead of ``sessionId`` / ``parentUuid``.
2. Audit metadata: ``_audit_timestamp``, ``_audit_hmac`` extras on every record.

We normalize Cowork records into the upstream camelCase shape and feed them
through the existing ``parse_record`` so dedup, tool extraction, and DB insert
logic stay shared. Records are tagged ``source='cowork'`` for filtering.
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Iterator, Union

from .db import connect
from .scanner import (
    INSERT_MSG,
    INSERT_TOOL,
    parse_record,
    _evict_prior_snapshots,
)


def default_cowork_dir() -> Path:
    return (
        Path.home()
        / "Library"
        / "Application Support"
        / "Claude"
        / "local-agent-mode-sessions"
    )


# Cowork → Claude Code field rename map.
_RENAMES = {
    "session_id": "sessionId",
    "parent_uuid": "parentUuid",
    "is_sidechain": "isSidechain",
    "git_branch": "gitBranch",
    "claude_code_version": "version",
}


def normalize_record(rec: dict) -> dict:
    """Return a record reshaped to match Claude Code's top-level field names.

    Non-destructive — returns a shallow copy. Audit metadata (``_audit_*``) is
    left in place; ``parse_record`` ignores unknown fields.
    """
    if not isinstance(rec, dict):
        return rec
    out = dict(rec)
    for snake, camel in _RENAMES.items():
        if snake in out and camel not in out:
            out[camel] = out[snake]
    return out


def _project_slug(path: Path, root: Path) -> str:
    """Use the workspace UUID (top-level dir under root) as the project slug.

    Cowork groups related sessions under a workspace ID. That maps cleanly to
    a "project" in the dashboard. Sessions within the workspace share the slug.
    """
    rel = path.relative_to(root)
    if not rel.parts:
        return "cowork"
    return f"cowork:{rel.parts[0]}"


def iter_audit_jsonls(root: Path) -> Iterator[Path]:
    """Yield every ``audit.jsonl`` under the Cowork sessions tree."""
    if not root.is_dir():
        return
    for p in root.rglob("audit.jsonl"):
        if p.is_file():
            yield p


def scan_file(path: Path, project_slug: str, conn, start_byte: int = 0) -> dict:
    """Cowork-aware variant of scanner.scan_file with field normalization."""
    msgs = tools = 0
    end_offset = start_byte
    with open(path, "rb") as fb:
        if start_byte:
            fb.seek(start_byte)
        while True:
            raw = fb.readline()
            if not raw:
                break
            if not raw.endswith(b"\n"):
                # Partial line — Cowork is mid-flush, retry next scan.
                break
            line_end = fb.tell()
            try:
                line = raw.decode("utf-8", errors="replace").strip()
            except Exception:
                end_offset = line_end
                continue
            if not line:
                end_offset = line_end
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                end_offset = line_end
                continue
            if not isinstance(rec, dict) or "type" not in rec:
                end_offset = line_end
                continue
            # Skip Cowork-only event types that aren't user/assistant turns.
            if rec.get("type") in {"rate_limit_event", "attachment", "queue-operation", "ai-title", "system"}:
                end_offset = line_end
                continue
            # Cowork sometimes omits "uuid" on system events; require it on real turns.
            if "uuid" not in rec:
                end_offset = line_end
                continue
            normalized = normalize_record(rec)
            msg, tlist = parse_record(normalized, project_slug)
            if not msg["session_id"] or not msg["timestamp"]:
                end_offset = line_end
                continue
            msg["source"] = "cowork"
            for t in tlist:
                t["source"] = "cowork"
            if msg["message_id"]:
                _evict_prior_snapshots(conn, msg["session_id"], msg["message_id"], msg["uuid"])
            conn.execute(INSERT_MSG, msg)
            conn.execute("DELETE FROM tool_calls WHERE message_uuid=?", (msg["uuid"],))
            for t in tlist:
                conn.execute(INSERT_TOOL, t)
                tools += 1
            msgs += 1
            end_offset = line_end
    return {"messages": msgs, "tools": tools, "end_offset": end_offset}


def scan_dir(cowork_root: Union[str, Path], db_path: Union[str, Path]) -> dict:
    root = Path(cowork_root)
    totals = {"messages": 0, "tools": 0, "files": 0}
    if not root.is_dir():
        return totals
    with connect(db_path) as conn:
        for p in iter_audit_jsonls(root):
            try:
                stat = p.stat()
            except OSError:
                continue
            row = conn.execute(
                "SELECT mtime, bytes_read FROM files WHERE path=?", (str(p),)
            ).fetchone()
            offset = 0
            if row and row["mtime"] == stat.st_mtime and row["bytes_read"] == stat.st_size:
                continue
            if row and stat.st_size > row["bytes_read"]:
                offset = row["bytes_read"]
            slug = _project_slug(p.parent, root)
            sub = scan_file(p, slug, conn, start_byte=offset)
            conn.execute(
                "INSERT OR REPLACE INTO files (path, mtime, bytes_read, scanned_at) VALUES (?, ?, ?, ?)",
                (str(p), stat.st_mtime, sub["end_offset"], time.time()),
            )
            totals["messages"] += sub["messages"]
            totals["tools"]    += sub["tools"]
            totals["files"]    += 1
        conn.commit()
    return totals
