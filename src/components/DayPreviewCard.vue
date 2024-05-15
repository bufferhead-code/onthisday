<script setup lang="ts">

import dayjs from '@/time'
import CardHeadline from '@/components/CardHeadline.vue'
import Card from '@/components/Card.vue'
import type { Dayjs } from 'dayjs'
import { onMounted, ref, watch } from 'vue'
import { getDailyCountryData } from '@/db'

const props = defineProps<{
  date: Dayjs
  country: string
}>()

const dailyData = ref([])

onMounted(async () => {
  await updateData()
})

watch(() => props.date, async () => {
  await updateData()
})

async function updateData(){
  dailyData.value = (await getDailyCountryData(props.country, props.date))[0]?.values[0]
}

function formatTemperature(temperature: number) {
  return `${temperature?.toFixed(1)}°C`
}

</script>

<template>
  <div class="border-t border-b border-gray-200">
    <p class="font-semibold text-gray-500 text-xs py-0.5 border-b border-gray-200 text-center">
      {{ date.format('YYYY') }}
    </p>
    <div class="text-xs divide-y ">
      <div class="grid grid-cols-1  pb-2">
        <div class="flex items-center justify-between text-center">
          <p class=" text-red-500">Max</p>
          <p class="font-semibold text-base text-red-500">{{ formatTemperature(dailyData[4]) }}</p>
        </div>
        <div class="flex items-center justify-between text-center">
          <p class=" text-blue-500">Min</p>
          <p class="font-semibold text-base text-blue-500">{{ formatTemperature(dailyData[3]) }}</p>
        </div>
        <div class="flex items-center justify-between text-center">
          <p class=" text-gray-500">Avg</p>
          <p class="font-semibold text-base text-gray-500">{{ formatTemperature(dailyData[2]) }}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>