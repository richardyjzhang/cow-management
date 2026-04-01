import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockCastrations, type CastrationRow } from '@/mock/breeding/castration'

function clone(data: CastrationRow[]) {
  return JSON.parse(JSON.stringify(data)) as CastrationRow[]
}

function genId() {
  return `cs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useBreedingCastrationStore = defineStore('breedingCastration', () => {
  const rows = ref<CastrationRow[]>(clone(mockCastrations))

  function reset() {
    rows.value = clone(mockCastrations)
  }

  function add(payload: Omit<CastrationRow, 'id'>) {
    const row: CastrationRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<CastrationRow, 'id'>>) {
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
