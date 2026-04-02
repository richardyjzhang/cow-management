/** 养殖户 mock：行政村 → 户 两级（通过 villageId 关联） */

import { mockFarmerBoById } from './farmer-bo'

export interface FarmerRow {
  id: string
  villageId: string
  villageName: string
  villageNameBo?: string
  townshipName: string
  townshipNameBo?: string
  headName: string
  headNameBo?: string
  idCard: string
  phone: string
  familySize: number
  laborForce: number
  breedingCondition: string
  breedingConditionBo?: string
  remark?: string
  remarkBo?: string
}

const mockFarmersZh: FarmerRow[] = [
  {
    id: 'fm-001',
    villageId: 'vl-xingfu',
    villageName: '幸福村',
    townshipName: '南木林镇',
    headName: '扎西顿珠',
    idCard: '540221199001015xxx',
    phone: '13889001111',
    familySize: 5,
    laborForce: 3,
    breedingCondition: '暖棚+储草棚，饮用井水',
  },
  {
    id: 'fm-002',
    villageId: 'vl-xingfu',
    villageName: '幸福村',
    townshipName: '南木林镇',
    headName: '次仁旺姆',
    idCard: '540221198503225xxx',
    phone: '13989002222',
    familySize: 4,
    laborForce: 2,
    breedingCondition: '半开放式牛舍，配套青贮窖',
  },
  {
    id: 'fm-003',
    villageId: 'vl-tuanjie',
    villageName: '团结村',
    townshipName: '南木林镇',
    headName: '洛桑平措',
    idCard: '540221199207107xxx',
    phone: '13689003333',
    familySize: 6,
    laborForce: 4,
    breedingCondition: '标准化牛舍，饲草基地约8亩',
  },
  {
    id: 'fm-004',
    villageId: 'vl-aima',
    villageName: '艾玛村',
    townshipName: '艾玛乡',
    headName: '白玛央金',
    idCard: '540221199412018xxx',
    phone: '13789004444',
    familySize: 5,
    laborForce: 2,
    breedingCondition: '牦牛与奶牛分栏，有兽医联络员',
  },
  {
    id: 'fm-005',
    villageId: 'vl-chaka',
    villageName: '查卡村',
    townshipName: '艾玛乡',
    headName: '顿珠次仁',
    idCard: '540221198811129xxx',
    phone: '13589005555',
    familySize: 7,
    laborForce: 3,
    breedingCondition: '棚圈改造完成，冬季补饲条件较好',
  },
  {
    id: 'fm-006',
    villageId: 'vl-kazi',
    villageName: '卡孜村',
    townshipName: '卡孜乡',
    headName: '格桑拉姆',
    idCard: '540221199603203xxx',
    phone: '13889006666',
    familySize: 4,
    laborForce: 2,
    breedingCondition: '参与县级奶牛到户项目，有青稞秸秆来源',
  },
  {
    id: 'fm-007',
    villageId: 'vl-duojiao',
    villageName: '多角村',
    townshipName: '多角乡',
    headName: '索朗多吉',
    idCard: '540221198501017xxx',
    phone: '13989007777',
    familySize: 5,
    laborForce: 3,
    breedingCondition: '人畜分居，粪污堆肥还田',
  },
  {
    id: 'fm-008',
    villageId: 'vl-pudang',
    villageName: '普当村',
    townshipName: '普当乡',
    headName: '尼玛顿珠',
    idCard: '540221199101011xxx',
    phone: '13889008888',
    familySize: 5,
    laborForce: 2,
    breedingCondition: '新建暖棚，配套饮水槽',
  },
  {
    id: 'fm-009',
    villageId: 'vl-rendui',
    villageName: '仁堆村',
    townshipName: '仁堆乡',
    headName: '央金卓嘎',
    idCard: '540221198802022xxx',
    phone: '13889009999',
    familySize: 6,
    laborForce: 3,
    breedingCondition: '半牧半农，饲草以青稞秸秆为主',
  },
  {
    id: 'fm-010',
    villageId: 'vl-qiemu',
    villageName: '秋木村',
    townshipName: '秋木乡',
    headName: '平措罗布',
    idCard: '540221199303033xxx',
    phone: '13889010001',
    familySize: 4,
    laborForce: 2,
    breedingCondition: '参与防疫示范户',
  },
  {
    id: 'fm-011',
    villageId: 'vl-dana',
    villageName: '达那村',
    townshipName: '达那乡',
    headName: '德吉拉姆',
    idCard: '540221199504044xxx',
    phone: '13889010002',
    familySize: 5,
    laborForce: 2,
    breedingCondition: '棚圈保温改造完成',
  },
  {
    id: 'fm-012',
    villageId: 'vl-mangre',
    villageName: '芒热村',
    townshipName: '芒热乡',
    headName: '多吉次仁',
    idCard: '540221198605055xxx',
    phone: '13889010003',
    familySize: 7,
    laborForce: 4,
    breedingCondition: '奶牛与役牛分养',
  },
  {
    id: 'fm-013',
    villageId: 'vl-suojin',
    villageName: '索金村',
    townshipName: '索金乡',
    headName: '拉姆玉珍',
    idCard: '540221199706066xxx',
    phone: '13889010004',
    familySize: 4,
    laborForce: 2,
    breedingCondition: '有村级防疫员对接',
  },
  {
    id: 'fm-014',
    villageId: 'vl-tudan',
    villageName: '土布加村',
    townshipName: '土布加乡',
    headName: '次仁罗布',
    idCard: '540221198807077xxx',
    phone: '13889010005',
    familySize: 6,
    laborForce: 3,
    breedingCondition: '粪污资源化利用试点户',
  },
  {
    id: 'fm-015',
    villageId: 'vl-redang',
    villageName: '热当村',
    townshipName: '热当乡',
    headName: '边巴顿珠',
    idCard: '540221199908088xxx',
    phone: '13889010006',
    familySize: 5,
    laborForce: 3,
    breedingCondition: '饲草料基地约5亩',
  },
]

export const mockFarmers: FarmerRow[] = mockFarmersZh.map((r) => ({
  ...r,
  ...mockFarmerBoById[r.id],
}))
