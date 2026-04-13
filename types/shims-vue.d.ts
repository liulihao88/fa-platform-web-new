import 'vue'
import type { Ref } from 'vue'

interface OptionType {
  label: string
  value: string | number
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.scss' {
  const scss: Record<string, string>
  export default scss
}

// 扩展 ComponentPublicInstance 类型
declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: any
    setStorage: any
    setTenantStorage: any
    getStorage: any
    getTenantStorage: any
    clearStorage: any
    clearTenantStorage: any
    validForm: any
    isEmpty: any
    notEmpty: any
    merge: any
    clone: any
    formatTime: any
    formatDurationTime: any
    uuid: any
    getType: any
    sleep: any
    validate: any
    asyncWrapper: any
    formatImg: any
    copy: any
    formatThousands: any
    formatToFixed: any
    log: any
    random: any
    toLine: any
    processWidth: any
    formatBytes: any
    formatBytesConvert: any
    throttle: any
    debounce: any
    confirm: any
    formatNewLines: any
    devConfirm: any
    formatTimeByRule: any

    // 本地
    isImage: any
    $dev: any
    $mitt: any
    quotaRules
    jump: any
    calculatePrometheusStep: any
    QUOTA_OPTIONS: OptionType[]
    QUOTA_UNIT: OptionType[]
    TIME_WIDTH_ATTRS: OptionType[]
    VERSION_WIDTH: OptionType[]
    setEditAttrs: any
    setDetailAttrs: any
    setDeleteAttrs: any
    renderWarnNumber: any

    ROLE_OPTIONS: OptionType[]
    PERMISSION_OPTIONS: OptionType[]
    TASK_TYPE_OPTIONS: OptionType[]
    PAGE_SIZE: OptionType[]
    SERVE_STATUS: OptionType[]
    PAGE_NUMBER: OptionType[]
    PRIVATE: 'PRIVATE'
    IMAGE_OPTIONS: Array<{ label: string; value: string | number }>
    $initTableHeight: any
    MIN_PASSWORD: number
    Max_PASSWORD: number
    VALID_PASSWORD: any
    $tableHeight: Ref<number>
    gDownloadUrl: function
  }
}
