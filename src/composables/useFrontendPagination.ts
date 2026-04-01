import { ref, computed, watch, type ComputedRef } from 'vue'
import type { PaginationProps } from 'naive-ui'

const DEFAULT_PAGE_SIZE = 10

/**
 * 非远程表格的前端分页：与 NDataTable 的 remote=false（默认）配合使用。
 * 筛选条件变化时可调用 resetPage() 回到第 1 页。
 */
export function useFrontendPagination(total: ComputedRef<number>) {
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)

  const pagination = computed<PaginationProps>(() => ({
    page: page.value,
    pageSize: pageSize.value,
    itemCount: total.value,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
    showQuickJumper: true,
    prefix: (info) => `共 ${info.itemCount ?? 0} 条`,
    onUpdatePage: (p) => {
      page.value = p
    },
    onUpdatePageSize: (s) => {
      pageSize.value = s
      page.value = 1
    },
  }))

  function resetPage() {
    page.value = 1
  }

  watch(total, (n) => {
    const maxPage = Math.max(1, Math.ceil(n / pageSize.value) || 1)
    if (page.value > maxPage) page.value = maxPage
  })

  return { page, pageSize, pagination, resetPage }
}
