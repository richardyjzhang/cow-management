import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockAudits, type AuditRow } from '@/mock/process/audit'

function clone(data: AuditRow[]) {
  return JSON.parse(JSON.stringify(data)) as AuditRow[]
}

function genId() {
  return `au-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useProcessAuditStore = defineStore('processAudit', () => {
  const rows = ref<AuditRow[]>(clone(mockAudits))

  function reset() {
    rows.value = clone(mockAudits)
  }

  function add(payload: Omit<AuditRow, 'id'>) {
    const row: AuditRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<AuditRow, 'id'>>) {
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
