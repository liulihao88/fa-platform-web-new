<template>
  <div class="pdf-viewer">
    <div class="pdf-controls">
      <button class="control-btn" size="small" @click="zoomIn">放大</button>
      <button class="control-btn" @click="zoomOut">缩小</button>
      <button :disabled="currentPage <= 1" class="control-btn" @click="previousPage">上一页</button>

      <button :disabled="!pdfDoc || currentPage >= pdfDoc.numPages" class="control-btn" @click="nextPage">
        下一页
      </button>
      <input
        v-model="jumpToPage"
        type="number"
        min="1"
        :max="pdfDoc ? pdfDoc.numPages : 1"
        class="page-input"
        placeholder="跳转到第几页"
        @change="goToPage"
      />
      <span>/</span>
      <span>{{ pdfDoc ? pdfDoc.numPages : '--' }} 页</span>
    </div>
    <div ref="containerRef" class="pdf-container" @scroll="handleScroll">
      <div class="pages-wrapper" :style="{ height: totalHeight + 'px' }">
        <div
          v-for="pageData in renderedPages"
          :key="pageData.pageNum"
          class="page-container"
          :style="{
            position: 'absolute',
            top: pageData.offsetTop + 'px',
            height: pageData.height + 'px',
          }"
        >
          <!-- Canvas 用于渲染PDF -->
          <canvas :ref="(el) => setCanvasRef(el, pageData.pageNum)" class="pdf-canvas" />
        </div>
      </div>
      <div v-if="loading" class="loading-overlay">加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, toRaw } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
})

// 在浏览器环境中动态设置worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/node_modules/pdfjs-dist/build/pdf.worker.min.mjs`
}

// 响应式数据
const pdfDoc = ref(null)
const currentPage = ref(1)
const scale = ref(1.0)
const containerRef = ref(null)
const pagesInfo = ref([])
const renderedPages = ref([])
const totalHeight = ref(0)
const containerHeight = ref(0)
const scrollTop = ref(0)
const pageBuffer = ref(10) // 可视区域缓冲页面数
const loadingTask = ref(null)
const loading = ref(false)
const scrollTimer = ref(null)
const jumpToPage = ref(1)
const pageCache = ref(new Map()) // 缓存已渲染的页面
const textLayerCache = ref(new Map()) // 缓存文本层

// 用于存储canvas和textLayer的引用
const canvasRefs = ref({})
const textLayerRefs = ref({})

// 设置canvas引用
const setCanvasRef = (el, pageNum) => {
  if (el) {
    canvasRefs.value[`canvas-${pageNum}`] = el
  }
}

// 设置textLayer引用
const setTextLayerRef = (el, pageNum) => {
  if (el) {
    textLayerRefs.value[`textLayer-${pageNum}`] = el
  }
}

// 获取canvas引用
const getCanvasRef = (pageNum) => {
  return canvasRefs.value[`canvas-${pageNum}`]
}

// 获取textLayer引用
const getTextLayerRef = (pageNum) => {
  return textLayerRefs.value[`textLayer-${pageNum}`]
}

// 加载PDF
const loadPDF = async () => {
  try {
    // 使用流式加载以提高大文件性能
    loadingTask.value = pdfjsLib.getDocument({
      url: props.url,
      cMapUrl: '/node_modules/pdfjs-dist/cmaps/',
      cMapPacked: true,
    })
    pdfDoc.value = await loadingTask.value.promise
  } catch (error) {
    console.error('PDF加载失败：', error)
    throw error
  }
}

// 计算页面信息
const calculatePagesInfo = async () => {
  if (!pdfDoc.value) return
  let offsetY = 0
  pagesInfo.value = []

  // 获取所有页面尺寸信息
  const pagePromises = []
  for (let i = 1; i <= pdfDoc.value.numPages; i++) {
    pagePromises.push(
      toRaw(pdfDoc.value)
        .getPage(i)
        .then((page) => {
          const viewport = page.getViewport({ scale: scale.value })
          const pageHeight = viewport.height

          pagesInfo.value.push({
            pageNum: i,
            offsetTop: offsetY,
            height: pageHeight,
            rendered: false,
          })

          offsetY += pageHeight + 10 // 20px 间距
          totalHeight.value = offsetY
        }),
    )
  }

  await Promise.all(pagePromises)
}

// 处理滚动
const handleScroll = () => {
  if (!containerRef.value) return

  scrollTop.value = containerRef.value.scrollTop
  containerHeight.value = containerRef.value.clientHeight
  // currentPage.value = pagesInfo.value.find((pageInfo) => pageInfo.offsetTop >= scrollTop.value)?.pageNum ?? 1;
  // 18473
  currentPage.value =
    // console.log(`95 pagesInfo.value`, pagesInfo.value);
    pagesInfo.value.find((pageInfo) => {
      console.log(`51 pageInfo.offsetTop`, pageInfo.offsetTop)
      return pageInfo.offsetTop + pageInfo.height >= scrollTop.value
    }).pageNum ?? 1
  console.log(`17 currentPage.value`, currentPage.value)
  jumpToPage.value = currentPage.value
  // 防抖处理
  clearTimeout(scrollTimer.value)
  //  currentPage.value = scrollTop.value /
  scrollTimer.value = setTimeout(() => {
    updateRenderedPages()
  }, 100)
}

// 处理窗口大小变化
const handleResize = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
    updateRenderedPages()
  }
}

// 更新渲染的页面
const updateRenderedPages = () => {
  if (!pdfDoc.value || !containerRef.value) return

  const scrollTop = containerRef.value.scrollTop
  const containerHeight = containerRef.value.clientHeight

  // 计算可视区域（包含缓冲区）
  const startOffset = Math.max(0, scrollTop - containerHeight * pageBuffer.value)
  const endOffset = scrollTop + containerHeight + containerHeight * pageBuffer.value

  // 找出可视区域内的页面
  const pagesToRender = []

  for (let i = 0; i < pagesInfo.value.length; i++) {
    const pageInfo = pagesInfo.value[i]
    const pageEnd = pageInfo.offsetTop + pageInfo.height

    // 如果页面与可视区域有交集
    if (pageInfo.offsetTop < endOffset && pageEnd > startOffset) {
      pagesToRender.push({
        ...pageInfo,
        scale: scale.value,
      })
    }
  }

  renderedPages.value = pagesToRender
  // 延迟渲染，确保DOM更新完成
  nextTick(() => {
    renderPages(pagesToRender)
  })
}

// 添加用于控制渲染任务的变量
const currentRenderAbortController = ref(null)

// 渲染页面
const renderPages = async (pagesToRender) => {
  // 使用Promise.all来并行渲染多个页面
  const renderPromises = pagesToRender.map((pageData) => {
    // 即使页面已缓存，也需要确保canvas被正确渲染
    if (!pageCache.value.has(pageData.pageNum)) {
      return renderPage(pageData.pageNum, pageData.offsetTop, currentRenderAbortController.value?.signal)
    } else {
      // 如果页面已缓存，仍然需要确保canvas被渲染（可能在页面重新进入视图时）
      return renderPage(pageData.pageNum, pageData.offsetTop, currentRenderAbortController.value?.signal)
    }
    return Promise.resolve()
  })

  await Promise.all(renderPromises)
}

// 渲染单个页面
const renderPage = async (pageNum, offsetTop, abortSignal) => {
  if (!pdfDoc.value) return

  // 检查是否已被取消
  if (abortSignal && abortSignal.aborted) {
    console.log(`页面 ${pageNum} 渲染被取消`)
    return
  }

  try {
    // 检查是否已经缓存了此页面
    if (pageCache.value.has(pageNum)) {
      // 如果页面已缓存，直接返回，但确保canvas已经渲染
      const canvas = getCanvasRef(pageNum)
      if (canvas && canvas.style.height && canvas.style.width) {
        // Canvas已经渲染过了，跳过
        return pageCache.value.get(pageNum)
      }
    }

    const page = await toRaw(pdfDoc.value).getPage(pageNum)
    const canvas = getCanvasRef(pageNum)
    const textLayerDiv = getTextLayerRef(pageNum)

    if (!canvas) return

    // 检查是否已被取消
    if (abortSignal && abortSignal.aborted) {
      console.log(`页面 ${pageNum} 渲染被取消`)
      return
    }

    const context = canvas.getContext('2d')
    const viewport = page.getViewport({ scale: scale.value })

    // 设置canvas尺寸，使用更高分辨率以改善文字清晰度
    const devicePixelRatio = window.devicePixelRatio || 1
    const scaledWidth = viewport.width * devicePixelRatio
    const scaledHeight = viewport.height * devicePixelRatio

    canvas.width = scaledWidth
    canvas.height = scaledHeight

    // 应用缩放以确保高DPI显示
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)

    // 设置canvas样式以适应容器
    canvas.style.height = viewport.height + 'px'
    canvas.style.width = viewport.width + 'px'

    // 添加CSS样式优化，减少文字加粗效果
    canvas.style.fontWeight = 'normal'
    canvas.style.imageRendering = 'optimizeQuality'
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      intent: 'display',
    }

    // 检查是否已被取消
    if (abortSignal && abortSignal.aborted) {
      console.log(`页面 ${pageNum} 渲染被取消`)
      return
    }

    // 渲染页面到canvas
    await page.render(renderContext).promise

    // 检查是否已被取消
    if (abortSignal && abortSignal.aborted) {
      console.log(`页面 ${pageNum} 渲染被取消`)
      return
    }

    // 渲染文本层以支持文本选择和复制
    if (textLayerDiv) {
      // 如果文本层已缓存，直接使用缓存
      if (textLayerCache.value.has(pageNum)) {
        textLayerDiv.innerHTML = textLayerCache.value.get(pageNum)
      } else {
        // 创建新的文本层
        const textContent = await page.getTextContent()
        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: viewport,
          textDivs: [],
          hideTextLayer: false,
        })

        await textLayer.render()

        // 缓存文本层内容
        textLayerCache.value.set(pageNum, textLayerDiv.innerHTML)
      }
    }

    // 将页面标记为已渲染并缓存
    const pageInfo = pagesInfo.value.find((p) => p.pageNum === pageNum)
    if (pageInfo) {
      pageInfo.rendered = true
    }
    pageCache.value.set(pageNum, true)
  } catch (error) {
    // 检查错误是否由于取消操作引起
    if (error.name === 'AbortError') {
      console.log(`页面 ${pageNum} 渲染被取消`)
      return
    }
    console.error(`渲染页面 ${pageNum} 失败：`, error)
  }
}

// 上一页
const previousPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value--
  await scrollToPage(currentPage.value)
}

// 下一页
const nextPage = async () => {
  if (!pdfDoc.value || currentPage.value >= pdfDoc.value.numPages) return
  currentPage.value++
  await scrollToPage(currentPage.value)
}

// 滚动到指定页面
const scrollToPage = async (pageNum) => {
  if (!pdfDoc.value || pageNum < 1 || pageNum > pdfDoc.value.numPages) return

  const pageInfo = pagesInfo.value[pageNum - 1]
  if (containerRef.value && pageInfo) {
    containerRef.value.scrollTop = pageInfo.offsetTop
    currentPage.value = pageNum
    jumpToPage.value = pageNum
  }
  clearTimeout(scrollTimer.value)
  scrollTimer.value = setTimeout(() => {
    updateRenderedPages()
  }, 100)
}

// 添加节流相关变量
const lastZoomTime = ref(0)

// 放大
const zoomIn = () => {
  const now = Date.now()
  if (now - lastZoomTime.value < 200) {
    return // 如果距离上次缩放操作不足200ms，则不执行
  }
  lastZoomTime.value = now

  scale.value = Math.min(scale.value + 0.2, 10)
  cancelPreviousRender()
  recalculateAllPages()
}

// 缩小
const zoomOut = () => {
  const now = Date.now()
  if (now - lastZoomTime.value < 200) {
    return // 如果距离上次缩放操作不足200ms，则不执行
  }
  lastZoomTime.value = now

  scale.value = Math.max(scale.value - 0.2, 0.1)
  cancelPreviousRender()
  recalculateAllPages()
}

// 取消上一次渲染的方法
const cancelPreviousRender = () => {
  if (currentRenderAbortController.value) {
    currentRenderAbortController.value.abort()
  }
  // 创建新的 AbortController 用于当前渲染任务
  currentRenderAbortController.value = new AbortController()
}

// 重新计算所有页面
const recalculateAllPages = async () => {
  // 取消之前的渲染任务
  cancelPreviousRender()

  // 清除缓存，重新计算页面尺寸
  pageCache.value.clear()
  textLayerCache.value.clear()
  pagesInfo.value = []

  await calculatePagesInfo()
  updateRenderedPages()
}

// 跳转到指定页面
const goToPage = () => {
  const page = parseInt(jumpToPage.value)
  currentPage.value = jumpToPage.value
  if (page >= 1 && page <= (pdfDoc.value ? pdfDoc.value.numPages : 0)) {
    scrollToPage(page)
  }
}

// 组件挂载后执行
onMounted(async () => {
  loading.value = true
  try {
    await loadPDF()
    containerRef.value = containerRef.value
    containerHeight.value = containerRef.value.clientHeight
    await calculatePagesInfo()
    updateRenderedPages()
  } catch (error) {
    console.error('PDF viewer error:', error)
  } finally {
    loading.value = false
  }

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载前执行
onUnmounted(() => {
  if (loadingTask.value) {
    loadingTask.value.destroy()
  }
  clearTimeout(scrollTimer.value)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

.pdf-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.control-btn {
  height: 30px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.control-btn:hover {
  background-color: #e9e9e9;
}

.control-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  margin: 0 15px;
  font-weight: bold;
}

.page-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.pdf-container {
  position: relative;
  flex: 1;
  overflow: auto;
  background-color: #eee;
}

.pages-wrapper {
  position: relative;
  width: 100%;
}

.page-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 0;
}

.pdf-canvas {
  position: absolute;
  left: 10px;
  image-rendering: optimizequality;
  background-color: white;
  box-shadow: 0 2px 6px rgb(0 0 0 / 10%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.pdf-text-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  line-height: 1;
  opacity: 0.2;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 100;
  padding: 10px;
  background-color: rgb(255 255 255 / 80%);
  border-radius: 5px;
  transform: translate(-50%, -50%);
}
</style>
