<script setup lang="ts">
import './registerEcharts'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import VChart from 'vue-echarts'
import { useBaseCowStore } from '@/stores/base/cow'
import { useBaseFarmerStore } from '@/stores/base/farmer'
import { useBaseRegionStore } from '@/stores/base/region'
import { useBreedingMilkStore } from '@/stores/breeding/milk'
import { useBreedingImmunityStore } from '@/stores/breeding/immunity'
import { useStatsFundStore } from '@/stores/stats/fund'
import { useProcessProgressStore } from '@/stores/process/progress'
import { useSystemLogStore } from '@/stores/system/log'
import { useProcessTaskStore } from '@/stores/process/task'
import KpiCard from './components/KpiCard.vue'
import ScreenPanel from './components/ScreenPanel.vue'
import ScrollBoard, { type ScrollItem } from './components/ScrollBoard.vue'

const cowStore = useBaseCowStore()
const farmerStore = useBaseFarmerStore()
const regionStore = useBaseRegionStore()
const milkStore = useBreedingMilkStore()
const immunityStore = useBreedingImmunityStore()
const fundStore = useStatsFundStore()
const progressStore = useProcessProgressStore()
const logStore = useSystemLogStore()
const taskStore = useProcessTaskStore()

const { cows } = storeToRefs(cowStore)
const { farmers } = storeToRefs(farmerStore)
const { tree } = storeToRefs(regionStore)
const { rows: milkRows } = storeToRefs(milkStore)
const { rows: immunityRows } = storeToRefs(immunityStore)
const { rows: fundRows } = storeToRefs(fundStore)
const { rows: progressRows } = storeToRefs(progressStore)
const { rows: logRows } = storeToRefs(logStore)
const { rows: taskRows } = storeToRefs(taskStore)

const townshipCount = computed(() => tree.value.length)
const villageCount = computed(() =>
  tree.value.reduce((n, t) => n + (t.children?.length ?? 0), 0),
)

const fundTotal = computed(() => fundRows.value.reduce((s, r) => s + r.amount, 0))

/** 数据集中最近一日的产奶合计（演示） */
const latestDayMilkKg = computed(() => {
  const rows = milkRows.value
  if (!rows.length) return 0
  const dates = [...new Set(rows.map((r) => r.recordDate))].sort()
  const last = dates[dates.length - 1]!
  return rows.filter((r) => r.recordDate === last).reduce((s, r) => s + r.dailyKg, 0)
})

const farmerTownshipMap = computed(() => {
  const m = new Map<string, number>()
  for (const f of farmers.value) {
    const t = f.townshipName || '未知'
    m.set(t, (m.get(t) ?? 0) + 1)
  }
  return m
})

const cowTownshipMap = computed(() => {
  const idToTown = new Map(farmers.value.map((f) => [f.id, f.townshipName]))
  const m = new Map<string, number>()
  for (const c of cows.value) {
    const t = idToTown.get(c.farmerId) ?? '未知'
    m.set(t, (m.get(t) ?? 0) + 1)
  }
  return m
})

const townshipKeysSorted = computed(() => {
  const keys = [...new Set([...cowTownshipMap.value.keys(), ...farmerTownshipMap.value.keys()])]
  keys.sort((a, b) => (cowTownshipMap.value.get(b) ?? 0) - (cowTownshipMap.value.get(a) ?? 0))
  return keys.slice(0, 12)
})

const breedAgg = computed(() => {
  const m = new Map<string, number>()
  for (const c of cows.value) {
    const b = c.breed || '其他'
    m.set(b, (m.get(b) ?? 0) + 1)
  }
  return [...m.entries()].map(([name, value]) => ({ name, value }))
})

const milkByDate = computed(() => {
  const m = new Map<string, number>()
  for (const r of milkRows.value) {
    m.set(r.recordDate, (m.get(r.recordDate) ?? 0) + r.dailyKg)
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})

const immunityByVaccine = computed(() => {
  const m = new Map<string, number>()
  for (const r of immunityRows.value) {
    const k = r.vaccineName.replace(/\s+/g, ' ').trim()
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return [...m.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
})

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

const progressAvg = computed(() => {
  const rows = progressRows.value
  if (!rows.length) return 0
  return Math.round(rows.reduce((s, r) => s + r.percent, 0) / rows.length)
})

const scrollItems = computed<ScrollItem[]>(() => {
  const logs = [...logRows.value]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 24)
    .map((r) => ({
      tag: '日志',
      text: `${r.module} · ${r.action}${r.operator ? `（${r.operator}）` : ''}`,
      meta: r.createdAt,
    }))
  const tasks = taskRows.value.slice(0, 20).map((t) => ({
    tag: '任务',
    text: `${t.title}`,
    meta: `${t.status} · ${t.dueDate}`,
  }))
  return [...logs, ...tasks]
})

const anim = { animationDuration: 1100, animationEasing: 'cubicOut' as const }

const chartPalette = ['#22d3ee', '#38bdf8', '#a78bfa', '#fbbf24', '#34d399', '#f472b6', '#94a3b8']

const optBreedRose = computed(() => ({
  ...anim,
  color: chartPalette,
  tooltip: { trigger: 'item', textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
  legend: { bottom: 0, textStyle: { color: '#94a3b8', fontSize: 11 } },
  series: [
    {
      name: '品种',
      type: 'pie',
      radius: [24, 92],
      center: ['50%', '44%'],
      roseType: 'area',
      itemStyle: { borderRadius: 6 },
      label: { color: '#cbd5e1' },
      data: breedAgg.value.map((d) => ({ name: d.name, value: d.value })),
    },
  ],
}))

const optMilkLine = computed(() => ({
  ...anim,
  color: ['#22d3ee'],
  tooltip: { trigger: 'axis', textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
  grid: { left: '2%', right: '2%', bottom: '2%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: milkByDate.value.map(([d]) => d.slice(5)),
    axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 35 },
    axisLine: { lineStyle: { color: 'rgba(148,163,184,0.35)' } },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#94a3b8', fontSize: 10 },
    splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } },
  },
  series: [
    {
      name: '日产奶(kg)',
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
            { offset: 0, color: 'rgba(34,211,238,0.45)' },
            { offset: 1, color: 'rgba(34,211,238,0.02)' },
          ],
        },
      },
      lineStyle: { width: 2 },
      data: milkByDate.value.map(([, v]) => Number(v.toFixed(1))),
    },
  ],
}))

const optImmunityBar = computed(() => ({
  ...anim,
  color: chartPalette,
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
  grid: { left: '2%', right: '8%', bottom: '2%', top: '2%', containLabel: true },
  xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } } },
  yAxis: {
    type: 'category',
    data: immunityByVaccine.value.map((d) => (d.name.length > 10 ? `${d.name.slice(0, 10)}…` : d.name)),
    axisLabel: { color: '#94a3b8', fontSize: 10 },
    axisLine: { show: false },
  },
  series: [{ type: 'bar', data: immunityByVaccine.value.map((d) => d.value), itemStyle: { borderRadius: [0, 4, 4, 0] } }],
}))

const optTownshipMain = computed(() => {
  const keys = townshipKeysSorted.value
  return {
    ...anim,
    color: ['#22d3ee', '#a78bfa'],
    tooltip: { trigger: 'axis', textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
    legend: { data: ['奶牛存栏', '养殖户'], textStyle: { color: '#94a3b8', fontSize: 11 }, top: 0 },
    grid: { left: '2%', right: '2%', bottom: '2%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: keys.map((k) => (k.length > 5 ? `${k.slice(0, 4)}…` : k)),
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 28 },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.35)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } },
    },
    series: [
      {
        name: '奶牛存栏',
        type: 'bar',
        barMaxWidth: 22,
        data: keys.map((k) => cowTownshipMap.value.get(k) ?? 0),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#22d3ee' },
              { offset: 1, color: 'rgba(34,211,238,0.15)' },
            ],
          },
        },
      },
      {
        name: '养殖户',
        type: 'bar',
        barMaxWidth: 22,
        data: keys.map((k) => farmerTownshipMap.value.get(k) ?? 0),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#a78bfa' },
              { offset: 1, color: 'rgba(167,139,250,0.15)' },
            ],
          },
        },
      },
    ],
  }
})

const optFarmerBar = computed(() => {
  const entries = [...farmerTownshipMap.value.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
  return {
    ...anim,
    color: ['#38bdf8'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
    grid: { left: '2%', right: '6%', bottom: '2%', top: '2%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } } },
    yAxis: {
      type: 'category',
      data: entries.map(([k]) => (k.length > 8 ? `${k.slice(0, 7)}…` : k)),
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
    series: [{ name: '户数', type: 'bar', data: entries.map(([, v]) => v), itemStyle: { borderRadius: [0, 4, 4, 0] } }],
  }
})

const optProgressBar = computed(() => {
  const rows = [...progressRows.value].sort((a, b) => b.percent - a.percent).slice(0, 8)
  return {
    ...anim,
    color: ['#34d399'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
    grid: { left: '2%', right: '8%', bottom: '2%', top: '2%', containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } } },
    yAxis: {
      type: 'category',
      data: rows.map((r) => (r.projectName.length > 12 ? `${r.projectName.slice(0, 11)}…` : r.projectName)),
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
    series: [{ type: 'bar', data: rows.map((r) => r.percent), itemStyle: { borderRadius: [0, 4, 4, 0] } }],
  }
})

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
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 22 },
    },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.45)' } } },
    series: [
      { name: '收入', type: 'bar', stack: 'total', data: rows.map((r) => r.in), itemStyle: { borderRadius: [0, 0, 0, 0] } },
      { name: '支出', type: 'bar', stack: 'total', data: rows.map((r) => r.out), itemStyle: { borderRadius: [4, 4, 0, 0] } },
    ],
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
</script>

<template>
  <div class="big-screen">
    <section class="big-screen__hero">
      <h1 class="big-screen__hero-title">养殖运营实时总览</h1>
      <p class="big-screen__hero-desc">关键指标 · 多源汇聚 · 演示数据与当前会话内数据一致</p>
    </section>

    <section class="big-screen__kpis">
      <KpiCard label="在档奶牛" :target="cows.length" unit="头" />
      <KpiCard label="登记养殖户" :target="farmers.length" unit="户" />
      <KpiCard label="覆盖乡镇" :target="townshipCount" unit="个" />
      <KpiCard label="覆盖行政村" :target="villageCount" unit="个" />
      <KpiCard
        label="日产奶量(最近统计日)"
        :target="latestDayMilkKg"
        unit="kg"
        :decimals="1"
        sub="按产奶记录最近日期汇总"
      />
      <KpiCard
        label="资金流水合计"
        :target="fundTotal"
        unit="元"
        :decimals="0"
        sub="收入与支出代数和"
      />
    </section>

    <div class="big-screen__cols">
      <aside class="big-screen__col big-screen__col--side">
        <ScreenPanel title="牛群品种分布" hint="南丁格尔玫瑰">
          <VChart class="big-screen__chart big-screen__chart--sm" :option="optBreedRose" autoresize />
        </ScreenPanel>
        <ScreenPanel title="产奶趋势" hint="按日汇总(kg)">
          <VChart class="big-screen__chart big-screen__chart--md" :option="optMilkLine" autoresize />
        </ScreenPanel>
        <ScreenPanel title="免疫剂次" hint="按疫苗名称">
          <VChart class="big-screen__chart big-screen__chart--md" :option="optImmunityBar" autoresize />
        </ScreenPanel>
      </aside>

      <main class="big-screen__col big-screen__col--center">
        <ScreenPanel title="乡镇养殖对比" hint="存栏与户数">
          <VChart class="big-screen__chart big-screen__chart--lg" :option="optTownshipMain" autoresize />
        </ScreenPanel>
        <div class="big-screen__center-row">
          <ScreenPanel class="big-screen__gauge-wrap" title="综合进度" hint="各项目百分比均值">
            <VChart class="big-screen__chart big-screen__chart--gauge" :option="optGauge" autoresize />
          </ScreenPanel>
          <ScreenPanel title="运行动态" hint="日志与任务">
            <ScrollBoard :items="scrollItems" />
          </ScreenPanel>
        </div>
      </main>

      <aside class="big-screen__col big-screen__col--side">
        <ScreenPanel title="养殖户分布" hint="按乡镇">
          <VChart class="big-screen__chart big-screen__chart--sm" :option="optFarmerBar" autoresize />
        </ScreenPanel>
        <ScreenPanel title="项目进度" hint="TOP 按完成度">
          <VChart class="big-screen__chart big-screen__chart--md" :option="optProgressBar" autoresize />
        </ScreenPanel>
        <ScreenPanel title="资金流向" hint="按类别收支堆叠">
          <VChart class="big-screen__chart big-screen__chart--md" :option="optFundStack" autoresize />
        </ScreenPanel>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.big-screen {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 110rem;
  margin: 0 auto;
  min-height: min-content;
}

.big-screen__hero {
  text-align: center;
  padding: 0.15rem 0 0.25rem;
}

.big-screen__hero-title {
  margin: 0;
  font-size: clamp(1.1rem, 2.4vw, 1.6rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  background: linear-gradient(90deg, #fef3c7, #22d3ee, #a5f3fc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.big-screen__hero-desc {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: rgba(226, 232, 240, 0.58);
  letter-spacing: 0.06em;
}

.big-screen__kpis {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.6rem;
}

@media (max-width: 96rem) {
  .big-screen__kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 52rem) {
  .big-screen__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.big-screen__cols {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2.1fr) minmax(0, 1fr);
  gap: 0.65rem;
  align-items: stretch;
}

@media (max-width: 90rem) {
  .big-screen__cols {
    grid-template-columns: 1fr;
  }
}

.big-screen__col {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 0;
}

.big-screen__col--center {
  min-height: 0;
}

.big-screen__center-row {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 0.65rem;
  align-items: stretch;
}

@media (max-width: 64rem) {
  .big-screen__center-row {
    grid-template-columns: 1fr;
  }
}

.big-screen__gauge-wrap {
  min-height: 14rem;
}

.big-screen__chart {
  width: 100%;
}

.big-screen__chart--sm {
  height: 15rem;
}

.big-screen__chart--md {
  height: 17rem;
}

.big-screen__chart--lg {
  height: 22rem;
}

.big-screen__chart--gauge {
  height: 13.5rem;
}
</style>
