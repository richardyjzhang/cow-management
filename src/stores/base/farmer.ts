import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockFarmers, type FarmerRow } from '@/mock/base/farmer'
import { useBaseCowStore } from './cow'

function cloneFarmers(data: FarmerRow[]): FarmerRow[] {
  return JSON.parse(JSON.stringify(data)) as FarmerRow[]
}

function genId() {
  return `fm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useBaseFarmerStore = defineStore('baseFarmer', () => {
  const farmers = ref<FarmerRow[]>(cloneFarmers(mockFarmers))

  function reset() {
    farmers.value = cloneFarmers(mockFarmers)
  }

  function countByVillageId(villageId: string) {
    return farmers.value.filter((f) => f.villageId === villageId).length
  }

  function hasFarmerInVillages(villageIds: string[]) {
    const set = new Set(villageIds)
    return farmers.value.some((f) => set.has(f.villageId))
  }

  function addFarmer(payload: Omit<FarmerRow, 'id'>) {
    const row: FarmerRow = { ...payload, id: genId() }
    farmers.value.push(row)
    return row
  }

  function updateFarmer(id: string, patch: Partial<Omit<FarmerRow, 'id'>>) {
    const i = farmers.value.findIndex((f) => f.id === id)
    if (i < 0) return false
    const cur = farmers.value[i]!
    const next: FarmerRow = { ...cur, ...patch, id: cur.id }
    farmers.value[i] = next
    if (patch.headName !== undefined) {
      const cowStore = useBaseCowStore()
      cowStore.syncFarmerName(id, next.headName, next.headNameBo)
    }
    return true
  }

  function removeFarmer(id: string) {
    const i = farmers.value.findIndex((f) => f.id === id)
    if (i < 0) return false
    farmers.value.splice(i, 1)
    const cowStore = useBaseCowStore()
    cowStore.removeByFarmerId(id)
    return true
  }

  return {
    farmers,
    reset,
    countByVillageId,
    hasFarmerInVillages,
    addFarmer,
    updateFarmer,
    removeFarmer,
  }
})
