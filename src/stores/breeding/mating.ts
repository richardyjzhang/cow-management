import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockMatings, type MatingRow } from '@/mock/breeding/mating'

function clone(data: MatingRow[]) {
  return JSON.parse(JSON.stringify(data)) as MatingRow[]
}

function genId() {
  return `mt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useBreedingMatingStore = defineStore('breedingMating', () => {
  const rows = ref<MatingRow[]>(clone(mockMatings))

  function reset() {
    rows.value = clone(mockMatings)
  }

  function add(payload: Omit<MatingRow, 'id'>) {
    const row: MatingRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<MatingRow, 'id'>>) {
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
