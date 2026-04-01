<script setup lang="ts">
import { h, ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { SearchOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useBaseRegionStore } from '@/stores/base/region'
import { useBaseFarmerStore } from '@/stores/base/farmer'
import { useBaseCowStore } from '@/stores/base/cow'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { FarmerRow } from '@/mock/base/farmer'

const regionStore = useBaseRegionStore()
const farmerStore = useBaseFarmerStore()
const cowStore = useBaseCowStore()
const { tree } = storeToRefs(regionStore)
const { farmers } = storeToRefs(farmerStore)

const dialog = useDialog()
const message = useMessage()

const keyword = ref('')
const townshipId = ref<string | null>(null)
const villageId = ref<string | null>(null)

const townshipOptions = computed(() =>
  tree.value.map((t) => ({ label: t.name, value: t.id })),
)

const villageOptions = computed(() => {
  if (townshipId.value) {
    const tw = tree.value.find((t) => t.id === townshipId.value)
    return (tw?.children ?? []).map((v) => ({ label: v.name, value: v.id }))
  }
  const all: { label: string; value: string }[] = []
  for (const tw of tree.value) {
    for (const v of tw.children ?? []) {
      all.push({ label: `${tw.name} / ${v.name}`, value: v.id })
    }
  }
  return all
})

const villageFormOptions = computed(() =>
  regionStore.listVillagesMeta().map((m) => ({
    label: `${m.townshipName} / ${m.villageName}`,
    value: m.villageId,
    townshipName: m.townshipName,
    villageName: m.villageName,
  })),
)

watch(townshipId, () => {
  villageId.value = null
})

const filteredData = computed(() => {
  let rows = farmers.value
  if (villageId.value) rows = rows.filter((r) => r.villageId === villageId.value)
  else if (townshipId.value) {
    const tw = tree.value.find((t) => t.id === townshipId.value)
    const ids = new Set((tw?.children ?? []).map((v) => v.id))
    rows = rows.filter((r) => ids.has(r.villageId))
  }
  const q = keyword.value.trim()
  if (!q) return rows
  const lower = q.toLowerCase()
  return rows.filter(
    (r) =>
      r.headName.includes(q) ||
      r.phone.includes(q) ||
      r.idCard.includes(q) ||
      r.villageName.includes(q) ||
      r.townshipName.includes(q) ||
      r.breedingCondition.toLowerCase().includes(lower),
  )
})

const rowTotal = computed(() => filteredData.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch([keyword, townshipId, villageId], () => resetPage())

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  villageSelect: null as string | null,
  headName: '',
  idCard: '',
  phone: '',
  familySize: 4,
  laborForce: 2,
  breedingCondition: '',
})

function resolveVillageMeta(vid: string) {
  const meta = villageFormOptions.value.find((o) => o.value === vid)
  return meta
    ? { townshipName: meta.townshipName, villageName: meta.villageName }
    : { townshipName: '', villageName: '' }
}

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    villageSelect: villageFormOptions.value[0]?.value ?? null,
    headName: '',
    idCard: '',
    phone: '',
    familySize: 4,
    laborForce: 2,
    breedingCondition: '',
  }
  modalShow.value = true
}

function openEdit(row: FarmerRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    villageSelect: row.villageId,
    headName: row.headName,
    idCard: row.idCard,
    phone: row.phone,
    familySize: row.familySize,
    laborForce: row.laborForce,
    breedingCondition: row.breedingCondition,
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.villageSelect) {
    message.warning('请选择所属行政村')
    return
  }
  if (!form.value.headName.trim() || !form.value.phone.trim()) {
    message.warning('请填写户主与联系电话')
    return
  }
  const { townshipName, villageName } = resolveVillageMeta(form.value.villageSelect)
  if (!townshipName) {
    message.warning('行政村数据无效，请重新选择')
    return
  }
  const payload = {
    villageId: form.value.villageSelect,
    villageName,
    townshipName,
    headName: form.value.headName.trim(),
    idCard: form.value.idCard.trim(),
    phone: form.value.phone.trim(),
    familySize: Number(form.value.familySize) || 0,
    laborForce: Number(form.value.laborForce) || 0,
    breedingCondition: form.value.breedingCondition.trim(),
  }
  if (modalMode.value === 'add') {
    farmerStore.addFarmer(payload)
    message.success('已新增养殖户')
  } else if (editingId.value) {
    farmerStore.updateFarmer(editingId.value, payload)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: FarmerRow) {
  const n = cowStore.countByFarmerId(row.id)
  dialog.warning({
    title: '确认删除',
    content:
      n > 0
        ? `确定删除养殖户「${row.headName}」？将同步删除其名下 ${n} 头奶牛档案，且不可恢复。`
        : `确定删除养殖户「${row.headName}」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      farmerStore.removeFarmer(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed<DataTableColumns<FarmerRow>>(() => [
  { title: '乡镇', key: 'townshipName', width: 110, ellipsis: { tooltip: true } },
  { title: '行政村', key: 'villageName', width: 110, ellipsis: { tooltip: true } },
  { title: '户主', key: 'headName', width: 100, ellipsis: { tooltip: true } },
  { title: '身份证号', key: 'idCard', width: 180, ellipsis: { tooltip: true } },
  { title: '联系电话', key: 'phone', width: 130 },
  { title: '家庭人口', key: 'familySize', width: 88, align: 'center' },
  { title: '劳动力', key: 'laborForce', width: 80, align: 'center' },
  {
    title: '养殖条件',
    key: 'breedingCondition',
    minWidth: 200,
    ellipsis: { tooltip: true },
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
  <NCard class="page-card page-card--fill" title="养殖户管理" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">行政村 → 养殖户 两级筛选（先选乡镇再选村）</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NSelect
          v-model:value="townshipId"
          clearable
          placeholder="全部乡镇"
          :options="townshipOptions"
          style="width: 11rem"
        />
        <NSelect
          v-model:value="villageId"
          clearable
          placeholder="全部行政村"
          filterable
          :options="villageOptions"
          style="width: 15rem"
        />
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="户主、电话、身份证、村名"
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
          :data="filteredData"
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
        <NFormItem label="行政村">
          <NSelect
            v-model:value="form.villageSelect"
            filterable
            placeholder="请选择行政村"
            :options="villageFormOptions"
            value-field="value"
            label-field="label"
          />
        </NFormItem>
        <NFormItem label="户主">
          <NInput v-model:value="form.headName" placeholder="户主姓名" />
        </NFormItem>
        <NFormItem label="身份证号">
          <NInput v-model:value="form.idCard" placeholder="身份证号码" />
        </NFormItem>
        <NFormItem label="联系电话">
          <NInput v-model:value="form.phone" placeholder="手机号" />
        </NFormItem>
        <NFormItem label="家庭人口">
          <NInputNumber v-model:value="form.familySize" :min="1" :max="30" style="width: 100%" />
        </NFormItem>
        <NFormItem label="劳动力">
          <NInputNumber v-model:value="form.laborForce" :min="0" :max="30" style="width: 100%" />
        </NFormItem>
        <NFormItem label="养殖条件">
          <NInput
            v-model:value="form.breedingCondition"
            type="textarea"
            placeholder="棚圈、饲草、水源等"
            :autosize="{ minRows: 2, maxRows: 5 }"
          />
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
