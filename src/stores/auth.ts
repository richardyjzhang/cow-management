import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const AUTH_TOKEN_KEY = 'cow-management-token'

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getStoredToken())

  const isLoggedIn = computed(() => Boolean(token.value))

  function login() {
    const mockToken = `mock-${Date.now()}`
    localStorage.setItem(AUTH_TOKEN_KEY, mockToken)
    token.value = mockToken
  }

  function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    token.value = null
  }

  return { token, isLoggedIn, login, logout }
})
