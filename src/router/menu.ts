import type { Component } from 'vue'
import {
  HomeOutline,
  LocationOutline,
  PeopleOutline,
  PawOutline,
  MedicalOutline,
  ShieldCheckmarkOutline,
  BandageOutline,
  HeartOutline,
  WaterOutline,
  QrCodeOutline,
  BarcodeOutline,
  GitNetworkOutline,
  CheckmarkDoneOutline,
  DocumentTextOutline,
  TrendingUpOutline,
  BarChartOutline,
  WalletOutline,
  DownloadOutline,
  SettingsOutline,
  PersonOutline,
  KeyOutline,
  ListOutline,
} from '@vicons/ionicons5'

export interface MenuItemConfig {
  label: string
  key: string
  path?: string
  icon: Component
  component?: () => Promise<{ default: Component }>
  children?: MenuItemConfig[]
}

export const menuConfig: MenuItemConfig[] = [
  {
    label: '首页看板',
    key: 'dashboard-group',
    icon: HomeOutline,
    children: [
      {
        label: '首页看板',
        key: '/dashboard',
        icon: HomeOutline,
        path: 'dashboard',
        component: () => import('@/views/dashboard/IndexView.vue'),
      },
    ],
  },
  {
    label: '基础信息管理',
    key: 'base-group',
    icon: LocationOutline,
    children: [
      {
        label: '区划管理',
        key: '/base/region',
        icon: LocationOutline,
        path: 'base/region',
        component: () => import('@/views/base/RegionView.vue'),
      },
      {
        label: '养殖户管理',
        key: '/base/farmer',
        icon: PeopleOutline,
        path: 'base/farmer',
        component: () => import('@/views/base/FarmerView.vue'),
      },
      {
        label: '奶牛档案',
        key: '/base/cow',
        icon: PawOutline,
        path: 'base/cow',
        component: () => import('@/views/base/CowView.vue'),
      },
    ],
  },
  {
    label: '养殖业务管理',
    key: 'breeding-group',
    icon: MedicalOutline,
    children: [
      {
        label: '土杂牛淘汰',
        key: '/breeding/eliminate',
        icon: ShieldCheckmarkOutline,
        path: 'breeding/eliminate',
        component: () => import('@/views/breeding/EliminateView.vue'),
      },
      {
        label: '公牛去势',
        key: '/breeding/castration',
        icon: BandageOutline,
        path: 'breeding/castration',
        component: () => import('@/views/breeding/CastrationView.vue'),
      },
      {
        label: '免疫记录',
        key: '/breeding/immunity',
        icon: MedicalOutline,
        path: 'breeding/immunity',
        component: () => import('@/views/breeding/ImmunityView.vue'),
      },
      {
        label: '配种记录',
        key: '/breeding/mating',
        icon: HeartOutline,
        path: 'breeding/mating',
        component: () => import('@/views/breeding/MatingView.vue'),
      },
      {
        label: '产奶记录',
        key: '/breeding/milk',
        icon: WaterOutline,
        path: 'breeding/milk',
        component: () => import('@/views/breeding/MilkView.vue'),
      },
    ],
  },
  {
    label: '溯源管理',
    key: 'trace-group',
    icon: QrCodeOutline,
    children: [
      {
        label: '耳标管理',
        key: '/trace/eartag',
        icon: BarcodeOutline,
        path: 'trace/eartag',
        component: () => import('@/views/trace/EartagView.vue'),
      },
      {
        label: '二维码溯源',
        key: '/trace/qrcode',
        icon: QrCodeOutline,
        path: 'trace/qrcode',
        component: () => import('@/views/trace/QrcodeView.vue'),
      },
    ],
  },
  {
    label: '项目流程管理',
    key: 'process-group',
    icon: GitNetworkOutline,
    children: [
      {
        label: '任务管理',
        key: '/process/task',
        icon: CheckmarkDoneOutline,
        path: 'process/task',
        component: () => import('@/views/process/TaskView.vue'),
      },
      {
        label: '采购验收',
        key: '/process/acceptance',
        icon: DocumentTextOutline,
        path: 'process/acceptance',
        component: () => import('@/views/process/AcceptanceView.vue'),
      },
      {
        label: '审核管理',
        key: '/process/audit',
        icon: ShieldCheckmarkOutline,
        path: 'process/audit',
        component: () => import('@/views/process/AuditView.vue'),
      },
      {
        label: '项目进度',
        key: '/process/progress',
        icon: TrendingUpOutline,
        path: 'process/progress',
        component: () => import('@/views/process/ProgressView.vue'),
      },
    ],
  },
  {
    label: '统计分析',
    key: 'stats-group',
    icon: BarChartOutline,
    children: [
      {
        label: '数据统计',
        key: '/stats/overview',
        icon: BarChartOutline,
        path: 'stats/overview',
        component: () => import('@/views/stats/OverviewView.vue'),
      },
      {
        label: '资金统计',
        key: '/stats/fund',
        icon: WalletOutline,
        path: 'stats/fund',
        component: () => import('@/views/stats/FundView.vue'),
      },
      {
        label: '报表导出',
        key: '/stats/report',
        icon: DownloadOutline,
        path: 'stats/report',
        component: () => import('@/views/stats/ReportView.vue'),
      },
    ],
  },
  {
    label: '系统管理',
    key: 'system-group',
    icon: SettingsOutline,
    children: [
      {
        label: '用户管理',
        key: '/system/user',
        icon: PersonOutline,
        path: 'system/user',
        component: () => import('@/views/system/UserView.vue'),
      },
      {
        label: '角色权限',
        key: '/system/role',
        icon: KeyOutline,
        path: 'system/role',
        component: () => import('@/views/system/RoleView.vue'),
      },
      {
        label: '操作日志',
        key: '/system/log',
        icon: ListOutline,
        path: 'system/log',
        component: () => import('@/views/system/LogView.vue'),
      },
    ],
  },
]
