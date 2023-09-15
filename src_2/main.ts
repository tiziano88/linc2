import { createApp } from "vue";
import { createPinia, defineStore } from "pinia";
import App from "./App.vue";
import "./schema";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());

app.mount("#app");

export const useMessageStore = defineStore("message", {
  // other options...
});
