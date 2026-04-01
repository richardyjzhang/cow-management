<script setup lang="ts">
defineProps<{
  title: string
  hint?: string
}>()
</script>

<template>
  <section class="screen-panel">
    <header class="screen-panel__head">
      <span class="screen-panel__title">{{ title }}</span>
      <span v-if="hint" class="screen-panel__hint">{{ hint }}</span>
    </header>
    <div class="screen-panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.screen-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 0.5rem;
  padding: 0.65rem 0.75rem 0.75rem;
  background: linear-gradient(145deg, rgba(8, 28, 52, 0.72), rgba(4, 14, 28, 0.55));
  border: 1px solid rgba(34, 211, 238, 0.22);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.45) inset,
    0 12px 36px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  animation: screenPanelGlow 5s ease-in-out infinite;
}

@keyframes screenPanelGlow {
  0%,
  100% {
    border-color: rgba(34, 211, 238, 0.22);
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.45) inset,
      0 12px 36px rgba(0, 0, 0, 0.35),
      0 0 0 rgba(34, 211, 238, 0);
  }
  50% {
    border-color: rgba(56, 189, 248, 0.42);
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.45) inset,
      0 12px 36px rgba(0, 0, 0, 0.35),
      0 0 22px rgba(34, 211, 238, 0.18);
  }
}

.screen-panel::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 211, 238, 0.2),
    rgba(56, 189, 248, 0.75),
    rgba(167, 139, 250, 0.45),
    rgba(34, 211, 238, 0.2),
    transparent
  );
  background-size: 200% 100%;
  animation: screenPanelScan 4s linear infinite;
  pointer-events: none;
}

@keyframes screenPanelScan {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.screen-panel__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(34, 211, 238, 0.18);
}

.screen-panel__title {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #e0f2fe;
  animation: screenPanelTitleGlow 3.2s ease-in-out infinite;
}

@keyframes screenPanelTitleGlow {
  0%,
  100% {
    text-shadow: 0 0 8px rgba(34, 211, 238, 0.25);
  }
  50% {
    text-shadow: 0 0 16px rgba(34, 211, 238, 0.55);
  }
}

.screen-panel__hint {
  font-size: 0.6875rem;
  color: rgba(226, 232, 240, 0.42);
}

.screen-panel__body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 10rem;
}
</style>
