<script setup lang="ts">
import './registerEcharts'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { DataTableColumns } from 'naive-ui'
import VChart from 'vue-echarts'
import { useBaseCowStore } from '@/stores/base/cow'
import { useBaseFarmerStore } from '@/stores/base/farmer'
import { useBreedingMilkStore } from '@/stores/breeding/milk'
import { useBreedingImmunityStore } from '@/stores/breeding/immunity'
import KpiCard from './components/KpiCard.vue'
import ScreenPanel from './components/ScreenPanel.vue'
import DetailDialog, { type DetailSection } from './components/DetailDialog.vue'

const cowStore = useBaseCowStore()
const farmerStore = useBaseFarmerStore()
const milkStore = useBreedingMilkStore()
const immunityStore = useBreedingImmunityStore()

const { cows } = storeToRefs(cowStore)
const { farmers } = storeToRefs(farmerStore)
const { rows: milkRows } = storeToRefs(milkStore)
const { rows: immunityRows } = storeToRefs(immunityStore)

const latestDayMilkKg = computed(() => {
  const rows = milkRows.value
  if (!rows.length) return 0
  const dates = [...new Set(rows.map((r) => r.recordDate))].sort()
  const last = dates[dates.length - 1]!
  return rows.filter((r) => r.recordDate === last).reduce((s, r) => s + r.dailyKg, 0)
})

const immunityCount = computed(() => immunityRows.value.length)

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
  return keys.slice(0, 14)
})

const farmerBarEntries = computed(() =>
  [...farmerTownshipMap.value.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12),
)

const breedAgg = computed(() => {
  const m = new Map<string, number>()
  for (const c of cows.value) {
    const b = c.breed || '其他'
    m.set(b, (m.get(b) ?? 0) + 1)
  }
  return [...m.entries()].map(([name, value]) => ({ name, value }))
})

const sexAgg = computed(() => {
  const m = new Map<string, number>()
  for (const c of cows.value) {
    const s = c.sex || '未知'
    m.set(s, (m.get(s) ?? 0) + 1)
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
      radius: [20, 88],
      center: ['50%', '44%'],
      roseType: 'area',
      itemStyle: { borderRadius: 6 },
      label: { color: '#cbd5e1' },
      data: breedAgg.value.map((d) => ({ name: d.name, value: d.value })),
    },
  ],
}))

const optSexPie = computed(() => ({
  ...anim,
  color: ['#f472b6', '#38bdf8', '#94a3b8'],
  tooltip: { trigger: 'item', textStyle: { color: '#e2e8f0' }, backgroundColor: 'rgba(15,23,42,0.92)' },
  legend: { bottom: 0, textStyle: { color: '#94a3b8', fontSize: 11 } },
  series: [
    {
      name: '性别',
      type: 'pie',
      radius: ['32%', '58%'],
      center: ['50%', '46%'],
      itemStyle: { borderRadius: 4 },
      label: { color: '#cbd5e1' },
      data: sexAgg.value.map((d) => ({ name: d.name, value: d.value })),
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
    axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 30 },
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
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(34,211,238,0.4)' },
            { offset: 1, color: 'rgba(34,211,238,0.02)' },
          ],
        },
      },
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
    data: immunityByVaccine.value.map((d) => (d.name.length > 12 ? `${d.name.slice(0, 11)}…` : d.name)),
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
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 26 },
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
        barMaxWidth: 20,
        data: keys.map((k) => cowTownshipMap.value.get(k) ?? 0),
        itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#22d3ee' }, { offset: 1, color: 'rgba(34,211,238,0.15)' }] } },
      },
      {
        name: '养殖户',
        type: 'bar',
        barMaxWidth: 20,
        data: keys.map((k) => farmerTownshipMap.value.get(k) ?? 0),
        itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#a78bfa' }, { offset: 1, color: 'rgba(167,139,250,0.15)' }] } },
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
  openDetail({
    title: `品种「${name}」奶牛明细`,
    columns: [
      { title: '耳标号', key: 'earTag', ellipsis: { tooltip: true } },
      { title: '品种', key: 'breed', width: 100 },
      { title: '性别', key: 'sex', width: 60 },
      { title: '月龄', key: 'ageMonths', width: 70 },
      { title: '养殖户', key: 'farmerName', ellipsis: { tooltip: true } },
    ],
    data: list.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}

function onSexClick(e: any) {
  const name = e.name ?? e?.data?.name
  if (!name) return
  const list = cows.value.filter((c) => c.sex === name)
  openDetail({
    title: `性别「${name}」奶牛明细`,
    columns: [
      { title: '耳标号', key: 'earTag', ellipsis: { tooltip: true } },
      { title: '品种', key: 'breed', width: 110 },
      { title: '月龄', key: 'ageMonths', width: 70 },
      { title: '养殖户', key: 'farmerName', ellipsis: { tooltip: true } },
    ],
    data: list.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}

function onMilkLineClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const pair = idx >= 0 ? milkByDate.value[idx] : undefined
  if (!pair) return
  const [dateStr] = pair
  const rows = milkRows.value.filter((r) => r.recordDate === dateStr)
  openDetail({
    title: `产奶明细 · ${dateStr}`,
    columns: [
      { title: '耳标号', key: 'earTag', ellipsis: { tooltip: true } },
      { title: '日产奶(kg)', key: 'dailyKg', width: 110 },
      { title: '泌乳阶段', key: 'period', width: 110 },
      { title: '日期', key: 'recordDate', width: 120 },
    ],
    data: rows.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}

function onImmunityBarClick(e: any) {
  const idx = typeof e.dataIndex === 'number' ? e.dataIndex : -1
  const item = idx >= 0 ? immunityByVaccine.value[idx] : undefined
  if (!item) return
  const vaccine = item.name
  const rows = immunityRows.value.filter((r) => r.vaccineName.replace(/\s+/g, ' ').trim() === vaccine)
  openDetail({
    title: `免疫记录 · ${vaccine}`,
    columns: [
      { title: '耳标号', key: 'earTag', ellipsis: { tooltip: true } },
      { title: '疫苗', key: 'vaccineName', ellipsis: { tooltip: true } },
      { title: '批次', key: 'batchNo', width: 110 },
      { title: '注射日', key: 'injectDate', width: 110 },
      { title: '下次', key: 'nextDate', width: 110 },
    ],
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
  openDetail({
    title: `乡镇「${township}」`,
    sections: [
      {
        subtitle: `养殖户（${farmersIn.length} 户）`,
        columns: [
          { title: '户主', key: 'headName', width: 100 },
          { title: '行政村', key: 'villageName', width: 100 },
          { title: '电话', key: 'phone', width: 140 },
          { title: '劳动力', key: 'laborForce', width: 80 },
        ],
        data: farmersIn.map((r) => ({ ...r })) as Record<string, unknown>[],
      },
      {
        subtitle: `在档奶牛（${cowsIn.length} 头）`,
        columns: [
          { title: '耳标号', key: 'earTag', ellipsis: { tooltip: true } },
          { title: '品种', key: 'breed', width: 100 },
          { title: '养殖户', key: 'farmerName', ellipsis: { tooltip: true } },
        ],
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
  openDetail({
    title: `养殖户分布 · ${township}`,
    columns: [
      { title: '户主', key: 'headName', width: 100 },
      { title: '行政村', key: 'villageName', width: 100 },
      { title: '电话', key: 'phone', width: 140 },
      { title: '养殖条件', key: 'breedingCondition', ellipsis: { tooltip: true } },
    ],
    data: farmersIn.map((r) => ({ ...r })) as Record<string, unknown>[],
  })
}
</script>

<template>
  <div class="breeding-screen">
    <section class="breeding-screen__kpis">
      <KpiCard variant="row" label="在档奶牛" :target="cows.length" unit="头" />
      <KpiCard variant="row" label="登记养殖户" :target="farmers.length" unit="户" />
      <KpiCard variant="row" label="免疫记录" :target="immunityCount" unit="条" />
      <KpiCard variant="row" label="产奶记录" :target="milkRows.length" unit="条" />
      <KpiCard variant="row" label="最近统计日产奶" :target="latestDayMilkKg" unit="kg" :decimals="1" />
      <KpiCard variant="row" label="品种数" :target="breedAgg.length" unit="种" />
    </section>

    <div class="breeding-screen__cols">
      <aside class="breeding-screen__col">
        <ScreenPanel variant="side" title="牛群品种分布" hint="玫瑰图">
          <div class="breeding-screen__chart-wrap">
            <VChart class="breeding-screen__chart" :option="optBreedRose" autoresize @click="onBreedClick" />
          </div>
        </ScreenPanel>
        <ScreenPanel variant="side" title="产奶趋势" hint="按日汇总">
          <div class="breeding-screen__chart-wrap">
            <VChart class="breeding-screen__chart" :option="optMilkLine" autoresize @click="onMilkLineClick" />
          </div>
        </ScreenPanel>
        <ScreenPanel variant="side" title="性别结构" hint="在档牛">
          <div class="breeding-screen__chart-wrap">
            <VChart class="breeding-screen__chart" :option="optSexPie" autoresize @click="onSexClick" />
          </div>
        </ScreenPanel>
      </aside>

      <main class="breeding-screen__col breeding-screen__col--main">
        <ScreenPanel variant="center" title="乡镇养殖对比" hint="存栏与户数">
          <div class="breeding-screen__chart-wrap breeding-screen__chart-wrap--tall">
            <VChart class="breeding-screen__chart" :option="optTownshipMain" autoresize @click="onTownshipMainClick" />
          </div>
        </ScreenPanel>
        <ScreenPanel variant="center" title="免疫剂次" hint="按疫苗">
          <div class="breeding-screen__chart-wrap">
            <VChart class="breeding-screen__chart" :option="optImmunityBar" autoresize @click="onImmunityBarClick" />
          </div>
        </ScreenPanel>
      </main>

      <aside class="breeding-screen__col">
        <ScreenPanel variant="side" title="养殖户分布" hint="按乡镇 TOP">
          <div class="breeding-screen__chart-wrap">
            <VChart class="breeding-screen__chart" :option="optFarmerBar" autoresize @click="onFarmerBarClick" />
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
.breeding-screen {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.breeding-screen__kpis {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.4rem;
}

@media (max-width: 96rem) {
  .breeding-screen__kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.breeding-screen__cols {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr) minmax(0, 0.85fr);
  gap: 0.45rem;
  align-items: stretch;
}

@media (max-width: 90rem) {
  .breeding-screen__cols {
    grid-template-columns: 1fr;
  }
}

.breeding-screen__col {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
  min-height: 0;
}

.breeding-screen__col .screen-panel {
  flex: 1;
  min-height: 0;
}

.breeding-screen__col--main > .screen-panel:first-child {
  flex: 1.2;
}

.breeding-screen__chart-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.breeding-screen__chart-wrap--tall {
  flex: 1.15;
}

.breeding-screen__chart {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
