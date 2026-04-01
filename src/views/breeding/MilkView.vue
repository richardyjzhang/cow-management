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
  NSelect,
  NDatePicker,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { SearchOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useBaseCowStore } from '@/stores/base/cow'
import { useBreedingMilkStore } from '@/stores/breeding/milk'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { MilkRow } from '@/mock/breeding/milk'

const cowStore = useBaseCowStore()
const milkStore = useBreedingMilkStore()
const { cows } = storeToRefs(cowStore)
const { rows } = storeToRefs(milkStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  const lower = q.toLowerCase()
  return rows.value.filter(
    (r) =>
      r.earTag.includes(q) ||
      r.period.toLowerCase().includes(lower) ||
      (r.remark?.includes(q) ?? false) ||
      String(r.dailyKg).includes(q),
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

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  earTag: null as string | null,
  recordDate: null as number | null,
  dailyKg: 0 as number | null,
  period: '',
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    earTag: earTagOptions.value[0]?.value ?? null,
    recordDate: Date.now(),
    dailyKg: 0,
    period: '',
    remark: '',
  }
  modalShow.value = true
}

function openEdit(row: MilkRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    earTag: row.earTag,
    recordDate: new Date(row.recordDate).getTime(),
    dailyKg: row.dailyKg,
    period: row.period,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.earTag?.trim()) {
    message.warning('请选择耳标号')
    return
  }
  if (!form.value.recordDate) {
    message.warning('请选择记录日期')
    return
  }
  const daily = Number(form.value.dailyKg)
  if (Number.isNaN(daily) || daily < 0) {
    message.warning('请填写有效产奶量')
    return
  }
  const recordDate = new Date(form.value.recordDate).toISOString().slice(0, 10)
  const payload = {
    earTag: form.value.earTag.trim(),
    recordDate,
    dailyKg: daily,
    period: form.value.period.trim() || '—',
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    milkStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    milkStore.update(editingId.value, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: MilkRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除该条产奶记录？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      milkStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed<DataTableColumns<MilkRow>>(() => [
  { title: '耳标号', key: 'earTag', width: 140, ellipsis: { tooltip: true } },
  { title: '记录日期', key: 'recordDate', width: 120 },
  {
    title: '日产奶(kg)',
    key: 'dailyKg',
    width: 120,
    align: 'right',
    render(row) {
      return row.dailyKg.toFixed(1)
    },
  },
  { title: '泌乳阶段', key: 'period', minWidth: 120, ellipsis: { tooltip: true } },
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
  <NCard class="page-card page-card--fill" title="产奶记录" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">按日登记单产，便于泌乳曲线分析</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="耳标、阶段、产奶量"
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
          :scroll-x="900"
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
          />
        </NFormItem>
        <NFormItem label="记录日期">
          <NDatePicker v-model:value="form.recordDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="日产奶(kg)">
          <NInputNumber v-model:value="form.dailyKg" :min="0" :max="999" :step="0.1" style="width: 100%" />
        </NFormItem>
        <NFormItem label="泌乳阶段">
          <NInput v-model:value="form.period" placeholder="如：泌乳高峰期" />
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
