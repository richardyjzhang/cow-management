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
import { useStatsFundStore } from '@/stores/stats/fund'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { FundRow } from '@/mock/stats/fund'

const fundStore = useStatsFundStore()
const { rows } = storeToRefs(fundStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.projectName.includes(q) ||
      r.category.includes(q) ||
      r.voucherNo.includes(q) ||
      String(r.amount).includes(q) ||
      (r.remark?.includes(q) ?? false),
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
  amount: 0 as number | null,
  category: '',
  happenDate: null as number | null,
  voucherNo: '',
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    projectName: '',
    amount: 0,
    category: '',
    happenDate: Date.now(),
    voucherNo: '',
    remark: '',
  }
  modalShow.value = true
}

function openEdit(row: FundRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    projectName: row.projectName,
    amount: row.amount,
    category: row.category,
    happenDate: new Date(row.happenDate).getTime(),
    voucherNo: row.voucherNo,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.projectName.trim() || !form.value.category.trim()) {
    message.warning('请填写项目与类别')
    return
  }
  if (form.value.amount === null || Number.isNaN(Number(form.value.amount))) {
    message.warning('请填写金额')
    return
  }
  if (!form.value.happenDate) {
    message.warning('请选择发生日期')
    return
  }
  const happenDate = new Date(form.value.happenDate).toISOString().slice(0, 10)
  const payload = {
    projectName: form.value.projectName.trim(),
    amount: Number(form.value.amount),
    category: form.value.category.trim(),
    happenDate,
    voucherNo: form.value.voucherNo.trim() || '—',
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    fundStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    fundStore.update(editingId.value, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: FundRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除资金流水「${row.voucherNo}」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      fundStore.remove(row.id)
      message.success('已删除')
    },
  })
}

function formatAmount(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const columns = computed((): DataTableColumns<FundRow> => [
  { title: '项目', key: 'projectName', minWidth: 160, ellipsis: { tooltip: true } },
  {
    title: '金额(元)',
    key: 'amount',
    width: 130,
    align: 'right',
    render(row) {
      const s = formatAmount(row.amount)
      return row.amount < 0 ? h('span', { style: { color: '#d03050' } }, s) : s
    },
  },
  { title: '类别', key: 'category', width: 110, ellipsis: { tooltip: true } },
  { title: '发生日期', key: 'happenDate', width: 120 },
  { title: '凭证号', key: 'voucherNo', width: 120, ellipsis: { tooltip: true } },
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
  <NCard class="page-card page-card--fill" title="资金统计" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">项目资金收支流水登记</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="项目、类别、凭证号"
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
        <NFormItem label="项目">
          <NInput v-model:value="form.projectName" />
        </NFormItem>
        <NFormItem label="金额(元)">
          <NInputNumber v-model:value="form.amount" :step="100" style="width: 100%" />
        </NFormItem>
        <NFormItem label="类别">
          <NInput v-model:value="form.category" placeholder="补贴发放、项目支出等" />
        </NFormItem>
        <NFormItem label="发生日期">
          <NDatePicker v-model:value="form.happenDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="凭证号">
          <NInput v-model:value="form.voucherNo" />
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
