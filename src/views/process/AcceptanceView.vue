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
import { useProcessAcceptanceStore } from '@/stores/process/acceptance'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { AcceptanceRow } from '@/mock/process/acceptance'

const store = useProcessAcceptanceStore()
const { rows } = storeToRefs(store)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.materialName.includes(q) ||
      r.spec.includes(q) ||
      r.supplier.includes(q) ||
      r.result.includes(q) ||
      r.inspector.includes(q) ||
      String(r.qty).includes(q),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  materialName: '',
  spec: '',
  qty: 1 as number | null,
  unit: '',
  supplier: '',
  acceptDate: null as number | null,
  result: '合格',
  inspector: '',
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    materialName: '',
    spec: '',
    qty: 1,
    unit: '',
    supplier: '',
    acceptDate: Date.now(),
    result: '合格',
    inspector: '',
    remark: '',
  }
  modalShow.value = true
}

function openEdit(row: AcceptanceRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    materialName: row.materialName,
    spec: row.spec,
    qty: row.qty,
    unit: row.unit,
    supplier: row.supplier,
    acceptDate: new Date(row.acceptDate).getTime(),
    result: row.result,
    inspector: row.inspector,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.materialName.trim() || !form.value.supplier.trim()) {
    message.warning('请填写物资名称与供应商')
    return
  }
  if (!form.value.acceptDate) {
    message.warning('请选择验收日期')
    return
  }
  const qty = Number(form.value.qty)
  if (Number.isNaN(qty) || qty <= 0) {
    message.warning('请填写有效数量')
    return
  }
  const acceptDate = new Date(form.value.acceptDate).toISOString().slice(0, 10)
  const payload = {
    materialName: form.value.materialName.trim(),
    spec: form.value.spec.trim(),
    qty,
    unit: form.value.unit.trim() || '件',
    supplier: form.value.supplier.trim(),
    acceptDate,
    result: form.value.result.trim() || '合格',
    inspector: form.value.inspector.trim() || '—',
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

function confirmDelete(row: AcceptanceRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除验收记录「${row.materialName}」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      store.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed((): DataTableColumns<AcceptanceRow> => [
  { title: '物资名称', key: 'materialName', minWidth: 140, ellipsis: { tooltip: true } },
  { title: '规格', key: 'spec', width: 120, ellipsis: { tooltip: true } },
  {
    title: '数量',
    key: 'qty',
    width: 88,
    align: 'right',
    render(row) {
      return `${row.qty} ${row.unit}`
    },
  },
  { title: '供应商', key: 'supplier', minWidth: 140, ellipsis: { tooltip: true } },
  { title: '验收日期', key: 'acceptDate', width: 120 },
  { title: '结果', key: 'result', width: 88 },
  { title: '验收人', key: 'inspector', width: 100, ellipsis: { tooltip: true } },
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
  <NCard class="page-card page-card--fill" title="采购验收" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">物资到货验收与结果登记</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="物资、规格、供应商、验收人"
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
        <NFormItem label="物资名称">
          <NInput v-model:value="form.materialName" />
        </NFormItem>
        <NFormItem label="规格">
          <NInput v-model:value="form.spec" />
        </NFormItem>
        <NFormItem label="数量">
          <NInputNumber v-model:value="form.qty" :min="0.01" :step="1" style="width: 100%" />
        </NFormItem>
        <NFormItem label="单位">
          <NInput v-model:value="form.unit" placeholder="件、支、卷…" />
        </NFormItem>
        <NFormItem label="供应商">
          <NInput v-model:value="form.supplier" />
        </NFormItem>
        <NFormItem label="验收日期">
          <NDatePicker v-model:value="form.acceptDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="结果">
          <NInput v-model:value="form.result" />
        </NFormItem>
        <NFormItem label="验收人">
          <NInput v-model:value="form.inspector" />
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
