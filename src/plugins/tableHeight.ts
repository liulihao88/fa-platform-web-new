/**
 * src/plugins/tableHeight.ts
 * 计算容器高度, 用于表格高度自适应
 *
 * @examples
 const headerRef = ref(null)
 proxy.$initTableHeight(headerRef, true)
 :height="$tableHeight.value"
 */

import { ref, onMounted, onUnmounted } from 'vue'
const DomHeight = ref(0)
const tableHeight = ref(0)
export default {
  install(app) {
    app.config.globalProperties.$tableHeight = tableHeight
    function calcItemHeight(el, isShowPagination) {
      if (el instanceof HTMLElement) {
      } else {
        el = el.$el
      }
      const height = el.offsetHeight
      const marginTop = parseFloat(getComputedStyle(el).marginTop)
      const marginBottom = parseFloat(getComputedStyle(el).marginBottom)
      DomHeight.value += height + marginTop + marginBottom
      tableHeight.value = window.innerHeight - DomHeight.value - 34 - 48 - 48 - (isShowPagination ? 50 : 0)
    }
    // 创建一个响应式引用，用于存储表格高度

    // 初始化全局响应式属性
    // 定义计算表格高度的函数
    const calculateHeight = (referenceElement: any = '', isShowPagination = false): void => {
      tableHeight.value = 0
      DomHeight.value = 0
      if (Array.isArray(referenceElement)) {
        for (let i = 0; i < referenceElement.length; i++) {
          const toRowEl = referenceElement[i].value
          if (toRowEl) {
            calcItemHeight(toRowEl, isShowPagination)
          }
        }
      } else if (referenceElement.value) {
        calcItemHeight(referenceElement.value, isShowPagination)
      } else if (referenceElement === '') {
        const windowHeight = window.innerHeight
        const tableHeightValue = windowHeight - 34 - 48 - 48 - (isShowPagination ? 64 : 0)
        tableHeight.value = tableHeightValue
      }

      tableHeight.value++
      setTimeout(() => {
        tableHeight.value--
      }, 0)
    }

    // 在插件中提供一个方法，用于初始化表格高度计算
    app.config.globalProperties.$initTableHeight = (...rest: any) => {
      onMounted(() => {
        calculateHeight(...rest)
        // 监听窗口大小变化事件
        window.addEventListener('resize', () => calculateHeight(...rest))
      })

      // 在组件卸载时移除事件监听器
      onUnmounted(() => {
        window.removeEventListener('resize', () => calculateHeight(...rest))
      })
    }

    // 初始化全局响应式属性 - 已在上方设置，无需重复
  },
}
