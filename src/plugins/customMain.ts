// main.ts
import oeosComponents from "oeos-components";
import "oeos-components/dist/style.css";

// const app = createApp(App);
// app.use(oeosComponents);
// app.mount("#app");

export function installOeos(app) {
  app.use(oeosComponents);
}
