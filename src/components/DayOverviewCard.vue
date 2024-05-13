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

const dailyData = ref([]);

watch(() => props.country, async () => {
  updateData()
})

onMounted(async () => {
  updateData()
})

async function updateData(){
  dailyData.value = (await getDailyCountryData(props.country, props.date))[0]?.values[0]
}

function formatTemperature(temperature: number) {
  return `${temperature?.toFixed(1)}°C`
}

</script>

<template>
  <Card>
    <CardHeadline>{{ date.format('LL') }}</CardHeadline>
    <div class="text-xs divide-y ">
      <div class="grid grid-cols-2 gap-x-2 divide-x pb-2">
        <div class="py-1 text-center">
          <p class=" text-red-500">Max</p>
          <p class="font-semibold text-lg text-red-500">{{ formatTemperature(dailyData[4]) }}</p>
          </div>
        <div class="py-1 text-center">
          <p class=" text-blue-500">Min</p>
          <p class="font-semibold text-lg text-blue-500">{{ formatTemperature(dailyData[3]) }}</p>
        </div>
      </div>
      <p class="py-1.5 text-center text-gray-500 font-medium">Avg Temperature: {{ formatTemperature(dailyData[2]) }}</p>
      <div class="grid grid-cols-3 gap-x-2 divide-x py-2">
        <div class="py-1 text-center">
          <p class="pt-1 text-2xl" aria-label="️Precipitation">🌧</p>
          <p class="pb-1 pt-0.5">{{ dailyData[5]?.toFixed(0) }} mm</p>
        </div>
        <div class="py-1 text-center">
          <p class="pt-1 text-2xl" aria-label="️Precipitation">❄️</p>
          <p class="pb-1 pt-0.5">{{ dailyData[6]?.toFixed(0) }} mm</p>
        </div>
        <div class="py-1 text-center">
          <p class="pt-1 text-2xl" aria-label="Sunshine">🌞️</p>
          <p class="pb-1 pt-0.5">{{ dailyData[9]?.toFixed(0) }} min</p>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>

</style>