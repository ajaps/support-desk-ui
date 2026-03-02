import { createApp } from "vue";
import { createPinia } from "pinia";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { apolloClient } from "./apollo/client";
import * as ActiveStorage from "@rails/activestorage"
import router from "./router";
import App from "./App.vue";
import "./style.css";

ActiveStorage.start()

createApp(App)
  .provide(DefaultApolloClient, apolloClient)
  .use(createPinia())
  .use(router)
  .mount("#app");