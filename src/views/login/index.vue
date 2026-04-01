<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

type LoginMode = 'account' | 'sms'

const mode = ref<LoginMode>('sms')
const loading = ref(false)

/** 账号登录 */
const username = ref('')
const password = ref('')

/** 验证码登录 */
const phone = ref('')
const smsCode = ref('')
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const QR_N = 21
const qrCells = Array.from({ length: QR_N * QR_N }, (_, i) => {
  const x = i % QR_N
  const y = Math.floor(i / QR_N)
  const corners = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
  if (corners) return (x + y) % 2 === 0
  return (x * 13 + y * 17 + x * y) % 3 !== 0
})

const sendCodeLabel = computed(() => (countdown.value > 0 ? `${countdown.value}s 后重发` : '发送验证码'))

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function sendSmsCode() {
  if (countdown.value > 0) return
  const p = phone.value.trim()
  if (!/^1\d{10}$/.test(p)) {
    message.warning('请输入正确的手机号')
    return
  }
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) clearCountdown()
  }, 1000)
  message.success('验证码已发送（演示）')
}

onUnmounted(() => {
  clearCountdown()
})

async function handleLogin() {
  if (mode.value === 'account') {
    if (!username.value.trim() || !password.value) {
      message.warning('请输入账号和密码')
      return
    }
  } else {
    const p = phone.value.trim()
    if (!/^1\d{10}$/.test(p)) {
      message.warning('请输入正确的手机号')
      return
    }
    if (!smsCode.value.trim()) {
      message.warning('请输入验证码')
      return
    }
  }

  loading.value = true
  try {
    authStore.login()
    await router.push('/dashboard')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page flex min-h-screen w-full bg-[#0a1920]">
    <!-- 左侧背景（约 70%） -->
    <div class="login-page__hero relative min-h-screen min-w-0 flex-[7] max-lg:hidden">
      <img src="/login-bg.png" alt="" class="absolute inset-0 h-full w-full object-cover" />
    </div>

    <!-- 右侧登录区（约 30%） -->
    <aside
      class="login-page__panel relative flex min-h-screen w-full min-w-0 flex-[3] flex-col justify-between px-10 py-12 text-white max-lg:flex-1 max-lg:px-8"
      style="background: rgba(10, 25, 35, 0.88)"
    >
      <div class="flex flex-1 flex-col justify-center">
        <header class="mb-10">
          <h1 class="m-0 text-xl font-semibold leading-snug tracking-wide text-white">
            优质奶牛管理系统
          </h1>
        </header>

        <!-- Tab -->
        <div class="mb-8 flex gap-8 border-b border-white/15">
          <button
            type="button"
            class="login-tab -mb-px border-b-2 pb-3 text-[15px] transition-colors"
            :class="
              mode === 'account'
                ? 'border-[#22c55e] font-medium text-white'
                : 'border-transparent text-white/75 hover:text-white'
            "
            @click="mode = 'account'"
          >
            账号登录
          </button>
          <button
            type="button"
            class="login-tab -mb-px border-b-2 pb-3 text-[15px] transition-colors"
            :class="
              mode === 'sms'
                ? 'border-[#22c55e] font-medium text-white'
                : 'border-transparent text-white/75 hover:text-white'
            "
            @click="mode = 'sms'"
          >
            验证码登录
          </button>
        </div>

        <form class="flex flex-col gap-6" @submit.prevent="handleLogin">
          <template v-if="mode === 'account'">
            <div class="login-field flex items-baseline gap-3 border-b border-white/35 pb-2 focus-within:border-[#22c55e]">
              <label class="w-14 shrink-0 text-[15px] text-white/95">账号</label>
              <input
                v-model="username"
                type="text"
                autocomplete="username"
                placeholder="请输入账号"
                class="min-w-0 flex-1 border-0 bg-transparent py-1 text-[15px] text-white outline-none placeholder:text-white/45"
              />
            </div>
            <div class="login-field flex items-baseline gap-3 border-b border-white/35 pb-2 focus-within:border-[#22c55e]">
              <label class="w-14 shrink-0 text-[15px] text-white/95">密码</label>
              <input
                v-model="password"
                type="password"
                autocomplete="current-password"
                placeholder="请输入密码"
                class="min-w-0 flex-1 border-0 bg-transparent py-1 text-[15px] text-white outline-none placeholder:text-white/45"
              />
            </div>
          </template>

          <template v-else>
            <div class="login-field flex items-baseline gap-3 border-b border-white/35 pb-2 focus-within:border-[#22c55e]">
              <label class="w-14 shrink-0 text-[15px] text-white/95">手机号</label>
              <input
                v-model="phone"
                type="tel"
                maxlength="11"
                inputmode="numeric"
                autocomplete="tel"
                placeholder="请输入手机号"
                class="min-w-0 flex-1 border-0 bg-transparent py-1 text-[15px] text-white outline-none placeholder:text-white/45"
              />
            </div>
            <div
              class="login-field flex items-baseline gap-3 border-b border-white/35 pb-2 focus-within:border-[#22c55e]"
            >
              <label class="w-14 shrink-0 text-[15px] text-white/95">验证码</label>
              <input
                v-model="smsCode"
                type="text"
                maxlength="6"
                inputmode="numeric"
                autocomplete="one-time-code"
                placeholder="请输入验证码"
                class="min-w-0 flex-1 border-0 bg-transparent py-1 text-[15px] text-white outline-none placeholder:text-white/45"
              />
              <button
                type="button"
                class="shrink-0 text-[14px] text-[#22c55e] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="countdown > 0"
                @click="sendSmsCode"
              >
                {{ sendCodeLabel }}
              </button>
            </div>
          </template>

          <NButton
            attr-type="submit"
            :loading="loading"
            :color="'#22c55e'"
            :text-color="'#ffffff'"
            class="login-submit mt-2 !h-11 !rounded-md !text-[16px] !font-medium"
            block
          >
            登录
          </NButton>
        </form>
      </div>

      <footer class="mt-10 flex items-end gap-4 pt-4 max-sm:flex-col max-sm:items-start">
        <svg
          class="h-[4.5rem] w-[4.5rem] shrink-0 bg-white p-0.5"
          :viewBox="`0 0 ${QR_N} ${QR_N}`"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            v-for="(on, i) in qrCells"
            :key="i"
            :x="i % QR_N"
            :y="Math.floor(i / QR_N)"
            width="1"
            height="1"
            :fill="on ? '#000' : '#fff'"
          />
        </svg>
      </footer>
    </aside>

    <!-- 小屏：背景叠在整页下方 -->
    <div class="login-page__hero-mobile pointer-events-none absolute inset-0 -z-10 lg:hidden">
      <img src="/login-bg.png" alt="" class="h-full w-full object-cover opacity-35" />
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
}
</style>
