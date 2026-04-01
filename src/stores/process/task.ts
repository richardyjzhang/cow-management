import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockTasks, type TaskRow } from '@/mock/process/task'

function clone(data: TaskRow[]) {
  return JSON.parse(JSON.stringify(data)) as TaskRow[]
}

function genId() {
  return `tk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useProcessTaskStore = defineStore('processTask', () => {
  const rows = ref<TaskRow[]>(clone(mockTasks))

  function reset() {
    rows.value = clone(mockTasks)
  }

  function add(payload: Omit<TaskRow, 'id'>) {
    const row: TaskRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<TaskRow, 'id'>>) {
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
