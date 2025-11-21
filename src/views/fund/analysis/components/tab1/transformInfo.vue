<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import {BasicModal} from '/@/components/Modal';
const { proxy } = getCurrentInstance()
const isShow = ref(false)
const transformInfo = ()=>{
  isShow.value = true
}

</script>

<template>
  <div>
      <a-button class="ml1" size="small" type="primary" danger @click="transformInfo">转换结果说明</a-button>

         <BasicModal
            v-model:visible="isShow"
            title="转换结果说明"
            width="800px"
            :maskClosable="false"
            :keyboard="false"
            :footer="null"
        >
          <div>
            <gTitle title=" 关于导入行数："></gTitle>
            <div class="title-1">
              1、每个文件的导入行数，对应文件的每一行，包括空行都会导入到系统；每个文件的导入行数相加，则是本案件的导入行数
            </div>
            <div class="title-1">
              2、纵表导入时，每个数据段，只导入一行数据
            </div>
            <div class="title-1">
              3、在生成标准数据的时候，空行会被排除，所以标准数据的导入行数可能小于文件的导入行数
            </div>
          </div>
        </BasicModal>
  </div>
</template>

<style lang="scss" scoped>
 .title-1{
  font-size: 16px;
  padding-left: 24px;
  margin-top: 8px;
 }
</style>
