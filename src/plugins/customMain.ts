// main.ts
import 'oeos-components/dist/style.css'
import OeosComponents from 'oeos-components'
import { reactive, watchEffect } from 'vue'
import * as utils from '@oeos-components/utils'
import { DEFAULT_PAGE_SIZE, useTablePageStoreHook } from '@/store/modules/tablePage'

export function installOeos(app) {
  const tablePageStore = useTablePageStoreHook()
  const globalComponentConfig = reactive({
    oSelect: {
      showPrefix: true,
    },
    oTable: {
      pageSizes: [5, 10, 30, 50],
      pageSize: DEFAULT_PAGE_SIZE,
    },
  })

  watchEffect(() => {
    globalComponentConfig.oTable.pageSize = tablePageStore.pageSize || DEFAULT_PAGE_SIZE
  })

  app.use(OeosComponents, {
    globalComponentConfig,
  })
  Object.keys(utils).forEach((v) => {
    app.config.globalProperties[v] = utils[v]
  })
  const $dev = import.meta.env.MODE === 'development'
  app.config.globalProperties.$dev = utils.getStorage('fa-$dev') ?? $dev
}
