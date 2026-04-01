/** 养殖户 mock：行政村 → 户 两级（通过 villageId 关联） */

export interface FarmerRow {
  id: string
  villageId: string
  villageName: string
  townshipName: string
  headName: string
  idCard: string
  phone: string
  familySize: number
  laborForce: number
  breedingCondition: string
  remark?: string
}

export const mockFarmers: FarmerRow[] = [
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
]
