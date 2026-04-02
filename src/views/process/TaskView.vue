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
import { useLocaleEnum } from '@/composables/useLocaleEnum'
import type { TaskRow, TaskStatus } from '@/mock/process/task'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const { taskStatus, taskPriority } = useLocaleEnum()
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

const statusOptions = computed((): { label: string; value: TaskStatus }[] => [
  { label: taskStatus('待办'), value: '待办' },
  { label: taskStatus('进行中'), value: '进行中' },
  { label: taskStatus('已完成'), value: '已完成' },
  { label: taskStatus('已取消'), value: '已取消' },
])

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
    message.warning(t('task.msgTitleAssignee'))
    return
  }
  if (!form.value.dueDate) {
    message.warning(t('task.msgDue'))
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
    message.success(t('common.added'))
  } else if (editingId.value) {
    taskStore.update(editingId.value, payload)
    message.success(t('common.saved'))
  }
  modalShow.value = false
}

function confirmDelete(row: TaskRow) {
  dialog.warning({
    title: t('common.confirmDeleteTitle'),
    content: t('task.deleteContent', { title: row.title }),
    positiveText: t('common.confirmDeleteOk'),
    negativeText: t('common.cancel'),
    onPositiveClick: () => {
      taskStore.remove(row.id)
      message.success(t('common.deleted'))
    },
  })
}

const columns = computed((): DataTableColumns<TaskRow> => {
  void locale.value
  return [
  { title: t('common.taskTitle'), key: 'title', minWidth: 180, ellipsis: { tooltip: true } },
  { title: t('common.type'), key: 'type', width: 100, ellipsis: { tooltip: true } },
  { title: t('common.assignee'), key: 'assignee', width: 130, ellipsis: { tooltip: true } },
  { title: t('common.dueShort'), key: 'dueDate', width: 120 },
  {
    title: t('common.priority'),
    key: 'priority',
    width: 88,
    align: 'center',
    render(row) {
      return taskPriority(row.priority)
    },
  },
  {
    title: t('common.status'),
    key: 'status',
    width: 90,
    render(row) {
      return taskStatus(row.status)
    },
  },
  {
    title: t('common.remark'),
    key: 'remark',
    minWidth: 120,
    ellipsis: { tooltip: true },
    render(row) {
      return row.remark ?? t('common.dash')
    },
  },
  {
    title: t('common.actions'),
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
                default: () => t('common.edit'),
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
                default: () => t('common.delete'),
                icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
              },
            ),
          ],
        },
      )
    },
  },
]
})

function handleSearch() {
  //
}
</script>

<template>
  <NCard class="page-card page-card--fill" :title="t('task.pageTitle')" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">{{ t('task.hint') }}</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          :placeholder="t('task.searchPh')"
          style="width: 16rem"
          @keyup.enter="handleSearch"
        />
        <NButton type="primary" @click="handleSearch">
          <template #icon>
            <SearchOutline />
          </template>
          {{ t('common.search') }}
        </NButton>
        <NButton type="primary" @click="openAdd">
          <template #icon>
            <AddOutline />
          </template>
          {{ t('common.add') }}
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
      :title="modalMode === 'add' ? t('common.add') : t('common.edit')"
      style="width: 28rem"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="96">
        <NFormItem :label="t('task.formTitle')">
          <NInput v-model:value="form.title" :placeholder="t('task.phTitle')" />
        </NFormItem>
        <NFormItem :label="t('task.formType')">
          <NInput v-model:value="form.type" :placeholder="t('task.phType')" />
        </NFormItem>
        <NFormItem :label="t('task.formAssignee')">
          <NInput v-model:value="form.assignee" :placeholder="t('task.phAssignee')" />
        </NFormItem>
        <NFormItem :label="t('task.formDue')">
          <NDatePicker v-model:value="form.dueDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem :label="t('task.formPriority')">
          <NInput v-model:value="form.priority" :placeholder="t('task.phPriority')" />
        </NFormItem>
        <NFormItem :label="t('task.formStatus')">
          <NSelect v-model:value="form.status" :options="statusOptions" />
        </NFormItem>
        <NFormItem :label="t('task.formRemark')">
          <NInput v-model:value="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="modalShow = false">{{ t('common.cancel') }}</NButton>
          <NButton type="primary" @click="submitModal">{{ t('common.confirm') }}</NButton>
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
