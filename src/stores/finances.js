import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Transaction } from '@/models/transaction'

export const useFinances = defineStore('finances', () => {
  const isLoading = ref(false)
  const loadingText = ref(null)
  const records = ref([])

  const hasRecords = computed(() => !isLoading.value && records.value.length !== 0)

  function addRecord(row) {
    if (row.data.length === 18 && row.errors.length === 0) {
      console.info(new Transaction(row))
    } else {
      console.error('Failed to parse record:', row)
    }
  }

  return {
    isLoading,
    loadingText,
    records,
    hasRecords,
    addRecord,
  }
})
