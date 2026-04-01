/** 项目进度 */

export interface ProgressRow {
  id: string
  projectName: string
  phase: string
  percent: number
  owner: string
  milestone: string
  updateDate: string
  remark?: string
}

export const mockProgresses: ProgressRow[] = [
  {
    id: 'pg-001',
    projectName: '优质奶牛扩繁示范',
    phase: '土建施工',
    percent: 65,
    owner: '县项目办',
    milestone: '主体棚圈封顶',
    updateDate: '2026-03-28',
  },
  {
    id: 'pg-002',
    projectName: '饲草料基地配套',
    phase: '设备采购',
    percent: 40,
    owner: '乡镇实施组',
    milestone: '青贮窖建设完成',
    updateDate: '2026-03-15',
  },
]
