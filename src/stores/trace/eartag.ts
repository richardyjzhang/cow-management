import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockEartags, type EartagRow } from '@/mock/trace/eartag'

function clone(data: EartagRow[]) {
  return JSON.parse(JSON.stringify(data)) as EartagRow[]
}

function genId() {
  return `et-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useTraceEartagStore = defineStore('traceEartag', () => {
  const rows = ref<EartagRow[]>(clone(mockEartags))

  function reset() {
    rows.value = clone(mockEartags)
  }

  function add(payload: Omit<EartagRow, 'id'>) {
    const row: EartagRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<EartagRow, 'id'>>) {
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
