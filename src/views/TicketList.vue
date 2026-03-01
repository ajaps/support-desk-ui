<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ authStore.isAgent ? 'All Tickets' : 'My Tickets' }}
        </h1>
        <router-link
          v-if="authStore.isCustomer"
          to="/tickets/new"
          class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Ticket
        </router-link>
        <button
          v-if="authStore.isAgent"
          @click="exportCSV"
          :disabled="exporting"
          class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {{ exporting ? 'Exporting...' : 'Export Closed Tickets (Last Month)' }}
        </button>
      </div>

      <div v-if="loading" class="text-center py-10">Loading...</div>
      
      <div v-else-if="tickets.length === 0" class="text-center py-10 text-gray-500">
        No tickets found.
      </div>
      
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="ticket in tickets" :key="ticket.id">
            <router-link 
              :to="`/tickets/${ticket.id}`"
              class="block hover:bg-gray-50"
            >
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <p class="text-sm font-medium text-indigo-600 truncate">
                      {{ ticket.title }}
                    </p>
                    <span 
                      :class="statusColor(ticket.status)"
                      class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    >
                      {{ ticket.status }}
                    </span>

                  </div>
                  <div class="ml-2 flex-shrink-0 flex">
                    <p class="text-sm text-gray-500">
                      {{ formatDate(ticket.createdAt) }}
                    </p>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                      Customer: {{ ticket?.customer?.name }}
                    </p>
                  </div>
                  <div v-if="ticket.agent" class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    Agent: {{ ticket.agent.name }}
                  </div>
                </div>
              </div>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { useAuthStore } from '../stores/auth'

const TICKETS_QUERY = gql`
  query Tickets($status: String) {
    tickets(
      status: $status
    ) {
      totalCount
      nodes {
        id
        title
        status
        createdAt
        closedAt
        customer {
          name
          email
        }
        agent {
          name
          email
        }
      }
    }
  }
`

const EXPORT_MUTATION = gql`
  mutation ExportClosedTickets {
    exportClosedTickets {
      csvData
      errors
    }
  }
`

const authStore = useAuthStore()
const { result, loading } = useQuery(TICKETS_QUERY)
const { mutate: exportMutation } = useMutation(EXPORT_MUTATION)

const tickets = computed(() => result.value?.tickets?.nodes || [])
const exporting = ref(false)

const statusColor = (status) => ({
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800'
}[status] || 'bg-gray-100 text-gray-800')

const formatDate = (date) => new Date(date).toLocaleDateString()

const exportCSV = async () => {
  exporting.value = true
  try {
    const result = await exportMutation()
    if (result.data.exportClosedTickets.csvData) {
      const blob = new Blob([result.data.exportClosedTickets.csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `closed-tickets-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    }
  } catch (e) {
    alert('Export failed: ' + e.message)
  } finally {
    exporting.value = false
  }
}
</script>