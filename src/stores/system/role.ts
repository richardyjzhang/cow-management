import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockRoles, type RoleRow } from '@/mock/system/role'

function clone(data: RoleRow[]) {
  return JSON.parse(JSON.stringify(data)) as RoleRow[]
}

function genId() {
  return `rl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useSystemRoleStore = defineStore('systemRole', () => {
  const rows = ref<RoleRow[]>(clone(mockRoles))

  function reset() {
    rows.value = clone(mockRoles)
  }

  function add(payload: Omit<RoleRow, 'id'>) {
    const row: RoleRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<RoleRow, 'id'>>) {
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
