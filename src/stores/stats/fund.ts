import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockFunds, type FundRow } from '@/mock/stats/fund'

function clone(data: FundRow[]) {
  return JSON.parse(JSON.stringify(data)) as FundRow[]
}

function genId() {
  return `fd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useStatsFundStore = defineStore('statsFund', () => {
  const rows = ref<FundRow[]>(clone(mockFunds))

  function reset() {
    rows.value = clone(mockFunds)
  }

  function add(payload: Omit<FundRow, 'id'>) {
    const row: FundRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<FundRow, 'id'>>) {
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
