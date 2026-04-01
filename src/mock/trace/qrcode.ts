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

export const mockQrcodes: QrcodeRow[] = [
  {
    id: 'qr-001',
    earTag: 'NML-2026-0001',
    traceCode: 'TR-NML-2026-0001-A1B2',
    issueDate: '2026-01-10',
    scanCount: 42,
    status: '有效',
  },
  {
    id: 'qr-002',
    earTag: 'NML-2026-0003',
    traceCode: 'TR-NML-2026-0003-C3D4',
    issueDate: '2026-02-01',
    scanCount: 18,
    status: '有效',
  },
]
