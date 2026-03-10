<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import {
  getCaseFileTransInfo,
  queryFilePropertyByFileId,
  faOrgsConfigureList,
  casefileFileConfigData,
} from '@/api/analysis.ts'
const { proxy } = getCurrentInstance()

const isShow = ref(false)
const details = ref({})
const payOptions = ref([])

/**
  * {
  "id": "ff8080819c97a11d019c97d6b27a0030",
  "fileName": "汪~-天津银行-脱敏.xlsx",
  "fileAddress": "/www/upload/fa/2026836384183017473/ff8080819c97a11d019c97d6b27a0030_汪~-天津银行-脱敏.xlsx",
  "organization": null,
  "organizationCode": null,
  "filePages": [
    {
      "pageId": "ff8080819c97a11d019c97d6b43c0031",
      "pageName": "sheet1",
      "configureStatus": "1",
      "adjTransAmt": "否",
      "adjCreditAmt": "否",
      "adjSettlementAmt": "否"
    }
  ]
}
  */
const fileInfo = ref({})
const orgCode = ref('')
const orgDisabled = ref(false)

const initTable = async () => {}

const initPayList = async () => {
  let params = {
    isMultiTranslate: true,
    pageSize: 1,
    orgCd: orgCode.value,
  }
  let res = await faOrgsConfigureList(params)
  payOptions.value = res
}

const init = async () => {
  let sendParams = {
    fileId: details.value.id,
  }
  Promise.all([getCaseFileTransInfo(sendParams), queryFilePropertyByFileId(sendParams)]).then((res) => {
    fileInfo.value = res[0]
    orgCode.value = res[1].orgCd
    orgDisabled.value = res[1].configFlag === true
  })
}

const selectOrg = () => {
  console.log('selectOrg')
}

const open = async (row) => {
  details.value = row
  await init()
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" title="textMapping" fullscreen>
      <o-row class="w-100%" :col="8">
        <o-input v-model="fileInfo.fileName" title="文件名称" disabled :width="300" />
        <o-select v-model="orgCode" title="所属银行/支付公司" disabled :options="payOptions" label="orgName" value="id">
          <template #suffix>
            <el-button type="primary" :disabled="orgDisabled" @click="selectOrg">选择</el-button>
          </template>
        </o-select>
        <o-tooltip content="1111111">
          <el-button type="primary">字段映射说明</el-button>
        </o-tooltip>
      </o-row>
    </o-dialog>
  </div>
</template>
