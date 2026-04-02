<script setup lang="ts">
import { h, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NSpace,
  NTag,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NRadioGroup,
  NRadio,
  NSelect,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { SearchOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useBaseRegionStore } from '@/stores/base/region'
import { useBaseFarmerStore } from '@/stores/base/farmer'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import { pickMockBilingual } from '@/composables/useMockBilingual'
import type { AppLocale } from '@/i18n'
import type { RegionRow } from '@/mock/base/region'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
function pick(zh: string, bo?: string) {
  return pickMockBilingual(locale.value as AppLocale, zh, bo)
}
const router = useRouter()
const regionStore = useBaseRegionStore()
const farmerStore = useBaseFarmerStore()
const { tree } = storeToRefs(regionStore)

const dialog = useDialog()
const message = useMessage()

const keyword = ref('')

function rowMatches(r: RegionRow, q: string, lower: string): boolean {
  if (r.name.toLowerCase().includes(lower) || r.code.includes(q) || (r.contact?.includes(q) ?? false))
    return true
  if (r.nameBo?.includes(q)) return true
  if (r.groupNames?.includes(q) || (r.groupNamesBo?.includes(q) ?? false)) return true
  return false
}

function townshipMatchesKeyword(tw: RegionRow, q: string): boolean {
  if (!q.trim()) return true
  const lower = q.toLowerCase()
  if (rowMatches(tw, q, lower)) return true
  for (const v of tw.children ?? []) {
    if (rowMatches(v, q, lower)) return true
  }
  return false
}

/** 仅乡镇一级列表，行政村在子页面维护 */
const displayData = computed(() => tree.value.filter((tw) => townshipMatchesKeyword(tw, keyword.value)))

const rowTotal = computed(() => displayData.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const addKind = ref<'township' | 'village'>('township')
const editId = ref<string | null>(null)
const editRowType = ref<'township' | 'village' | null>(null)
const parentTownshipId = ref<string | null>(null)

const formTownship = ref({ name: '', code: '', contact: '' })
const formVillage = ref({ name: '', code: '', contact: '', groupNames: '' })

const townshipSelectOptions = computed(() => {
  void locale.value
  return tree.value.map((t) => ({ label: pick(t.name, t.nameBo), value: t.id }))
})

watch(modalShow, (open) => {
  if (!open) {
    editId.value = null
    editRowType.value = null
  }
})

function openAdd() {
  modalMode.value = 'add'
  addKind.value = 'township'
  parentTownshipId.value = townshipSelectOptions.value[0]?.value ?? null
  formTownship.value = { name: '', code: '', contact: '' }
  formVillage.value = { name: '', code: '', contact: '', groupNames: '' }
  modalShow.value = true
}

function openEdit(row: RegionRow) {
  modalMode.value = 'edit'
  editId.value = row.id
  editRowType.value = row.type
  if (row.type === 'township') {
    formTownship.value = {
      name: row.name,
      code: row.code,
      contact: row.contact ?? '',
    }
  } else {
    formVillage.value = {
      name: row.name,
      code: row.code,
      contact: row.contact ?? '',
      groupNames: row.groupNames ?? '',
    }
  }
  modalShow.value = true
}

function submitModal() {
  if (modalMode.value === 'add') {
    if (addKind.value === 'township') {
      if (!formTownship.value.name.trim() || !formTownship.value.code.trim()) {
        message.warning(t('region.msgFillTownship'))
        return
      }
      regionStore.addTownship({
        name: formTownship.value.name,
        code: formTownship.value.code,
        contact: formTownship.value.contact,
      })
      message.success(t('region.msgSuccessTownship'))
    } else {
      if (!parentTownshipId.value) {
        message.warning(t('region.msgSelectTownship'))
        return
      }
      if (!formVillage.value.name.trim() || !formVillage.value.code.trim()) {
        message.warning(t('region.msgFillVillage'))
        return
      }
      regionStore.addVillage(parentTownshipId.value, {
        name: formVillage.value.name,
        code: formVillage.value.code,
        contact: formVillage.value.contact,
        groupNames: formVillage.value.groupNames,
      })
      message.success(t('region.msgSuccessVillage'))
    }
  } else if (editId.value) {
    const id = editId.value
    const loc = regionStore.findNode(id)
    if (!loc) return
    if (loc.node.type === 'township') {
      regionStore.updateNode(id, {
        name: formTownship.value.name,
        code: formTownship.value.code,
        contact: formTownship.value.contact,
      })
    } else {
      regionStore.updateNode(id, {
        name: formVillage.value.name,
        code: formVillage.value.code,
        contact: formVillage.value.contact,
        groupNames: formVillage.value.groupNames,
      })
    }
    message.success(t('common.saved'))
  }
  modalShow.value = false
}

function confirmDelete(row: RegionRow) {
  const villageIds = regionStore.getVillageIdsUnder(row.id)
  if (farmerStore.hasFarmerInVillages(villageIds)) {
    message.warning(t('region.msgHasFarmers'))
    return
  }
  const scope =
    row.type === 'township' ? t('region.deleteScopeTownship') : t('region.deleteScopeVillage')
  dialog.warning({
    title: t('common.confirmDeleteTitle'),
    content: t('region.deleteContent', { scope, name: pick(row.name, row.nameBo) }),
    positiveText: t('common.confirmDeleteOk'),
    negativeText: t('common.cancel'),
    onPositiveClick: () => {
      regionStore.removeNode(row.id)
      message.success(t('common.deleted'))
    },
  })
}

const columns = computed((): DataTableColumns<RegionRow> => {
  void locale.value
  return [
  {
    title: t('common.townshipNameCol'),
    key: 'name',
    minWidth: 160,
    ellipsis: { tooltip: true },
    render(row) {
      return pick(row.name, row.nameBo)
    },
  },
  {
    title: t('common.code'),
    key: 'code',
    width: 140,
  },
  {
    title: t('common.type'),
    key: 'type',
    width: 100,
    render() {
      return h(
        NTag,
        { size: 'small', type: 'info', bordered: false },
        { default: () => t('region.typeTownship') },
      )
    },
  },
  {
    title: t('common.contactPhone'),
    key: 'contact',
    width: 140,
    ellipsis: { tooltip: true },
  },
  {
    title: t('common.villageCount'),
    key: 'vCnt',
    width: 100,
    align: 'center',
    render(row) {
      return row.children?.length ?? 0
    },
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 220,
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
                type: 'info',
                size: 'small',
                onClick: () =>
                  router.push({ name: 'base-region-township', params: { townshipId: row.id } }),
              },
              { default: () => t('common.villageManageBtn') },
            ),
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
  <NCard class="page-card page-card--fill" :title="t('region.pageTitle')" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">{{ t('region.hint') }}</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          :placeholder="t('region.searchPh')"
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
          :data="displayData"
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
      :title="modalMode === 'add' ? t('region.modalAddTitle') : t('region.modalEditTitle')"
      style="width: 32rem"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="96">
        <template v-if="modalMode === 'add'">
          <NFormItem :label="t('region.formType')">
            <NRadioGroup v-model:value="addKind" name="addKind">
              <NRadio value="township">{{ t('region.typeTownship') }}</NRadio>
              <NRadio value="village">{{ t('region.typeVillage') }}</NRadio>
            </NRadioGroup>
          </NFormItem>
          <template v-if="addKind === 'village'">
            <NFormItem :label="t('region.formParentTownship')">
              <NSelect
                v-model:value="parentTownshipId"
                :placeholder="t('region.phSelectTownship')"
                :options="townshipSelectOptions"
              />
            </NFormItem>
            <NFormItem :label="t('region.formVillageName')">
              <NInput v-model:value="formVillage.name" :placeholder="t('region.phVillageName')" />
            </NFormItem>
            <NFormItem :label="t('region.formVillageCode')">
              <NInput v-model:value="formVillage.code" :placeholder="t('region.phVillageCode')" />
            </NFormItem>
            <NFormItem :label="t('common.contactPhone')">
              <NInput v-model:value="formVillage.contact" :placeholder="t('region.phVillageContact')" />
            </NFormItem>
            <NFormItem :label="t('common.groupNames')">
              <NInput
                v-model:value="formVillage.groupNames"
                type="textarea"
                :placeholder="t('region.phGroupNames')"
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </NFormItem>
          </template>
          <template v-else>
            <NFormItem :label="t('region.formTownshipName')">
              <NInput v-model:value="formTownship.name" :placeholder="t('region.phTownshipName')" />
            </NFormItem>
            <NFormItem :label="t('region.formTownshipCode')">
              <NInput v-model:value="formTownship.code" :placeholder="t('region.phTownshipCode')" />
            </NFormItem>
            <NFormItem :label="t('common.contactPhone')">
              <NInput v-model:value="formTownship.contact" :placeholder="t('region.phTownshipContact')" />
            </NFormItem>
          </template>
        </template>
        <template v-else>
          <template v-if="editRowType === 'township'">
            <NFormItem :label="t('region.formTownshipName')">
              <NInput v-model:value="formTownship.name" />
            </NFormItem>
            <NFormItem :label="t('region.formTownshipCode')">
              <NInput v-model:value="formTownship.code" />
            </NFormItem>
            <NFormItem :label="t('common.contactPhone')">
              <NInput v-model:value="formTownship.contact" />
            </NFormItem>
          </template>
          <template v-else>
            <NFormItem :label="t('region.formVillageName')">
              <NInput v-model:value="formVillage.name" />
            </NFormItem>
            <NFormItem :label="t('region.formVillageCode')">
              <NInput v-model:value="formVillage.code" />
            </NFormItem>
            <NFormItem :label="t('common.contactPhone')">
              <NInput v-model:value="formVillage.contact" />
            </NFormItem>
            <NFormItem :label="t('common.groupNames')">
              <NInput
                v-model:value="formVillage.groupNames"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </NFormItem>
          </template>
        </template>
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

.base-table :deep(.n-data-table-td .n-button + .n-button) {
  margin-left: 0.25rem;
}
</style>
