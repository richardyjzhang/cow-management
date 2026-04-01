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
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { SearchOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useSystemUserStore } from '@/stores/system/user'
import { useSystemRoleStore } from '@/stores/system/role'
import { useFrontendPagination } from '@/composables/useFrontendPagination'
import type { UserRow, UserStatus } from '@/mock/system/user'

const userStore = useSystemUserStore()
const roleStore = useSystemRoleStore()
const { rows } = storeToRefs(userStore)
const { rows: roles } = storeToRefs(roleStore)

const dialog = useDialog()
const message = useMessage()
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.username.includes(q) ||
      r.realName.includes(q) ||
      r.roleName.includes(q) ||
      r.phone.includes(q) ||
      r.status.includes(q),
  )
})

const rowTotal = computed(() => filtered.value.length)
const { pagination, resetPage } = useFrontendPagination(rowTotal)
watch(keyword, () => resetPage())

const roleOptions = computed(() =>
  roles.value.map((r) => ({ label: r.roleName, value: r.id, roleName: r.roleName })),
)

const statusOptions: { label: string; value: UserStatus }[] = [
  { label: '启用', value: '启用' },
  { label: '禁用', value: '禁用' },
]

const modalShow = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const form = ref({
  username: '',
  realName: '',
  roleId: null as string | null,
  phone: '',
  status: '启用' as UserStatus,
})

function resolveRoleName(roleId: string | null) {
  if (!roleId) return ''
  return roleOptions.value.find((o) => o.value === roleId)?.roleName ?? ''
}

function openAdd() {
  modalMode.value = 'add'
  editingId.value = null
  form.value = {
    username: '',
    realName: '',
    roleId: roleOptions.value[0]?.value ?? null,
    phone: '',
    status: '启用',
  }
  modalShow.value = true
}

function openEdit(row: UserRow) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    username: row.username,
    realName: row.realName,
    roleId: row.roleId,
    phone: row.phone,
    status: row.status,
  }
  modalShow.value = true
}

function submitModal() {
  if (!form.value.username.trim() || !form.value.realName.trim()) {
    message.warning('请填写登录名与姓名')
    return
  }
  if (!form.value.roleId) {
    message.warning('请选择角色')
    return
  }
  if (!form.value.phone.trim()) {
    message.warning('请填写手机号')
    return
  }
  const roleName = resolveRoleName(form.value.roleId)
  if (!roleName) {
    message.warning('角色无效')
    return
  }
  const payload = {
    username: form.value.username.trim(),
    realName: form.value.realName.trim(),
    roleId: form.value.roleId,
    roleName,
    phone: form.value.phone.trim(),
    status: form.value.status,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  if (modalMode.value === 'add') {
    if (rows.value.some((u) => u.username === payload.username)) {
      message.warning('登录名已存在')
      return
    }
    userStore.add(payload)
    message.success('已新增')
  } else if (editingId.value) {
    const id = editingId.value
    const dup = rows.value.find((u) => u.username === payload.username && u.id !== id)
    if (dup) {
      message.warning('登录名已存在')
      return
    }
    const cur = rows.value.find((u) => u.id === id)
    userStore.update(id, {
      ...payload,
      createdAt: cur?.createdAt ?? payload.createdAt,
    })
    message.success('已保存')
  }
  modalShow.value = false
}

function confirmDelete(row: UserRow) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除用户「${row.realName}（${row.username}）」？删除后不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: () => {
      userStore.remove(row.id)
      message.success('已删除')
    },
  })
}

const columns = computed<DataTableColumns<UserRow>>(() => [
  { title: '登录名', key: 'username', width: 120, ellipsis: { tooltip: true } },
  { title: '姓名', key: 'realName', width: 110, ellipsis: { tooltip: true } },
  { title: '角色', key: 'roleName', width: 130, ellipsis: { tooltip: true } },
  { title: '手机', key: 'phone', width: 130 },
  { title: '状态', key: 'status', width: 88 },
  { title: '创建日期', key: 'createdAt', width: 120 },
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
  <NCard class="page-card page-card--fill" title="用户管理" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">账号与角色绑定（演示数据）</span>
    </template>

    <div class="base-page base-page--table">
      <div class="base-page__toolbar">
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="登录名、姓名、角色、手机"
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
        <NFormItem label="登录名">
          <NInput v-model:value="form.username" placeholder="英文字母与数字" />
        </NFormItem>
        <NFormItem label="姓名">
          <NInput v-model:value="form.realName" />
        </NFormItem>
        <NFormItem label="角色">
          <NSelect
            v-model:value="form.roleId"
            placeholder="选择角色"
            :options="roleOptions"
            value-field="value"
            label-field="label"
          />
        </NFormItem>
        <NFormItem label="手机">
          <NInput v-model:value="form.phone" />
        </NFormItem>
        <NFormItem label="状态">
          <NSelect v-model:value="form.status" :options="statusOptions" />
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
