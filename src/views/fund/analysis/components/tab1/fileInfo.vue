<script setup lang="ts">
import { ref } from "vue";
import gTitle from "./gTitle.vue";
import { Image } from 'ant-design-vue';
import { BasicModal } from '/@/components/Modal';
import info1Image from '@/assets/images/filedesc/info1.png';

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
      <div class="modal-box">
        <g-title title="1、单个文件："></g-title>
        <div>招商银行-某某人.xlsx</div>
        <div>招行-某某人.xlsx</div>
        <div>文件名称中包含银行名称就可以。 包含银行名称，系统可以自动识别，减少后续银行认定的工作。</div>
        <g-title title="2、ZIP压缩文件："></g-title>
        <div>这是比较方便的方式，一次可以上传很多文件</div>
        <div>压缩文件名称不限制1.zip</div>
        <div class="f-ct">
          <div class="content">压缩包内容</div>
          <Image :src="info1Image" />
        </div>
      </div>
    </BasicModal>
  </div>
</template>

<style lang="scss" scoped>
.modal-box {
  > div {
    font-size: 14px;
  }
  .f-ct {
    .content {
      width: 100px;
    }
    display: flex;
    align-items: top;
  }
}
</style>
