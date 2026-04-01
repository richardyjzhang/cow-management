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
  }>(),
  { unit: '', decimals: 0 },
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
  <article class="kpi-card">
    <div class="kpi-card__label">{{ label }}</div>
    <div class="kpi-card__row">
      <span class="kpi-card__value">{{ valueText }}</span>
      <span v-if="unit" class="kpi-card__unit">{{ unit }}</span>
    </div>
    <div v-if="sub" class="kpi-card__sub">{{ sub }}</div>
  </article>
</template>

<style scoped>
.kpi-card {
  position: relative;
  padding: 0.65rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(34, 211, 238, 0.28);
  background: linear-gradient(155deg, rgba(8, 32, 58, 0.9), rgba(5, 16, 34, 0.72));
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.5) inset,
    0 10px 32px rgba(0, 0, 0, 0.38);
  overflow: hidden;
  animation: kpiCardPulse 4s ease-in-out infinite;
}

@keyframes kpiCardPulse {
  0%,
  100% {
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.5) inset,
      0 10px 32px rgba(0, 0, 0, 0.38),
      0 0 18px rgba(34, 211, 238, 0.08);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.5) inset,
      0 10px 32px rgba(0, 0, 0, 0.38),
      0 0 28px rgba(34, 211, 238, 0.22);
  }
}

.kpi-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.14), transparent 55%);
  pointer-events: none;
}

.kpi-card__label {
  position: relative;
  z-index: 1;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.72);
  letter-spacing: 0.04em;
}

.kpi-card__row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-top: 0.3rem;
}

.kpi-card__value {
  font-size: clamp(1.1rem, 1.6vw, 1.45rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #fef9c3;
  text-shadow: 0 0 18px rgba(250, 204, 21, 0.35);
}

.kpi-card__unit {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.5);
}

.kpi-card__sub {
  position: relative;
  z-index: 1;
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  color: rgba(148, 163, 184, 0.85);
}
</style>
