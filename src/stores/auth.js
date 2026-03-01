import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apolloClient } from "../apollo/client";
import { SIGN_IN, SIGN_UP } from "../graphql/auth.gql";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("jwt") || null);
  const user  = ref(JSON.parse(localStorage.getItem("user") || "null"));

  const isAuthenticated = computed(() => !!token.value);
  const isAgent  = computed(() => user.value?.role === "agent");
  const isCustomer = computed(() => user.value?.role === "customer");

  async function signIn(email, password) {
    const { data } = await apolloClient.mutate({
      mutation: SIGN_IN,
      variables: { email, password },
    });
    const result = data.signIn;
    if (result.errors.length) throw new Error(result.errors[0]);
    _persist(result.token, result.user);
  }

  async function signUp(name, email, password, role = "customer") {
    const { data } = await apolloClient.mutate({
      mutation: SIGN_UP,
      variables: { name, email, password, role },
    });
    const result = data.signUp;
    if (result.errors.length) throw new Error(result.errors[0]);
    _persist(result.token, result.user);
  }

  function signOut() {
    token.value = null;
    user.value  = null;
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    apolloClient.clearStore();
  }

  function _persist(t, u) {
    token.value = t;
    user.value  = u;
    localStorage.setItem("jwt",  t);
    localStorage.setItem("user", JSON.stringify(u));
  }

  async function fetchCurrentUser() {
    // This can be implemented if there's a query to fetch current user details
    // For now, we rely on the user info stored in localStorage after sign-in/up
  }

  return { token, user, isAuthenticated, isAgent, isCustomer, signIn, signUp, signOut };
});