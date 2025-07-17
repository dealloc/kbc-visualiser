<script setup>
import LoadingPage from './pages/LoadingPage.vue'
import UploadPage from './pages/UploadPage.vue'
import { useFinances } from './stores/finances'

const finances = useFinances()
</script>

<template>
  <LoadingPage v-if="finances.isLoading" />
  <UploadPage v-else-if="!finances.hasRecords" />
</template>
