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
import { useBreedingMatingStore } from '@/stores/breeding/mating'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { MatingRow } from '@/mock/breeding/mating'

const cowStore = useBaseCowStore()
const matingStore = useBreedingMatingStore()
const { cows } = storeToRefs(cowStore)
const { rows } = storeToRefs(matingStore)

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
      r.bullNo.includes(q) ||
      r.method.toLowerCase().includes(lower) ||
      r.expectedCalving.includes(q),
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
  mateDate: null as number | null,
  bullNo: '',
  method: '人工授精',
  expectedCalving: null as number | null,
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    earTag: earTagOptions.value[0]?.value ?? null,
    mateDate: Date.now(),
    bullNo: '',
    method: '人工授精',
    expectedCalving: null,
    remark: '',
  }
  modalShow.value = true
}

function openEdit(row: MatingRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    earTag: row.earTag,
    mateDate: new Date(row.mateDate).getTime(),
    bullNo: row.bullNo,
    method: row.method,
    expectedCalving: row.expectedCalving ? new Date(row.expectedCalving).getTime() : null,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.earTag?.trim()) {
    message.warning('请选择耳标号')
    return
  }
  if (!form.value.mateDate) {
    message.warning('请选择配种日期')
    return
  }
  if (!form.value.bullNo.trim() || !form.value.method.trim()) {
    message.warning('请填写冻精号/公牛号与配种方式')
    return
  }
  const mateDate = new Date(form.value.mateDate).toISOString().slice(0, 10)
  const expectedCalving = form.value.expectedCalving
    ? new Date(form.value.expectedCalving).toISOString().slice(0, 10)
    : ''
  const payload = {
    earTag: form.value.earTag.trim(),
    mateDate,
    bullNo: form.value.bullNo.trim(),
    method: form.value.method.trim(),
    expectedCalving,
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    matingStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    matingStore.update(editingId.value, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: MatingRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除该条配种记录？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      matingStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed<DataTableColumns<MatingRow>>(() => [
  { title: '耳标号', key: 'earTag', width: 140, ellipsis: { tooltip: true } },
  { title: '配种日期', key: 'mateDate', width: 120 },
  { title: '冻精/公牛', key: 'bullNo', minWidth: 160, ellipsis: { tooltip: true } },
  { title: '方式', key: 'method', width: 100, ellipsis: { tooltip: true } },
  { title: '预计产犊', key: 'expectedCalving', width: 120 },
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
  <NCard class="page-card page-card--fill" title="配种记录" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">母牛配种与预产期登记</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="耳标、冻精号、方式"
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
        <NFormItem label="配种日期">
          <NDatePicker v-model:value="form.mateDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="冻精/公牛">
          <NInput v-model:value="form.bullNo" placeholder="冻精号或公牛号" />
        </NFormItem>
        <NFormItem label="方式">
          <NInput v-model:value="form.method" placeholder="如：人工授精" />
        </NFormItem>
        <NFormItem label="预计产犊">
          <NDatePicker v-model:value="form.expectedCalving" type="date" style="width: 100%" />
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
