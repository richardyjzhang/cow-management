import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockProgresses, type ProgressRow } from '@/mock/process/progress'

function clone(data: ProgressRow[]) {
  return JSON.parse(JSON.stringify(data)) as ProgressRow[]
}

function genId() {
  return `pg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useProcessProgressStore = defineStore('processProgress', () => {
  const rows = ref<ProgressRow[]>(clone(mockProgresses))

  function reset() {
    rows.value = clone(mockProgresses)
  }

  function add(payload: Omit<ProgressRow, 'id'>) {
    const row: ProgressRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<ProgressRow, 'id'>>) {
    const i = rows.value.findIndex((r) => r.id === id)
    if (i < 0) return false
    rows.value[i] = { ...rows.value[i]!, ...patch, id }
    return true
  }

  function remove(id: string) {
    const i = rows.value.findIndex((r) => r.id === id)
    if (i < 0) return false
    rows.value.splice(i, 1)
    return true
  }

  return { rows, reset, add, update, remove }
})
