<script setup>
import { provide } from "vue";
import { useAuthStore } from "./stores/auth";
import NavigationBar from "./components/NavigationBar.vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { apolloClient } from "./apollo/client";

provide(DefaultApolloClient, apolloClient);

const authStore = useAuthStore();
</script>

<template>
  <div class="app-root">
    <NavigationBar v-if="authStore.isAuthenticated" />
    <router-view />
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0a0f;
}
</style>
