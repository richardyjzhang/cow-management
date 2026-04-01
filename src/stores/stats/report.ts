import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockReports, type ReportRow, type ReportStatus } from '@/mock/stats/report'

function clone(data: ReportRow[]) {
  return JSON.parse(JSON.stringify(data)) as ReportRow[]
}

function genId() {
  return `rp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useStatsReportStore = defineStore('statsReport', () => {
  const rows = ref<ReportRow[]>(clone(mockReports))

  function reset() {
    rows.value = clone(mockReports)
  }

  function add(payload: Omit<ReportRow, 'id'>) {
    const row: ReportRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<ReportRow, 'id'>>) {
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

  /** 模拟生成报表：异步改状态 */
  function simulateGenerate(id: string) {
    const i = rows.value.findIndex((r) => r.id === id)
    if (i < 0) return
    update(id, { status: '生成中' as ReportStatus })
    window.setTimeout(() => {
      update(id, {
        status: '已完成',
        generatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        fileSize: `${(1.5 + Math.random()).toFixed(1)} MB`,
      })
    }, 800)
  }

  return { rows, reset, add, update, remove, simulateGenerate }
})
