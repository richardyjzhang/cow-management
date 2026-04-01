import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockEliminates, type EliminateRow } from '@/mock/breeding/eliminate'

function clone(data: EliminateRow[]) {
  return JSON.parse(JSON.stringify(data)) as EliminateRow[]
}

function genId() {
  return `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useBreedingEliminateStore = defineStore('breedingEliminate', () => {
  const rows = ref<EliminateRow[]>(clone(mockEliminates))

  function reset() {
    rows.value = clone(mockEliminates)
  }

  function add(payload: Omit<EliminateRow, 'id'>) {
    const row: EliminateRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<EliminateRow, 'id'>>) {
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
