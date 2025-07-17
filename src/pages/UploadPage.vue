<template>
  <div class="flex flex-col items-center bg-white rounded-lg p-4 shadow">
    <h1 class="text-lg font-bold">Upload KBC export</h1>
    <h6>Your data never leaves your device</h6>

    <label
      for="file-upload"
      class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mx-auto size-12 text-gray-400"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      <span class="mt-2 block text-sm font-semibold text-gray-900">Click here to select CSV</span>
      <input
        type="file"
        id="file-upload"
        name="file-upload"
        class="sr-only"
        @change="onFileSelected"
      />
    </label>
  </div>
</template>

<script setup>
import { useFinances } from '@/stores/finances'
import Papa from 'papaparse'

const finances = useFinances()

function onFileSelected(event) {
  const files = event.target.files

  Papa.parse(files[0], {
    step(results) {
      finances.addRecord(results)
    },
    complete() {
      console.info('complete')
    },
  })
}
</script>
