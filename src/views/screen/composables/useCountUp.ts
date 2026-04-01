import { onUnmounted, ref, watch } from 'vue'

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export interface UseCountUpOptions {
  /** 动画时长 ms */
  duration?: number
}

/**
 * 将目标数值从当前显示值缓动到目标值（easeOutExpo），用于 KPI 翻牌效果。
 */
export function useCountUp(getTarget: () => number, options?: UseCountUpOptions) {
  const display = ref(0)
  const duration = options?.duration ?? 1400

  let raf = 0
  let startTs = 0
  let from = 0
  let to = 0

  function cancel() {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  function tick(ts: number) {
    if (!startTs) startTs = ts
    const elapsed = ts - startTs
    const p = Math.min(1, elapsed / duration)
    display.value = from + (to - from) * easeOutExpo(p)
    if (p < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      display.value = to
      raf = 0
    }
  }

  function run(next: number) {
    cancel()
    from = display.value
    to = next
    startTs = 0
    raf = requestAnimationFrame(tick)
  }

  watch(
    () => getTarget(),
    (v) => {
      run(Number.isFinite(v) ? v : 0)
    },
    { immediate: true },
  )

  onUnmounted(() => cancel())

  return { display }
}
