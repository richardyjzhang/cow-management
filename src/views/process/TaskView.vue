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
import { useProcessTaskStore } from '@/stores/process/task'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { TaskRow, TaskStatus } from '@/mock/process/task'

const taskStore = useProcessTaskStore()
const { rows } = storeToRefs(taskStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  const lower = q.toLowerCase()
  return rows.value.filter(
    (r) =>
      r.title.includes(q) ||
      r.type.includes(q) ||
      r.assignee.includes(q) ||
      r.priority.includes(q) ||
      r.status.includes(q) ||
      r.dueDate.includes(q) ||
      (r.remark?.toLowerCase().includes(lower) ?? false),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: '待办', value: '待办' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已取消', value: '已取消' },
]

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  title: '',
  type: '',
  assignee: '',
  dueDate: null as number | null,
  priority: '中',
  status: '待办' as TaskStatus,
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    title: '',
    type: '',
    assignee: '',
    dueDate: Date.now(),
    priority: '中',
    status: '待办',
    remark: '',
  }
  modalShow.value = true
}

function openEdit(row: TaskRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    title: row.title,
    type: row.type,
    assignee: row.assignee,
    dueDate: new Date(row.dueDate).getTime(),
    priority: row.priority,
    status: row.status,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.title.trim() || !form.value.assignee.trim()) {
    message.warning('请填写任务标题与责任人')
    return
  }
  if (!form.value.dueDate) {
    message.warning('请选择截止日期')
    return
  }
  const dueDate = new Date(form.value.dueDate).toISOString().slice(0, 10)
  const payload = {
    title: form.value.title.trim(),
    type: form.value.type.trim() || '常规',
    assignee: form.value.assignee.trim(),
    dueDate,
    priority: form.value.priority.trim() || '中',
    status: form.value.status,
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    taskStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    taskStore.update(editingId.value, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: TaskRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除任务「${row.title}」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      taskStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed<DataTableColumns<TaskRow>>(() => [
  { title: '任务标题', key: 'title', minWidth: 180, ellipsis: { tooltip: true } },
  { title: '类型', key: 'type', width: 100, ellipsis: { tooltip: true } },
  { title: '责任人', key: 'assignee', width: 130, ellipsis: { tooltip: true } },
  { title: '截止', key: 'dueDate', width: 120 },
  { title: '优先级', key: 'priority', width: 88, align: 'center' },
  { title: '状态', key: 'status', width: 90 },
  {
    title: '备注',
    key: 'remark',
    minWidth: 120,
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
  <NCard class="page-card page-card--fill" title="任务管理" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">项目任务分解与状态跟踪</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="标题、类型、责任人、状态"
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
        <NFormItem label="标题">
          <NInput v-model:value="form.title" placeholder="任务标题" />
        </NFormItem>
        <NFormItem label="类型">
          <NInput v-model:value="form.type" placeholder="如：防疫、补贴" />
        </NFormItem>
        <NFormItem label="责任人">
          <NInput v-model:value="form.assignee" placeholder="责任人/单位" />
        </NFormItem>
        <NFormItem label="截止日期">
          <NDatePicker v-model:value="form.dueDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="优先级">
          <NInput v-model:value="form.priority" placeholder="高 / 中 / 低" />
        </NFormItem>
        <NFormItem label="状态">
          <NSelect v-model:value="form.status" :options="statusOptions" />
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
