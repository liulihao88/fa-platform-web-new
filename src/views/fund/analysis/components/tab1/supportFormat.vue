<script setup lang="ts">
import { ref } from "vue";
import gTitle from "./gTitle.vue";
import { Image } from 'ant-design-vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import support1Image from '@/assets/images/filedesc/support1.png';
import support2Image from '@/assets/images/filedesc/support2.png';
import support3Image from '@/assets/images/filedesc/support3.png';

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
      @register="registerModal"
      :defaultFullscreen="true"
      title="支持的文件格式"
      @ok="confirm"
    >
      <g-title title="一、支持的文件种类"></g-title>
      <div>PDF， 文本表格类</div>
      <div>EXCEL： xls xlsx csv xlsm 结尾的文件</div>
      <div>ZIP： 压缩文件</div>
      <g-title title="二、支持的格式"></g-title>
      <div>1）横向表格</div>
      <Image :src="support1Image" />
      <div>2）纵向表格</div>
      <Image :src="support2Image" />
      <div>3）横表+纵表 任意组合</div>
      <Image :src="support3Image" />
    </BasicModal>
  </div>
</template>
