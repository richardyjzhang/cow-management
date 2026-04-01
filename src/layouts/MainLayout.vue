<script setup lang="ts">
import { computed, h, watch, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  NIcon,
  NDropdown,
  type MenuOption,
} from 'naive-ui'
import { LogOutOutline, PersonOutline, CloseOutline } from '@vicons/ionicons5'
import { menuConfig, type MenuItemConfig } from '@/router/menu'
import { useTabsStore } from '@/stores/tabs'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const route = useRoute()
const tabsStore = useTabsStore()

watch(
  () => route.path,
  (path) => {
    const title = typeof route.meta.title === 'string' ? route.meta.title : path
    tabsStore.addTab(path, title)
  },
  { immediate: true },
)

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

function buildMenuOptions(items: MenuItemConfig[]): MenuOption[] {
  return items.map((item) => ({
    label: item.label,
    key: item.key,
    icon: renderIcon(item.icon),
    children: item.children ? buildMenuOptions(item.children) : undefined,
  }))
}

const menuOptions = computed<MenuOption[]>(() => buildMenuOptions(menuConfig))

const menuGroupKeys = menuConfig.filter((item) => item.children).map((item) => item.key)

const activeMenuKey = computed(() => route.path)

function handleMenuUpdate(key: string) {
  void router.push(key)
}

function handleTabClick(path: string) {
  tabsStore.setActive(path)
  void router.push(path)
}

function closeTab(path: string) {
  if (tabsStore.tabs.length <= 1) return
  const wasActive = tabsStore.activeTab === path
  tabsStore.removeTab(path)
  if (wasActive) {
    void router.push(tabsStore.activeTab)
  }
}

function handleTabClose(e: Event, path: string) {
  e.stopPropagation()
  closeTab(path)
}

function handleTabMousedown(e: MouseEvent, path: string) {
  if (e.button === 1) {
    e.preventDefault()
    closeTab(path)
  }
}

const userDropdownOptions = [
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline),
  },
]

function handleUserDropdown(key: string | number) {
  if (key === 'logout') {
    authStore.logout()
    void router.push('/login')
  }
}
</script>

<template>
  <NLayout class="app-root">
    <NLayoutHeader bordered class="app-topbar">
      <div class="app-topbar__left">
        <RouterLink to="/screen/overview" class="app-topbar__logo app-topbar__logo--link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            class="app-topbar__badge"
            style="color: var(--theme-primary, #679d3f)"
          >
            <rect width="32" height="32" rx="6" fill="currentColor" />
            <ellipse cx="16" cy="14" rx="8" ry="6" fill="rgba(255,255,255,0.85)" />
            <ellipse cx="12" cy="9" rx="2.5" ry="3.5" fill="rgba(255,255,255,0.65)" />
            <ellipse cx="20" cy="9" rx="2.5" ry="3.5" fill="rgba(255,255,255,0.65)" />
            <circle cx="13" cy="14" r="1.2" fill="currentColor" />
            <circle cx="19" cy="14" r="1.2" fill="currentColor" />
            <ellipse cx="16" cy="17" rx="2" ry="1.2" fill="rgba(255,255,255,0.5)" />
          </svg>
          <span class="app-topbar__name">优质奶牛管理信息系统</span>
        </RouterLink>
      </div>
      <div class="app-topbar__right">
        <span class="app-topbar__hint">Cow Management System</span>
        <NDropdown :options="userDropdownOptions" trigger="click" @select="handleUserDropdown">
          <div class="app-topbar__user">
            <NIcon :component="PersonOutline" :size="18" />
            <span>管理员</span>
          </div>
        </NDropdown>
      </div>
    </NLayoutHeader>

    <NLayout has-sider class="app-body">
      <NLayoutSider
        bordered
        :width="220"
        :native-scrollbar="false"
        content-style="padding: 0.5rem;"
        class="app-sidebar"
      >
        <NMenu
          :value="activeMenuKey"
          :options="menuOptions"
          :indent="24"
          accordion
          :default-expanded-keys="menuGroupKeys"
          @update:value="handleMenuUpdate"
        />
      </NLayoutSider>

      <NLayout>
        <div class="tab-bar">
          <div class="tab-bar__scroll">
            <div
              v-for="tab in tabsStore.tabs"
              :key="tab.path"
              class="tab-item"
              :class="{ 'tab-item--active': tabsStore.activeTab === tab.path }"
              @click="handleTabClick(tab.path)"
              @mousedown="handleTabMousedown($event, tab.path)"
            >
              <span class="tab-item__title">{{ tab.title }}</span>
              <span
                v-if="tabsStore.tabs.length > 1"
                class="tab-item__close"
                @click="handleTabClose($event, tab.path)"
              >
                <NIcon :component="CloseOutline" :size="14" />
              </span>
            </div>
          </div>
        </div>

        <NLayoutContent
          content-style="padding: 0 1.25rem 1.25rem;"
          class="app-content"
          :native-scrollbar="false"
        >
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NLayout>
  </NLayout>
</template>
