import type { App } from "vue";
import { createPinia } from "pinia";
const store = createPinia();
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useCommonHook } from "./common";

export function setupStore(app: App<Element>) {
  app.use(store);
  store.use(piniaPluginPersistedstate);
}

export { store, useCommonHook };
