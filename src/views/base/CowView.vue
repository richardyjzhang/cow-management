<script setup lang="ts">
import { h, ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NInputNumber,
  NTag,
  NSpace,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NSelect,
  NRadioGroup,
  NRadio,
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
import type { CowRow } from '@/mock/base/cow'

const regionStore = useBaseRegionStore()
const farmerStore = useBaseFarmerStore()
const cowStore = useBaseCowStore()
const { farmers } = storeToRefs(farmerStore)
const { cows } = storeToRefs(cowStore)

const dialog = useDialog()
const message = useMessage()

const keyword = ref('')

type FarmerWithCows = FarmerRow & { cowList: CowRow[] }

const tableData = computed<FarmerWithCows[]>(() =>
  farmers.value.map((f) => ({
    ...f,
    cowList: cows.value.filter((c) => c.farmerId === f.id),
  })),
)

const filteredData = computed(() => {
  const q = keyword.value.trim()
  if (!q) return tableData.value
  const lower = q.toLowerCase()
  return tableData.value.filter((row) => {
    if (
      row.headName.includes(q) ||
      row.phone.includes(q) ||
      row.villageName.includes(q) ||
      row.townshipName.includes(q)
    )
      return true
    return row.cowList.some(
      (c) =>
        c.earTag.includes(q) ||
        c.breed.includes(q) ||
        (c.remark?.includes(q) ?? false) ||
        c.source.toLowerCase().includes(lower),
    )
  })
})

const rowTotal = computed(() => filteredData.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const villageFormOptions = computed(() =>
  regionStore.listVillagesMeta().map((m) => ({
    label: `${m.townshipName} / ${m.villageName}`,
    value: m.villageId,
    townshipName: m.townshipName,
    villageName: m.villageName,
  })),
)

const farmerSelectOptions = computed(() =>
  farmers.value.map((f) => ({
    label: `${f.headName}（${f.townshipName}·${f.villageName}）`,
    value: f.id,
    headName: f.headName,
  })),
)

function resolveVillageMeta(vid: string) {
  const meta = villageFormOptions.value.find((o) => o.value === vid)
  return meta
    ? { townshipName: meta.townshipName, villageName: meta.villageName }
    : { townshipName: '', villageName: '' }
}

/* —— 养殖户弹窗 —— */
const farmerModalShow = ref(false)
const farmerModalMode = ref<'add' | 'edit'>('add')
const farmerEditingId = ref<string | null>(null)
const farmerForm = ref({
  villageSelect: null as string | null,
  headName: '',
  idCard: '',
  phone: '',
  familySize: 4,
  laborForce: 2,
  breedingCondition: '',
})

function openFarmerModal(mode: 'add' | 'edit', row?: FarmerRow) {
  farmerModalMode.value = mode
  if (mode === 'add') {
    farmerEditingId.value = null
    farmerForm.value = {
      villageSelect: villageFormOptions.value[0]?.value ?? null,
      headName: '',
      idCard: '',
      phone: '',
      familySize: 4,
      laborForce: 2,
      breedingCondition: '',
    }
  } else if (row) {
    farmerEditingId.value = row.id
    farmerForm.value = {
      villageSelect: row.villageId,
      headName: row.headName,
      idCard: row.idCard,
      phone: row.phone,
      familySize: row.familySize,
      laborForce: row.laborForce,
      breedingCondition: row.breedingCondition,
    }
  }
  farmerModalShow.value = true
}

function submitFarmerModal() {
  if (!farmerForm.value.villageSelect) {
    message.warning('请选择所属行政村')
    return
  }
  if (!farmerForm.value.headName.trim() || !farmerForm.value.phone.trim()) {
    message.warning('请填写户主与联系电话')
    return
  }
  const { townshipName, villageName } = resolveVillageMeta(farmerForm.value.villageSelect)
  if (!townshipName) {
    message.warning('行政村数据无效')
    return
  }
  const payload = {
    villageId: farmerForm.value.villageSelect,
    villageName,
    townshipName,
    headName: farmerForm.value.headName.trim(),
    idCard: farmerForm.value.idCard.trim(),
    phone: farmerForm.value.phone.trim(),
    familySize: Number(farmerForm.value.familySize) || 0,
    laborForce: Number(farmerForm.value.laborForce) || 0,
    breedingCondition: farmerForm.value.breedingCondition.trim(),
  }
  if (farmerModalMode.value === 'add') {
    farmerStore.addFarmer(payload)
    message.success('已新增养殖户')
  } else if (farmerEditingId.value) {
    farmerStore.updateFarmer(farmerEditingId.value, payload)
    message.success('已保存')
  }
  farmerModalShow.value = false
}

function confirmDeleteFarmer(row: FarmerRow) {
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

/* —— 奶牛弹窗 —— */
const cowModalShow = ref(false)
const cowModalMode = ref<'add' | 'edit'>('add')
const cowEditingId = ref<string | null>(null)
const cowForm = ref({
  farmerId: null as string | null,
  earTag: '',
  breed: '',
  sex: '母' as '母' | '公',
  ageMonths: 18,
  source: '县统一采购引进',
  purchasePrice: 18000,
  subsidyAmount: 8000,
  selfPaid: 10000,
  remark: '',
})

function openCowModal(mode: 'add' | 'edit', farmerId?: string, cow?: CowRow) {
  cowModalMode.value = mode
  if (mode === 'add') {
    cowEditingId.value = null
    cowForm.value = {
      farmerId: farmerId ?? farmerSelectOptions.value[0]?.value ?? null,
      earTag: '',
      breed: '荷斯坦',
      sex: '母',
      ageMonths: 18,
      source: '县统一采购引进',
      purchasePrice: 18000,
      subsidyAmount: 8000,
      selfPaid: 10000,
      remark: '',
    }
  } else if (cow) {
    cowEditingId.value = cow.id
    cowForm.value = {
      farmerId: cow.farmerId,
      earTag: cow.earTag,
      breed: cow.breed,
      sex: cow.sex,
      ageMonths: cow.ageMonths,
      source: cow.source,
      purchasePrice: cow.purchasePrice,
      subsidyAmount: cow.subsidyAmount,
      selfPaid: cow.selfPaid,
      remark: cow.remark ?? '',
    }
  }
  cowModalShow.value = true
}

function submitCowModal() {
  if (!cowForm.value.farmerId) {
    message.warning('请选择所属养殖户')
    return
  }
  if (!cowForm.value.earTag.trim() || !cowForm.value.breed.trim()) {
    message.warning('请填写耳标号与品种')
    return
  }
  const fr = farmers.value.find((f) => f.id === cowForm.value.farmerId)
  if (!fr) {
    message.warning('养殖户不存在')
    return
  }
  const payload = {
    farmerId: cowForm.value.farmerId,
    farmerName: fr.headName,
    earTag: cowForm.value.earTag.trim(),
    breed: cowForm.value.breed.trim(),
    sex: cowForm.value.sex,
    ageMonths: Number(cowForm.value.ageMonths) || 0,
    source: cowForm.value.source.trim(),
    purchasePrice: Number(cowForm.value.purchasePrice) || 0,
    subsidyAmount: Number(cowForm.value.subsidyAmount) || 0,
    selfPaid: Number(cowForm.value.selfPaid) || 0,
    remark: cowForm.value.remark.trim() || undefined,
  }
  if (cowModalMode.value === 'add') {
    cowStore.addCow(payload)
    message.success('已新增奶牛档案')
  } else if (cowEditingId.value) {
    cowStore.updateCow(cowEditingId.value, payload)
    message.success('已保存')
  }
  cowModalShow.value = false
}

function confirmDeleteCow(cow: CowRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除耳标「${cow.earTag}」的奶牛档案？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      cowStore.removeCow(cow.id)
      message.success('已删除')
    },
  })
}

/* —— 新增入口：先选类型 —— */
const pickModalShow = ref(false)
const pickAddKind = ref<'farmer' | 'cow'>('cow')

function openAddPicker() {
  pickAddKind.value = 'cow'
  pickModalShow.value = true
}

function confirmPickAdd() {
  pickModalShow.value = false
  if (pickAddKind.value === 'farmer') openFarmerModal('add')
  else openCowModal('add')
}

function buildCowColumns(): DataTableColumns<CowRow> {
  return [
    { title: '耳标号', key: 'earTag', width: 140 },
    { title: '品种', key: 'breed', width: 120, ellipsis: { tooltip: true } },
    {
      title: '性别',
      key: 'sex',
      width: 64,
      align: 'center',
      render(row) {
        return h(NTag, { size: 'small', bordered: false, type: 'success' }, { default: () => row.sex })
      },
    },
    { title: '月龄', key: 'ageMonths', width: 72, align: 'center' },
    { title: '来源', key: 'source', minWidth: 140, ellipsis: { tooltip: true } },
    {
      title: '采购价(元)',
      key: 'purchasePrice',
      width: 108,
      align: 'right',
      render(row) {
        return row.purchasePrice.toLocaleString()
      },
    },
    {
      title: '补助(元)',
      key: 'subsidyAmount',
      width: 96,
      align: 'right',
      render(row) {
        return row.subsidyAmount.toLocaleString()
      },
    },
    {
      title: '自筹(元)',
      key: 'selfPaid',
      width: 96,
      align: 'right',
      render(row) {
        return row.selfPaid.toLocaleString()
      },
    },
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
      key: 'cowActions',
      width: 140,
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
                  onClick: () => openCowModal('edit', undefined, row),
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
                  onClick: () => confirmDeleteCow(row),
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
  ]
}

const columns = computed<DataTableColumns<FarmerWithCows>>(() => [
  {
    type: 'expand',
    expandable: (row) => row.cowList.length > 0,
    renderExpand: (row) =>
      h(NDataTable, {
        size: 'small',
        bordered: false,
        singleLine: false,
        columns: buildCowColumns(),
        data: row.cowList,
        rowKey: (r: CowRow) => r.id,
        class: 'cow-expand-table-inner',
      }),
  },
  {
    title: '户主',
    key: 'headName',
    width: 100,
    ellipsis: { tooltip: true },
  },
  {
    title: '乡镇 / 村',
    key: 'addr',
    minWidth: 180,
    ellipsis: { tooltip: true },
    render(row) {
      return `${row.townshipName} · ${row.villageName}`
    },
  },
  { title: '联系电话', key: 'phone', width: 130 },
  {
    title: '存栏奶牛',
    key: 'cnt',
    width: 96,
    align: 'center',
    render(row) {
      return row.cowList.length
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
                onClick: () => openFarmerModal('edit', row),
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
                onClick: () => confirmDeleteFarmer(row),
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
  <NCard class="page-card page-card--fill" title="奶牛档案" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">养殖户 → 奶牛 两级（展开查看户内奶牛明细）</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="户主、电话、耳标、品种、乡镇村"
          style="width: 18rem"
          @keyup.enter="handleSearch"
        />
        <NButton type="primary" @click="handleSearch">
          <template #icon>
            <SearchOutline />
          </template>
          搜索
        </NButton>
        <NButton type="primary" @click="openAddPicker">
          <template #icon>
            <AddOutline />
          </template>
          新增
        </NButton>
      </div>

      <div class="page-table-wrap">
        <NDataTable
          class="base-table cow-table"
          :columns="columns"
          :data="filteredData"
          :row-key="(row) => row.id"
          :bordered="false"
          :single-line="false"
          :scroll-x="1100"
          :pagination="pagination"
          pagination-behavior-on-filter="first"
          default-expand-all
        />
      </div>
    </div>

    <NModal v-model:show="pickModalShow" preset="card" title="新增" style="width: 22rem" :mask-closable="false">
      <NRadioGroup v-model:value="pickAddKind" name="pickAddKind">
        <NSpace vertical>
          <NRadio value="cow">新增奶牛档案</NRadio>
          <NRadio value="farmer">新增养殖户</NRadio>
        </NSpace>
      </NRadioGroup>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="pickModalShow = false">取消</NButton>
          <NButton type="primary" @click="confirmPickAdd">下一步</NButton>
        </NSpace>
      </template>
    </NModal>

    <NModal
      v-model:show="farmerModalShow"
      preset="card"
      :title="farmerModalMode === 'add' ? '新增' : '编辑'"
      style="width: 28rem"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="96">
        <NFormItem label="行政村">
          <NSelect
            v-model:value="farmerForm.villageSelect"
            filterable
            placeholder="请选择行政村"
            :options="villageFormOptions"
            value-field="value"
            label-field="label"
          />
        </NFormItem>
        <NFormItem label="户主">
          <NInput v-model:value="farmerForm.headName" />
        </NFormItem>
        <NFormItem label="身份证号">
          <NInput v-model:value="farmerForm.idCard" />
        </NFormItem>
        <NFormItem label="联系电话">
          <NInput v-model:value="farmerForm.phone" />
        </NFormItem>
        <NFormItem label="家庭人口">
          <NInputNumber v-model:value="farmerForm.familySize" :min="1" :max="30" style="width: 100%" />
        </NFormItem>
        <NFormItem label="劳动力">
          <NInputNumber v-model:value="farmerForm.laborForce" :min="0" :max="30" style="width: 100%" />
        </NFormItem>
        <NFormItem label="养殖条件">
          <NInput
            v-model:value="farmerForm.breedingCondition"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="farmerModalShow = false">取消</NButton>
          <NButton type="primary" @click="submitFarmerModal">确定</NButton>
        </NSpace>
      </template>
    </NModal>

    <NModal
      v-model:show="cowModalShow"
      preset="card"
      :title="cowModalMode === 'add' ? '新增' : '编辑'"
      style="width: 28rem"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="108">
        <NFormItem label="所属养殖户">
          <NSelect
            v-model:value="cowForm.farmerId"
            filterable
            placeholder="请选择养殖户"
            :options="farmerSelectOptions"
            value-field="value"
            label-field="label"
          />
        </NFormItem>
        <NFormItem label="耳标号">
          <NInput v-model:value="cowForm.earTag" placeholder="如 NML-2026-xxxx" />
        </NFormItem>
        <NFormItem label="品种">
          <NInput v-model:value="cowForm.breed" />
        </NFormItem>
        <NFormItem label="性别">
          <NSelect
            v-model:value="cowForm.sex"
            :options="[
              { label: '母', value: '母' },
              { label: '公', value: '公' },
            ]"
          />
        </NFormItem>
        <NFormItem label="月龄">
          <NInputNumber v-model:value="cowForm.ageMonths" :min="0" :max="240" style="width: 100%" />
        </NFormItem>
        <NFormItem label="来源">
          <NInput v-model:value="cowForm.source" />
        </NFormItem>
        <NFormItem label="采购价(元)">
          <NInputNumber v-model:value="cowForm.purchasePrice" :min="0" style="width: 100%" />
        </NFormItem>
        <NFormItem label="补助(元)">
          <NInputNumber v-model:value="cowForm.subsidyAmount" :min="0" style="width: 100%" />
        </NFormItem>
        <NFormItem label="自筹(元)">
          <NInputNumber v-model:value="cowForm.selfPaid" :min="0" style="width: 100%" />
        </NFormItem>
        <NFormItem label="备注">
          <NInput v-model:value="cowForm.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="cowModalShow = false">取消</NButton>
          <NButton type="primary" @click="submitCowModal">确定</NButton>
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

.cow-table :deep(.n-data-table-expand-trigger) {
  margin-right: 0.5rem;
}

.cow-table :deep(.cow-expand-table-inner) {
  margin: 0.25rem 0 0.75rem 0;
}

.cow-table :deep(.cow-expand-table-inner .n-data-table-td) {
  background: #fafafa;
}

/* 展开子表按内容高度展示，避免少量行时出现整块竖向滚动条 */
.cow-table :deep(.cow-expand-table-inner .n-data-table-wrapper),
.cow-table :deep(.cow-expand-table-inner .n-scrollbar) {
  max-height: none !important;
  height: auto !important;
}
</style>
