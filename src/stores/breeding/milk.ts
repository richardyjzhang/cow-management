import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockMilks, type MilkRow } from '@/mock/breeding/milk'

function clone(data: MilkRow[]) {
  return JSON.parse(JSON.stringify(data)) as MilkRow[]
}

function genId() {
  return `mk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useBreedingMilkStore = defineStore('breedingMilk', () => {
  const rows = ref<MilkRow[]>(clone(mockMilks))

  function reset() {
    rows.value = clone(mockMilks)
  }

  function add(payload: Omit<MilkRow, 'id'>) {
    const row: MilkRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<MilkRow, 'id'>>) {
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
