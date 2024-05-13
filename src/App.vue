<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { initializeDb } from '@/db'


onMounted(() => {
})

</script>

<template>
  <header>
    <div class="wrapper">
    </div>
  </header>

  <RouterView />
</template>

<style scoped>

</style>
