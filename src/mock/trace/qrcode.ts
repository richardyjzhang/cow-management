/** 二维码溯源 */

export type QrcodeStatus = '有效' | '已失效'

export interface QrcodeRow {
  id: string
  earTag: string
  traceCode: string
  issueDate: string
  scanCount: number
  status: QrcodeStatus
  remark?: string
}

const st: QrcodeStatus[] = [
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '有效',
  '已失效',
]

export const mockQrcodes: QrcodeRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `qr-${String(i + 1).padStart(3, '0')}`,
  earTag: `NML-2026-${String(i + 1).padStart(4, '0')}`,
  traceCode: `TR-NML-2026-${String(i + 1).padStart(4, '0')}-${['A1', 'B2', 'C3', 'D4', 'E5'][i % 5]}${i}`,
  issueDate: `2026-0${1 + (i % 2)}-${String((i % 27) + 1).padStart(2, '0')}`,
  scanCount: 5 + i * 3 + (i % 7),
  status: st[i]!,
  remark: st[i] === '已失效' ? '耳标更换后作废' : undefined,
}))
