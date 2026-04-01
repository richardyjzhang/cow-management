<script setup lang="ts">
const kpis = [
  { label: '在档奶牛', value: '12,580', unit: '头', trend: '+2.3%' },
  { label: '登记养殖户', value: '3,246', unit: '户', trend: '+0.8%' },
  { label: '覆盖区划', value: '186', unit: '个', trend: '—' },
  { label: '本月免疫', value: '9,412', unit: '剂次', trend: '+5.1%' },
]

const milkTrend = [
  { month: '1月', v: 62 },
  { month: '2月', v: 58 },
  { month: '3月', v: 71 },
  { month: '4月', v: 69 },
  { month: '5月', v: 76 },
  { month: '6月', v: 82 },
]

const regions = [
  { name: '华北片区', cows: 4280, farmers: 980 },
  { name: '华东片区', cows: 3910, farmers: 1020 },
  { name: '西南片区', cows: 2650, farmers: 756 },
  { name: '其他', cows: 1740, farmers: 490 },
]

const maxMilk = Math.max(...milkTrend.map((x) => x.v))
</script>

<template>
  <div class="big-screen">
    <section class="big-screen__hero">
      <h1 class="big-screen__hero-title">养殖运营实时总览</h1>
      <p class="big-screen__hero-desc">关键指标 · 产奶趋势 · 区域分布（演示数据）</p>
    </section>

    <section class="big-screen__kpis">
      <article v-for="item in kpis" :key="item.label" class="big-screen__kpi">
        <div class="big-screen__kpi-label">{{ item.label }}</div>
        <div class="big-screen__kpi-row">
          <span class="big-screen__kpi-value">{{ item.value }}</span>
          <span class="big-screen__kpi-unit">{{ item.unit }}</span>
        </div>
        <div class="big-screen__kpi-trend">{{ item.trend }} 环比</div>
      </article>
    </section>

    <div class="big-screen__grid">
      <section class="big-screen__panel big-screen__panel--chart">
        <header class="big-screen__panel-head">
          <span class="big-screen__panel-title">近六月产奶指数</span>
          <span class="big-screen__panel-hint">相对指数 · 越高越好</span>
        </header>
        <div class="big-screen__bars">
          <div v-for="row in milkTrend" :key="row.month" class="big-screen__bar-wrap">
            <div
              class="big-screen__bar"
              :style="{ height: `${(row.v / maxMilk) * 100}%` }"
              :title="`${row.month}: ${row.v}`"
            />
            <span class="big-screen__bar-label">{{ row.month }}</span>
          </div>
        </div>
      </section>

      <section class="big-screen__panel big-screen__panel--donut">
        <header class="big-screen__panel-head">
          <span class="big-screen__panel-title">区域奶牛占比</span>
        </header>
        <div class="big-screen__donut-wrap">
          <div class="big-screen__donut" aria-hidden="true" />
          <ul class="big-screen__legend">
            <li v-for="r in regions" :key="r.name">
              <span class="big-screen__legend-name">{{ r.name }}</span>
              <span class="big-screen__legend-val">{{ r.cows.toLocaleString() }} 头</span>
            </li>
          </ul>
        </div>
      </section>

      <section class="big-screen__panel big-screen__panel--table">
        <header class="big-screen__panel-head">
          <span class="big-screen__panel-title">片区概览</span>
        </header>
        <div class="big-screen__table">
          <div class="big-screen__table-row big-screen__table-row--head">
            <span>片区</span>
            <span>奶牛</span>
            <span>养殖户</span>
          </div>
          <div v-for="r in regions" :key="r.name" class="big-screen__table-row">
            <span>{{ r.name }}</span>
            <span>{{ r.cows.toLocaleString() }}</span>
            <span>{{ r.farmers.toLocaleString() }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.big-screen {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100rem;
  margin: 0 auto;
}

.big-screen__hero {
  text-align: center;
  padding: 0.25rem 0 0.5rem;
}

.big-screen__hero-title {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  background: linear-gradient(90deg, #fef3c7, #22d3ee, #a5f3fc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.big-screen__hero-desc {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.65);
  letter-spacing: 0.06em;
}

.big-screen__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (max-width: 72rem) {
  .big-screen__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.big-screen__kpi {
  position: relative;
  padding: 0.85rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(34, 211, 238, 0.28);
  background: linear-gradient(145deg, rgba(8, 30, 55, 0.85), rgba(6, 18, 36, 0.65));
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.5) inset,
    0 12px 40px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.big-screen__kpi::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.12), transparent 55%);
  pointer-events: none;
}

.big-screen__kpi-label {
  position: relative;
  z-index: 1;
  font-size: 0.8125rem;
  color: rgba(226, 232, 240, 0.75);
  letter-spacing: 0.04em;
}

.big-screen__kpi-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-top: 0.35rem;
}

.big-screen__kpi-value {
  font-size: clamp(1.25rem, 2.2vw, 1.6rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #fef9c3;
  text-shadow: 0 0 20px rgba(250, 204, 21, 0.35);
}

.big-screen__kpi-unit {
  font-size: 0.8125rem;
  color: rgba(226, 232, 240, 0.55);
}

.big-screen__kpi-trend {
  position: relative;
  z-index: 1;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: rgba(52, 211, 153, 0.9);
}

.big-screen__grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  grid-template-rows: auto auto;
  gap: 0.75rem;
}

@media (max-width: 64rem) {
  .big-screen__grid {
    grid-template-columns: 1fr;
  }
}

.big-screen__panel {
  border-radius: 0.5rem;
  border: 1px solid rgba(34, 211, 238, 0.22);
  background: rgba(6, 18, 36, 0.55);
  padding: 0.75rem 1rem 1rem;
  min-height: 12rem;
}

.big-screen__panel--table {
  grid-column: 1 / -1;
}

.big-screen__panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(34, 211, 238, 0.15);
}

.big-screen__panel-title {
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #e0f2fe;
}

.big-screen__panel-hint {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.45);
}

.big-screen__bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
  height: 11rem;
  padding: 0 0.25rem;
}

.big-screen__bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  height: 100%;
}

.big-screen__bar {
  width: 100%;
  max-width: 3rem;
  margin-top: auto;
  border-radius: 0.25rem 0.25rem 0 0;
  background: linear-gradient(180deg, #22d3ee, rgba(34, 211, 238, 0.15));
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.25);
  min-height: 4px;
  transition: filter 0.2s;
}

.big-screen__bar:hover {
  filter: brightness(1.15);
}

.big-screen__bar-label {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.55);
}

.big-screen__donut-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}

.big-screen__donut {
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  background: conic-gradient(
    #22d3ee 0% 34%,
    #38bdf8 34% 65%,
    #a78bfa 65% 86%,
    rgba(148, 163, 184, 0.55) 86% 100%
  );
  mask: radial-gradient(farthest-side, transparent calc(100% - 18px), #000 calc(100% - 18px + 1px));
  box-shadow: 0 0 32px rgba(34, 211, 238, 0.2);
}

.big-screen__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: 12rem;
}

.big-screen__legend li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.8125rem;
  padding: 0.35rem 0;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.2);
  color: rgba(226, 232, 240, 0.85);
}

.big-screen__legend-val {
  font-variant-numeric: tabular-nums;
  color: #a5f3fc;
}

.big-screen__table {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.big-screen__table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  padding: 0.5rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}

.big-screen__table-row--head {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.big-screen__table-row:not(.big-screen__table-row--head):nth-child(odd) {
  background: rgba(15, 23, 42, 0.45);
}
</style>
