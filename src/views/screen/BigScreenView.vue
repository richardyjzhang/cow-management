<script setup lang="ts">
import './registerEcharts'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { DataTableColumns } from 'naive-ui'
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
import DetailDialog, { type DetailSection } from './components/DetailDialog.vue'

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

const farmerBarEntries = computed(() =>
  [...farmerTownshipMap.value.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
)

const progressTopRows = computed(() =>
  [...progressRows.value].sort((a, b) => b.percent - a.percent).slice(0, 8),
)

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
  const entries = farmerBarEntries.value
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
  const rows = progressTopRows.value
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

/* --- 详情弹窗 --- */
const detailShow = ref(false)
const detailTitle = ref('')
const detailSections = ref<DetailSection[] | undefined>(undefined)
const detailColumns = ref<DataTableColumns<Record<string, unknown>> | undefined>(undefined)
const detailData = ref<Record<string, unknown>[] | undefined>(undefined)

function openDetail(payload: {
  title: string
  sections?: DetailSection[]
  columns?: DataTableColumns<Record<string, unknown>>
  data?: Record<string, unknown>[]
}) {
  detailTitle.value = payload.title
  detailSections.value = payload.sections
  detailColumns.value = payload.sections?.length ? undefined : payload.columns
  detailData.value = payload.sections?.length ? undefined : payload.data
  detailShow.value = true
}

function onBreedClick(e: any) {
  const name = e.name ?? e?.data?.name
  if (!name) return
  const list = cows.value.filter((c) => (c.breed || '其他') === name)
  const columns: DataTableColumns<Record<string, unknown>> = [
    { title: '耳标号', key: 'earTag', ellipsis: { tooltip: true } },
    { title: '品种', key: 'breed', width: 100 },
    { title: '性别', key: 'sex', width: 60 },
    { title: '月龄', key: 'ageMonths', width: 70 },
    { title: '养殖户', key: 'farmerName', ellipsis: { tooltip: true } },
  ]
  openDetail({
    title: `品种「${name}」奶牛明细`,
    columns,
    data: list.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}

function onMilkLineClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const pair = idx >= 0 ? milkByDate.value[idx] : undefined
  if (!pair) return
  const [dateStr] = pair
  const rows = milkRows.value.filter((r) => r.recordDate === dateStr)
  const columns: DataTableColumns<Record<string, unknown>> = [
    { title: '耳标号', key: 'earTag', ellipsis: { tooltip: true } },
    { title: '日产奶(kg)', key: 'dailyKg', width: 110 },
    { title: '泌乳阶段', key: 'period', width: 110 },
    { title: '日期', key: 'recordDate', width: 120 },
  ]
  openDetail({
    title: `产奶明细 · ${dateStr}`,
    columns,
    data: rows.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}

function onImmunityBarClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const item = idx >= 0 ? immunityByVaccine.value[idx] : undefined
  if (!item) return
  const vaccine = item.name
  const rows = immunityRows.value.filter((r) => r.vaccineName.replace(/\s+/g, ' ').trim() === vaccine)
  const columns: DataTableColumns<Record<string, unknown>> = [
    { title: '耳标号', key: 'earTag', ellipsis: { tooltip: true } },
    { title: '疫苗', key: 'vaccineName', ellipsis: { tooltip: true } },
    { title: '批次', key: 'batchNo', width: 110 },
    { title: '注射日', key: 'injectDate', width: 110 },
    { title: '下次', key: 'nextDate', width: 110 },
  ]
  openDetail({
    title: `免疫记录 · ${vaccine}`,
    columns,
    data: rows.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}

function onTownshipMainClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const keys = townshipKeysSorted.value
  const township = idx >= 0 ? keys[idx] : undefined
  if (!township) return
  const farmersIn = farmers.value.filter((f) => f.townshipName === township)
  const cowsIn = cows.value.filter((c) => farmersIn.some((f) => f.id === c.farmerId))
  const farmerCols: DataTableColumns<Record<string, unknown>> = [
    { title: '户主', key: 'headName', width: 100 },
    { title: '行政村', key: 'villageName', width: 100 },
    { title: '电话', key: 'phone', width: 140 },
    { title: '劳动力', key: 'laborForce', width: 80 },
  ]
  const cowCols: DataTableColumns<Record<string, unknown>> = [
    { title: '耳标号', key: 'earTag', ellipsis: { tooltip: true } },
    { title: '品种', key: 'breed', width: 100 },
    { title: '养殖户', key: 'farmerName', ellipsis: { tooltip: true } },
  ]
  openDetail({
    title: `乡镇「${township}」`,
    sections: [
      {
        subtitle: `养殖户（${farmersIn.length} 户）`,
        columns: farmerCols,
        data: farmersIn.map((r) => ({ ...r })) as Record<string, unknown>[],
      },
      {
        subtitle: `在档奶牛（${cowsIn.length} 头）`,
        columns: cowCols,
        data: cowsIn.map((r) => ({ ...r })) as Record<string, unknown>[],
      },
    ],
  })
}

function onFarmerBarClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const entry = idx >= 0 ? farmerBarEntries.value[idx] : undefined
  if (!entry) return
  const township = entry[0]
  const farmersIn = farmers.value.filter((f) => f.townshipName === township)
  const columns: DataTableColumns<Record<string, unknown>> = [
    { title: '户主', key: 'headName', width: 100 },
    { title: '行政村', key: 'villageName', width: 100 },
    { title: '电话', key: 'phone', width: 140 },
    { title: '养殖条件', key: 'breedingCondition', ellipsis: { tooltip: true } },
  ]
  openDetail({
    title: `养殖户分布 · ${township}`,
    columns,
    data: farmersIn.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}

function onProgressBarClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const row = idx >= 0 ? progressTopRows.value[idx] : undefined
  if (!row) return
  const columns: DataTableColumns<Record<string, unknown>> = [
    { title: '项目', key: 'projectName', ellipsis: { tooltip: true } },
    { title: '阶段', key: 'phase', width: 100 },
    { title: '完成度', key: 'percent', width: 90 },
    { title: '负责人', key: 'owner', width: 100 },
    { title: '里程碑', key: 'milestone', ellipsis: { tooltip: true } },
    { title: '更新', key: 'updateDate', width: 120 },
  ]
  openDetail({
    title: `项目进度 · ${row.projectName}`,
    columns,
    data: [{ ...row }] as Record<string, unknown>[],
  })
}

function onFundStackClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const cat = idx >= 0 ? fundByCategory.value[idx] : undefined
  if (!cat) return
  const rows = fundRows.value.filter((r) => r.category === cat.name)
  const columns: DataTableColumns<Record<string, unknown>> = [
    { title: '项目', key: 'projectName', ellipsis: { tooltip: true } },
    { title: '金额', key: 'amount', width: 120 },
    { title: '日期', key: 'happenDate', width: 110 },
    { title: '凭证号', key: 'voucherNo', width: 120 },
  ]
  openDetail({
    title: `资金流水 · 类别「${cat.name}」`,
    columns,
    data: rows.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}

function onGaugeClick() {
  const rows = [...progressRows.value].sort((a, b) => b.percent - a.percent)
  const columns: DataTableColumns<Record<string, unknown>> = [
    { title: '项目', key: 'projectName', ellipsis: { tooltip: true } },
    { title: '阶段', key: 'phase', width: 100 },
    { title: '完成度', key: 'percent', width: 90 },
    { title: '负责人', key: 'owner', width: 100 },
    { title: '更新', key: 'updateDate', width: 120 },
  ]
  openDetail({
    title: '全部项目进度',
    columns,
    data: rows.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}
</script>

<template>
  <div class="big-screen">
    <section class="big-screen__kpis">
      <KpiCard variant="row" label="在档奶牛" :target="cows.length" unit="头" />
      <KpiCard variant="row" label="登记养殖户" :target="farmers.length" unit="户" />
      <KpiCard variant="row" label="覆盖乡镇" :target="townshipCount" unit="个" />
      <KpiCard variant="row" label="覆盖行政村" :target="villageCount" unit="个" />
      <KpiCard
        variant="row"
        label="日产奶量(最近统计日)"
        :target="latestDayMilkKg"
        unit="kg"
        :decimals="1"
        sub="按产奶记录最近日期汇总"
      />
      <KpiCard
        variant="row"
        label="资金流水合计"
        :target="fundTotal"
        unit="元"
        :decimals="0"
        sub="收入与支出代数和"
      />
    </section>

    <div class="big-screen__cols">
      <aside class="big-screen__col big-screen__col--side">
        <ScreenPanel variant="side" title="牛群品种分布" hint="南丁格尔玫瑰">
          <div class="big-screen__panel-chart">
            <VChart class="big-screen__chart" :option="optBreedRose" autoresize @click="onBreedClick" />
          </div>
        </ScreenPanel>
        <ScreenPanel variant="side" title="产奶趋势" hint="按日汇总(kg)">
          <div class="big-screen__panel-chart">
            <VChart class="big-screen__chart" :option="optMilkLine" autoresize @click="onMilkLineClick" />
          </div>
        </ScreenPanel>
        <ScreenPanel variant="side" title="免疫剂次" hint="按疫苗名称">
          <div class="big-screen__panel-chart">
            <VChart class="big-screen__chart" :option="optImmunityBar" autoresize @click="onImmunityBarClick" />
          </div>
        </ScreenPanel>
      </aside>

      <main class="big-screen__col big-screen__col--center">
        <ScreenPanel variant="center" title="乡镇养殖对比" hint="存栏与户数">
          <div class="big-screen__panel-chart big-screen__panel-chart--tall">
            <VChart class="big-screen__chart" :option="optTownshipMain" autoresize @click="onTownshipMainClick" />
          </div>
        </ScreenPanel>
        <div class="big-screen__center-row">
          <ScreenPanel variant="center" class="big-screen__gauge-wrap" title="综合进度" hint="各项目百分比均值">
            <div class="big-screen__panel-chart big-screen__panel-chart--gauge">
              <VChart class="big-screen__chart" :option="optGauge" autoresize @click="onGaugeClick" />
            </div>
          </ScreenPanel>
          <ScreenPanel variant="center" title="运行动态" hint="日志与任务">
            <ScrollBoard :items="scrollItems" />
          </ScreenPanel>
        </div>
      </main>

      <aside class="big-screen__col big-screen__col--side">
        <ScreenPanel variant="side" title="养殖户分布" hint="按乡镇">
          <div class="big-screen__panel-chart">
            <VChart class="big-screen__chart" :option="optFarmerBar" autoresize @click="onFarmerBarClick" />
          </div>
        </ScreenPanel>
        <ScreenPanel variant="side" title="项目进度" hint="TOP 按完成度">
          <div class="big-screen__panel-chart">
            <VChart class="big-screen__chart" :option="optProgressBar" autoresize @click="onProgressBarClick" />
          </div>
        </ScreenPanel>
        <ScreenPanel variant="side" title="资金流向" hint="按类别收支堆叠">
          <div class="big-screen__panel-chart">
            <VChart class="big-screen__chart" :option="optFundStack" autoresize @click="onFundStackClick" />
          </div>
        </ScreenPanel>
      </aside>
    </div>

    <DetailDialog
      v-model:show="detailShow"
      :title="detailTitle"
      :sections="detailSections"
      :columns="detailColumns"
      :data="detailData"
    />
  </div>
</template>

<style scoped>
.big-screen {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  max-width: none;
  margin: 0;
}

.big-screen__kpis {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.4rem;
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
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2.1fr) minmax(0, 1fr);
  gap: 0.45rem;
  align-items: stretch;
}

@media (max-width: 90rem) {
  .big-screen__cols {
    grid-template-columns: 1fr;
    min-height: auto;
  }
}

.big-screen__col {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
  min-height: 0;
}

.big-screen__col--side .screen-panel {
  flex: 1;
  min-height: 0;
}

.big-screen__col--center {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.big-screen__col--center > .screen-panel:first-child {
  flex: 1.35;
  min-height: 0;
}

.big-screen__center-row {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 0.45rem;
  align-items: stretch;
}

@media (max-width: 64rem) {
  .big-screen__center-row {
    grid-template-columns: 1fr;
  }
}

.big-screen__center-row .screen-panel {
  min-height: 0;
}

.big-screen__gauge-wrap {
  min-height: 0;
}

.big-screen__panel-chart {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.big-screen__panel-chart--tall {
  flex: 1.15;
}

.big-screen__panel-chart--gauge {
  min-height: 0;
}

.big-screen__chart {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
