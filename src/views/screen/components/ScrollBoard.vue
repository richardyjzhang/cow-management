<script setup lang="ts">
import { computed } from 'vue'

export type ScrollItem = {
  tag: string
  text: string
  meta?: string
}

const props = defineProps<{
  items: ScrollItem[]
  /** 单行高度 px，用于动画 */
  rowHeight?: number
}>()

const rowHeight = computed(() => props.rowHeight ?? 36)

/** 复制一份用于无缝循环 */
const loopItems = computed(() => {
  const list = props.items
  if (!list.length) return []
  return [...list, ...list]
})
</script>

<template>
  <div class="scroll-board">
    <div v-if="!items.length" class="scroll-board__empty">暂无动态</div>
    <div
      v-else
      class="scroll-board__viewport"
      :style="{ '--row-h': `${rowHeight}px`, '--duration': `${Math.max(18, items.length * 2.2)}s` }"
    >
      <div class="scroll-board__track">
        <div
          v-for="(row, i) in loopItems"
          :key="`${i}-${row.text}`"
          class="scroll-board__row"
        >
          <span class="scroll-board__tag">{{ row.tag }}</span>
          <span class="scroll-board__text">{{ row.text }}</span>
          <span v-if="row.meta" class="scroll-board__meta">{{ row.meta }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-board {
  min-height: 8rem;
}

.scroll-board__empty {
  padding: 1rem;
  font-size: 0.8125rem;
  color: rgba(148, 163, 184, 0.75);
  text-align: center;
}

.scroll-board__viewport {
  height: calc(var(--row-h) * 6);
  overflow: hidden;
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
}

.scroll-board__track {
  animation: scrollBoardMove var(--duration) linear infinite;
}

@keyframes scrollBoardMove {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.scroll-board__row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  height: var(--row-h);
  padding: 0 0.35rem;
  font-size: 0.8125rem;
  border-bottom: 1px dashed rgba(51, 65, 85, 0.45);
  color: rgba(226, 232, 240, 0.88);
}

.scroll-board__tag {
  flex-shrink: 0;
  font-size: 0.6875rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(34, 211, 238, 0.35);
  color: #a5f3fc;
  letter-spacing: 0.04em;
}

.scroll-board__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scroll-board__meta {
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: rgba(148, 163, 184, 0.85);
}
</style>
