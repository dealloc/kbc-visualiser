import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useFinances = defineStore('finances', () => {
  const parsing = ref(false)
  const rows = ref([])

  function pushFinanceData(row) {
    if (row.data.length === 18) {
      rows.value.push(row.data)
    }
  }

  function completeFinanceData() {
    console.info(rows)
  }

  return { parsing, pushFinanceData, completeFinanceData }
})
