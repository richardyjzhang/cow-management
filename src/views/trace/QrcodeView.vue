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
  NInputNumber,
  NDatePicker,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { SearchOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useBaseCowStore } from '@/stores/base/cow'
import { useTraceQrcodeStore } from '@/stores/trace/qrcode'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { QrcodeRow, QrcodeStatus } from '@/mock/trace/qrcode'

const cowStore = useBaseCowStore()
const qrcodeStore = useTraceQrcodeStore()
const { cows } = storeToRefs(cowStore)
const { rows } = storeToRefs(qrcodeStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.earTag.includes(q) ||
      r.traceCode.includes(q) ||
      String(r.scanCount).includes(q) ||
      r.status.includes(q),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const earTagOptions = computed(() =>
  cows.value.map((c) => ({
    label: `${c.earTag}（${c.farmerName}）`,
    value: c.earTag,
  })),
)

const statusOptions = [
  { label: '有效', value: '有效' as QrcodeStatus },
  { label: '已失效', value: '已失效' as QrcodeStatus },
]

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  earTag: null as string | null,
  traceCode: '',
  issueDate: null as number | null,
  scanCount: 0,
  status: '有效' as QrcodeStatus,
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  const tag = earTagOptions.value[0]?.value ?? null
  form.value = {
    earTag: tag,
    traceCode: tag ? qrcodeStore.genTraceCode(tag) : '',
    issueDate: Date.now(),
    scanCount: 0,
    status: '有效',
    remark: '',
  }
  modalShow.value = true
}

function openEdit(row: QrcodeRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    earTag: row.earTag,
    traceCode: row.traceCode,
    issueDate: new Date(row.issueDate).getTime(),
    scanCount: row.scanCount,
    status: row.status,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function onEarTagChange() {
  const t = form.value.earTag
  if (modalMode.value === 'add' && t) {
    form.value.traceCode = qrcodeStore.genTraceCode(t)
  }
}

function submitModal() {
  if (!form.value.earTag?.trim()) {
    message.warning('请选择耳标号')
    return
  }
  if (!form.value.traceCode.trim()) {
    message.warning('请填写溯源码')
    return
  }
  if (!form.value.issueDate) {
    message.warning('请选择签发日期')
    return
  }
  const issueDate = new Date(form.value.issueDate).toISOString().slice(0, 10)
  const payload = {
    earTag: form.value.earTag.trim(),
    traceCode: form.value.traceCode.trim(),
    issueDate,
    scanCount: Number(form.value.scanCount) || 0,
    status: form.value.status,
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    if (rows.value.some((r) => r.traceCode === payload.traceCode)) {
      message.warning('溯源码已存在')
      return
    }
    qrcodeStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    const id = editingId.value
    const dup = rows.value.find((r) => r.traceCode === payload.traceCode && r.id !== id)
    if (dup) {
      message.warning('溯源码已存在')
      return
    }
    qrcodeStore.update(id, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: QrcodeRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除溯源码「${row.traceCode}」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      qrcodeStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed((): DataTableColumns<QrcodeRow> => [
  { title: '耳标号', key: 'earTag', width: 140, ellipsis: { tooltip: true } },
  { title: '溯源码', key: 'traceCode', minWidth: 200, ellipsis: { tooltip: true } },
  { title: '签发日期', key: 'issueDate', width: 120 },
  { title: '扫码次数', key: 'scanCount', width: 100, align: 'center' },
  { title: '状态', key: 'status', width: 90 },
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
  <NCard class="page-card page-card--fill" title="二维码溯源" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">新增时按耳标自动生成溯源码，可手动调整</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="耳标、溯源码、状态"
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
          :scroll-x="1100"
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
        <NFormItem label="耳标号">
          <NSelect
            v-model:value="form.earTag"
            filterable
            placeholder="选择耳标"
            :options="earTagOptions"
            value-field="value"
            label-field="label"
            @update:value="onEarTagChange"
          />
        </NFormItem>
        <NFormItem label="溯源码">
          <NInput v-model:value="form.traceCode" placeholder="溯源码" />
        </NFormItem>
        <NFormItem label="签发日期">
          <NDatePicker v-model:value="form.issueDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="扫码次数">
          <NInputNumber v-model:value="form.scanCount" :min="0" style="width: 100%" />
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
