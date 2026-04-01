/** 奶牛档案 mock：养殖户 → 奶牛 两级（通过 farmerId 关联） */

export interface CowRow {
  id: string
  farmerId: string
  farmerName: string
  earTag: string
  breed: string
  sex: '母' | '公'
  ageMonths: number
  source: string
  purchasePrice: number
  subsidyAmount: number
  selfPaid: number
  remark?: string
}

export const mockCows: CowRow[] = [
  {
    id: 'cw-001',
    farmerId: 'fm-001',
    farmerName: '扎西顿珠',
    earTag: 'NML-2026-0001',
    breed: '荷斯坦',
    sex: '母',
    ageMonths: 18,
    source: '县统一采购引进',
    purchasePrice: 18500,
    subsidyAmount: 8000,
    selfPaid: 10500,
  },
  {
    id: 'cw-002',
    farmerId: 'fm-001',
    farmerName: '扎西顿珠',
    earTag: 'NML-2026-0002',
    breed: '西门塔尔杂交',
    sex: '母',
    ageMonths: 22,
    source: '县统一采购引进',
    purchasePrice: 17200,
    subsidyAmount: 8000,
    selfPaid: 9200,
  },
  {
    id: 'cw-003',
    farmerId: 'fm-002',
    farmerName: '次仁旺姆',
    earTag: 'NML-2026-0003',
    breed: '荷斯坦',
    sex: '母',
    ageMonths: 20,
    source: '县统一采购引进',
    purchasePrice: 18000,
    subsidyAmount: 8000,
    selfPaid: 10000,
  },
  {
    id: 'cw-004',
    farmerId: 'fm-003',
    farmerName: '洛桑平措',
    earTag: 'NML-2026-0004',
    breed: '荷斯坦',
    sex: '母',
    ageMonths: 24,
    source: '县统一采购引进',
    purchasePrice: 17800,
    subsidyAmount: 8000,
    selfPaid: 9800,
  },
  {
    id: 'cw-005',
    farmerId: 'fm-004',
    farmerName: '白玛央金',
    earTag: 'NML-2026-0005',
    breed: '娟姗杂交',
    sex: '母',
    ageMonths: 19,
    source: '县统一采购引进',
    purchasePrice: 19000,
    subsidyAmount: 8000,
    selfPaid: 11000,
    remark: '高寒牧区适应性观察中',
  },
  {
    id: 'cw-006',
    farmerId: 'fm-005',
    farmerName: '顿珠次仁',
    earTag: 'NML-2026-0006',
    breed: '荷斯坦',
    sex: '母',
    ageMonths: 21,
    source: '县统一采购引进',
    purchasePrice: 18200,
    subsidyAmount: 8000,
    selfPaid: 10200,
  },
  {
    id: 'cw-007',
    farmerId: 'fm-006',
    farmerName: '格桑拉姆',
    earTag: 'NML-2026-0007',
    breed: '西门塔尔杂交',
    sex: '母',
    ageMonths: 17,
    source: '县统一采购引进',
    purchasePrice: 17500,
    subsidyAmount: 8000,
    selfPaid: 9500,
  },
  {
    id: 'cw-008',
    farmerId: 'fm-007',
    farmerName: '索朗多吉',
    earTag: 'NML-2026-0008',
    breed: '荷斯坦',
    sex: '母',
    ageMonths: 23,
    source: '县统一采购引进',
    purchasePrice: 18800,
    subsidyAmount: 8000,
    selfPaid: 10800,
  },
]
