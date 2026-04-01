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
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { SearchOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useSystemRoleStore } from '@/stores/system/role'
import { useSystemUserStore } from '@/stores/system/user'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { RoleRow } from '@/mock/system/role'

const roleStore = useSystemRoleStore()
const userStore = useSystemUserStore()
const { rows } = storeToRefs(roleStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) => r.roleName.includes(q) || r.permKeys.includes(q) || (r.remark?.includes(q) ?? false),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  roleName: '',
  permKeys: '',
  remark: '',
})

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = { roleName: '', permKeys: '', remark: '' }
  modalShow.value = true
}

function openEdit(row: RoleRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    roleName: row.roleName,
    permKeys: row.permKeys,
    remark: row.remark ?? '',
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.roleName.trim() || !form.value.permKeys.trim()) {
    message.warning('请填写角色名称与权限标识')
    return
  }
  const payload = {
    roleName: form.value.roleName.trim(),
    permKeys: form.value.permKeys.trim(),
    remark: form.value.remark.trim() || undefined,
  }
  if (modalMode.value === 'add') {
    if (rows.value.some((r) => r.roleName === payload.roleName)) {
      message.warning('角色名称已存在')
      return
    }
    roleStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    const id = editingId.value
    const dup = rows.value.find((r) => r.roleName === payload.roleName && r.id !== id)
    if (dup) {
      message.warning('角色名称已存在')
      return
    }
    roleStore.update(id, payload)
    userStore.syncRoleName(id, payload.roleName)
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: RoleRow) {
  const n = userStore.countByRoleId(row.id)
  if (n > 0) {
    message.warning(`该角色下仍有 ${n} 个用户，请先在用户管理中调整后再删除`)
    return
  }
  dialog.warning({
    title: '确认删除',
    content: `确定删除角色「${row.roleName}」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      roleStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed<DataTableColumns<RoleRow>>(() => [
  { title: '角色名称', key: 'roleName', minWidth: 140, ellipsis: { tooltip: true } },
  { title: '权限标识', key: 'permKeys', minWidth: 200, ellipsis: { tooltip: true } },
  {
    title: '备注',
    key: 'remark',
    minWidth: 160,
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
  <NCard class="page-card page-card--fill" title="角色权限" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">删除前会校验是否仍有关联用户</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="角色名、权限标识"
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
        <NFormItem label="角色名称">
          <NInput v-model:value="form.roleName" />
        </NFormItem>
        <NFormItem label="权限标识">
          <NInput
            v-model:value="form.permKeys"
            type="textarea"
            placeholder="如：base, breeding 或 all"
            :autosize="{ minRows: 2, maxRows: 5 }"
          />
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
