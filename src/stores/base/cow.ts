import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockCows, type CowRow } from '@/mock/base/cow'

function cloneCows(data: CowRow[]): CowRow[] {
  return JSON.parse(JSON.stringify(data)) as CowRow[]
}

function genId() {
  return `cw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useBaseCowStore = defineStore('baseCow', () => {
  const cows = ref<CowRow[]>(cloneCows(mockCows))

  function reset() {
    cows.value = cloneCows(mockCows)
  }

  function countByFarmerId(farmerId: string) {
    return cows.value.filter((c) => c.farmerId === farmerId).length
  }

  function addCow(payload: Omit<CowRow, 'id'>) {
    const row: CowRow = { ...payload, id: genId() }
    cows.value.push(row)
    return row
  }

  function updateCow(id: string, patch: Partial<Omit<CowRow, 'id'>>) {
    const i = cows.value.findIndex((c) => c.id === id)
    if (i < 0) return false
    const cur = cows.value[i]!
    const next: CowRow = { ...cur, ...patch, id: cur.id }
    cows.value[i] = next
    return true
  }

  function removeCow(id: string) {
    const i = cows.value.findIndex((c) => c.id === id)
    if (i < 0) return false
    cows.value.splice(i, 1)
    return true
  }

  function removeByFarmerId(farmerId: string) {
    cows.value = cows.value.filter((c) => c.farmerId !== farmerId)
  }

  function syncFarmerName(farmerId: string, farmerName: string) {
    for (const c of cows.value) {
      if (c.farmerId === farmerId) c.farmerName = farmerName
    }
  }

  return {
    cows,
    reset,
    countByFarmerId,
    addCow,
    updateCow,
    removeCow,
    removeByFarmerId,
    syncFarmerName,
  }
})
