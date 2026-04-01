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
import { useBaseFarmerStore } from '@/stores/base/farmer'
import { useBreedingCastrationStore } from '@/stores/breeding/castration'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { CastrationRow } from '@/mock/breeding/castration'

const cowStore = useBaseCowStore()
const farmerStore = useBaseFarmerStore()
const castrationStore = useBreedingCastrationStore()
const { cows } = storeToRefs(cowStore)
const { farmers } = storeToRefs(farmerStore)
const { rows } = storeToRefs(castrationStore)

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
      r.farmerName.includes(q) ||
      r.villageName.includes(q) ||
      r.method.toLowerCase().includes(lower) ||
      r.vetName.includes(q),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const earTagOptions = computed(() =>
  cows.value.map((c) => ({
    label: `${c.earTag}（${c.farmerName}）`,
    value: c.earTag,
    farmerName: c.farmerName,
    farmerId: c.farmerId,
  })),
)

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  earTag: null as string | null,
  farmerName: '',
  villageName: '',
  castrationDate: null as number | null,
  method: '',
  vetName: '',
  remark: '',
})

function syncFromEarTag(earTag: string | null) {
  if (!earTag) {
    form.value.farmerName = ''
    form.value.villageName = ''
    return
  }
  const cow = cows.value.find((c) => c.earTag === earTag)
  if (!cow) return
  form.value.farmerName = cow.farmerName
  const f = farmers.value.find((x) => x.id === cow.farmerId)
  form.value.villageName = f?.villageName ?? ''
}

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  const first = earTagOptions.value[0]
  form.value = {
    earTag: first?.value ?? null,
    farmerName: '',
    villageName: '',
    castrationDate: Date.now(),
    method: '血去势',
    vetName: '',
    remark: '',
  }
  syncFromEarTag(form.value.earTag)
  modalShow.value = true
}

function openEdit(row: CastrationRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    earTag: row.earTag,
    farmerName: row.farmerName,
    villageName: row.villageName,
    castrationDate: new Date(row.castrationDate).getTime(),
    method: row.method,
    vetName: row.vetName,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.earTag?.trim()) {
    message.warning('请选择耳标号')
    return
  }
  if (!form.value.castrationDate) {
    message.warning('请选择去势日期')
    return
  }
  if (!form.value.method.trim() || !form.value.vetName.trim()) {
    message.warning('请填写方式与兽医')
    return
  }
  const castrationDate = new Date(form.value.castrationDate).toISOString().slice(0, 10)
  const payload = {
    earTag: form.value.earTag.trim(),
    farmerName: form.value.farmerName.trim(),
    villageName: form.value.villageName.trim(),
    castrationDate,
    method: form.value.method.trim(),
    vetName: form.value.vetName.trim(),
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    castrationStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    castrationStore.update(editingId.value, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: CastrationRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除耳标「${row.earTag}」的去势记录？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      castrationStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed<DataTableColumns<CastrationRow>>(() => [
  { title: '耳标号', key: 'earTag', width: 140, ellipsis: { tooltip: true } },
  { title: '养殖户', key: 'farmerName', width: 110, ellipsis: { tooltip: true } },
  { title: '行政村', key: 'villageName', width: 110, ellipsis: { tooltip: true } },
  { title: '去势日期', key: 'castrationDate', width: 120 },
  { title: '方式', key: 'method', width: 100, ellipsis: { tooltip: true } },
  { title: '兽医', key: 'vetName', width: 100, ellipsis: { tooltip: true } },
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
  <NCard class="page-card page-card--fill" title="公牛去势" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">仅公牛可去势，耳标来自奶牛档案</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="耳标、养殖户、方式、兽医"
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
            :value="form.earTag"
            filterable
            placeholder="选择奶牛耳标"
            :options="earTagOptions"
            value-field="value"
            label-field="label"
            @update:value="
              (v) => {
                form.earTag = v
                syncFromEarTag(v)
              }
            "
          />
        </NFormItem>
        <NFormItem label="养殖户">
          <NInput v-model:value="form.farmerName" placeholder="随耳标带出" />
        </NFormItem>
        <NFormItem label="行政村">
          <NInput v-model:value="form.villageName" placeholder="随耳标带出" />
        </NFormItem>
        <NFormItem label="去势日期">
          <NDatePicker v-model:value="form.castrationDate" type="date" style="width: 100%" />
        </NFormItem>
        <NFormItem label="方式">
          <NInput v-model:value="form.method" placeholder="如：血去势" />
        </NFormItem>
        <NFormItem label="兽医">
          <NInput v-model:value="form.vetName" placeholder="执行人" />
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
