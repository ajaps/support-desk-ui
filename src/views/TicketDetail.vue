<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div v-if="loading" class="text-center py-10">Loading...</div>
    
    <div v-else-if="ticket" class="px-4 py-6 sm:px-0">
      <!-- Ticket Header -->
      <div class="bg-white shadow sm:rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ ticket.title }}</h1>
              <div class="flex space-x-2 mb-4">
                <span :class="statusColor(ticket.status)" class="px-2 py-1 rounded text-sm">
                  {{ ticket.status }}
                </span>
              </div>
            </div>
            <div v-if="authStore.isAgent" class="space-x-2">
              <select 
                v-model="statusUpdate"
                @change="updateStatus"
                class="border rounded px-2 py-1"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          
          <div class="prose max-w-none text-gray-700 mb-4">
            {{ ticket.description }}
          </div>
          
          <div class="text-sm text-gray-500">
            <p>Created by: {{ ticket.customer.name }} ({{ ticket.customer.email }})</p>
            <p>Created at: {{ formatDate(ticket.createdAt) }}</p>
            <p v-if="ticket.agent">Assigned to: {{ ticket.agent.name }}</p>
          </div>
          
          <!-- Attachments -->
          <div v-if="ticket.attachments?.length > 0" class="mt-4">
            <h3 class="text-sm font-medium text-gray-900">Attachments:</h3>
            <ul class="mt-2 space-y-1">
              <li v-for="attachment in ticket.attachments" :key="attachment.id">
                <a 
                  :href="attachment.url" 
                  target="_blank"
                  class="text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  {{ attachment.filename }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Comments</h2>
          
          <div v-if="ticket.comments.length === 0" class="text-gray-500 text-center py-4">
            No comments yet.
            <span v-if="authStore.isCustomer" class="block text-sm mt-1">
              An agent must comment first before you can reply.
            </span>
          </div>
          
          <div v-else class="space-y-4 mb-6">
            <div 
              v-for="comment in ticket.comments" 
              :key="comment.id"
              :class="comment.user.role === 'agent' ? 'bg-blue-50' : 'bg-gray-50'"
              class="p-4 rounded-lg"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">
                  {{ comment.user.name }}
                  <span 
                    :class="comment.user.role === 'agent' ? 'text-blue-600' : 'text-gray-600'"
                    class="text-xs ml-1"
                  >
                    ({{ comment.user.role }})
                  </span>
                </span>
                <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="text-gray-700">{{ comment.body }}</p>
            </div>
          </div>

          <!-- Add Comment -->
          <div v-if="canComment" class="mt-4">
            <textarea
              v-model="newComment"
              rows="3"
              class="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
              placeholder="Add a comment..."
            ></textarea>
            <div class="mt-2 flex justify-end">
              <button
                @click="submitComment"
                :disabled="!newComment.trim() || submitting"
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ submitting ? 'Submitting...' : 'Add Comment' }}
              </button>
            </div>
          </div>
          
          <div v-else-if="authStore.isCustomer && !canComment" class="text-sm text-gray-500 text-center py-4">
            Waiting for an agent to respond before you can comment.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { useAuthStore } from '../stores/auth'

const TICKET_QUERY = gql`
  query Ticket($id: ID!) {
    ticket(id: $id) {
      id
      title
      description
      status
      createdAt
      closedAt
      customer {
        id
        name
        email
        role
      }
      agent {
        id
        name
        email
      }
      comments {
        id
        body
        createdAt
        user {
          id
          name
          role
        }
      }
    }
  }
`

const UPDATE_TICKET_MUTATION = gql`
  mutation UpdateTicket($id: ID!, $status: String) {
    updateTicket(id: $id, status: $status) {
      ticket {
        id
        status
      }
      errors
    }
  }
`

const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($ticketId: ID!, $body: String!) {
    createComment(ticketId: $ticketId, body: $body) {
      comment {
        id
        body
        createdAt
        user {
          id
          name
          role
        }
      }
      errors
    }
  }
`

const route = useRoute()
const authStore = useAuthStore()
const ticketId = route.params.id

const { result, loading, refetch } = useQuery(TICKET_QUERY, { id: ticketId })
const { mutate: updateTicket } = useMutation(UPDATE_TICKET_MUTATION)
const { mutate: createComment } = useMutation(CREATE_COMMENT_MUTATION)

const ticket = computed(() => result.value?.ticket)
const statusUpdate = ref('')
const newComment = ref('')
const submitting = ref(false)

const canComment = computed(() => {
  if (authStore.isAgent) return true
  if (authStore.isCustomer && ticket.value?.agent) return true
  return false
})

const statusColor = (status) => ({
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800'
}[status])

const formatDate = (date) => new Date(date).toLocaleString()

const updateStatus = async () => {
  try {
    await updateTicket({ id: ticketId, status: statusUpdate.value })
    refetch()
  } catch (e) {
    alert('Failed to update status')
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  submitting.value = true
  try {
    await createComment({ ticketId, body: newComment.value })
    newComment.value = ''
    refetch()
  } catch (e) {
    alert('Failed to add comment: ' + e.message)
  } finally {
    submitting.value = false
  }
}
</script>