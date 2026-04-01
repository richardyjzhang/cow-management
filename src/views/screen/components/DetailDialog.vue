<script setup lang="ts">
import { NConfigProvider, NDataTable, NModal, darkTheme } from 'naive-ui'
import type { DataTableColumns, GlobalThemeOverrides } from 'naive-ui'

/** 弹窗内表格：强制暗色，与数据大屏风格一致 */
const detailThemeOverrides: GlobalThemeOverrides = {
  common: {
    bodyColor: '#0a1628',
    cardColor: '#0c1a2e',
    modalColor: '#0a1628',
    popoverColor: '#0c1a2e',
    tableColor: '#0a1628',
    hoverColor: 'rgba(34, 211, 238, 0.08)',
    dividerColor: 'rgba(51, 65, 85, 0.55)',
    borderColor: 'rgba(51, 65, 85, 0.5)',
    textColor1: '#e2e8f0',
    textColor2: '#94a3b8',
    textColor3: '#64748b',
  },
  DataTable: {
    thColor: '#0f172a',
    thColorHover: '#1e293b',
    tdColor: '#0a1628',
    tdColorHover: 'rgba(30, 58, 95, 0.65)',
    tdColorStriped: '#0c1d32',
    borderColor: 'rgba(51, 65, 85, 0.45)',
    thTextColor: '#94a3b8',
    tdTextColor: '#e2e8f0',
    loadingColor: 'rgba(34, 211, 238, 0.45)',
    loadingColorTransparent: 'rgba(34, 211, 238, 0.12)',
    boxShadowAfter: 'rgba(0, 0, 0, 0.35)',
    boxShadowBefore: 'rgba(0, 0, 0, 0.35)',
  },
}

export type DetailSection = {
  subtitle?: string
  columns: DataTableColumns<Record<string, unknown>>
  data: Record<string, unknown>[]
}

const props = withDefaults(
  defineProps<{
    show: boolean
    title: string
    /** 单表模式 */
    columns?: DataTableColumns<Record<string, unknown>>
    data?: Record<string, unknown>[]
    /** 多段表格 */
    sections?: DetailSection[]
    maxHeight?: string
  }>(),
  { maxHeight: 'min(60vh, 520px)' },
)

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

function onUpdateShow(v: boolean) {
  emit('update:show', v)
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="title"
    :bordered="false"
    size="huge"
    :segmented="{ content: true, footer: 'soft' }"
    class="screen-detail-modal"
    :style="{ width: 'min(96vw, 920px)' }"
    @update:show="onUpdateShow"
  >
    <NConfigProvider :theme="darkTheme" :theme-overrides="detailThemeOverrides">
      <div v-if="sections?.length" class="screen-detail-modal__wrap">
        <div v-for="(sec, i) in sections" :key="i" class="screen-detail-modal__block">
          <p v-if="sec.subtitle" class="screen-detail-modal__sub">{{ sec.subtitle }}</p>
          <NDataTable
            size="small"
            :columns="sec.columns"
            :data="sec.data"
            :bordered="false"
            :single-line="false"
            :max-height="maxHeight"
            striped
            class="screen-detail-modal__table"
          />
        </div>
      </div>
      <NDataTable
        v-else
        size="small"
        :columns="columns ?? []"
        :data="data ?? []"
        :bordered="false"
        :single-line="false"
        :max-height="maxHeight"
        striped
        class="screen-detail-modal__table"
      />
    </NConfigProvider>
  </NModal>
</template>

<style>
/* 非 scoped：覆盖 Naive Modal 卡片为深色 */
.screen-detail-modal.n-modal {
  --n-color-modal: rgba(8, 18, 36, 0.98) !important;
  --n-box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.28), 0 24px 64px rgba(0, 0, 0, 0.6) !important;
}

.screen-detail-modal .n-card {
  background-color: rgba(8, 18, 36, 0.98) !important;
  color: #e2e8f0 !important;
}

.screen-detail-modal .n-card-header {
  border-bottom: 1px solid rgba(51, 65, 85, 0.45) !important;
}

.screen-detail-modal .n-card-header__main {
  color: #e0f2fe !important;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.screen-detail-modal .n-card__content {
  padding-top: 0.5rem !important;
  background-color: rgba(8, 18, 36, 0.98) !important;
  color: #e2e8f0 !important;
}

.screen-detail-modal__wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.screen-detail-modal__sub {
  margin: 0 0 0.35rem;
  font-size: 0.8125rem;
  color: rgba(165, 243, 252, 0.9);
  letter-spacing: 0.04em;
}

/* 表格容器与滚动区暗色底 */
.screen-detail-modal .screen-detail-modal__table.n-data-table {
  background-color: #0a1628 !important;
  border-radius: 0.375rem;
}

.screen-detail-modal .n-data-table-wrapper {
  background-color: #0a1628 !important;
}

.screen-detail-modal .n-data-table-base-table {
  background-color: #0a1628 !important;
}

.screen-detail-modal .n-data-table-td,
.screen-detail-modal .n-data-table-th {
  background-color: inherit !important;
}

.screen-detail-modal .n-data-table-th {
  color: #94a3b8 !important;
  font-size: 0.75rem !important;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5) !important;
}

.screen-detail-modal .n-data-table-td {
  color: #e2e8f0 !important;
  font-size: 0.8125rem !important;
  border-bottom: 1px solid rgba(51, 65, 85, 0.35) !important;
}

.screen-detail-modal .n-data-table-tr:not(.n-data-table-tr--summary):hover > .n-data-table-td {
  background-color: rgba(30, 58, 95, 0.55) !important;
}

.screen-detail-modal .n-data-table-tr--striped .n-data-table-td {
  background-color: rgba(12, 29, 50, 0.92) !important;
}

.screen-detail-modal .n-data-table-empty {
  color: #64748b !important;
  background-color: #0a1628 !important;
}

.screen-detail-modal .n-scrollbar-rail {
  background-color: rgba(15, 23, 42, 0.6) !important;
}

.screen-detail-modal .n-scrollbar-rail__scrollbar {
  background-color: rgba(34, 211, 238, 0.35) !important;
}
</style>
