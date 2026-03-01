<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Create Support Ticket</h1>
        
        <form @submit.prevent="handleSubmit" class="space-y-6 bg-white shadow sm:rounded-lg p-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              v-model="form.description"
              rows="4"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Attachments (Optional)</label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              @change="handleFileChange"
              class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p class="mt-1 text-xs text-gray-500">Images and PDF files only</p>
          </div>
          
          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>
          
          <div class="flex justify-end space-x-3">
            <router-link
              to="/"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </router-link>
            <button
              type="submit"
              :disabled="submitting"
              class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ submitting ? 'Creating...' : 'Create Ticket' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const CREATE_TICKET_MUTATION = gql`
  mutation CreateTicket($title: String!, $description: String!) {
    createTicket(
      input: {
        title: $title
        description: $description
      }
    ) {
      ticket {
        id
        title
      }
      errors
    }
  }
`

const router = useRouter()
const { mutate } = useMutation(CREATE_TICKET_MUTATION)

const form = ref({
  title: '',
  description: '',
})
const attachments = ref([])
const error = ref('')
const submitting = ref(false)

const handleFileChange = (event) => {
  attachments.value = Array.from(event.target.files)
}

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''
  
  try {
    // Note: For file uploads with GraphQL, you'd typically use 
    // apollo-upload-client or REST endpoint for multipart uploads
    // This is a simplified version
    
    const result = await mutate({
      title: form.value.title,
      description: form.value.description,
    })
    
    if (result.data.createTicket.errors.length > 0) {
      throw new Error(result.data.createTicket.errors.join(', '))
    }
    
    router.push(`/tickets/${result.data.createTicket.ticket.id}`)
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>