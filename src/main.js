import { createApp } from "vue";
import { createPinia } from "pinia";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { apolloClient } from "./apollo/client";
import router from "./router";
import App from "./App.vue";
import "./style.css";

createApp(App)
  .provide(DefaultApolloClient, apolloClient)
  .use(createPinia())
  .use(router)
  .mount("#app");