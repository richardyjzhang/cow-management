/** 南木林县基础区划 mock：乡镇 → 行政村 两级；行政村下辖村民小组在列中展示 */

export interface RegionRow {
  id: string
  code: string
  name: string
  type: 'township' | 'village'
  /** 联系电话（村级联络方式，演示数据） */
  contact?: string
  /** 行政村：下辖村民小组名称，逗号分隔 */
  groupNames?: string
  children?: RegionRow[]
}

export const mockRegionTree: RegionRow[] = [
  {
    id: 'tw-nanmulin',
    code: '540221100',
    name: '南木林镇',
    type: 'township',
    contact: '0892-8342xxx',
    children: [
      {
        id: 'vl-xingfu',
        code: '540221100200',
        name: '幸福村',
        type: 'village',
        contact: '1388900xxxx',
        groupNames: '第一村民小组, 第二村民小组',
      },
      {
        id: 'vl-tuanjie',
        code: '540221100201',
        name: '团结村',
        type: 'village',
        contact: '1390890xxxx',
        groupNames: '牧业组, 农区组',
      },
    ],
  },
  {
    id: 'tw-aima',
    code: '540221200',
    name: '艾玛乡',
    type: 'township',
    contact: '0892-8343xxx',
    children: [
      {
        id: 'vl-aima',
        code: '540221200200',
        name: '艾玛村',
        type: 'village',
        contact: '1361890xxxx',
        groupNames: '上组, 下组',
      },
      {
        id: 'vl-chaka',
        code: '540221200201',
        name: '查卡村',
        type: 'village',
        contact: '1370890xxxx',
        groupNames: '一组, 二组',
      },
    ],
  },
  {
    id: 'tw-chaer',
    code: '540221201',
    name: '茶尔乡',
    type: 'township',
    contact: '0892-8344xxx',
    children: [
      {
        id: 'vl-chaer',
        code: '540221201200',
        name: '茶尔村',
        type: 'village',
        contact: '1351890xxxx',
        groupNames: '沿河组, 高台组',
      },
    ],
  },
  {
    id: 'tw-kazi',
    code: '540221202',
    name: '卡孜乡',
    type: 'township',
    contact: '0892-8345xxx',
    children: [
      {
        id: 'vl-kazi',
        code: '540221202200',
        name: '卡孜村',
        type: 'village',
        contact: '1362890xxxx',
        groupNames: '一组, 二组, 牧业示范组',
      },
      {
        id: 'vl-kangsa',
        code: '540221202201',
        name: '康萨村',
        type: 'village',
        contact: '1382890xxxx',
        groupNames: '东组, 西组',
      },
    ],
  },
  {
    id: 'tw-duojiao',
    code: '540221203',
    name: '多角乡',
    type: 'township',
    contact: '0892-8346xxx',
    children: [
      {
        id: 'vl-duojiao',
        code: '540221203200',
        name: '多角村',
        type: 'village',
        contact: '1393890xxxx',
        groupNames: '一组, 二组',
      },
    ],
  },
]
