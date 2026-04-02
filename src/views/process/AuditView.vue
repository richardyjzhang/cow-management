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
  NDatePicker,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { SearchOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useProcessAuditStore } from '@/stores/process/audit'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { AuditRow, AuditStatus } from '@/mock/process/audit'

const store = useProcessAuditStore()
const { rows } = storeToRefs(store)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.businessType.includes(q) ||
      r.title.includes(q) ||
      r.applicant.includes(q) ||
      r.status.includes(q) ||
      (r.auditor?.includes(q) ?? false) ||
      (r.opinion?.includes(q) ?? false),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const statusOptions: { label: string; value: AuditStatus }[] = [
  { label: '待审核', value: '待审核' },
  { label: '已通过', value: '已通过' },
  { label: '已驳回', value: '已驳回' },
]

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  businessType: '',
  title: '',
  applicant: '',
  applyDate: null as number | null,
  status: '待审核' as AuditStatus,
  auditor: '',
  auditDate: null as number | null,
  opinion: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    businessType: '',
    title: '',
    applicant: '',
    applyDate: Date.now(),
    status: '待审核',
    auditor: '',
    auditDate: null,
    opinion: '',
  }
  modalShow.value = true
}

function openEdit(row: AuditRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    businessType: row.businessType,
    title: row.title,
    applicant: row.applicant,
    applyDate: new Date(row.applyDate).getTime(),
    status: row.status,
    auditor: row.auditor ?? '',
    auditDate: row.auditDate ? new Date(row.auditDate).getTime() : null,
    opinion: row.opinion ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.title.trim() || !form.value.applicant.trim()) {
    message.warning('请填写申请标题与申请人')
    return
  }
  if (!form.value.applyDate) {
    message.warning('请选择申请日期')
    return
  }
  const applyDate = new Date(form.value.applyDate).toISOString().slice(0, 10)
  const auditDate = form.value.auditDate
    ? new Date(form.value.auditDate).toISOString().slice(0, 10)
    : undefined
  const payload = {
    businessType: form.value.businessType.trim() || '其他',
    title: form.value.title.trim(),
    applicant: form.value.applicant.trim(),
    applyDate,
    status: form.value.status,
    auditor: form.value.auditor.trim() || undefined,
    auditDate,
    opinion: form.value.opinion.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    store.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    store.update(editingId.value, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: AuditRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除审核「${row.title}」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      store.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed((): DataTableColumns<AuditRow> => [
  { title: '业务类型', key: 'businessType', width: 110, ellipsis: { tooltip: true } },
  { title: '标题', key: 'title', minWidth: 180, ellipsis: { tooltip: true } },
  { title: '申请人', key: 'applicant', width: 110, ellipsis: { tooltip: true } },
  { title: '申请日期', key: 'applyDate', width: 120 },
  { title: '状态', key: 'status', width: 90 },
  { title: '审核人', key: 'auditor', width: 120, ellipsis: { tooltip: true }, render: (r) => r.auditor ?? '—' },
  { title: '审核日期', key: 'auditDate', width: 120, render: (r) => r.auditDate ?? '—' },
  {
    title: '意见',
    key: 'opinion',
    minWidth: 140,
    ellipsis: { tooltip: true },
    render(row) {
      return row.opinion ?? '—'
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
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
  <NCard class="page-card page-card--fill" title="审核管理" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">各类业务申请与审核流转</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="类型、标题、申请人、状态"
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
          :scroll-x="1400"
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
        <NFormItem label="业务类型">
          <NInput v-model:value="form.businessType" />
        </NFormItem>
        <NFormItem label="标题">
          <NInput v-model:value="form.title" />
        </NFormItem>
        <NFormItem label="申请人">
          <NInput v-model:value="form.applicant" />
        </NFormItem>
        <NFormItem label="申请日期">
          <NDatePicker v-model:value="form.applyDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="状态">
          <NSelect v-model:value="form.status" :options="statusOptions" />
        </NFormItem>
        <NFormItem label="审核人">
          <NInput v-model:value="form.auditor" />
        </NFormItem>
        <NFormItem label="审核日期">
          <NDatePicker v-model:value="form.auditDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="意见">
          <NInput v-model:value="form.opinion" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
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
</style>
