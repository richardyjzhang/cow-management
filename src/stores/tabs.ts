import { ref } from 'vue'
import { defineStore } from 'pinia'

interface TabItem {
  path: string
  title: string
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([])
  const activeTab = ref('')

  function addTab(path: string, title: string) {
    if (!tabs.value.some((t) => t.path === path)) {
      tabs.value.push({ path, title })
    }
    activeTab.value = path
  }

  function removeTab(path: string) {
    const idx = tabs.value.findIndex((t) => t.path === path)
    if (idx === -1) return
    tabs.value.splice(idx, 1)
    if (activeTab.value === path && tabs.value.length > 0) {
      activeTab.value = tabs.value[Math.min(idx, tabs.value.length - 1)]?.path ?? ''
    }
  }

  function setActive(path: string) {
    activeTab.value = path
  }

  return { tabs, activeTab, addTab, removeTab, setActive }
})
