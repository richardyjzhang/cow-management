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
import { pickMockBilingual } from '@/composables/useMockBilingual'
import type { AppLocale } from '@/i18n'
import type { FarmerRow } from '@/mock/base/farmer'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
function pick(zh: string, bo?: string) {
  return pickMockBilingual(locale.value as AppLocale, zh, bo)
}
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

const townshipOptions = computed(() => {
  void locale.value
  return tree.value.map((t) => ({ label: pick(t.name, t.nameBo), value: t.id }))
})

const villageOptions = computed(() => {
  void locale.value
  if (townshipId.value) {
    const tw = tree.value.find((t) => t.id === townshipId.value)
    return (tw?.children ?? []).map((v) => ({ label: pick(v.name, v.nameBo), value: v.id }))
  }
  const all: { label: string; value: string }[] = []
  for (const tw of tree.value) {
    for (const v of tw.children ?? []) {
      all.push({
        label: `${pick(tw.name, tw.nameBo)} / ${pick(v.name, v.nameBo)}`,
        value: v.id,
      })
    }
  }
  return all
})

const villageFormOptions = computed(() => {
  void locale.value
  return regionStore.listVillagesMeta().map((m) => ({
    label: `${pick(m.townshipName, m.townshipNameBo)} / ${pick(m.villageName, m.villageNameBo)}`,
    value: m.villageId,
    townshipName: m.townshipName,
    villageName: m.villageName,
    townshipNameBo: m.townshipNameBo,
    villageNameBo: m.villageNameBo,
  }))
})

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
      (r.headNameBo?.includes(q) ?? false) ||
      r.phone.includes(q) ||
      r.idCard.includes(q) ||
      r.villageName.includes(q) ||
      (r.villageNameBo?.includes(q) ?? false) ||
      r.townshipName.includes(q) ||
      (r.townshipNameBo?.includes(q) ?? false) ||
      r.breedingCondition.toLowerCase().includes(lower) ||
      (r.breedingConditionBo?.includes(q) ?? false),
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
    ? {
        townshipName: meta.townshipName,
        villageName: meta.villageName,
        townshipNameBo: meta.townshipNameBo,
        villageNameBo: meta.villageNameBo,
      }
    : { townshipName: '', villageName: '', townshipNameBo: undefined, villageNameBo: undefined }
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
    message.warning(t('farmer.msgSelectVillage'))
    return
  }
  if (!form.value.headName.trim() || !form.value.phone.trim()) {
    message.warning(t('farmer.msgHeadPhone'))
    return
  }
  const { townshipName, villageName, townshipNameBo, villageNameBo } = resolveVillageMeta(
    form.value.villageSelect,
  )
  if (!townshipName) {
    message.warning(t('farmer.msgInvalidVillage'))
    return
  }
  const payload = {
    villageId: form.value.villageSelect,
    villageName,
    villageNameBo,
    townshipName,
    townshipNameBo,
    headName: form.value.headName.trim(),
    idCard: form.value.idCard.trim(),
    phone: form.value.phone.trim(),
    familySize: Number(form.value.familySize) || 0,
    laborForce: Number(form.value.laborForce) || 0,
    breedingCondition: form.value.breedingCondition.trim(),
  }
  if (modalMode.value === 'add') {
    farmerStore.addFarmer(payload)
    message.success(t('farmer.msgAdded'))
  } else if (editingId.value) {
    farmerStore.updateFarmer(editingId.value, payload)
    message.success(t('common.saved'))
  }
  modalShow.value = false
}

function confirmDelete(row: FarmerRow) {
  const n = cowStore.countByFarmerId(row.id)
  const name = pick(row.headName, row.headNameBo)
  dialog.warning({
    title: t('common.confirmDeleteTitle'),
    content:
      n > 0
        ? t('farmer.deleteWithCows', { name, n })
        : t('farmer.deletePlain', { name }),
    positiveText: t('common.confirmDeleteOk'),
    negativeText: t('common.cancel'),
    onPositiveClick: () => {
      farmerStore.removeFarmer(row.id)
      message.success(t('common.deleted'))
    },
  })
}

const columns = computed((): DataTableColumns<FarmerRow> => {
  void locale.value
  return [
  {
    title: t('common.township'),
    key: 'townshipName',
    width: 110,
    ellipsis: { tooltip: true },
    render(row) {
      return pick(row.townshipName, row.townshipNameBo)
    },
  },
  {
    title: t('common.village'),
    key: 'villageName',
    width: 110,
    ellipsis: { tooltip: true },
    render(row) {
      return pick(row.villageName, row.villageNameBo)
    },
  },
  {
    title: t('common.headName'),
    key: 'headName',
    width: 100,
    ellipsis: { tooltip: true },
    render(row) {
      return pick(row.headName, row.headNameBo)
    },
  },
  { title: t('common.idCard'), key: 'idCard', width: 180, ellipsis: { tooltip: true } },
  { title: t('common.contactPhone'), key: 'phone', width: 130 },
  { title: t('common.familySize'), key: 'familySize', width: 88, align: 'center' },
  { title: t('common.laborForce'), key: 'laborForce', width: 80, align: 'center' },
  {
    title: t('common.breedingCondition'),
    key: 'breedingCondition',
    minWidth: 200,
    ellipsis: { tooltip: true },
    render(row) {
      return pick(row.breedingCondition, row.breedingConditionBo)
    },
  },
  {
    title: t('common.actions'),
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
                default: () => t('common.edit'),
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
                default: () => t('common.delete'),
                icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
              },
            ),
          ],
        },
      )
    },
  },
]
})

function handleSearch() {
  //
}
</script>

<template>
  <NCard class="page-card page-card--fill" :title="t('farmer.pageTitle')" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">{{ t('farmer.hint') }}</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NSelect
          v-model:value="townshipId"
          clearable
          :placeholder="t('farmer.phAllTownship')"
          :options="townshipOptions"
          style="width: 11rem"
        />
        <NSelect
          v-model:value="villageId"
          clearable
          :placeholder="t('farmer.phAllVillage')"
          filterable
          :options="villageOptions"
          style="width: 15rem"
        />
        <NInput
          v-model:value="keyword"
          clearable
          :placeholder="t('farmer.searchPh')"
          style="width: 16rem"
          @keyup.enter="handleSearch"
        />
        <NButton type="primary" @click="handleSearch">
          <template #icon>
            <SearchOutline />
          </template>
          {{ t('common.search') }}
        </NButton>
        <NButton type="primary" @click="openAdd">
          <template #icon>
            <AddOutline />
          </template>
          {{ t('common.add') }}
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
      :title="modalMode === 'add' ? t('common.add') : t('common.edit')"
      style="width: 28rem"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="96">
        <NFormItem :label="t('common.village')">
          <NSelect
            v-model:value="form.villageSelect"
            filterable
            :placeholder="t('farmer.phSelectVillage')"
            :options="villageFormOptions"
            value-field="value"
            label-field="label"
          />
        </NFormItem>
        <NFormItem :label="t('common.headName')">
          <NInput v-model:value="form.headName" :placeholder="t('farmer.phHeadName')" />
        </NFormItem>
        <NFormItem :label="t('common.idCard')">
          <NInput v-model:value="form.idCard" :placeholder="t('farmer.phIdCard')" />
        </NFormItem>
        <NFormItem :label="t('common.contactPhone')">
          <NInput v-model:value="form.phone" :placeholder="t('farmer.phMobile')" />
        </NFormItem>
        <NFormItem :label="t('common.familySize')">
          <NInputNumber v-model:value="form.familySize" :min="1" :max="30" style="width: 100%" />
        </NFormItem>
        <NFormItem :label="t('common.laborForce')">
          <NInputNumber v-model:value="form.laborForce" :min="0" :max="30" style="width: 100%" />
        </NFormItem>
        <NFormItem :label="t('common.breedingCondition')">
          <NInput
            v-model:value="form.breedingCondition"
            type="textarea"
            :placeholder="t('farmer.phCondition')"
            :autosize="{ minRows: 2, maxRows: 5 }"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="modalShow = false">{{ t('common.cancel') }}</NButton>
          <NButton type="primary" @click="submitModal">{{ t('common.confirm') }}</NButton>
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
