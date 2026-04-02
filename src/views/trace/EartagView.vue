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
import { useBaseCowStore } from '@/stores/base/cow'
import { useTraceEartagStore } from '@/stores/trace/eartag'
import { useTraceQrcodeStore } from '@/stores/trace/qrcode'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { EartagRow, EartagStatus } from '@/mock/trace/eartag'

const cowStore = useBaseCowStore()
const eartagStore = useTraceEartagStore()
const qrcodeStore = useTraceQrcodeStore()
const { cows } = storeToRefs(cowStore)
const { rows } = storeToRefs(eartagStore)
const { rows: qrRows } = storeToRefs(qrcodeStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.earTag.includes(q) ||
      r.farmerName.includes(q) ||
      r.status.includes(q) ||
      (r.remark?.includes(q) ?? false),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const statusOptions = [
  { label: '在库', value: '在库' as EartagStatus },
  { label: '已绑定', value: '已绑定' as EartagStatus },
  { label: '作废', value: '作废' as EartagStatus },
]

const cowOptions = computed(() =>
  cows.value.map((c) => ({
    label: `${c.earTag}（${c.farmerName}）`,
    value: c.id,
    earTag: c.earTag,
    farmerName: c.farmerName,
  })),
)

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  earTag: '',
  cowId: null as string | null,
  farmerName: '',
  status: '在库' as EartagStatus,
  bindDate: null as number | null,
  remark: '',
})

function syncFromCow(cowId: string | null) {
  if (!cowId) {
    form.value.farmerName = ''
    form.value.earTag = ''
    return
  }
  const opt = cowOptions.value.find((o) => o.value === cowId)
  if (opt) {
    form.value.earTag = opt.earTag
    form.value.farmerName = opt.farmerName
    if (form.value.status === '已绑定') {
      form.value.bindDate = form.value.bindDate ?? Date.now()
    }
  }
}

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    earTag: '',
    cowId: cowOptions.value[0]?.value ?? null,
    farmerName: '',
    status: '在库',
    bindDate: null,
    remark: '',
  }
  syncFromCow(form.value.cowId)
  modalShow.value = true
}

function openEdit(row: EartagRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    earTag: row.earTag,
    cowId: row.cowId || null,
    farmerName: row.farmerName,
    status: row.status,
    bindDate: row.bindDate ? new Date(row.bindDate).getTime() : null,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.earTag.trim()) {
    message.warning('请填写或选择耳标号')
    return
  }
  if (form.value.status === '已绑定') {
    if (!form.value.cowId) {
      message.warning('已绑定状态需关联奶牛档案')
      return
    }
    if (!form.value.bindDate) {
      message.warning('请选择绑定日期')
      return
    }
  }
  const bindDate = form.value.bindDate
    ? new Date(form.value.bindDate).toISOString().slice(0, 10)
    : ''
  const payload = {
    earTag: form.value.earTag.trim(),
    cowId: form.value.cowId ?? '',
    farmerName: form.value.farmerName.trim(),
    status: form.value.status,
    bindDate,
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    if (rows.value.some((r) => r.earTag === payload.earTag)) {
      message.warning('该耳标号已存在')
      return
    }
    eartagStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    const id = editingId.value
    const other = rows.value.find((r) => r.earTag === payload.earTag && r.id !== id)
    if (other) {
      message.warning('已存在相同耳标号')
      return
    }
    eartagStore.update(id, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: EartagRow) {
  if (qrRows.value.some((q) => q.earTag === row.earTag)) {
    message.warning('该耳标已生成溯源二维码，请先在二维码溯源中处理后再删除')
    return
  }
  dialog.warning({
    title: '确认删除',
    content: `确定删除耳标「${row.earTag}」记录？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      eartagStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed((): DataTableColumns<EartagRow> => [
  { title: '耳标号', key: 'earTag', width: 150, ellipsis: { tooltip: true } },
  { title: '养殖户', key: 'farmerName', width: 110, ellipsis: { tooltip: true } },
  { title: '状态', key: 'status', width: 90 },
  { title: '绑定日期', key: 'bindDate', width: 120, render: (r) => r.bindDate || '—' },
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
  <NCard class="page-card page-card--fill" title="耳标管理" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">与奶牛档案绑定，删除前需无溯源二维码记录</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="耳标、养殖户、状态"
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
          :scroll-x="1000"
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
        <NFormItem label="状态">
          <NSelect v-model:value="form.status" :options="statusOptions" />
        </NFormItem>
        <NFormItem label="关联奶牛">
          <NSelect
            :value="form.cowId"
            filterable
            clearable
            placeholder="绑定奶牛档案"
            :options="cowOptions"
            value-field="value"
            label-field="label"
            @update:value="
              (v) => {
                form.cowId = v
                syncFromCow(v)
                if (form.status === '已绑定' && v) form.status = '已绑定'
              }
            "
          />
        </NFormItem>
        <NFormItem label="耳标号">
          <NInput v-model:value="form.earTag" placeholder="可手输或随奶牛带出" />
        </NFormItem>
        <NFormItem label="养殖户">
          <NInput v-model:value="form.farmerName" placeholder="随奶牛带出" />
        </NFormItem>
        <NFormItem label="绑定日期">
          <NDatePicker v-model:value="form.bindDate" type="date" style="width: 100%" />
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
