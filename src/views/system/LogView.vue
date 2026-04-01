<script setup lang="ts">
import { h, ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NSpace,
  NIcon,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { SearchOutline, TrashOutline } from '@vicons/ionicons5'
import { useSystemLogStore } from '@/stores/system/log'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { LogRow } from '@/mock/system/log'

const logStore = useSystemLogStore()
const { rows } = storeToRefs(logStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.operator.includes(q) ||
      r.module.includes(q) ||
      r.action.includes(q) ||
      r.ip.includes(q) ||
      (r.detail?.includes(q) ?? false),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

function confirmDelete(row: LogRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除该条操作日志？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      logStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed<DataTableColumns<LogRow>>(() => [
  { title: '操作人', key: 'operator', width: 110, ellipsis: { tooltip: true } },
  { title: '模块', key: 'module', width: 120, ellipsis: { tooltip: true } },
  { title: '动作', key: 'action', width: 88 },
  { title: 'IP', key: 'ip', width: 130 },
  { title: '时间', key: 'createdAt', width: 170 },
  {
    title: '详情',
    key: 'detail',
    minWidth: 200,
    ellipsis: { tooltip: true },
    render(row) {
      return row.detail ?? '—'
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render(row) {
      return h(
        NSpace,
        { size: 10, align: 'center', wrap: false },
        {
          default: () => [
            h(
              NButton,
              {
                text: true,
                type: 'primary',
                size: 'small',
                onClick: () => confirmDelete(row),
              },
              {
                default: () => '删除',
                icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
              },
            ),
          ],
        },
      )
    },
  },
])

function handleSearch() {
  //
}
</script>

<template>
  <NCard class="page-card page-card--fill" title="操作日志" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">只读列表，支持检索与单条清理（演示）</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="操作人、模块、IP、详情"
          style="width: 16rem"
          @keyup.enter="handleSearch"
        />
        <NButton type="primary" @click="handleSearch">
          <template #icon>
            <SearchOutline />
          </template>
          搜索
        </NButton>
      </div>

      <div class="page-table-wrap">
        <NDataTable
          class="base-table"
          :columns="columns"
          :data="filtered"
          :row-key="(row) => row.id"
          :bordered="false"
          :single-line="false"
          :scroll-x="1200"
          :pagination="pagination"
          pagination-behavior-on-filter="first"
        />
      </div>
    </div>
  </NCard>
</template>

<style scoped>
.page-card__hint {
  font-size: 0.75rem;
  color: #86909c;
  font-weight: normal;
}

.base-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.base-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.base-table :deep(.n-data-table-th),
.base-table :deep(.n-data-table-td) {
  padding: 0.625rem 0.75rem;
}
</style>
