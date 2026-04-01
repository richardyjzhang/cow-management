<script setup lang="ts">
import { h, ref, computed, watch } from 'vue'
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
import type { RegionRow } from '@/mock/base/region'

const regionStore = useBaseRegionStore()
const farmerStore = useBaseFarmerStore()
const { tree } = storeToRefs(regionStore)

const dialog = useDialog()
const message = useMessage()

const keyword = ref('')

function filterTree(rows: RegionRow[], q: string): RegionRow[] {
  if (!q.trim()) return rows
  const lower = q.toLowerCase()
  const match = (r: RegionRow) =>
    r.name.toLowerCase().includes(lower) || r.code.includes(q) || (r.contact?.includes(q) ?? false)
  const out: RegionRow[] = []
  for (const r of rows) {
    const kids = r.children ? filterTree(r.children, q) : []
    if (match(r) || kids.length) {
      out.push({
        ...r,
        children: kids.length ? kids : r.children,
      })
    }
  }
  return out
}

const displayData = computed(() => filterTree(tree.value, keyword.value))

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

const townshipSelectOptions = computed(() =>
  tree.value.map((t) => ({ label: t.name, value: t.id })),
)

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
        message.warning('请填写乡镇名称与编码')
        return
      }
      regionStore.addTownship({
        name: formTownship.value.name,
        code: formTownship.value.code,
        contact: formTownship.value.contact,
      })
      message.success('已新增乡镇')
    } else {
      if (!parentTownshipId.value) {
        message.warning('请选择所属乡镇')
        return
      }
      if (!formVillage.value.name.trim() || !formVillage.value.code.trim()) {
        message.warning('请填写行政村名称与编码')
        return
      }
      regionStore.addVillage(parentTownshipId.value, {
        name: formVillage.value.name,
        code: formVillage.value.code,
        contact: formVillage.value.contact,
        groupNames: formVillage.value.groupNames,
      })
      message.success('已新增行政村')
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
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: RegionRow) {
  const villageIds = regionStore.getVillageIdsUnder(row.id)
  if (farmerStore.hasFarmerInVillages(villageIds)) {
    message.warning('该区划下仍有养殖户数据，请先在养殖户管理中处理后再删除')
    return
  }
  const label = row.type === 'township' ? '乡镇及其下辖行政村' : '行政村'
  dialog.warning({
    title: '确认删除',
    content: `确定删除该${label}「${row.name}」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      regionStore.removeNode(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed<DataTableColumns<RegionRow>>(() => [
  {
    title: '区划名称',
    key: 'name',
    tree: true,
    minWidth: 200,
  },
  {
    title: '区划编码',
    key: 'code',
    width: 140,
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    render(row) {
      const map = { township: '乡镇', village: '行政村' } as const
      const type = row.type
      return h(
        NTag,
        { size: 'small', type: type === 'township' ? 'info' : 'success', bordered: false },
        { default: () => map[type] },
      )
    },
  },
  {
    title: '联系电话',
    key: 'contact',
    width: 140,
    ellipsis: { tooltip: true },
  },
  {
    title: '村民小组',
    key: 'groupNames',
    minWidth: 200,
    ellipsis: { tooltip: true },
    render(row) {
      if (row.type === 'village') return row.groupNames ?? '—'
      const n = row.children?.length ?? 0
      return n ? `辖 ${n} 个行政村` : '—'
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
  <NCard class="page-card page-card--fill" title="区划管理" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">日喀则市南木林县 · 乡镇—行政村两级（村民小组见列表列）</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="搜索区划名称、编码、电话"
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
          :data="displayData"
          :row-key="(row) => row.id"
          :bordered="false"
          :single-line="false"
          :scroll-x="900"
          :pagination="pagination"
          pagination-behavior-on-filter="first"
          default-expand-all
        />
      </div>
    </div>

    <NModal
      v-model:show="modalShow"
      preset="card"
      :title="modalMode === 'add' ? '新增区划' : '编辑区划'"
      style="width: 32rem"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="96">
        <template v-if="modalMode === 'add'">
          <NFormItem label="类型">
            <NRadioGroup v-model:value="addKind" name="addKind">
              <NRadio value="township">乡镇</NRadio>
              <NRadio value="village">行政村</NRadio>
            </NRadioGroup>
          </NFormItem>
          <template v-if="addKind === 'village'">
            <NFormItem label="所属乡镇">
              <NSelect
                v-model:value="parentTownshipId"
                placeholder="请选择乡镇"
                :options="townshipSelectOptions"
              />
            </NFormItem>
            <NFormItem label="村名称">
              <NInput v-model:value="formVillage.name" placeholder="行政村名称" />
            </NFormItem>
            <NFormItem label="村编码">
              <NInput v-model:value="formVillage.code" placeholder="区划编码" />
            </NFormItem>
            <NFormItem label="联系电话">
              <NInput v-model:value="formVillage.contact" placeholder="村级联络电话" />
            </NFormItem>
            <NFormItem label="村民小组">
              <NInput
                v-model:value="formVillage.groupNames"
                type="textarea"
                placeholder="多个小组用逗号分隔"
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </NFormItem>
          </template>
          <template v-else>
            <NFormItem label="乡镇名称">
              <NInput v-model:value="formTownship.name" placeholder="乡镇名称" />
            </NFormItem>
            <NFormItem label="乡镇编码">
              <NInput v-model:value="formTownship.code" placeholder="区划编码" />
            </NFormItem>
            <NFormItem label="联系电话">
              <NInput v-model:value="formTownship.contact" placeholder="乡镇办公电话" />
            </NFormItem>
          </template>
        </template>
        <template v-else>
          <template v-if="editRowType === 'township'">
            <NFormItem label="乡镇名称">
              <NInput v-model:value="formTownship.name" />
            </NFormItem>
            <NFormItem label="乡镇编码">
              <NInput v-model:value="formTownship.code" />
            </NFormItem>
            <NFormItem label="联系电话">
              <NInput v-model:value="formTownship.contact" />
            </NFormItem>
          </template>
          <template v-else>
            <NFormItem label="村名称">
              <NInput v-model:value="formVillage.name" />
            </NFormItem>
            <NFormItem label="村编码">
              <NInput v-model:value="formVillage.code" />
            </NFormItem>
            <NFormItem label="联系电话">
              <NInput v-model:value="formVillage.contact" />
            </NFormItem>
            <NFormItem label="村民小组">
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

.base-table :deep(.n-data-table-td .n-button + .n-button) {
  margin-left: 0.25rem;
}
</style>
