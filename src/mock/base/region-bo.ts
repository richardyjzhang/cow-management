/**
 * 区划名称、村民小组等展示用藏文（与 region.ts 中 id 对应，不改动 id/code/type 等结构字段）
 */
export type RegionBoPatch = { nameBo: string; groupNamesBo?: string }

export const mockRegionBoById: Record<string, RegionBoPatch> = {
  'tw-nanmulin': { nameBo: 'རྣམ་སྒྲིལ་གྲོང་རྡལ།' },
  'vl-xingfu': {
    nameBo: 'བདེ་སྐྱིད་གྲོང་ཚོ།',
    groupNamesBo: 'སྡེ་ཚོ་དང་པོ།, སྡེ་ཚོ་གཉིས་པ།',
  },
  'vl-tuanjie': {
    nameBo: 'མཐུན་སྒྲིལ་གྲོང་ཚོ།',
    groupNamesBo: 'འབྲོག་ལས་ཚོ་ཆུང་།, ཞིང་ཁུལ་ཚོ་ཆུང་།',
  },
  'tw-aima': { nameBo: 'ཨའེ་མཱ་ཤང་།' },
  'vl-aima': { nameBo: 'ཨའེ་མཱ་གྲོང་ཚོ།', groupNamesBo: 'སྟོད་ཚོ་ཆུང་།, སྨད་ཚོ་ཆུང་།' },
  'vl-chaka': { nameBo: 'ཚ་ཁ་གྲོང་ཚོ།', groupNamesBo: 'ཚོ་ཆུང་དང་པོ།, ཚོ་ཆུང་གཉིས་པ།' },
  'tw-chaer': { nameBo: 'ཚར་ཤང་།' },
  'vl-chaer': { nameBo: 'ཚར་གྲོང་ཚོ།', groupNamesBo: 'ཆུ་རྒྱུན་ཕྲག་ཚོ་ཆུང་།, མཐོ་ས་ཚོ་ཆུང་།' },
  'tw-kazi': { nameBo: 'ཁ་ཟི་ཤང་།' },
  'vl-kazi': {
    nameBo: 'ཁ་ཟི་གྲོང་ཚོ།',
    groupNamesBo: 'ཚོ་ཆུང་དང་པོ།, ཚོ་ཆུང་གཉིས་པ།, འབྲོག་ལས་དཔེ་སློག་ཚོ་ཆུང་།',
  },
  'vl-kangsa': { nameBo: 'ཁང་ས་གྲོང་ཚོ།', groupNamesBo: 'ཤར་ཚོ་ཆུང་།, ནུབ་ཚོ་ཆུང་།' },
  'tw-duojiao': { nameBo: 'དོ་ཅོའོ་ཤང་།' },
  'vl-duojiao': { nameBo: 'དོ་ཅོའོ་གྲོང་ཚོ།', groupNamesBo: 'ཚོ་ཆུང་དང་པོ།, ཚོ་ཆུང་གཉིས་པ།' },
  'tw-pudang': { nameBo: 'ཕུ་དང་ཤང་།' },
  'vl-pudang': { nameBo: 'ཕུ་དང་གྲོང་ཚོ།', groupNamesBo: 'ཚོ་ཆུང་དང་པོ།, ཚོ་ཆུང་གཉིས་པ།' },
  'tw-rendui': { nameBo: 'རིན་སྡེར་ཤང་།' },
  'vl-rendui': {
    nameBo: 'རིན་སྡེར་གྲོང་ཚོ།',
    groupNamesBo: 'འབྲོག་ལས་ཚོ་ཆུང་།, ཞིང་ཁུལ་ཚོ་ཆུང་།',
  },
  'tw-qiemu': { nameBo: 'ཆི་མུའུ་ཤང་།' },
  'vl-qiemu': { nameBo: 'ཆི་མུའུ་གྲོང་ཚོ།', groupNamesBo: 'སྟོད་ཚོ་ཆུང་།, སྨད་ཚོ་ཆུང་།' },
  'tw-dana': { nameBo: 'ཏ་ན་ཤང་།' },
  'vl-dana': { nameBo: 'ཏ་ན་གྲོང་ཚོ།', groupNamesBo: 'ཚོ་ཆུང་དང་པོ།, ཚོ་ཆུང་གཉིས་པ།' },
  'tw-mangre': { nameBo: 'མང་རེ་ཤང་།' },
  'vl-mangre': { nameBo: 'མང་རེ་གྲོང་ཚོ།', groupNamesBo: 'ཤར་ཚོ་ཆུང་།, ནུབ་ཚོ་ཆུང་།' },
  'tw-suojin': { nameBo: 'སོ་ཅིན་ཤང་།' },
  'vl-suojin': { nameBo: 'སོ་ཅིན་གྲོང་ཚོ།', groupNamesBo: 'ཆུ་རྒྱུན་ཕྲག་ཚོ་ཆུང་།, མཐོ་ས་ཚོ་ཆུང་།' },
  'tw-tudan': { nameBo: 'ཐུ་པུ་ཅ་ཤང་།' },
  'vl-tudan': { nameBo: 'ཐུ་པུ་ཅ་གྲོང་ཚོ།', groupNamesBo: 'ཚོ་ཆུང་དང་པོ།, ཚོ་ཆུང་གཉིས་པ།' },
  'tw-rendui2': { nameBo: 'རེ་ཏང་ཤང་།' },
  'vl-redang': { nameBo: 'རེ་ཏང་གྲོང་ཚོ།', groupNamesBo: 'འབྲོག་ལས་དཔེ་སློག་ཚོ་ཆུང་།' },
  'tw-lacun': { nameBo: 'ལྦུ་ཕུ་ཤང་།' },
  'vl-lacun': {
    nameBo: 'ལྦུ་ཕུ་གྲོང་ཚོ།',
    groupNamesBo: 'ཚོ་ཆུང་དང་པོ།, ཚོ་ཆུང་གཉིས་པ།, ཚོ་ཆུང་གསུམ་པ།',
  },
  'tw-jiacha': { nameBo: 'ཅ་ཚོ་ཤང་།' },
  'vl-jiacha': { nameBo: 'ཅ་ཚོ་གྲོང་ཚོ།', groupNamesBo: 'ཚོ་ཆུང་དང་པོ།, ཚོ་ཆུང་གཉིས་པ།' },
}
