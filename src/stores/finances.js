import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Transaction } from '@/models/transaction'

export const useFinances = defineStore('finances', () => {
  const isLoading = ref(false)
  const loadingText = ref(null)
  const records = ref([])

  const hasRecords = computed(() => !isLoading.value && records.value.length !== 0)

  function setLoading(state, text) {
    isLoading.value = state
    loadingText.value = text
  }

  function addRecord(row) {
    if (row.data.length === 18 && row.errors.length === 0) {
      records.value.push(new Transaction(row))
    } else if (row.data.length === 1 && row.data[0] === '') {
      return
    } else {
      console.error('Failed to parse record:', row)
    }
  }

  function noMoreRecords() {
    setLoading(false)
    console.info(records.value)
  }

  return {
    isLoading,
    loadingText,
    records,
    hasRecords,
    setLoading,
    addRecord,
    noMoreRecords,
  }
})
