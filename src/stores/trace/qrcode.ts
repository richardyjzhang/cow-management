import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockQrcodes, type QrcodeRow } from '@/mock/trace/qrcode'

function clone(data: QrcodeRow[]) {
  return JSON.parse(JSON.stringify(data)) as QrcodeRow[]
}

function genId() {
  return `qr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function genTraceCode(earTag: string) {
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `TR-${earTag.replace(/\s/g, '')}-${tail}`
}

export const useTraceQrcodeStore = defineStore('traceQrcode', () => {
  const rows = ref<QrcodeRow[]>(clone(mockQrcodes))

  function reset() {
    rows.value = clone(mockQrcodes)
  }

  function add(payload: Omit<QrcodeRow, 'id'>) {
    const row: QrcodeRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<QrcodeRow, 'id'>>) {
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

  return { rows, reset, add, update, remove, genTraceCode }
})
