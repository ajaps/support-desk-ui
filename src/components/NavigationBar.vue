<template>
  <nav class="bg-indigo-600">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
          <router-link to="/" class="text-white font-bold text-xl">
            Support Ticket System
          </router-link>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-indigo-200">{{ authStore.user?.name }}</span>
          <span 
            :class="authStore.isAgent ? 'bg-green-500' : 'bg-blue-500'"
            class="px-2 py-1 rounded text-xs text-white"
          >
            {{ authStore.user?.role }}
          </span>
          <button 
            @click="logout"
            class="text-white hover:text-indigo-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.signOut()
  router.push('/login')
}
</script>