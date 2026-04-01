import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockAcceptances, type AcceptanceRow } from '@/mock/process/acceptance'

function clone(data: AcceptanceRow[]) {
  return JSON.parse(JSON.stringify(data)) as AcceptanceRow[]
}

function genId() {
  return `ac-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useProcessAcceptanceStore = defineStore('processAcceptance', () => {
  const rows = ref<AcceptanceRow[]>(clone(mockAcceptances))

  function reset() {
    rows.value = clone(mockAcceptances)
  }

  function add(payload: Omit<AcceptanceRow, 'id'>) {
    const row: AcceptanceRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<AcceptanceRow, 'id'>>) {
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
