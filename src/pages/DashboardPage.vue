<script setup>
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { useFinances } from '@/stores/finances'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const finances = useFinances()
const selectedMonth = ref(null)

// Group transactions by month
const monthlyData = computed(() => {
  const grouped = {}

  finances.records.forEach((transaction) => {
    // Parse date and get month key (YYYY-MM)
    const date = new Date(transaction.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        income: 0,
        outcome: 0,
        transactions: [],
      }
    }

    grouped[monthKey].transactions.push(transaction)

    // Parse amount and determine if it's income or outcome
    const amount = parseFloat(transaction.amount.replace(',', '.'))
    if (amount > 0) {
      grouped[monthKey].income += amount
    } else {
      grouped[monthKey].outcome += Math.abs(amount)
    }
  })

  // Sort by month
  const sortedMonths = Object.keys(grouped).sort()

  return {
    months: sortedMonths,
    data: sortedMonths.map((month) => grouped[month]),
    grouped,
  }
})

// Chart data
const chartData = computed(() => ({
  labels: monthlyData.value.months.map((month) => {
    const [year, monthNum] = month.split('-')
    const date = new Date(year, monthNum - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }),
  datasets: [
    {
      label: 'Income',
      backgroundColor: '#10b981',
      data: monthlyData.value.data.map((d) => d.income.toFixed(2)),
    },
    {
      label: 'Outcome',
      backgroundColor: '#ef4444',
      data: monthlyData.value.data.map((d) => d.outcome.toFixed(2)),
    },
  ],
}))

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index
      selectedMonth.value = monthlyData.value.months[index]
    }
  },
  plugins: {
    title: {
      display: true,
      text: 'Monthly Income vs Outcome',
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || ''
          const value = parseFloat(context.parsed.y).toFixed(2)
          return `${label}: ${finances.records[0]?.currency || '€'} ${value}`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `${finances.records[0]?.currency || '€'} ${value}`,
      },
    },
  },
}

// Get largest transactions for selected month
const selectedMonthTransactions = computed(() => {
  if (!selectedMonth.value || !monthlyData.value.grouped[selectedMonth.value]) {
    return null
  }

  const transactions = monthlyData.value.grouped[selectedMonth.value].transactions

  // Sort transactions by absolute amount
  const sorted = [...transactions].sort((a, b) => {
    const amountA = Math.abs(parseFloat(a.amount.replace(',', '.')))
    const amountB = Math.abs(parseFloat(b.amount.replace(',', '.')))
    return amountB - amountA
  })

  // Get top 5 income and outcome
  const income = sorted.filter((t) => parseFloat(t.amount.replace(',', '.')) > 0).slice(0, 5)
  const outcome = sorted.filter((t) => parseFloat(t.amount.replace(',', '.')) < 0).slice(0, 5)

  return { income, outcome }
})

// Format amount for display
const formatAmount = (amount) => {
  const value = parseFloat(amount.replace(',', '.'))
  return value.toFixed(2)
}

// Format date for display
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Close details panel
const closeDetails = () => {
  selectedMonth.value = null
}
</script>

<template>
  <div class="p-6">
    <!-- Chart and details -->
    <div class="space-y-6">
      <!-- Chart container -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="h-96">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
        <p class="text-sm text-gray-500 text-center mt-4">
          Click on any month to see the largest transactions
        </p>
      </div>

      <!-- Selected month details -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="selectedMonth && selectedMonthTransactions"
          class="bg-white rounded-lg shadow-lg p-6"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">
              {{
                new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })
              }}
            </h2>
            <button
              @click="closeDetails"
              class="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Top Income -->
            <div>
              <h3 class="text-lg font-semibold text-green-600 mb-4">Top Income</h3>
              <div v-if="selectedMonthTransactions.income.length > 0" class="space-y-3">
                <div
                  v-for="(transaction, index) in selectedMonthTransactions.income"
                  :key="index"
                  class="border border-green-200 rounded-lg p-4 bg-green-50"
                >
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-sm text-gray-600">{{ formatDate(transaction.date) }}</span>
                    <span class="font-semibold text-green-700">
                      +{{ transaction.currency }} {{ formatAmount(transaction.amount) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700 font-medium">
                    {{ transaction.other_name || 'Unknown' }}
                  </p>
                  <p v-if="transaction.free_comment" class="text-xs text-gray-600 mt-1">
                    {{ transaction.free_comment }}
                  </p>
                </div>
              </div>
              <p v-else class="text-gray-500 text-sm">No income transactions this month</p>
            </div>

            <!-- Top Outcomes -->
            <div>
              <h3 class="text-lg font-semibold text-red-600 mb-4">Top Expenses</h3>
              <div v-if="selectedMonthTransactions.outcome.length > 0" class="space-y-3">
                <div
                  v-for="(transaction, index) in selectedMonthTransactions.outcome"
                  :key="index"
                  class="border border-red-200 rounded-lg p-4 bg-red-50"
                >
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-sm text-gray-600">{{ formatDate(transaction.date) }}</span>
                    <span class="font-semibold text-red-700">
                      {{ transaction.currency }} {{ formatAmount(transaction.amount) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700 font-medium">
                    {{ transaction.other_name || 'Unknown' }}
                  </p>
                  <p v-if="transaction.free_comment" class="text-xs text-gray-600 mt-1">
                    {{ transaction.free_comment }}
                  </p>
                </div>
              </div>
              <p v-else class="text-gray-500 text-sm">No expense transactions this month</p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
