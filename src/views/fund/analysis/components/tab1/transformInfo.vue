<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import {BasicModal} from '/@/components/Modal';
import gTitle from "./gTitle.vue";
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
            <gTitle title=" 为了保持数据之间的索引关系，系统在进行文件解析时，自动进行了一些处理，包括如下："></gTitle>
            <div class="title-1">
              1、如果账号为空，但是卡号不空，则账号用卡号填充，同时卡号不变。
            </div>
            <div class="title-1">
              2、如果结算行，结算账号为空，则系统自动生成
            </div>
            <div class="title-1">
              3、如果流水号位空，则自动生成
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
