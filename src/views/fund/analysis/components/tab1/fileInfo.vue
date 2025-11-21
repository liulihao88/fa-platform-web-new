<script setup lang="ts">
import { ref } from "vue";
import { Image } from 'ant-design-vue';
import { BasicModal } from '/@/components/Modal';
import support1Image from '@/assets/images/filedesc/support1.png';
import support2Image from '@/assets/images/filedesc/support2.png';
import support3Image from '@/assets/images/filedesc/support3.png';
import support4Image from '@/assets/images/filedesc/support4.png';
import unSupport1Image from '@/assets/images/filedesc/unSupport1.png';
import unSupport2Image from '@/assets/images/filedesc/unSupport2.png';

const isShow = ref(false);
const open = () => {
  isShow.value = true;
};
const confirm = async () => {
  isShow.value = false;
};

defineExpose({
  open
});
</script>

<template>
  <div>
    <BasicModal
      v-model:visible="isShow"
      :useWrapper="true"
      :defaultFullscreen="true"
      title="文件命名说明"
      @ok="confirm"
    >
      <a-row class="row-box">
        <a-col :span="12" class="l">
          <g-title title="一丶支持的文件种类"></g-title>
          <div class="title-1">PDF文件：文件数据的格式是表格，不能没有表格，不能是图片。</div>
          <div class="title-1">EXCEL文件： xls xlsx csv xlsm 结尾的文件</div>
          <div class="title-1">ZIP 文件： 可以把多个文件或者目录压缩成一个文件一次上传</div>
          <g-title title="二丶支持的格式"></g-title>
          <div class="title-1">1) 横向表格</div>
          <Image :src="support1Image" />
          <div  class="title-1">2) 纵向表格</div>
          <Image :src="support2Image" />
          <div  class="title-1">3) 横表+纵表 任意组合</div>
          <Image :src="support3Image" />
        </a-col>
        <a-col :span="12" class="r">
           <g-title title="三丶不支持的文件种类"></g-title>
           <div  class="title-1">图片：PDF文件如果内容是图片，则不能识别</div>
           <div  class="title-1">表格的表头错行  或者没有表格，则不能识别</div>
           <div  class="title-1">文件没有表格，只有文字，则不能识别</div>
           <div  class="title-1">对于不能识别的文件，请用WPS转换成可以识别的文件类型，或者调整文件格式为可识别的格式</div>
           <div  class="title-1">1) 没有表格</div>
           <Image :src="unSupport2Image" />
           <div  class="title-1">2) 表格错行</div>
           <Image :src="unSupport1Image" />
           <div  class="title-1">3) 只有文字</div>
           <Image :src="support4Image" />
        </a-col>
      </a-row>
    </BasicModal>
  </div>
</template>

<style lang="scss" scoped>
.row-box{
  height: 100%;
}
 .l{
  height: 100%;
  overflow: auto;
  border: 1px solid #ccc;
  margin-right: 8px;
  padding: 8px;
 }
 .r{
   flex: 1;
   height: 100%;
   overflow: auto;
   border: 1px solid #ccc;
   margin-left: 8px;
   padding: 8px;
 }
 .title-1{
  font-size: 16px;
  padding-left: 24px;
  margin-top: 8px;
 }
 .title-2{
  padding-left: 40px;
  font-size: 14px;
 }
</style>
