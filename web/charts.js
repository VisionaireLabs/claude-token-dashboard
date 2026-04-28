// charts.js — themed ECharts wrappers (Visionaire / Impeccable theme)
//
// Restrained palette: tinted-neutral grayscale ramp from --text down through
// --text-faint. Series differentiated by position and weight, never hue.

const PALETTE = [
  '#2D2A24',  // text (oklch 18% 0.008 80, sRGB approx)
  '#615C53',  // mid 1
  '#8B847A',  // muted (oklch 45%)
  '#B5AEA3',  // mid 2
  '#D4CFC7',  // faint (oklch 65%)
  '#E5E1D9',  // border-strong
  '#EFECE5',  // border
];

const BG          = '#FCFBF8';   // --bg          (oklch 99%)
const SURFACE     = '#F8F6F1';   // --surface     (oklch 97%)
const BORDER      = '#EFECE5';   // --border      (oklch 92%)
const BORDER_HARD = '#E0DCD3';   // --border-strong (oklch 86%)
const TEXT        = '#2D2A24';   // --text
const TEXT_MUTED  = '#8B847A';   // --text-muted
const TEXT_FAINT  = '#B5AEA3';   // --text-faint

const FONT_SANS = 'Inter, system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

const BASE = {
  textStyle: { color: TEXT, fontFamily: FONT_SANS, fontSize: 11 },
  color: PALETTE,
  grid: { left: 8, right: 8, top: 24, bottom: 24, containLabel: true },
};

const X_AXIS = {
  axisLine:  { lineStyle: { color: BORDER_HARD } },
  axisLabel: { color: TEXT_MUTED, fontFamily: FONT_MONO, fontSize: 10 },
  axisTick:  { show: false },
};

const Y_AXIS = {
  axisLine:  { show: false },
  axisTick:  { show: false },
  splitLine: { lineStyle: { color: BORDER, type: 'solid' } },
  axisLabel: { color: TEXT_FAINT, fontFamily: FONT_MONO, fontSize: 10 },
};

const TOOLTIP = {
  trigger: 'axis',
  backgroundColor: BG,
  borderColor: BORDER_HARD,
  borderWidth: 1,
  padding: [10, 14],
  textStyle: { color: TEXT, fontFamily: FONT_SANS, fontSize: 12 },
  extraCssText: 'box-shadow: 0 4px 16px oklch(18% 0.008 80 / 0.06); border-radius: 3px;',
};

const LEGEND = {
  textStyle: { color: TEXT_MUTED, fontFamily: FONT_MONO, fontSize: 11 },
  top: 0, right: 0,
  icon: 'rect',
  itemWidth: 10, itemHeight: 2,
  itemGap: 14,
};

function mount(el) {
  const c = echarts.init(el, null, { renderer: 'svg' });
  window.addEventListener('resize', () => c.resize());
  return c;
}

export function lineChart(el, { x, series }) {
  const c = mount(el);
  c.setOption({
    ...BASE,
    tooltip: TOOLTIP,
    legend: LEGEND,
    xAxis: { ...X_AXIS, type: 'category', data: x, boundaryGap: false },
    yAxis: { ...Y_AXIS, type: 'value' },
    series: series.map((s, i) => ({
      ...s,
      type: 'line',
      smooth: false,
      showSymbol: false,
      lineStyle: { width: i === 0 ? 1.75 : 1, color: PALETTE[i % PALETTE.length] },
      areaStyle: i === 0 ? { color: PALETTE[i], opacity: 0.06 } : undefined,
    })),
  });
  return c;
}

export function barChart(el, { categories, values, color }) {
  const c = mount(el);
  c.setOption({
    ...BASE,
    tooltip: { ...TOOLTIP, axisPointer: { type: 'shadow', shadowStyle: { color: SURFACE } } },
    xAxis: {
      ...X_AXIS, type: 'category', data: categories,
      axisLabel: { ...X_AXIS.axisLabel, interval: 0, rotate: categories.length > 5 ? 25 : 0 },
    },
    yAxis: { ...Y_AXIS, type: 'value' },
    series: [{
      type: 'bar', data: values,
      itemStyle: { color: color || TEXT, borderRadius: 0 },
      barMaxWidth: 28,
    }],
  });
  return c;
}

export function stackedBarChart(el, { categories, series, formatter }) {
  const c = mount(el);
  c.setOption({
    ...BASE,
    tooltip: {
      ...TOOLTIP,
      axisPointer: { type: 'shadow', shadowStyle: { color: SURFACE } },
      valueFormatter: formatter || (v => Number(v).toLocaleString()),
    },
    legend: LEGEND,
    xAxis: {
      ...X_AXIS, type: 'category', data: categories,
      axisLabel: { ...X_AXIS.axisLabel, interval: categories.length > 20 ? 'auto' : 0, rotate: categories.length > 12 ? 45 : 0 },
    },
    yAxis: { ...Y_AXIS, type: 'value' },
    series: series.map((s, i) => ({
      name: s.name,
      type: 'bar',
      stack: 'total',
      data: s.values,
      itemStyle: { color: s.color || PALETTE[i % PALETTE.length] },
      barMaxWidth: 24,
      emphasis: { focus: 'series' },
    })),
  });
  return c;
}

export function groupedBarChart(el, { categories, series, formatter }) {
  const c = mount(el);
  c.setOption({
    ...BASE,
    tooltip: {
      ...TOOLTIP,
      axisPointer: { type: 'shadow', shadowStyle: { color: SURFACE } },
      valueFormatter: formatter || (v => Number(v).toLocaleString()),
    },
    legend: LEGEND,
    xAxis: {
      ...X_AXIS, type: 'category', data: categories,
      axisLabel: { ...X_AXIS.axisLabel, interval: 0, rotate: categories.length > 5 ? 25 : 0 },
    },
    yAxis: { ...Y_AXIS, type: 'value' },
    series: series.map((s, i) => ({
      name: s.name,
      type: 'bar',
      data: s.values,
      itemStyle: { color: s.color || PALETTE[i % PALETTE.length], borderRadius: 0 },
      barMaxWidth: 24,
      emphasis: { focus: 'series' },
    })),
  });
  return c;
}

export function donutChart(el, data) {
  const c = mount(el);
  c.setOption({
    color: PALETTE,
    tooltip: {
      trigger: 'item',
      backgroundColor: BG, borderColor: BORDER_HARD, borderWidth: 1,
      textStyle: { color: TEXT, fontFamily: FONT_SANS, fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 16px oklch(18% 0.008 80 / 0.06); border-radius: 3px;',
      formatter: p => `${p.name}<br/><b>${Number(p.value).toLocaleString()}</b> tokens (${p.percent.toFixed(1)}%)`,
    },
    legend: {
      ...LEGEND,
      bottom: 0, top: 'auto', right: 'auto',
      type: 'scroll',
    },
    series: [{
      type: 'pie',
      center: ['50%', '44%'],
      radius: ['52%', '70%'],
      avoidLabelOverlap: true,
      padAngle: 0,
      itemStyle: { borderColor: BG, borderWidth: 2, borderRadius: 0 },
      label: {
        show: true,
        position: 'inside',
        color: BG,
        fontFamily: FONT_MONO,
        fontSize: 11,
        fontWeight: 500,
        formatter: ({ percent }) => percent >= 6 ? percent.toFixed(0) + '%' : '',
      },
      labelLine: { show: false },
      data,
    }],
  });
  return c;
}
