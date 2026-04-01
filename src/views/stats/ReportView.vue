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
  NModal,
  NForm,
  NFormItem,
  NSelect,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import {
  SearchOutline,
  AddOutline,
  CreateOutline,
  TrashOutline,
  CloudDownloadOutline,
} from '@vicons/ionicons5'
import { useStatsReportStore } from '@/stores/stats/report'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { ReportRow, ReportStatus } from '@/mock/stats/report'

const reportStore = useStatsReportStore()
const { rows } = storeToRefs(reportStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.name.includes(q) ||
      r.period.includes(q) ||
      r.format.includes(q) ||
      r.status.includes(q) ||
      (r.fileSize?.includes(q) ?? false),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const statusOptions: { label: string; value: ReportStatus }[] = [
  { label: '待生成', value: '待生成' },
  { label: '生成中', value: '生成中' },
  { label: '已完成', value: '已完成' },
  { label: '失败', value: '失败' },
]

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  name: '',
  period: '',
  format: 'Excel',
  status: '待生成' as ReportStatus,
  generatedAt: '',
  fileSize: '',
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    name: '',
    period: '',
    format: 'Excel',
    status: '待生成',
    generatedAt: '',
    fileSize: '',
    remark: '',
  }
  modalShow.value = true
}

function openEdit(row: ReportRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    name: row.name,
    period: row.period,
    format: row.format,
    status: row.status,
    generatedAt: row.generatedAt ?? '',
    fileSize: row.fileSize ?? '',
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.name.trim() || !form.value.period.trim()) {
    message.warning('请填写报表名称与统计周期')
    return
  }
  const payload = {
    name: form.value.name.trim(),
    period: form.value.period.trim(),
    format: form.value.format.trim() || 'Excel',
    status: form.value.status,
    generatedAt: form.value.generatedAt.trim() || undefined,
    fileSize: form.value.fileSize.trim() || undefined,
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    reportStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    reportStore.update(editingId.value, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: ReportRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除报表任务「${row.name}」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      reportStore.remove(row.id)
      message.success('已删除')
    },
  })
}

function handleGenerate(row: ReportRow) {
  if (row.status === '生成中') {
    message.info('正在生成中，请稍候')
    return
  }
  reportStore.simulateGenerate(row.id)
  message.success('已开始生成')
}

const columns = computed<DataTableColumns<ReportRow>>(() => [
  { title: '报表名称', key: 'name', minWidth: 180, ellipsis: { tooltip: true } },
  { title: '统计周期', key: 'period', width: 140, ellipsis: { tooltip: true } },
  { title: '格式', key: 'format', width: 88 },
  { title: '状态', key: 'status', width: 90 },
  { title: '生成时间', key: 'generatedAt', width: 160, render: (r) => r.generatedAt ?? '—' },
  { title: '大小', key: 'fileSize', width: 100, render: (r) => r.fileSize ?? '—' },
  {
    title: '备注',
    key: 'remark',
    minWidth: 100,
    ellipsis: { tooltip: true },
    render(row) {
      return row.remark ?? '—'
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
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
                onClick: () => handleGenerate(row),
              },
              {
                default: () => '生成',
                icon: () => h(NIcon, null, { default: () => h(CloudDownloadOutline) }),
              },
            ),
            h(
              NButton,
              {
                text: true,
                size: 'small',
                onClick: () => openEdit(row),
              },
              {
                default: () => '编辑',
                icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
              },
            ),
            h(
              NButton,
              {
                text: true,
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
  <NCard class="page-card page-card--fill" title="报表导出" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">报表任务与模拟生成（前端演示）</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="报表名称、周期、状态"
          style="width: 16rem"
          @keyup.enter="handleSearch"
        />
        <NButton type="primary" @click="handleSearch">
          <template #icon>
            <SearchOutline />
          </template>
          搜索
        </NButton>
        <NButton type="primary" @click="openAdd">
          <template #icon>
            <AddOutline />
          </template>
          新增
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
          :scroll-x="1300"
          :pagination="pagination"
          pagination-behavior-on-filter="first"
        />
      </div>
    </div>

    <NModal
      v-model:show="modalShow"
      preset="card"
      :title="modalMode === 'add' ? '新增' : '编辑'"
      style="width: 28rem"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="96">
        <NFormItem label="报表名称">
          <NInput v-model:value="form.name" />
        </NFormItem>
        <NFormItem label="统计周期">
          <NInput v-model:value="form.period" placeholder="如：2026 年一季度" />
        </NFormItem>
        <NFormItem label="格式">
          <NInput v-model:value="form.format" />
        </NFormItem>
        <NFormItem label="状态">
          <NSelect v-model:value="form.status" :options="statusOptions" />
        </NFormItem>
        <NFormItem label="生成时间">
          <NInput v-model:value="form.generatedAt" placeholder="完成后自动写入" />
        </NFormItem>
        <NFormItem label="文件大小">
          <NInput v-model:value="form.fileSize" />
        </NFormItem>
        <NFormItem label="备注">
          <NInput v-model:value="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="modalShow = false">取消</NButton>
          <NButton type="primary" @click="submitModal">确定</NButton>
        </NSpace>
      </template>
    </NModal>
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

.base-table :deep(.n-data-table-td .n-button + .n-button) {
  margin-left: 0.25rem;
}
</style>
