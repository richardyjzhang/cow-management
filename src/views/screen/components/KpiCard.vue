<script setup lang="ts">
import { computed } from 'vue'
import { useCountUp } from '../composables/useCountUp'

const props = withDefaults(
  defineProps<{
    label: string
    target: number
    unit?: string
    decimals?: number
    sub?: string
    /**
     * row：顶栏一排专用 — 顶光带 + 仅上沿两角 + 底微光
     * mesh：四格 L 角 + 斜向高光（可与 row 交替增加层次）
     */
    variant?: 'row' | 'mesh'
  }>(),
  { unit: '', decimals: 0, variant: 'row' },
)

const { display } = useCountUp(() => props.target, { duration: 1600 })

const valueText = computed(() => {
  const v = display.value
  if (!Number.isFinite(v)) return '—'
  if (props.decimals && props.decimals > 0) {
    return v.toFixed(props.decimals)
  }
  return Math.round(v).toLocaleString('zh-CN')
})
</script>

<template>
  <article class="kpi-card" :class="`kpi-card--${variant}`">
    <template v-if="variant === 'row'">
      <span class="kpi-card__topbar" aria-hidden="true" />
      <span class="kpi-card__corner-tl" aria-hidden="true" />
      <span class="kpi-card__corner-tr" aria-hidden="true" />
    </template>
    <template v-else>
      <span class="kpi-card__corner kpi-card__corner--tl" aria-hidden="true" />
      <span class="kpi-card__corner kpi-card__corner--tr" aria-hidden="true" />
      <span class="kpi-card__corner kpi-card__corner--bl" aria-hidden="true" />
      <span class="kpi-card__corner kpi-card__corner--br" aria-hidden="true" />
    </template>

    <div class="kpi-card__label">{{ label }}</div>
    <div class="kpi-card__row">
      <span class="kpi-card__value">{{ valueText }}</span>
      <span v-if="unit" class="kpi-card__unit">{{ unit }}</span>
    </div>
    <div v-if="sub" class="kpi-card__sub">{{ sub }}</div>
  </article>
</template>

<style scoped>
/* ========== 公共 ========== */
.kpi-card {
  position: relative;
  padding: 0.45rem 0.55rem;
  border-radius: 0.375rem;
  overflow: hidden;
}

.kpi-card__label {
  position: relative;
  z-index: 1;
  font-size: 0.6875rem;
  color: rgba(226, 232, 240, 0.72);
  letter-spacing: 0.04em;
}

.kpi-card__row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.kpi-card__value {
  font-size: clamp(1rem, 1.35vw, 1.35rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #fef9c3;
  text-shadow: 0 0 18px rgba(250, 204, 21, 0.35);
}

.kpi-card__unit {
  font-size: 0.6875rem;
  color: rgba(226, 232, 240, 0.5);
}

.kpi-card__sub {
  position: relative;
  z-index: 1;
  margin-top: 0.2rem;
  font-size: 0.625rem;
  color: rgba(148, 163, 184, 0.85);
  line-height: 1.25;
}

/* ========== row：顶栏一排 ========== */
.kpi-card--row {
  border: 1px solid rgba(34, 211, 238, 0.22);
  background: linear-gradient(175deg, rgba(12, 38, 68, 0.92), rgba(4, 14, 32, 0.78));
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.45) inset,
    0 8px 28px rgba(0, 0, 0, 0.42);
  animation: kpiRowPulse 5s ease-in-out infinite;
}

@keyframes kpiRowPulse {
  0%,
  100% {
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.45) inset,
      0 8px 28px rgba(0, 0, 0, 0.42),
      0 0 0 rgba(34, 211, 238, 0);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.45) inset,
      0 8px 28px rgba(0, 0, 0, 0.42),
      0 0 20px rgba(34, 211, 238, 0.12);
  }
}

.kpi-card__topbar {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    rgba(34, 211, 238, 0.1),
    rgba(56, 189, 248, 0.85),
    rgba(167, 139, 250, 0.55),
    rgba(250, 204, 21, 0.35),
    rgba(34, 211, 238, 0.1)
  );
  background-size: 180% 100%;
  animation: kpiTopbarShift 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes kpiTopbarShift {
  0%,
  100% {
    background-position: 0% 0;
  }
  50% {
    background-position: 100% 0;
  }
}

.kpi-card--row::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 95% 55% at 50% -10%, rgba(34, 211, 238, 0.12), transparent 52%);
  pointer-events: none;
}

.kpi-card__corner-tl,
.kpi-card__corner-tr {
  position: absolute;
  top: 3px;
  width: 10px;
  height: 10px;
  pointer-events: none;
  z-index: 2;
  border-color: rgba(56, 189, 248, 0.65);
  box-sizing: border-box;
  filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.4));
}

.kpi-card__corner-tl {
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
  border-top-left-radius: 2px;
}

.kpi-card__corner-tr {
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
  border-top-right-radius: 2px;
}

.kpi-card--row {
  border-bottom: 1px solid rgba(51, 65, 85, 0.35);
}

/* ========== mesh：四格 L 角（与 row 交替用） ========== */
.kpi-card--mesh {
  border: 1px solid rgba(167, 139, 250, 0.28);
  background: linear-gradient(155deg, rgba(22, 18, 48, 0.88), rgba(5, 18, 36, 0.75));
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.5) inset,
    0 10px 32px rgba(0, 0, 0, 0.38);
  animation: kpiMeshPulse 4.5s ease-in-out infinite;
}

@keyframes kpiMeshPulse {
  0%,
  100% {
    border-color: rgba(167, 139, 250, 0.22);
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.5) inset,
      0 10px 32px rgba(0, 0, 0, 0.38),
      0 0 12px rgba(167, 139, 250, 0.06);
  }
  50% {
    border-color: rgba(250, 204, 21, 0.2);
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.5) inset,
      0 10px 32px rgba(0, 0, 0, 0.38),
      0 0 22px rgba(167, 139, 250, 0.14);
  }
}

.kpi-card--mesh::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(125deg, transparent 45%, rgba(167, 139, 250, 0.06) 50%, transparent 55%);
  pointer-events: none;
}

.kpi-card__corner {
  position: absolute;
  width: 8px;
  height: 8px;
  pointer-events: none;
  z-index: 2;
  border-color: rgba(167, 139, 250, 0.6);
  filter: drop-shadow(0 0 3px rgba(167, 139, 250, 0.35));
  box-sizing: border-box;
}

.kpi-card__corner--tl {
  top: 0;
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
}

.kpi-card__corner--tr {
  top: 0;
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
}

.kpi-card__corner--bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  border-left: 2px solid;
}

.kpi-card__corner--br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid;
  border-right: 2px solid;
}
</style>
