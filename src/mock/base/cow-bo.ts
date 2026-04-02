export type CowBoPatch = {
  farmerNameBo?: string
  breedBo?: string
  sexBo?: string
  sourceBo?: string
  remarkBo?: string
}

const srcBo = 'རྫོང་ཁག་གཅིག་གྱུར་ཉོ་སྒྲུབ་ནས་འཁྱེར་བ།'

/** 奶牛档案展示用藏文，与 `mockCows` 中 id 一一对应 */
export const mockCowBoById: Record<string, CowBoPatch> = {
  'cw-001': {
    farmerNameBo: 'བཀྲ་ཤིས་དོན་གྲུབ་',
    breedBo: 'ཧོ་སི་ཐན་འབྲི་མོ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-002': {
    farmerNameBo: 'བཀྲ་ཤིས་དོན་གྲུབ་',
    breedBo: 'སི་མོན་ཐར་སྦྲེལ་མ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-003': {
    farmerNameBo: 'ཚེ་རིང་དབང་མོ་',
    breedBo: 'ཧོ་སི་ཐན་འབྲི་མོ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-004': {
    farmerNameBo: 'བློ་བཟང་ཕུན་ཚོགས་',
    breedBo: 'ཧོ་སི་ཐན་འབྲི་མོ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-005': {
    farmerNameBo: 'པདྨ་དབྱངས་སྐྱིད་',
    breedBo: 'ཅན་ཧྲན་སྦྲེལ་མ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
    remarkBo: 'གྲང་རིས་འབྲོག་སར་འཚམ་པའི་ལྟ་ཞིབ་བྱེད་བཞིན་ཡོད།',
  },
  'cw-006': {
    farmerNameBo: 'དོན་གྲུབ་ཚེ་རིང་',
    breedBo: 'ཧོ་སི་ཐན་འབྲི་མོ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-007': {
    farmerNameBo: 'སྐྱིད་བཟང་ལྷ་མོ་',
    breedBo: 'སི་མོན་ཐར་སྦྲེལ་མ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-008': {
    farmerNameBo: 'བསོད་ནམས་རྡོ་རྗེ་',
    breedBo: 'ཧོ་སི་ཐན་འབྲི་མོ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-009': {
    farmerNameBo: 'ཉི་མ་དོན་གྲུབ་',
    breedBo: 'ཧོ་སི་ཐན་འབྲི་མོ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-010': {
    farmerNameBo: 'དབྱངས་སྐྱིད་སྒྲོལ་དཀར་',
    breedBo: 'སི་མོན་ཐར་སྦྲེལ་མ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-011': {
    farmerNameBo: 'ཕུན་ཚོགས་ནོར་བུ་',
    breedBo: 'ཧོ་སི་ཐན་འབྲི་མོ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-012': {
    farmerNameBo: 'བདེ་སྐྱིད་ལྷ་མོ་',
    breedBo: 'ཅན་ཧྲན་སྦྲེལ་མ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-013': {
    farmerNameBo: 'རྡོ་རྗེ་ཚེ་རིང་',
    breedBo: 'ཧོ་སི་ཐན་འབྲི་མོ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-014': {
    farmerNameBo: 'ལྷ་མོ་གཡུ་སྒྲོན་',
    breedBo: 'སི་མོན་ཐར་སྦྲེལ་མ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
  'cw-015': {
    farmerNameBo: 'ཚེ་རིང་ནོར་བུ་',
    breedBo: 'ཧོ་སི་ཐན་འབྲི་མོ།',
    sexBo: 'མོ།',
    sourceBo: srcBo,
  },
}
