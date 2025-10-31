<script setup lang="ts">
import { ref } from "vue";
import gTitle from "./gTitle.vue";
import { Image } from 'ant-design-vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import unSupport1Image from '@/assets/images/filedesc/unSupport1.png';
import unSupport2Image from '@/assets/images/filedesc/unSupport2.png';

const isShow = ref(false);

const [registerModal, { closeModal }] = useModalInner((data) => {
  isShow.value = true;
});

const open = () => {
  isShow.value = true;
};

const confirm = async () => {
  isShow.value = false;
  closeModal();
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
      @register="registerModal"
      title="不支持的文件格式"
      @ok="confirm"
    >
      <div>1）图片，如果PDF内容是图片，则现在不能识别</div>
      <div>2）表格混乱</div>
      <Image :src="unSupport1Image" />
      <div>3）纯文本，没有表格</div>
      <Image :src="unSupport2Image" />
    </BasicModal>
  </div>
</template>
