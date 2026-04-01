<script setup lang="ts">
import { h, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { ArrowBackOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useBaseRegionStore } from '@/stores/base/region'
import { useBaseFarmerStore } from '@/stores/base/farmer'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { RegionRow } from '@/mock/base/region'

const route = useRoute()
const router = useRouter()
const regionStore = useBaseRegionStore()
const farmerStore = useBaseFarmerStore()
const { tree } = storeToRefs(regionStore)

const dialog = useDialog()
const message = useMessage()

const townshipId = computed(() => route.params.townshipId as string)

const township = computed(() => {
  const loc = regionStore.findNode(townshipId.value)
  if (!loc || loc.node.type !== 'township') return null
  return loc.node
})

const villageRows = computed(() => township.value?.children?.filter((c) => c.type === 'village') ?? [])

const keyword = ref('')
const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return villageRows.value
  const lower = q.toLowerCase()
  return villageRows.value.filter(
    (r) =>
      r.name.toLowerCase().includes(lower) ||
      r.code.includes(q) ||
      (r.contact?.includes(q) ?? false) ||
      (r.groupNames?.includes(q) ?? false),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editId = ref<string | null>(null)
const formVillage = ref({ name: '', code: '', contact: '', groupNames: '' })

function openAdd() {
  modalMode.value = 'add'
  editId.value = null
  formVillage.value = { name: '', code: '', contact: '', groupNames: '' }
  modalShow.value = true
}

function openEdit(row: RegionRow) {
  modalMode.value = 'edit'
  editId.value = row.id
  formVillage.value = {
    name: row.name,
    code: row.code,
    contact: row.contact ?? '',
    groupNames: row.groupNames ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  const tw = township.value
  if (!tw) return
  if (modalMode.value === 'add') {
    if (!formVillage.value.name.trim() || !formVillage.value.code.trim()) {
      message.warning('请填写行政村名称与编码')
      return
    }
    regionStore.addVillage(tw.id, {
      name: formVillage.value.name,
      code: formVillage.value.code,
      contact: formVillage.value.contact,
      groupNames: formVillage.value.groupNames,
    })
    message.success('已新增行政村')
  } else if (editId.value) {
    regionStore.updateNode(editId.value, {
      name: formVillage.value.name,
      code: formVillage.value.code,
      contact: formVillage.value.contact,
      groupNames: formVillage.value.groupNames,
    })
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: RegionRow) {
  const villageIds = regionStore.getVillageIdsUnder(row.id)
  if (farmerStore.hasFarmerInVillages(villageIds)) {
    message.warning('该村仍有养殖户数据，请先在养殖户管理中处理后再删除')
    return
  }
  dialog.warning({
    title: '确认删除',
    content: `确定删除行政村「${row.name}」？删除后不可恢复。`,
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
    title: '行政村名称',
    key: 'name',
    minWidth: 160,
    ellipsis: { tooltip: true },
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
      return h(NTag, { size: 'small', type: 'success', bordered: false }, { default: () => '行政村' })
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
      return row.groupNames ?? '—'
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

function goBack() {
  router.push({ name: 'base-region' })
}
</script>

<template>
  <NCard v-if="township" class="page-card page-card--fill" :bordered="false">
    <template #header>
      <NSpace align="center" :size="12">
        <NButton quaternary circle @click="goBack">
          <template #icon>
            <NIcon :component="ArrowBackOutline" />
          </template>
        </NButton>
        <span>行政村 · {{ township.name }}</span>
      </NSpace>
    </template>
    <template #header-extra>
      <span class="page-card__hint">区划编码 {{ township.code }} · 共 {{ villageRows.length }} 个行政村</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="村名、编码、电话、村民小组"
          style="width: 18rem"
        />
        <NButton type="primary" @click="openAdd">
          <template #icon>
            <AddOutline />
          </template>
          新增行政村
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
          :scroll-x="960"
          :pagination="pagination"
          pagination-behavior-on-filter="first"
        />
      </div>
    </div>

    <NModal v-model:show="modalShow" preset="card" :title="modalMode === 'add' ? '新增行政村' : '编辑行政村'" style="width: 32rem" :mask-closable="false">
      <NForm label-placement="left" label-width="96">
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
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="modalShow = false">取消</NButton>
          <NButton type="primary" @click="submitModal">确定</NButton>
        </NSpace>
      </template>
    </NModal>
  </NCard>

  <NCard v-else class="page-card page-card--fill" title="未找到乡镇" :bordered="false">
    <NSpace>
      <NButton @click="goBack">返回区划管理</NButton>
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
