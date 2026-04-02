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
import { useBreedingImmunityStore } from '@/stores/breeding/immunity'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { ImmunityRow } from '@/mock/breeding/immunity'

const cowStore = useBaseCowStore()
const immunityStore = useBreedingImmunityStore()
const { cows } = storeToRefs(cowStore)
const { rows } = storeToRefs(immunityStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.earTag.includes(q) ||
      r.vaccineName.includes(q) ||
      r.batchNo.includes(q) ||
      (r.remark?.includes(q) ?? false) ||
      r.injectDate.includes(q),
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
  vaccineName: '',
  batchNo: '',
  injectDate: null as number | null,
  nextDate: null as number | null,
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    earTag: earTagOptions.value[0]?.value ?? null,
    vaccineName: '',
    batchNo: '',
    injectDate: Date.now(),
    nextDate: null,
    remark: '',
  }
  modalShow.value = true
}

function openEdit(row: ImmunityRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    earTag: row.earTag,
    vaccineName: row.vaccineName,
    batchNo: row.batchNo,
    injectDate: new Date(row.injectDate).getTime(),
    nextDate: row.nextDate ? new Date(row.nextDate).getTime() : null,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.earTag?.trim()) {
    message.warning('请选择耳标号')
    return
  }
  if (!form.value.vaccineName.trim() || !form.value.batchNo.trim()) {
    message.warning('请填写疫苗名称与批号')
    return
  }
  if (!form.value.injectDate) {
    message.warning('请选择免疫日期')
    return
  }
  const injectDate = new Date(form.value.injectDate).toISOString().slice(0, 10)
  const nextDate = form.value.nextDate
    ? new Date(form.value.nextDate).toISOString().slice(0, 10)
    : ''
  const payload = {
    earTag: form.value.earTag.trim(),
    vaccineName: form.value.vaccineName.trim(),
    batchNo: form.value.batchNo.trim(),
    injectDate,
    nextDate,
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    immunityStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    immunityStore.update(editingId.value, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: ImmunityRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除该条免疫记录？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      immunityStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed((): DataTableColumns<ImmunityRow> => [
  { title: '耳标号', key: 'earTag', width: 140, ellipsis: { tooltip: true } },
  { title: '疫苗', key: 'vaccineName', minWidth: 140, ellipsis: { tooltip: true } },
  { title: '批号', key: 'batchNo', width: 120, ellipsis: { tooltip: true } },
  { title: '免疫日期', key: 'injectDate', width: 120 },
  { title: '下次免疫', key: 'nextDate', width: 120 },
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
  <NCard class="page-card page-card--fill" title="免疫记录" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">按耳标关联奶牛，支持批号与下次免疫提醒</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="耳标、疫苗、批号"
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
        <NFormItem label="疫苗名称">
          <NInput v-model:value="form.vaccineName" placeholder="疫苗名称" />
        </NFormItem>
        <NFormItem label="批号">
          <NInput v-model:value="form.batchNo" placeholder="生产批号" />
        </NFormItem>
        <NFormItem label="免疫日期">
          <NDatePicker v-model:value="form.injectDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="下次免疫">
          <NDatePicker v-model:value="form.nextDate" type="date" style="width: 100%" />
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
