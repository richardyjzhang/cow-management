import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockLogs, type LogRow } from '@/mock/system/log'

function clone(data: LogRow[]) {
  return JSON.parse(JSON.stringify(data)) as LogRow[]
}

function genId() {
  return `lg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useSystemLogStore = defineStore('systemLog', () => {
  const rows = ref<LogRow[]>(clone(mockLogs))

  function reset() {
    rows.value = clone(mockLogs)
  }

  function add(payload: Omit<LogRow, 'id'>) {
    const row: LogRow = { ...payload, id: genId() }
    rows.value.unshift(row)
    return row
  }

  function remove(id: string) {
    const i = rows.value.findIndex((r) => r.id === id)
    if (i < 0) return false
    rows.value.splice(i, 1)
    return true
  }

  return { rows, reset, add, remove }
})
