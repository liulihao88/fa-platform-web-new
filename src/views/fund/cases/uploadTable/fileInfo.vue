<script setup lang="ts">
import { ref } from 'vue'
import support1Image from '@/assets/images/filedesc/support1.png'
import support2Image from '@/assets/images/filedesc/support2.png'
import support3Image from '@/assets/images/filedesc/support3.png'
import support4Image from '@/assets/images/filedesc/support4.png'
import unSupport1Image from '@/assets/images/filedesc/unSupport1.png'
import unSupport2Image from '@/assets/images/filedesc/unSupport2.png'

const isShow = ref(false)
const open = () => {
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog v-model="isShow" :fullscreen="true" title="上传文件格式说明">
      <el-row class="row-box">
        <el-col :span="12" class="l">
          <o-title title="一丶支持的文件种类" />
          <div class="title-1">PDF文件：文件数据的格式是表格，不能没有表格，不能是图片。</div>
          <div class="title-1">EXCEL文件： xls xlsx xlsm 结尾的文件</div>
          <div class="title-1">CSV文件： csv结尾的文件</div>
          <div class="title-1">ZIP 文件： 可以把多个文件或者目录压缩成一个文件一次上传</div>
          <o-title title="二丶支持的格式" />
          <div class="title-1">1) 横向表格</div>
          <g-img :src="support1Image" showPreview />
          <div class="title-1">2) 纵向表格</div>
          <g-img :src="support2Image" />
          <div class="title-1">3) 横表+纵表 任意组合</div>
          <g-img :src="support3Image" />
        </el-col>
        <el-col :span="12" class="r">
          <o-title title="三丶不支持的文件种类" />
          <div class="title-1">图片：PDF文件如果内容是图片，则不能识别</div>
          <div class="title-1">表格的表头错行 或者没有表格，则不能识别</div>
          <div class="title-1">文件没有表格，只有文字，则不能识别</div>
          <div class="title-1">对于不能识别的文件，请用WPS转换成可以识别的文件类型，或者调整文件格式为可识别的格式</div>
          <div class="title-1">1) 没有表格</div>
          <g-img :src="unSupport2Image" />
          <div class="title-1">2) 表格错行</div>
          <g-img :src="unSupport1Image" />
          <div class="title-1">3) 只有文字</div>
          <g-img :src="support4Image" />
        </el-col>
      </el-row>
    </o-dialog>
  </div>
</template>

<style lang="scss" scoped>
.row-box {
  height: 100%;
}

.l {
  height: 100%;
  padding: 8px;
  margin-right: 8px;
  overflow: auto;
  border: 1px solid #ccc;
}

.r {
  flex: 1;
  height: 100%;
  padding: 8px;
  margin-left: 8px;
  overflow: auto;
  border: 1px solid #ccc;
}

.title-1 {
  padding-left: 24px;
  margin-top: 8px;
  font-size: 16px;
}

.title-2 {
  padding-left: 40px;
  font-size: 14px;
}
</style>
