import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockRegionTree, type RegionRow } from '@/mock/base/region'

function cloneTree(data: RegionRow[]): RegionRow[] {
  return JSON.parse(JSON.stringify(data)) as RegionRow[]
}

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

type NodeLocation = { node: RegionRow; parent: RegionRow | null; list: RegionRow[]; index: number }

function findLocation(rows: RegionRow[], id: string, parent: RegionRow | null = null): NodeLocation | null {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    if (row.id === id) return { node: row, parent, list: rows, index: i }
    if (row.children?.length) {
      const hit = findLocation(row.children, id, row)
      if (hit) return hit
    }
  }
  return null
}

export type VillageMeta = { villageId: string; villageName: string; townshipName: string }

function collectVillageIdsUnderTownship(node: RegionRow): string[] {
  if (node.type === 'village') return [node.id]
  const ids: string[] = []
  for (const ch of node.children ?? []) {
    ids.push(...collectVillageIdsUnderTownship(ch))
  }
  return ids
}

export const useBaseRegionStore = defineStore('baseRegion', () => {
  const tree = ref<RegionRow[]>(cloneTree(mockRegionTree))

  function reset() {
    tree.value = cloneTree(mockRegionTree)
  }

  function findNode(id: string) {
    return findLocation(tree.value, id)
  }

  function addTownship(payload: { name: string; code: string; contact?: string }) {
    const row: RegionRow = {
      id: genId('tw'),
      type: 'township',
      name: payload.name.trim(),
      code: payload.code.trim(),
      contact: payload.contact?.trim(),
      children: [],
    }
    tree.value.push(row)
    return row
  }

  function addVillage(
    townshipId: string,
    payload: { name: string; code: string; contact?: string; groupNames?: string },
  ) {
    const loc = findNode(townshipId)
    if (!loc || loc.node.type !== 'township') return null
    const parent = loc.node
    if (!parent.children) parent.children = []
    const row: RegionRow = {
      id: genId('vl'),
      type: 'village',
      name: payload.name.trim(),
      code: payload.code.trim(),
      contact: payload.contact?.trim(),
      groupNames: payload.groupNames?.trim(),
    }
    parent.children.push(row)
    return row
  }

  function updateNode(
    id: string,
    patch: Partial<Pick<RegionRow, 'name' | 'code' | 'contact' | 'groupNames'>>,
  ) {
    const loc = findNode(id)
    if (!loc) return false
    const n = loc.node
    if (patch.name !== undefined) n.name = patch.name.trim()
    if (patch.code !== undefined) n.code = patch.code.trim()
    if (patch.contact !== undefined) n.contact = patch.contact?.trim()
    if (patch.groupNames !== undefined && n.type === 'village') n.groupNames = patch.groupNames?.trim()
    return true
  }

  /** 供删除前校验：这些村是否仍有关联养殖户（由 farmer store 注入检查） */
  function getVillageIdsUnder(id: string): string[] {
    const loc = findNode(id)
    if (!loc) return []
    if (loc.node.type === 'village') return [loc.node.id]
    return collectVillageIdsUnderTownship(loc.node)
  }

  function removeNode(id: string): boolean {
    const loc = findNode(id)
    if (!loc) return false
    loc.list.splice(loc.index, 1)
    return true
  }

  function listVillagesMeta(): VillageMeta[] {
    const out: VillageMeta[] = []
    for (const tw of tree.value) {
      if (tw.type !== 'township') continue
      for (const v of tw.children ?? []) {
        if (v.type === 'village')
          out.push({ villageId: v.id, villageName: v.name, townshipName: tw.name })
      }
    }
    return out
  }

  return {
    tree,
    reset,
    findNode,
    addTownship,
    addVillage,
    updateNode,
    getVillageIdsUnder,
    removeNode,
    listVillagesMeta,
  }
})
