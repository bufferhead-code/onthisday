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

const data = ref<RegExpExecArray | null>(null)

const currentPosition = ref('Austria');
async function updateData(){
  data.value = await getCountryData(currentPosition.value)
}

watch(currentPosition, async () => {
  data.value = null
  historicDataLoaded.value = false
})

onMounted(async () => {
  navigator?.geolocation?.getCurrentPosition(async (value) => {
    const locationBasedLocation = feature([value.coords.longitude, value.coords.latitude])?.properties?.nameEn;
    if (locationBasedLocation && allCountries?.includes(locationBasedLocation)) {
      currentPosition.value = locationBasedLocation
    }
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

const historicDataLoaded = ref(false);
const historicDataLoading = ref(false);

async function loadHistoricData(){
  historicDataLoading.value = true;
  await updateData()
  historicDataLoaded.value = true;
  historicDataLoading.value = false;
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
      <div class="pt-4 flex justify-center">
        <a target="_blank" href="https://github.com/bufferhead-code/onthisday" class="flex items-center space-x-2 bg-white border hover:bg-gray-100 transition border-gray-200 rounded-lg shadow px-3 py-2">
          <svg
            class="w-6 h-6"
            viewBox="0 0 256 250"
            width="256"
            height="250"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid"
          >
            <path
              d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" />
          </svg>
          <div class="">Fork on Github</div>
        </a>
      </div>

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
      <div class="grid gap-3 sm:grid-cols-5">
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
        <div class=" grid sm:grid-cols-2 gap-6">

          <div class="custom-vis">
            <CardHeadline>
              Historical Data for {{ currentPosition }} on {{ dayjs().format('D') }}. {{ dayjs().format('MMM') }}
            </CardHeadline>
            <div class="relative">
              <VisXYContainer :data="graphData">
                <VisScatter :x="x" :y="y" />
                <VisLine :lineWidth="5" :x="x" :y="avgY" />
                <VisAxis type="x" :x="x" :tickFormat="xAxisFormatting" />
                <VisAxis type="y" />
              </VisXYContainer>
              <div v-if="!historicDataLoaded" class="bg-white/50 w-full h-full absolute left-0 top-0 flex items-center justify-center">
                <button :disabled="historicDataLoading" class="bg-white flex items-center font-medium rounded-lg border border-gray-100 px-3 py-2 shadow hover:bg-gray-100 transition" @click="loadHistoricData">
                  <svg v-if="historicDataLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Load all historic data</span>
                  </button>
              </div>
            </div>

          </div>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-x-6 gap-y-6">
            <div v-for="i in 12">
              <DayPreviewCard :country="currentPosition" :date="dayjs().subtract(i, 'y')" />
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