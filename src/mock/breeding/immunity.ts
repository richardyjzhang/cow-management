/** 免疫记录 */

export interface ImmunityRow {
  id: string
  earTag: string
  vaccineName: string
  batchNo: string
  injectDate: string
  nextDate: string
  remark?: string
}

const vaccines = [
  '口蹄疫 O 型',
  '布鲁氏菌病',
  '口蹄疫 A 型',
  '炭疽',
  '牛出败',
  '牛结节性皮肤病',
  '口蹄疫 O 型',
  '布鲁氏菌病',
  '口蹄疫 O 型',
  '炭疽',
  '口蹄疫 A 型',
  '牛出败',
  '口蹄疫 O 型',
  '布鲁氏菌病',
  '牛结节性皮肤病',
]

export const mockImmunities: ImmunityRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `im-${String(i + 1).padStart(3, '0')}`,
  earTag: `NML-2026-${String(i + 1).padStart(4, '0')}`,
  vaccineName: vaccines[i]!,
  batchNo: `FT-2026-${String(i + 1).padStart(2, '0')}`,
  injectDate: `2026-0${1 + (i % 3)}-${String((i % 27) + 1).padStart(2, '0')}`,
  nextDate: `2026-0${7 + (i % 3)}-${String((i % 27) + 1).padStart(2, '0')}`,
  remark: i === 1 ? '孕畜慎注' : i % 6 === 0 ? '集中免疫日' : undefined,
}))
