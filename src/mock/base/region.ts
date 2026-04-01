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
  {
    id: 'tw-pudang',
    code: '540221204',
    name: '普当乡',
    type: 'township',
    contact: '0892-8347xxx',
    children: [
      {
        id: 'vl-pudang',
        code: '540221204200',
        name: '普当村',
        type: 'village',
        contact: '13889011111',
        groupNames: '一组, 二组',
      },
    ],
  },
  {
    id: 'tw-rendui',
    code: '540221205',
    name: '仁堆乡',
    type: 'township',
    contact: '0892-8348xxx',
    children: [
      {
        id: 'vl-rendui',
        code: '540221205200',
        name: '仁堆村',
        type: 'village',
        contact: '13889012222',
        groupNames: '牧业组, 农区组',
      },
    ],
  },
  {
    id: 'tw-qiemu',
    code: '540221206',
    name: '秋木乡',
    type: 'township',
    contact: '0892-8349xxx',
    children: [
      {
        id: 'vl-qiemu',
        code: '540221206200',
        name: '秋木村',
        type: 'village',
        contact: '13889013333',
        groupNames: '上组, 下组',
      },
    ],
  },
  {
    id: 'tw-dana',
    code: '540221207',
    name: '达那乡',
    type: 'township',
    contact: '0892-8350xxx',
    children: [
      {
        id: 'vl-dana',
        code: '540221207200',
        name: '达那村',
        type: 'village',
        contact: '13889014444',
        groupNames: '一组, 二组',
      },
    ],
  },
  {
    id: 'tw-mangre',
    code: '540221208',
    name: '芒热乡',
    type: 'township',
    contact: '0892-8351xxx',
    children: [
      {
        id: 'vl-mangre',
        code: '540221208200',
        name: '芒热村',
        type: 'village',
        contact: '13889015555',
        groupNames: '东组, 西组',
      },
    ],
  },
  {
    id: 'tw-suojin',
    code: '540221209',
    name: '索金乡',
    type: 'township',
    contact: '0892-8352xxx',
    children: [
      {
        id: 'vl-suojin',
        code: '540221209200',
        name: '索金村',
        type: 'village',
        contact: '13889016666',
        groupNames: '沿河组, 高台组',
      },
    ],
  },
  {
    id: 'tw-tudan',
    code: '540221210',
    name: '土布加乡',
    type: 'township',
    contact: '0892-8353xxx',
    children: [
      {
        id: 'vl-tudan',
        code: '540221210200',
        name: '土布加村',
        type: 'village',
        contact: '13889017777',
        groupNames: '一组, 二组',
      },
    ],
  },
  {
    id: 'tw-rendui2',
    code: '540221211',
    name: '热当乡',
    type: 'township',
    contact: '0892-8354xxx',
    children: [
      {
        id: 'vl-redang',
        code: '540221211200',
        name: '热当村',
        type: 'village',
        contact: '13889018888',
        groupNames: '牧业示范组',
      },
    ],
  },
  {
    id: 'tw-lacun',
    code: '540221212',
    name: '拉布普乡',
    type: 'township',
    contact: '0892-8355xxx',
    children: [
      {
        id: 'vl-lacun',
        code: '540221212200',
        name: '拉布普村',
        type: 'village',
        contact: '13889019999',
        groupNames: '一组, 二组, 三组',
      },
    ],
  },
  {
    id: 'tw-jiacha',
    code: '540221213',
    name: '甲措乡',
    type: 'township',
    contact: '0892-8356xxx',
    children: [
      {
        id: 'vl-jiacha',
        code: '540221213200',
        name: '甲措村',
        type: 'village',
        contact: '13889020000',
        groupNames: '一组, 二组',
      },
    ],
  },
]
