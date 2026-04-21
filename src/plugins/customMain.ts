// main.ts
import 'oeos-components/dist/style.css'
import OeosComponents from 'oeos-components'
import * as utils from '@oeos-components/utils'
export function installOeos(app) {
  app.use(OeosComponents, {
    globalComponentConfig: {
      oSelect: {
        showPrefix: true,
      },
      oTable: {
        pageSizes: [10, 30, 50, 100],
      },
    },
  })
  Object.keys(utils).forEach((v) => {
    app.config.globalProperties[v] = utils[v]
  })
}
