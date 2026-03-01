<script setup>
import { onMounted, provide } from "vue";
import { useAuthStore } from "./stores/auth";
import NavigationBar from "./components/NavigationBar.vue";
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from './apollo/client'

provide(DefaultApolloClient, apolloClient)

const authStore = useAuthStore();

</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavigationBar v-if="authStore.isAuthenticated" />
    <router-view />
  </div>
</template>

<style scoped>
</style>
