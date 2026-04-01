<script setup lang="ts">
import '@/composables/registerEcharts'
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import VChart from 'vue-echarts'
import {
  NCard,
  NIcon,
  NProgress,
  NDataTable,
  NTag,
  NButton,
  type DataTableColumn,
} from 'naive-ui'
import {
  PawOutline,
  PeopleOutline,
  LocationOutline,
  WaterOutline,
  MedicalOutline,
  CheckmarkDoneOutline,
} from '@vicons/ionicons5'
import { useBaseCowStore } from '@/stores/base/cow'
import { useBaseFarmerStore } from '@/stores/base/farmer'
import { useBaseRegionStore } from '@/stores/base/region'
import { useBreedingMilkStore } from '@/stores/breeding/milk'
import { useBreedingImmunityStore } from '@/stores/breeding/immunity'
import { useStatsFundStore } from '@/stores/stats/fund'
import { useProcessProgressStore } from '@/stores/process/progress'
import { useProcessTaskStore } from '@/stores/process/task'
import type { TaskRow } from '@/mock/process/task'
import { useCountUp } from '@/views/screen/composables/useCountUp'

const router = useRouter()

const cowStore = useBaseCowStore()
const farmerStore = useBaseFarmerStore()
const regionStore = useBaseRegionStore()
const milkStore = useBreedingMilkStore()
const immunityStore = useBreedingImmunityStore()
const fundStore = useStatsFundStore()
const progressStore = useProcessProgressStore()
const taskStore = useProcessTaskStore()

const { cows } = storeToRefs(cowStore)
const { farmers } = storeToRefs(farmerStore)
const { tree } = storeToRefs(regionStore)
const { rows: milkRows } = storeToRefs(milkStore)
const { rows: immunityRows } = storeToRefs(immunityStore)
const { rows: fundRows } = storeToRefs(fundStore)
const { rows: progressRows } = storeToRefs(progressStore)
const { rows: taskRows } = storeToRefs(taskStore)

// ---- KPI 数据 ----

const townshipCount = computed(() => tree.value.length)
const villageCount = computed(() =>
  tree.value.reduce((n, t) => n + (t.children?.length ?? 0), 0),
)

const latestMonthMilkKg = computed(() => {
  const rows = milkRows.value
  if (!rows.length) return 0
  const dates = [...new Set(rows.map((r) => r.recordDate))].sort()
  const lastMonth = dates[dates.length - 1]!.slice(0, 7)
  return rows
    .filter((r) => r.recordDate.startsWith(lastMonth))
    .reduce((s, r) => s + r.dailyKg, 0)
})

const immunityRate = computed(() => {
  const cowCount = cows.value.length
  if (!cowCount) return 0
  const immunized = new Set(immunityRows.value.map((r) => r.earTag))
  return Math.round((immunized.size / cowCount) * 100)
})

const pendingTaskCount = computed(
  () => taskRows.value.filter((t) => t.status === '待办').length,
)

const { display: cowCountDisplay } = useCountUp(() => cows.value.length)
const { display: farmerCountDisplay } = useCountUp(() => farmers.value.length)
const { display: townshipDisplay } = useCountUp(() => townshipCount.value)
const { display: milkDisplay } = useCountUp(() => latestMonthMilkKg.value)
const { display: immunityDisplay } = useCountUp(() => immunityRate.value)
const { display: pendingDisplay } = useCountUp(() => pendingTaskCount.value)

const kpiItems = computed(() => [
  {
    label: '在档奶牛',
    value: Math.round(cowCountDisplay.value),
    unit: '头',
    icon: PawOutline,
    color: '#B8955C',
    bg: '#f7f1e6',
    iconBg: 'rgba(184, 149, 92, 0.14)',
  },
  {
    label: '登记养殖户',
    value: Math.round(farmerCountDisplay.value),
    unit: '户',
    icon: PeopleOutline,
    color: '#3d7ab8',
    bg: '#ebf2fa',
    iconBg: 'rgba(61, 122, 184, 0.12)',
  },
  {
    label: '覆盖乡镇',
    value: Math.round(townshipDisplay.value),
    unit: '个',
    icon: LocationOutline,
    color: '#4d8f3d',
    bg: '#eef5ea',
    iconBg: 'rgba(77, 143, 61, 0.12)',
  },
  {
    label: '本月产奶量',
    value: Math.round(milkDisplay.value * 10) / 10,
    unit: 'kg',
    icon: WaterOutline,
    color: '#c96a2a',
    bg: '#fdf3ea',
    iconBg: 'rgba(201, 106, 42, 0.12)',
  },
  {
    label: '免疫完成率',
    value: Math.round(immunityDisplay.value),
    unit: '%',
    icon: MedicalOutline,
    color: '#2a8f6e',
    bg: '#eaf5f1',
    iconBg: 'rgba(42, 143, 110, 0.12)',
  },
  {
    label: '任务待办',
    value: Math.round(pendingDisplay.value),
    unit: '条',
    icon: CheckmarkDoneOutline,
    color: '#c45c68',
    bg: '#f9eef0',
    iconBg: 'rgba(196, 92, 104, 0.12)',
  },
])

// ---- 图表数据 ----

const chartPalette = ['#DFC798', '#5B9BD5', '#70AD47', '#ED7D31', '#A5A5A5', '#E06C75']

// 产奶趋势
const milkByDate = computed(() => {
  const m = new Map<string, number>()
  for (const r of milkRows.value) {
    m.set(r.recordDate, (m.get(r.recordDate) ?? 0) + r.dailyKg)
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})

const optMilkLine = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#fff',
    borderColor: '#e5e6eb',
    textStyle: { color: '#4E5969' },
  },
  grid: { left: '1%', right: '3%', bottom: '2%', top: '8%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: milkByDate.value.map(([d]) => d.slice(5)),
    axisLabel: { color: '#86909C', fontSize: 11, rotate: 30 },
    axisLine: { lineStyle: { color: '#e5e6eb' } },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#86909C', fontSize: 11 },
    splitLine: { lineStyle: { color: '#F0F0F0' } },
  },
  series: [
    {
      name: '日产奶(kg)',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { width: 2.5, color: '#C4AE78' },
      itemStyle: { color: '#C4AE78' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(223,199,152,0.35)' },
            { offset: 1, color: 'rgba(223,199,152,0.03)' },
          ],
        },
      },
      data: milkByDate.value.map(([, v]) => Number(v.toFixed(1))),
    },
  ],
  animationDuration: 1000,
  animationEasing: 'cubicOut' as const,
}))

// 品种分布
const breedAgg = computed(() => {
  const m = new Map<string, number>()
  for (const c of cows.value) {
    const b = c.breed || '其他'
    m.set(b, (m.get(b) ?? 0) + 1)
  }
  return [...m.entries()].map(([name, value]) => ({ name, value }))
})

const optBreedDonut = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: '#fff',
    borderColor: '#e5e6eb',
    textStyle: { color: '#4E5969' },
  },
  legend: { bottom: 0, textStyle: { color: '#86909C', fontSize: 11 } },
  color: chartPalette,
  series: [
    {
      type: 'pie',
      radius: ['36%', '62%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, color: '#4E5969', fontSize: 12 },
      emphasis: {
        label: { fontSize: 14, fontWeight: 'bold' },
      },
      data: breedAgg.value,
    },
  ],
  animationDuration: 1000,
  animationEasing: 'cubicOut' as const,
}))

// 乡镇养殖对比
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

const townshipKeys = computed(() => {
  const keys = [...new Set([...cowTownshipMap.value.keys(), ...farmerTownshipMap.value.keys()])]
  keys.sort((a, b) => (cowTownshipMap.value.get(b) ?? 0) - (cowTownshipMap.value.get(a) ?? 0))
  return keys.slice(0, 10)
})

const optTownship = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#fff',
    borderColor: '#e5e6eb',
    textStyle: { color: '#4E5969' },
  },
  legend: {
    data: ['奶牛存栏', '养殖户'],
    textStyle: { color: '#86909C', fontSize: 11 },
    top: 0,
  },
  grid: { left: '1%', right: '2%', bottom: '2%', top: '14%', containLabel: true },
  xAxis: {
    type: 'category',
    data: townshipKeys.value.map((k) => (k.length > 4 ? `${k.slice(0, 3)}…` : k)),
    axisLabel: { color: '#86909C', fontSize: 10, rotate: 25 },
    axisLine: { lineStyle: { color: '#e5e6eb' } },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#86909C', fontSize: 11 },
    splitLine: { lineStyle: { color: '#F0F0F0' } },
  },
  color: ['#DFC798', '#5B9BD5'],
  barGap: '28%',
  barCategoryGap: '42%',
  series: [
    {
      name: '奶牛存栏',
      type: 'bar',
      barMaxWidth: 20,
      data: townshipKeys.value.map((k) => cowTownshipMap.value.get(k) ?? 0),
      itemStyle: { borderRadius: [2, 2, 0, 0] },
    },
    {
      name: '养殖户',
      type: 'bar',
      barMaxWidth: 20,
      data: townshipKeys.value.map((k) => farmerTownshipMap.value.get(k) ?? 0),
      itemStyle: { borderRadius: [2, 2, 0, 0] },
    },
  ],
  animationDuration: 1000,
  animationEasing: 'cubicOut' as const,
}))

// 资金收支
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

const optFundStack = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#fff',
    borderColor: '#e5e6eb',
    textStyle: { color: '#4E5969' },
    valueFormatter: (v: number) => `${(v / 10000).toFixed(1)} 万`,
  },
  legend: {
    data: ['收入', '支出'],
    textStyle: { color: '#86909C', fontSize: 11 },
    top: 0,
  },
  grid: { left: '1%', right: '2%', bottom: '2%', top: '14%', containLabel: true },
  xAxis: {
    type: 'category',
    data: fundByCategory.value.map((r) =>
      r.name.length > 5 ? `${r.name.slice(0, 4)}…` : r.name,
    ),
    axisLabel: { color: '#86909C', fontSize: 10, rotate: 20 },
    axisLine: { lineStyle: { color: '#e5e6eb' } },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#86909C',
      fontSize: 11,
      formatter: (v: number) => `${(v / 10000).toFixed(0)}万`,
    },
    splitLine: { lineStyle: { color: '#F0F0F0' } },
  },
  color: ['#70AD47', '#E06C75'],
  barCategoryGap: '40%',
  series: [
    {
      name: '收入',
      type: 'bar',
      stack: 'total',
      barMaxWidth: 24,
      data: fundByCategory.value.map((r) => r.in),
      itemStyle: { borderRadius: [0, 0, 0, 0] },
    },
    {
      name: '支出',
      type: 'bar',
      stack: 'total',
      barMaxWidth: 24,
      data: fundByCategory.value.map((r) => r.out),
      itemStyle: { borderRadius: [2, 2, 0, 0] },
    },
  ],
  animationDuration: 1000,
  animationEasing: 'cubicOut' as const,
}))

// ---- 项目进度 ----

const progressTop8 = computed(() =>
  [...progressRows.value].sort((a, b) => b.percent - a.percent).slice(0, 8),
)

function progressColor(p: number): string {
  if (p >= 85) return '#70AD47'
  if (p >= 50) return '#DFC798'
  return '#ED7D31'
}

// ---- 待办任务 ----

const activeTasks = computed(() =>
  taskRows.value
    .filter((t) => t.status === '待办' || t.status === '进行中')
    .slice(0, 8),
)

function statusType(status: string) {
  if (status === '进行中') return 'info' as const
  if (status === '待办') return 'warning' as const
  if (status === '已完成') return 'success' as const
  return 'default' as const
}

function priorityType(priority: string) {
  if (priority === '高') return 'error' as const
  if (priority === '中') return 'warning' as const
  return 'default' as const
}

const taskColumns: DataTableColumn<TaskRow>[] = [
  { title: '任务', key: 'title', ellipsis: { tooltip: true }, width: 200 },
  { title: '类型', key: 'type', width: 70 },
  { title: '截止日期', key: 'dueDate', width: 110 },
  {
    title: '优先级',
    key: 'priority',
    width: 75,
    render: (row) =>
      h(NTag, { type: priorityType(row.priority), size: 'small', bordered: false }, () => row.priority),
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) =>
      h(NTag, { type: statusType(row.status), size: 'small', bordered: false }, () => row.status),
  },
]

function goToTasks() {
  void router.push('/process/task')
}
</script>

<template>
  <div class="dashboard">
    <!-- KPI 指标卡 -->
    <section class="dashboard__kpis">
      <div
        v-for="item in kpiItems"
        :key="item.label"
        class="kpi-card"
        :style="{ backgroundColor: item.bg }"
      >
        <div class="kpi-card__body">
          <div class="kpi-card__icon-wrap" :style="{ backgroundColor: item.iconBg }">
            <NIcon :component="item.icon" :size="22" :style="{ color: item.color }" />
          </div>
          <div class="kpi-card__info">
            <span class="kpi-card__label">{{ item.label }}</span>
            <div class="kpi-card__value-row">
              <span class="kpi-card__value">{{ item.value }}</span>
              <span class="kpi-card__unit">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 四个图表同一行 -->
    <section class="dashboard__row dashboard__row--charts">
      <NCard class="dashboard__card" title="产奶趋势" size="small">
        <VChart class="dashboard__chart dashboard__chart--h260" :option="optMilkLine" autoresize />
      </NCard>
      <NCard class="dashboard__card" title="牛群品种分布" size="small">
        <VChart class="dashboard__chart dashboard__chart--h260" :option="optBreedDonut" autoresize />
      </NCard>
      <NCard class="dashboard__card" title="乡镇养殖对比" size="small">
        <VChart class="dashboard__chart dashboard__chart--h260" :option="optTownship" autoresize />
      </NCard>
      <NCard class="dashboard__card" title="资金收支概览" size="small">
        <VChart class="dashboard__chart dashboard__chart--h260" :option="optFundStack" autoresize />
      </NCard>
    </section>

    <!-- 进度 + 任务 -->
    <section class="dashboard__row dashboard__row--split">
      <NCard class="dashboard__card dashboard__card--half" title="项目进度 TOP 8" size="small">
        <div class="progress-list">
          <div v-for="p in progressTop8" :key="p.id" class="progress-item">
            <span class="progress-item__name" :title="p.projectName">{{ p.projectName }}</span>
            <NProgress
              type="line"
              :percentage="p.percent"
              :color="progressColor(p.percent)"
              :rail-color="'#F0F0F0'"
              :height="14"
              :border-radius="4"
              :show-indicator="false"
              class="progress-item__bar"
            />
            <span
              class="progress-item__pct"
              :style="{ color: progressColor(p.percent) }"
            >{{ p.percent }}%</span>
          </div>
        </div>
      </NCard>
      <NCard class="dashboard__card dashboard__card--half" title="待办任务" size="small">
        <NDataTable
          :columns="taskColumns"
          :data="activeTasks"
          :bordered="false"
          :single-line="false"
          size="small"
          :pagination="false"
          class="dashboard__task-table"
        />
        <div class="dashboard__task-footer">
          <NButton text type="primary" @click="goToTasks">查看全部任务</NButton>
        </div>
      </NCard>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.25rem;
}

/* ---- KPI 指标卡 ---- */

.dashboard__kpis {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.875rem;
}

@media (max-width: 90rem) {
  .dashboard__kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 52rem) {
  .dashboard__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-card {
  position: relative;
  display: flex;
  align-items: stretch;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}

.kpi-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
}

.kpi-card__body {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  flex: 1;
  min-width: 0;
}

.kpi-card__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.kpi-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.kpi-card__label {
  font-size: 0.8125rem;
  color: #86909c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-card__value-row {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.kpi-card__value {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.2;
}

.kpi-card__unit {
  font-size: 0.8125rem;
  color: #86909c;
}

/* ---- 图表行 ---- */

.dashboard__row {
  display: grid;
  gap: 0.875rem;
}

.dashboard__row--charts {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 100rem) {
  .dashboard__row--charts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 52rem) {
  .dashboard__row--charts {
    grid-template-columns: 1fr;
  }
}

.dashboard__row--split {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 72rem) {
  .dashboard__row--split {
    grid-template-columns: 1fr;
  }
}

.dashboard__card {
  border-radius: 0.5rem;
}

.dashboard__chart {
  width: 100%;
}

.dashboard__chart--h260 {
  height: 260px;
}

/* ---- 项目进度 ---- */

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.progress-item {
  display: grid;
  grid-template-columns: 10rem 1fr 3rem;
  align-items: center;
  gap: 0.625rem;
}

.progress-item__name {
  font-size: 0.8125rem;
  color: #4e5969;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-item__bar {
  min-width: 0;
}

.progress-item__pct {
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: right;
}

/* ---- 待办任务 ---- */

.dashboard__task-table {
  margin-top: -0.25rem;
}

.dashboard__task-footer {
  display: flex;
  justify-content: center;
  padding-top: 0.625rem;
}
</style>
