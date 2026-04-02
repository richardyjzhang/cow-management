<script setup lang="ts">
import { h, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { ArrowBackOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useBaseFarmerStore } from '@/stores/base/farmer'
import { useBaseCowStore } from '@/stores/base/cow'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import { useMockBilingual } from '@/composables/useMockBilingual'
import type { CowRow } from '@/mock/base/cow'

const { pick, locale } = useMockBilingual()
const route = useRoute()
const router = useRouter()
const farmerStore = useBaseFarmerStore()
const cowStore = useBaseCowStore()
const { farmers } = storeToRefs(farmerStore)
const { cows } = storeToRefs(cowStore)

const farmerId = computed(() => route.params.farmerId as string)
const farmer = computed(() => farmers.value.find((f) => f.id === farmerId.value))

const cowList = computed(() => cows.value.filter((c) => c.farmerId === farmerId.value))

const keyword = ref('')
const filteredCows = computed(() => {
  const q = keyword.value.trim()
  if (!q) return cowList.value
  const lower = q.toLowerCase()
  return cowList.value.filter(
    (c) =>
      c.earTag.includes(q) ||
      c.breed.toLowerCase().includes(lower) ||
      (c.breedBo?.includes(q) ?? false) ||
      c.source.toLowerCase().includes(lower) ||
      (c.sourceBo?.includes(q) ?? false) ||
      (c.remark?.includes(q) ?? false) ||
      (c.remarkBo?.includes(q) ?? false),
  )
})

const rowTotal = computed(() => filteredCows.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const dialog = useDialog()
const message = useMessage()

const farmerSelectOptions = computed(() => {
  void locale.value
  return farmers.value.map((f) => ({
    label: `${pick(f.headName, f.headNameBo)}（${pick(f.townshipName, f.townshipNameBo)}·${pick(f.villageName, f.villageNameBo)}）`,
    value: f.id,
    headName: f.headName,
  }))
})

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

function openCowModal(mode: 'add' | 'edit', cow?: CowRow) {
  cowModalMode.value = mode
  const fid = farmerId.value
  if (mode === 'add') {
    cowEditingId.value = null
    cowForm.value = {
      farmerId: fid,
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
    farmerNameBo: fr.headNameBo,
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

function buildCowColumns(pickFn: (zh: string, bo?: string) => string): DataTableColumns<CowRow> {
  return [
    { title: '耳标号', key: 'earTag', width: 140 },
    {
      title: '品种',
      key: 'breed',
      width: 120,
      ellipsis: { tooltip: true },
      render(row) {
        return pickFn(row.breed, row.breedBo)
      },
    },
    {
      title: '性别',
      key: 'sex',
      width: 64,
      align: 'center',
      render(row) {
        return h(
          NTag,
          { size: 'small', bordered: false, type: 'success' },
          { default: () => pickFn(row.sex, row.sexBo) },
        )
      },
    },
    { title: '月龄', key: 'ageMonths', width: 72, align: 'center' },
    {
      title: '来源',
      key: 'source',
      minWidth: 140,
      ellipsis: { tooltip: true },
      render(row) {
        return pickFn(row.source, row.sourceBo)
      },
    },
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
        const t = row.remark
        const b = row.remarkBo
        if (!t && !b) return '—'
        return pickFn(t ?? '', b)
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
                  onClick: () => openCowModal('edit', row),
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

const columns = computed(() => {
  void locale.value
  return buildCowColumns(pick)
})

function goBack() {
  router.push({ name: 'base-cow' })
}
</script>

<template>
  <NCard v-if="farmer" class="page-card page-card--fill" :bordered="false">
    <template #header>
      <NSpace align="center" :size="12">
        <NButton quaternary circle @click="goBack">
          <template #icon>
            <NIcon :component="ArrowBackOutline" />
          </template>
        </NButton>
        <span>户内奶牛档案 · {{ pick(farmer.headName, farmer.headNameBo) }}</span>
      </NSpace>
    </template>
    <template #header-extra>
      <span class="page-card__hint"
        >{{ pick(farmer.townshipName, farmer.townshipNameBo) }} ·
        {{ pick(farmer.villageName, farmer.villageNameBo) }} · 共 {{ cowList.length }} 头</span
      >
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="耳标、品种、来源"
          style="width: 16rem"
        />
        <NButton type="primary" @click="openCowModal('add')">
          <template #icon>
            <AddOutline />
          </template>
          新增奶牛
        </NButton>
      </div>

      <div class="page-table-wrap">
        <NDataTable
          class="base-table"
          :columns="columns"
          :data="filteredCows"
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

  <NCard v-else class="page-card page-card--fill" title="未找到养殖户" :bordered="false">
    <NSpace>
      <NButton @click="goBack">返回奶牛档案</NButton>
    </NSpace>
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
