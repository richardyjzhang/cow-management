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
  /** vue-i18n 键，如 menu.baseRegion */
  titleKey: string
  key: string
  path?: string
  icon: Component
  component?: () => Promise<{ default: Component }>
  children?: MenuItemConfig[]
}

export const menuConfig: MenuItemConfig[] = [
  {
    titleKey: 'menu.dashboard',
    key: 'dashboard-group',
    icon: HomeOutline,
    children: [
      {
        titleKey: 'menu.dashboard',
        key: '/dashboard',
        icon: HomeOutline,
        path: 'dashboard',
        component: () => import('@/views/dashboard/IndexView.vue'),
      },
    ],
  },
  {
    titleKey: 'menu.baseGroup',
    key: 'base-group',
    icon: LocationOutline,
    children: [
      {
        titleKey: 'menu.baseRegion',
        key: '/base/region',
        icon: LocationOutline,
        path: 'base/region',
        component: () => import('@/views/base/RegionView.vue'),
      },
      {
        titleKey: 'menu.baseFarmer',
        key: '/base/farmer',
        icon: PeopleOutline,
        path: 'base/farmer',
        component: () => import('@/views/base/FarmerView.vue'),
      },
      {
        titleKey: 'menu.baseCow',
        key: '/base/cow',
        icon: PawOutline,
        path: 'base/cow',
        component: () => import('@/views/base/CowView.vue'),
      },
    ],
  },
  {
    titleKey: 'menu.breedingGroup',
    key: 'breeding-group',
    icon: MedicalOutline,
    children: [
      {
        titleKey: 'menu.breedingEliminate',
        key: '/breeding/eliminate',
        icon: ShieldCheckmarkOutline,
        path: 'breeding/eliminate',
        component: () => import('@/views/breeding/EliminateView.vue'),
      },
      {
        titleKey: 'menu.breedingCastration',
        key: '/breeding/castration',
        icon: BandageOutline,
        path: 'breeding/castration',
        component: () => import('@/views/breeding/CastrationView.vue'),
      },
      {
        titleKey: 'menu.breedingImmunity',
        key: '/breeding/immunity',
        icon: MedicalOutline,
        path: 'breeding/immunity',
        component: () => import('@/views/breeding/ImmunityView.vue'),
      },
      {
        titleKey: 'menu.breedingMating',
        key: '/breeding/mating',
        icon: HeartOutline,
        path: 'breeding/mating',
        component: () => import('@/views/breeding/MatingView.vue'),
      },
      {
        titleKey: 'menu.breedingMilk',
        key: '/breeding/milk',
        icon: WaterOutline,
        path: 'breeding/milk',
        component: () => import('@/views/breeding/MilkView.vue'),
      },
    ],
  },
  {
    titleKey: 'menu.traceGroup',
    key: 'trace-group',
    icon: QrCodeOutline,
    children: [
      {
        titleKey: 'menu.traceEartag',
        key: '/trace/eartag',
        icon: BarcodeOutline,
        path: 'trace/eartag',
        component: () => import('@/views/trace/EartagView.vue'),
      },
      {
        titleKey: 'menu.traceQrcode',
        key: '/trace/qrcode',
        icon: QrCodeOutline,
        path: 'trace/qrcode',
        component: () => import('@/views/trace/QrcodeView.vue'),
      },
    ],
  },
  {
    titleKey: 'menu.processGroup',
    key: 'process-group',
    icon: GitNetworkOutline,
    children: [
      {
        titleKey: 'menu.processTask',
        key: '/process/task',
        icon: CheckmarkDoneOutline,
        path: 'process/task',
        component: () => import('@/views/process/TaskView.vue'),
      },
      {
        titleKey: 'menu.processAcceptance',
        key: '/process/acceptance',
        icon: DocumentTextOutline,
        path: 'process/acceptance',
        component: () => import('@/views/process/AcceptanceView.vue'),
      },
      {
        titleKey: 'menu.processAudit',
        key: '/process/audit',
        icon: ShieldCheckmarkOutline,
        path: 'process/audit',
        component: () => import('@/views/process/AuditView.vue'),
      },
      {
        titleKey: 'menu.processProgress',
        key: '/process/progress',
        icon: TrendingUpOutline,
        path: 'process/progress',
        component: () => import('@/views/process/ProgressView.vue'),
      },
    ],
  },
  {
    titleKey: 'menu.statsGroup',
    key: 'stats-group',
    icon: BarChartOutline,
    children: [
      {
        titleKey: 'menu.statsOverview',
        key: '/stats/overview',
        icon: BarChartOutline,
        path: 'stats/overview',
        component: () => import('@/views/stats/OverviewView.vue'),
      },
      {
        titleKey: 'menu.statsFund',
        key: '/stats/fund',
        icon: WalletOutline,
        path: 'stats/fund',
        component: () => import('@/views/stats/FundView.vue'),
      },
      {
        titleKey: 'menu.statsReport',
        key: '/stats/report',
        icon: DownloadOutline,
        path: 'stats/report',
        component: () => import('@/views/stats/ReportView.vue'),
      },
    ],
  },
  {
    titleKey: 'menu.systemGroup',
    key: 'system-group',
    icon: SettingsOutline,
    children: [
      {
        titleKey: 'menu.systemUser',
        key: '/system/user',
        icon: PersonOutline,
        path: 'system/user',
        component: () => import('@/views/system/UserView.vue'),
      },
      {
        titleKey: 'menu.systemRole',
        key: '/system/role',
        icon: KeyOutline,
        path: 'system/role',
        component: () => import('@/views/system/RoleView.vue'),
      },
      {
        titleKey: 'menu.systemLog',
        key: '/system/log',
        icon: ListOutline,
        path: 'system/log',
        component: () => import('@/views/system/LogView.vue'),
      },
    ],
  },
]
