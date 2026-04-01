<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { NCard, NGrid, NGi, NStatistic } from 'naive-ui'
import { useBaseRegionStore } from '@/stores/base/region'
import { useBaseFarmerStore } from '@/stores/base/farmer'
import { useBaseCowStore } from '@/stores/base/cow'
import { useStatsFundStore } from '@/stores/stats/fund'

const regionStore = useBaseRegionStore()
const farmerStore = useBaseFarmerStore()
const cowStore = useBaseCowStore()
const fundStore = useStatsFundStore()

const { tree } = storeToRefs(regionStore)
const { farmers } = storeToRefs(farmerStore)
const { cows } = storeToRefs(cowStore)
const { rows: fundRows } = storeToRefs(fundStore)

const townshipCount = computed(() => tree.value.length)
const villageCount = computed(() =>
  tree.value.reduce((n, t) => n + (t.children?.length ?? 0), 0),
)
const farmerCount = computed(() => farmers.value.length)
const cowCount = computed(() => cows.value.length)
const fundBalance = computed(() => fundRows.value.reduce((s, r) => s + r.amount, 0))
</script>

<template>
  <NCard class="page-card page-card--fill" title="数据统计" :bordered="false">
    <template #header-extra>
      <span class="page-card__hint">基于当前 Pinia 演示数据的汇总</span>
    </template>

    <div class="overview">
      <NGrid :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
        <NGi>
          <NCard size="small" class="overview__card">
            <NStatistic label="乡镇数" :value="townshipCount" />
          </NCard>
        </NGi>
        <NGi>
          <NCard size="small" class="overview__card">
            <NStatistic label="行政村数" :value="villageCount" />
          </NCard>
        </NGi>
        <NGi>
          <NCard size="small" class="overview__card">
            <NStatistic label="养殖户" :value="farmerCount" />
          </NCard>
        </NGi>
        <NGi>
          <NCard size="small" class="overview__card">
            <NStatistic label="奶牛存栏" :value="cowCount" />
          </NCard>
        </NGi>
        <NGi span="4">
          <NCard size="small" class="overview__card">
            <NStatistic label="资金流水合计(元，演示)" :value="fundBalance" />
          </NCard>
        </NGi>
      </NGrid>
    </div>
  </NCard>
</template>

<style scoped>
.page-card__hint {
  font-size: 0.75rem;
  color: #86909c;
  font-weight: normal;
}

.overview {
  padding: 0.25rem 0 0.5rem;
}

.overview__card {
  border-radius: 0.5rem;
}
</style>
