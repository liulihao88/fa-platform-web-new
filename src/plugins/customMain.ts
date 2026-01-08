// main.ts
import "oeos-components/dist/style.css";
import OeosComponents from "oeos-components";
import * as utils from "@oeos-components/utils";
export function installOeos(app) {
  app.use(OeosComponents);
  Object.keys(utils).forEach(v => {
    app.config.globalProperties[v] = utils[v];
  });
}
