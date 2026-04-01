<script setup lang="ts">
import './registerEcharts'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { DataTableColumns } from 'naive-ui'
import VChart from 'vue-echarts'
import { useStatsFundStore } from '@/stores/stats/fund'
import { useProcessProgressStore } from '@/stores/process/progress'
import KpiCard from './components/KpiCard.vue'
import ScreenPanel from './components/ScreenPanel.vue'
import DetailDialog from './components/DetailDialog.vue'

const fundStore = useStatsFundStore()
const progressStore = useProcessProgressStore()

const { rows: fundRows } = storeToRefs(fundStore)
const { rows: progressRows } = storeToRefs(progressStore)

const fundTotal = computed(() => fundRows.value.reduce((s, r) => s + r.amount, 0))
const fundInTotal = computed(() => fundRows.value.filter((r) => r.amount >= 0).reduce((s, r) => s + r.amount, 0))
const fundOutTotal = computed(() =>
  Math.abs(fundRows.value.filter((r) => r.amount < 0).reduce((s, r) => s + r.amount, 0)),
)

const progressAvg = computed(() => {
  const rows = progressRows.value
  if (!rows.length) return 0
  return Math.round(rows.reduce((s, r) => s + r.percent, 0) / rows.length)
})

const progressTopRows = computed(() =>
  [...progressRows.value].sort((a, b) => b.percent - a.percent).slice(0, 10),
)

const fundByCategory = computed(() => {
  const cats = new Map<string, { in: number; out: number }>()
  for (const r of fundRows.value) {
    const cur = cats.get(r.category) ?? { in: 0, out: 0 }
    if (r.amount >= 0) cur.in += r.amount
    else cur.out += Math.abs(r.amount)
    cats.set(r.category, cur)
  }
  return [...cats.entries()].map(([name, v]) => ({ name, ...v }))
})

const fundByProject = computed(() => {
  const m = new Map<string, number>()
  for (const r of fundRows.value) {
    m.set(r.projectName, (m.get(r.projectName) ?? 0) + r.amount)
  }
  return [...m.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 12)
})

const fundByMonth = computed(() => {
  const m = new Map<string, number>()
  for (const r of fundRows.value) {
    const mo = r.happenDate.slice(0, 7)
    m.set(mo, (m.get(mo) ?? 0) + r.amount)
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})

const anim = { animationDuration: 1100, animationEasing: 'cubicOut' as const }

const optFundStack = computed(() => {
  const rows = fundByCategory.value
  return {
    ...anim,
    color: ['#34d399', '#f87171'],
    tooltip: { trigger: 'axis', textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
    legend: { data: ['收入', '支出'], textStyle: { color: '#94a3b8', fontSize: 11 }, top: 0 },
    grid: { left: '2%', right: '2%', bottom: '2%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: rows.map((r) => (r.name.length > 6 ? `${r.name.slice(0, 5)}…` : r.name)),
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 20 },
    },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } } },
    series: [
      { name: '收入', type: 'bar', stack: 'total', data: rows.map((r) => r.in), itemStyle: { borderRadius: [0, 0, 0, 0] } },
      { name: '支出', type: 'bar', stack: 'total', data: rows.map((r) => r.out), itemStyle: { borderRadius: [4, 4, 0, 0] } },
    ],
  }
})

const optProgressBar = computed(() => {
  const rows = progressTopRows.value
  return {
    ...anim,
    color: ['#34d399'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
    grid: { left: '2%', right: '8%', bottom: '2%', top: '2%', containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } } },
    yAxis: {
      type: 'category',
      data: rows.map((r) => (r.projectName.length > 14 ? `${r.projectName.slice(0, 13)}…` : r.projectName)),
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
    series: [{ type: 'bar', data: rows.map((r) => r.percent), itemStyle: { borderRadius: [0, 4, 4, 0] } }],
  }
})

const optGauge = computed(() => ({
  ...anim,
  series: [
    {
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
      splitNumber: 10,
      radius: '88%',
      center: ['50%', '58%'],
      progress: { show: true, width: 10, itemStyle: { color: '#22d3ee' } },
      axisLine: { lineStyle: { width: 10, color: [[1, 'rgba(51,65,85,0.55)']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { color: '#94a3b8', distance: 12, fontSize: 10 },
      pointer: { show: true, length: '58%', width: 5, itemStyle: { color: '#fef9c3' } },
      anchor: { show: true, size: 12, itemStyle: { color: '#fef9c3' } },
      title: { show: true, offsetCenter: [0, '72%'], color: '#94a3b8', fontSize: 12 },
      detail: {
        valueAnimation: true,
        fontSize: 22,
        fontWeight: 700,
        color: '#fef9c3',
        offsetCenter: [0, '38%'],
        formatter: '{value}%',
      },
      data: [{ value: progressAvg.value, name: '项目平均进度' }],
    },
  ],
}))

const optFundProjectBar = computed(() => {
  const rows = fundByProject.value
  return {
    ...anim,
    color: ['#a78bfa'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
    grid: { left: '2%', right: '8%', bottom: '2%', top: '2%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } } },
    yAxis: {
      type: 'category',
      data: rows.map((r) => (r.name.length > 12 ? `${r.name.slice(0, 11)}…` : r.name)),
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
    series: [{ name: '净额', type: 'bar', data: rows.map((r) => r.value), itemStyle: { borderRadius: [0, 4, 4, 0] } }],
  }
})

const optFundMonthLine = computed(() => ({
  ...anim,
  color: ['#fbbf24'],
  tooltip: { trigger: 'axis', textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
  grid: { left: '2%', right: '2%', bottom: '2%', top: '12%', containLabel: true },
  xAxis: {
    type: 'category',
    data: fundByMonth.value.map(([d]) => d),
    axisLabel: { color: '#94a3b8', fontSize: 10 },
    axisLine: { lineStyle: { color: 'rgba(148,163,184,0.35)' } },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#94a3b8', fontSize: 10 },
    splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } },
  },
  series: [
    {
      name: '月度净额',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(251,191,36,0.35)' },
            { offset: 1, color: 'rgba(251,191,36,0.02)' },
          ],
        },
      },
      data: fundByMonth.value.map(([, v]) => Number(v.toFixed(0))),
    },
  ],
}))

const detailShow = ref(false)
const detailTitle = ref('')
const detailColumns = ref<DataTableColumns<Record<string, unknown>> | undefined>(undefined)
const detailData = ref<Record<string, unknown>[] | undefined>(undefined)

function openDetail(
  title: string,
  columns: DataTableColumns<Record<string, unknown>>,
  data: Record<string, unknown>[],
) {
  detailTitle.value = title
  detailColumns.value = columns
  detailData.value = data
  detailShow.value = true
}

function onFundStackClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const cat = idx >= 0 ? fundByCategory.value[idx] : undefined
  if (!cat) return
  const rows = fundRows.value.filter((r) => r.category === cat.name)
  openDetail(
    `资金流水 · 类别「${cat.name}」`,
    [
      { title: '项目', key: 'projectName', ellipsis: { tooltip: true } },
      { title: '金额', key: 'amount', width: 120 },
      { title: '日期', key: 'happenDate', width: 110 },
      { title: '凭证号', key: 'voucherNo', width: 120 },
    ],
    rows.map((r) => ({ ...r })) as Record<string, unknown>[],
  )
}

function onProgressBarClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const row = idx >= 0 ? progressTopRows.value[idx] : undefined
  if (!row) return
  openDetail(
    `项目进度 · ${row.projectName}`,
    [
      { title: '项目', key: 'projectName', ellipsis: { tooltip: true } },
      { title: '阶段', key: 'phase', width: 100 },
      { title: '完成度', key: 'percent', width: 90 },
      { title: '负责人', key: 'owner', width: 100 },
      { title: '里程碑', key: 'milestone', ellipsis: { tooltip: true } },
      { title: '更新', key: 'updateDate', width: 120 },
    ],
    [{ ...row }] as Record<string, unknown>[],
  )
}

function onGaugeClick() {
  const rows = [...progressRows.value].sort((a, b) => b.percent - a.percent)
  openDetail(
    '全部项目进度',
    [
      { title: '项目', key: 'projectName', ellipsis: { tooltip: true } },
      { title: '阶段', key: 'phase', width: 100 },
      { title: '完成度', key: 'percent', width: 90 },
      { title: '负责人', key: 'owner', width: 100 },
      { title: '更新', key: 'updateDate', width: 120 },
    ],
    rows.map((r) => ({ ...r })) as Record<string, unknown>[],
  )
}

function onFundProjectBarClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const row = idx >= 0 ? fundByProject.value[idx] : undefined
  if (!row) return
  const rows = fundRows.value.filter((r) => r.projectName === row.name)
  openDetail(
    `项目资金 · ${row.name}`,
    [
      { title: '类别', key: 'category', width: 100 },
      { title: '金额', key: 'amount', width: 120 },
      { title: '日期', key: 'happenDate', width: 110 },
      { title: '凭证号', key: 'voucherNo', width: 120 },
    ],
    rows.map((r) => ({ ...r })) as Record<string, unknown>[],
  )
}

function onFundMonthLineClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const pair = idx >= 0 ? fundByMonth.value[idx] : undefined
  if (!pair) return
  const [month] = pair
  const rows = fundRows.value.filter((r) => r.happenDate.startsWith(month))
  openDetail(
    `资金明细 · ${month}`,
    [
      { title: '项目', key: 'projectName', ellipsis: { tooltip: true } },
      { title: '类别', key: 'category', width: 100 },
      { title: '金额', key: 'amount', width: 110 },
      { title: '日期', key: 'happenDate', width: 110 },
    ],
    rows.map((r) => ({ ...r })) as Record<string, unknown>[],
  )
}
</script>

<template>
  <div class="fund-screen">
    <section class="fund-screen__kpis">
      <KpiCard variant="row" label="资金净额合计" :target="fundTotal" unit="元" :decimals="0" />
      <KpiCard variant="row" label="累计收入" :target="fundInTotal" unit="元" :decimals="0" />
      <KpiCard variant="row" label="累计支出" :target="fundOutTotal" unit="元" :decimals="0" />
      <KpiCard variant="row" label="项目平均进度" :target="progressAvg" unit="%" />
      <KpiCard variant="row" label="在管项目数" :target="progressRows.length" unit="个" />
      <KpiCard variant="row" label="资金流水笔数" :target="fundRows.length" unit="笔" />
    </section>

    <div class="fund-screen__cols">
      <aside class="fund-screen__col">
        <ScreenPanel variant="side" title="资金流向" hint="按类别收支堆叠">
          <div class="fund-screen__chart-wrap">
            <VChart class="fund-screen__chart" :option="optFundStack" autoresize @click="onFundStackClick" />
          </div>
        </ScreenPanel>
        <ScreenPanel variant="side" title="项目资金净额" hint="按项目">
          <div class="fund-screen__chart-wrap">
            <VChart class="fund-screen__chart" :option="optFundProjectBar" autoresize @click="onFundProjectBarClick" />
          </div>
        </ScreenPanel>
      </aside>

      <main class="fund-screen__col fund-screen__col--center">
        <ScreenPanel variant="center" title="月度资金净额" hint="按发生月汇总">
          <div class="fund-screen__chart-wrap fund-screen__chart-wrap--tall">
            <VChart class="fund-screen__chart" :option="optFundMonthLine" autoresize @click="onFundMonthLineClick" />
          </div>
        </ScreenPanel>
        <div class="fund-screen__bottom-row">
          <ScreenPanel variant="center" title="综合进度" hint="全部项目均值">
            <div class="fund-screen__chart-wrap fund-screen__chart-wrap--gauge">
              <VChart class="fund-screen__chart" :option="optGauge" autoresize @click="onGaugeClick" />
            </div>
          </ScreenPanel>
          <ScreenPanel variant="center" title="项目进度 TOP" hint="按完成度">
            <div class="fund-screen__chart-wrap">
              <VChart class="fund-screen__chart" :option="optProgressBar" autoresize @click="onProgressBarClick" />
            </div>
          </ScreenPanel>
        </div>
      </main>
    </div>

    <DetailDialog v-model:show="detailShow" :title="detailTitle" :columns="detailColumns" :data="detailData" />
  </div>
</template>

<style scoped>
.fund-screen {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.fund-screen__kpis {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.4rem;
}

@media (max-width: 96rem) {
  .fund-screen__kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.fund-screen__cols {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  gap: 0.45rem;
  align-items: stretch;
}

@media (max-width: 80rem) {
  .fund-screen__cols {
    grid-template-columns: 1fr;
  }
}

.fund-screen__col {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
  min-height: 0;
}

.fund-screen__col .screen-panel {
  flex: 1;
  min-height: 0;
}

.fund-screen__col--center > .screen-panel:first-child {
  flex: 1.1;
  min-height: 0;
}

.fund-screen__bottom-row {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 0.45rem;
}

@media (max-width: 52rem) {
  .fund-screen__bottom-row {
    grid-template-columns: 1fr;
  }
}

.fund-screen__bottom-row .screen-panel {
  min-height: 0;
}

.fund-screen__chart-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.fund-screen__chart-wrap--tall {
  flex: 1.1;
}

.fund-screen__chart-wrap--gauge {
  min-height: 0;
}

.fund-screen__chart {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
