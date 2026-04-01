import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockImmunities, type ImmunityRow } from '@/mock/breeding/immunity'

function clone(data: ImmunityRow[]) {
  return JSON.parse(JSON.stringify(data)) as ImmunityRow[]
}

function genId() {
  return `im-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useBreedingImmunityStore = defineStore('breedingImmunity', () => {
  const rows = ref<ImmunityRow[]>(clone(mockImmunities))

  function reset() {
    rows.value = clone(mockImmunities)
  }

  function add(payload: Omit<ImmunityRow, 'id'>) {
    const row: ImmunityRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<ImmunityRow, 'id'>>) {
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
