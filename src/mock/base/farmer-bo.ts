export type FarmerBoPatch = {
  villageNameBo?: string
  townshipNameBo?: string
  headNameBo?: string
  breedingConditionBo?: string
  remarkBo?: string
}

/** 养殖户展示用藏文，与 `mockFarmers` 中 id 一一对应 */
export const mockFarmerBoById: Record<string, FarmerBoPatch> = {
  'fm-001': {
    villageNameBo: 'བདེ་སྐྱིད་གྲོང་ཚོ།',
    townshipNameBo: 'རྣམ་སྒྲིལ་གྲོང་རྡལ།',
    headNameBo: 'བཀྲ་ཤིས་དོན་གྲུབ་',
    breedingConditionBo: 'དྲོད་ཁང་དང་རྩྭ་གསོག་ཁང་ཡོད། ཆུ་ནི་ས་ཁང་གི་ཀླད་པོ་ནས་འཐུང་།',
  },
  'fm-002': {
    villageNameBo: 'བདེ་སྐྱིད་གྲོང་ཚོ།',
    townshipNameBo: 'རྣམ་སྒྲིལ་གྲོང་རྡལ།',
    headNameBo: 'ཚེ་རིང་དབང་མོ་',
    breedingConditionBo: 'ཕྱེད་ཁ་ཕྱི་ཕྱོགས་བ་ལང་ཁང་། ལྗང་འཛོམས་གཅོད་ས་ཡོད།',
  },
  'fm-003': {
    villageNameBo: 'མཐུན་སྒྲིལ་གྲོང་ཚོ།',
    townshipNameBo: 'རྣམ་སྒྲིལ་གྲོང་རྡལ།',
    headNameBo: 'བློ་བཟང་ཕུན་ཚོགས་',
    breedingConditionBo: 'ཚད་ལྡན་བ་ལང་ཁང་། རྩྭ་ས་མང་ཆེ་བ་ཡོད།',
  },
  'fm-004': {
    villageNameBo: 'ཨའེ་མཱ་གྲོང་ཚོ།',
    townshipNameBo: 'ཨའེ་མཱ་ཤང་།',
    headNameBo: 'པདྨ་དབྱངས་སྐྱིད་',
    breedingConditionBo: 'འབྲི་མོ་དང་རྔ་མོ་ཁ་བྲལ། སྨན་པའི་འབྲེལ་གཏུག་མི་སྣ་ཡོད།',
  },
  'fm-005': {
    villageNameBo: 'ཚ་ཁ་གྲོང་ཚོ།',
    townshipNameBo: 'ཨའེ་མཱ་ཤང་།',
    headNameBo: 'དོན་གྲུབ་ཚེ་རིང་',
    breedingConditionBo: 'ཁང་ཁྱིམ་ལེགས་སྒྲིག་ཟིན། དགུན་དུས་ཁ་སྐོང་རྒྱུ་ཆ་ལེགས།',
  },
  'fm-006': {
    villageNameBo: 'ཁ་ཟི་གྲོང་ཚོ།',
    townshipNameBo: 'ཁ་ཟི་ཤང་།',
    headNameBo: 'སྐྱིད་བཟང་ལྷ་མོ་',
    breedingConditionBo: 'རྫོང་རིམ་བ་ལང་ཁྱིམ་ཚང་དུ་སྤྲོད་པའི་ཚོང་རར་ཞུགས། ནས་རྩྭ་ཤིང་བལ་ཡོད།',
  },
  'fm-007': {
    villageNameBo: 'དོ་ཅོའོ་གྲོང་ཚོ།',
    townshipNameBo: 'དོ་ཅོའོ་ཤང་།',
    headNameBo: 'བསོད་ནམས་རྡོ་རྗེ་',
    breedingConditionBo: 'མི་དང་སྲོག་ཆགས་ཁ་བྲལ། ལུད་སྐྱག་སྦུབ་སྐྱག་ཞིང་ལ་སླར་ལོག',
  },
  'fm-008': {
    villageNameBo: 'ཕུ་དང་གྲོང་ཚོ།',
    townshipNameBo: 'ཕུ་དང་ཤང་།',
    headNameBo: 'ཉི་མ་དོན་གྲུབ་',
    breedingConditionBo: 'དྲོད་ཁང་གསར་པ། འཐུང་ཆུ་ཐབ་ཀྱང་སྦྱར་ཡོད།',
  },
  'fm-009': {
    villageNameBo: 'རིན་སྡེར་གྲོང་ཚོ།',
    townshipNameBo: 'རིན་སྡེར་ཤང་།',
    headNameBo: 'དབྱངས་སྐྱིད་སྒྲོལ་དཀར་',
    breedingConditionBo: 'འབྲོག་ཞིང་འདྲེས་མ། རྩྭ་རྫས་གཙོ་བོ་ནས་ཤིང་བལ་ཡིན།',
  },
  'fm-010': {
    villageNameBo: 'ཆི་མུའུ་གྲོང་ཚོ།',
    townshipNameBo: 'ཆི་མུའུ་ཤང་།',
    headNameBo: 'ཕུན་ཚོགས་ནོར་བུ་',
    breedingConditionBo: 'གཏོར་རིམས་དཔེ་སློག་ཁྱིམ་ཚང་ལ་ཞུགས།',
  },
  'fm-011': {
    villageNameBo: 'ཏ་ན་གྲོང་ཚོ།',
    townshipNameBo: 'ཏ་ན་ཤང་།',
    headNameBo: 'བདེ་སྐྱིད་ལྷ་མོ་',
    breedingConditionBo: 'ཁང་ཁྱིམ་དྲོད་སྲུང་ལེགས་སྒྲིག་ཟིན།',
  },
  'fm-012': {
    villageNameBo: 'མང་རེ་གྲོང་ཚོ།',
    townshipNameBo: 'མང་རེ་ཤང་།',
    headNameBo: 'རྡོ་རྗེ་ཚེ་རིང་',
    breedingConditionBo: 'འབྲི་མོ་དང་ལས་བ་ལང་ཁ་བྲལ་དུ་བསྡད།',
  },
  'fm-013': {
    villageNameBo: 'སོ་ཅིན་གྲོང་ཚོ།',
    townshipNameBo: 'སོ་ཅིན་ཤང་།',
    headNameBo: 'ལྷ་མོ་གཡུ་སྒྲོན་',
    breedingConditionBo: 'གྲོང་ཚོའི་གཏོར་རིམས་མི་སྣ་དང་འབྲེལ་གཏུག་ཡོད།',
  },
  'fm-014': {
    villageNameBo: 'ཐུ་པུ་ཅ་གྲོང་ཚོ།',
    townshipNameBo: 'ཐུ་པུ་ཅ་ཤང་།',
    headNameBo: 'ཚེ་རིང་ནོར་བུ་',
    breedingConditionBo: 'ལུད་སྐྱག་ཐོན་ཁུངས་ཅན་དུ་བཀོལ་སྤྱོད་ཚོད་ལྟ་ཁྱིམ་ཚང་།',
  },
  'fm-015': {
    villageNameBo: 'རེ་ཏང་གྲོང་ཚོ།',
    townshipNameBo: 'རེ་ཏང་ཤང་།',
    headNameBo: 'དཔལ་འབར་དོན་གྲུབ་',
    breedingConditionBo: 'རྩྭ་རྫས་ས་ཆ་ངེས་ཅན་ཡོད།',
  },
}
