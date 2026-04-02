<script setup lang="ts">
import { h, ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NInputNumber,
  NSpace,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NDatePicker,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { SearchOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useProcessProgressStore } from '@/stores/process/progress'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { ProgressRow } from '@/mock/process/progress'

const store = useProcessProgressStore()
const { rows } = storeToRefs(store)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.projectName.includes(q) ||
      r.phase.includes(q) ||
      r.owner.includes(q) ||
      r.milestone.includes(q) ||
      String(r.percent).includes(q),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  projectName: '',
  phase: '',
  percent: 0 as number | null,
  owner: '',
  milestone: '',
  updateDate: null as number | null,
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    projectName: '',
    phase: '',
    percent: 0,
    owner: '',
    milestone: '',
    updateDate: Date.now(),
    remark: '',
  }
  modalShow.value = true
}

function openEdit(row: ProgressRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    projectName: row.projectName,
    phase: row.phase,
    percent: row.percent,
    owner: row.owner,
    milestone: row.milestone,
    updateDate: new Date(row.updateDate).getTime(),
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.projectName.trim() || !form.value.owner.trim()) {
    message.warning('请填写项目名称与负责人')
    return
  }
  const p = Number(form.value.percent)
  if (Number.isNaN(p) || p < 0 || p > 100) {
    message.warning('进度应为 0–100')
    return
  }
  if (!form.value.updateDate) {
    message.warning('请选择更新日期')
    return
  }
  const updateDate = new Date(form.value.updateDate).toISOString().slice(0, 10)
  const payload = {
    projectName: form.value.projectName.trim(),
    phase: form.value.phase.trim() || '—',
    percent: Math.round(p),
    owner: form.value.owner.trim(),
    milestone: form.value.milestone.trim() || '—',
    updateDate,
    remark: form.value.remark.trim() || undefined,
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

function confirmDelete(row: ProgressRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除项目「${row.projectName}」进度记录？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      store.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed((): DataTableColumns<ProgressRow> => [
  { title: '项目名称', key: 'projectName', minWidth: 160, ellipsis: { tooltip: true } },
  { title: '阶段', key: 'phase', width: 120, ellipsis: { tooltip: true } },
  {
    title: '进度',
    key: 'percent',
    width: 88,
    align: 'center',
    render(row) {
      return `${row.percent}%`
    },
  },
  { title: '负责人', key: 'owner', width: 120, ellipsis: { tooltip: true } },
  { title: '里程碑', key: 'milestone', minWidth: 140, ellipsis: { tooltip: true } },
  { title: '更新日期', key: 'updateDate', width: 120 },
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
  <NCard class="page-card page-card--fill" title="项目进度" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">里程碑与完成百分比</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="项目、阶段、负责人"
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
          :scroll-x="1200"
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
        <NFormItem label="项目名称">
          <NInput v-model:value="form.projectName" />
        </NFormItem>
        <NFormItem label="阶段">
          <NInput v-model:value="form.phase" />
        </NFormItem>
        <NFormItem label="进度(%)">
          <NInputNumber v-model:value="form.percent" :min="0" :max="100" style="width: 100%" />
        </NFormItem>
        <NFormItem label="负责人">
          <NInput v-model:value="form.owner" />
        </NFormItem>
        <NFormItem label="里程碑">
          <NInput v-model:value="form.milestone" />
        </NFormItem>
        <NFormItem label="更新日期">
          <NDatePicker v-model:value="form.updateDate" type="date" style="width: 100%" />
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
</style>
