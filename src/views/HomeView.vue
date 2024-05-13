<script setup lang="ts">
import { VisXYContainer, VisLine, VisScatter, VisAxis } from '@unovis/vue'
import { computed, onMounted, ref, watch } from 'vue'
import dayjs from '../time'
import { getAllCountries, getCountryData } from '@/db'
import Card from '@/components/Card.vue'
import CardHeadline from '@/components/CardHeadline.vue'
import DayOverviewCard from '@/components/DayOverviewCard.vue'
import DayPreviewCard from '@/components/DayPreviewCard.vue'
import { allCountries } from '../../countries'
import { feature } from '@rapideditor/country-coder'

const data = ref<RegExpExecArray>()

const currentPosition = ref('Austria');
async function updateData(){
  data.value = await getCountryData(currentPosition.value)
}

watch(currentPosition, async () => {
  await updateData()
})

onMounted(async () => {
  navigator?.geolocation?.getCurrentPosition(async (value) => {
    const locationBasedLocation = feature([value.coords.longitude, value.coords.latitude])?.properties?.nameEn;
    if (locationBasedLocation && allCountries?.includes(locationBasedLocation)) {
      currentPosition.value = locationBasedLocation
    }
    await updateData()
  }, async () => {
    await updateData()
  })
})

const graphData = computed(() => {
  if (data.value) {
    return data.value[0]?.values
  }
  return []
})

function x(d: DataRecord) {
  return dayjs(d[1]).unix()
}

function avgX(d: DataRecord) {
  const index = graphData.value.findIndex(entry => entry[1] === d[1])
  if (index % 200 === 0) {
    return dayjs(d[1]).unix()
  }
  return null
}

const avgY = [
  (d: DataRecord) => calculateAvg(d, 3),
  (d: DataRecord) => calculateAvg(d, 4)
]

function calculateAvg(d: DataRecord, index: number) {
  const defaultIntervalLength = 50
  const currentIndex = graphData.value.findIndex(entry => entry[1] === d[1])
  let avg = []

  for (let i = ((defaultIntervalLength / 2) * -1); i < defaultIntervalLength / 2; i++) {
    const loopIndex = currentIndex + i
    if (graphData.value[loopIndex]) {
      avg.push(graphData.value[loopIndex][index])
    }
  }
  return avg.reduce((p, c) => p + c, 0) / avg.length
}

const y = [
  (d: DataRecord) => d[3],
  (d: DataRecord) => d[4]
]

function xAxisFormatting(d) {
  return dayjs.unix(d).format('YYYY')
}

</script>

<template>
  <main class="max-w-7xl px-6 mx-auto">
    <div class="text-center max-w-md mx-auto pt-12">
      <h1 class="text-3xl pb-1 text-center text-gray-700 font-bold">
        🗓️ On This Day
      </h1>
      <h2 class="text-base text-gray-500 font-medium">See historical weather for this day of the year at your
        location.</h2>
      <div class="py-4 text-gray-700">
        <p><span class="font-bold">Current Date:</span> {{ dayjs().format('LL') }}</p>
        <p><span class="font-bold">
          Country:
        </span> {{ currentPosition }}</p>
        <label for="location" class="sr-only block text-sm font-medium leading-6 text-gray-900">Location</label>
        <select v-model="currentPosition" id="location" name="location" class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
          <option v-for="country in allCountries" :key="country" :value="country">{{country }}</option>
        </select>
      </div>
    </div>
    <div class="max-w-5xl mx-auto py-6">
      <p class="font-bold text-gray-700 py-2">
        Last 5 years
      </p>
      <div class="grid gap-3 grid-cols-5">
        <DayOverviewCard :country="currentPosition" :date="dayjs().subtract(5, 'y')" />
        <DayOverviewCard :country="currentPosition" :date="dayjs().subtract(4, 'y')" />
        <DayOverviewCard :country="currentPosition" :date="dayjs().subtract(3, 'y')" />
        <DayOverviewCard :country="currentPosition" :date="dayjs().subtract(2, 'y')" />
        <DayOverviewCard :country="currentPosition" :date="dayjs().subtract(1, 'y')" />
      </div>
    </div>
    <div></div>
    <div class="max-w-5xl mx-auto">
      <Card>
        <div class=" grid grid-cols-2 gap-6">

          <div class="custom-vis">
            <CardHeadline>
              Historical Data for Austria on {{ dayjs().format('D') }}. {{ dayjs().format('MMM') }}
            </CardHeadline>
            <VisXYContainer :data="graphData">
              <VisScatter :x="x" :y="y" />
              <VisLine :lineWidth="5" :x="x" :y="avgY" />
              <VisAxis type="x" :x="x" :tickFormat="xAxisFormatting" />
              <VisAxis type="y" />
            </VisXYContainer>
          </div>
          <div class="grid grid-cols-4 gap-x-6 gap-y-6">
            <div v-for="i in 12">
              <DayPreviewCard :date="dayjs().subtract(i, 'y')" />
            </div>
          </div>
        </div>

      </Card>
      <div class="py-6">
        <Card>
          <CardHeadline>Woke Disclaimer</CardHeadline>
          <p><a href="https://science.nasa.gov/climate-change/evidence/">Climate change is real</a>. This website is
            here to show historical data for one certain day of the year. If temperatures go down for your place, on a
            certain day, in a certain time period, it does not mean climate change does not exist. Thank you for coming
            to my TED Talk. </p>
        </Card>

        <p class="text-sm text-center text-gray-700 py-5">
          This website uses the <a target="_blank" class="underline"
                                   href="https://www.kaggle.com/datasets/guillemservera/global-daily-climate-data">Global
          Daily Weather Dataset (CC BY-NC 4.0 DEED)</a> as a basis
        </p>

      </div>
    </div>

  </main>
</template>
<style>
.custom-vis {
  --vis-scatter-fill-opacity: 0.2;
  --vis-scatter-stroke-width: 1;
  --vis-scatter-hover-stroke-width: 2;
  --vis-scatter-point-label-text-color-dark: darkblue;
}

</style>