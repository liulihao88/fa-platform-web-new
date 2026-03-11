<script setup lang="ts">
import { ref, getCurrentInstance, computed, useTemplateRef } from 'vue'
import OrgTableDIalog from '@/views/fund/cases/uploadTable/orgTableDIalog.vue'
import TextMappingInfo from '@/views/fund/cases/uploadTable/textMappingInfo.vue'
import {
  getCaseFileTransInfo,
  queryFilePropertyByFileId,
  faOrgsConfigureList,
  casefileFileConfigData,
} from '@/api/analysis.ts'
import { $toast, getStorage } from '@oeos-components/utils'
import { BOOLEAN_OPTIONS } from '@/assets/constants.ts'
const { proxy } = getCurrentInstance()

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const fileId = ref(route.query.fileId)

const payOptions: any = ref([])
const orgTableDIalogRef = ref()
const headerRef = useTemplateRef('headerRef')

const caseInfo = ref({})
const adjForm = ref({
  adjTransAmt: caseInfo.value?.adjTransAmt,
  adjCreditAmt: caseInfo.value?.adjCreditAmt,
  adjSettlementAmt: caseInfo.value?.adjSettlementAmt,
})

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
const fileInfo: any = ref({})
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
    fileId: fileId.value,
  }
  Promise.all([getCaseFileTransInfo(sendParams), queryFilePropertyByFileId(sendParams)]).then((res) => {
    fileInfo.value = res[0]
    orgCode.value = res[1].orgCd
    orgDisabled.value = res[1].configFlag === true
  })
}
init()

const selectOrg = () => {
  orgTableDIalogRef.value.open()
}

const dialogTitle = computed(() => {
  return '字段映射 - ' + fileInfo.value.fileName
})

proxy.$initTableHeight(headerRef)

defineExpose({
  open,
})
</script>

<template>
  <div class="h-100%">
    <el-card ref="headerRef" size="small" class="mb2">
      <o-title :title="fileInfo.fileName">
        <TextMappingInfo />
        <template #right>
          <div>
            <o-select
              v-model="orgCode"
              title="所属银行/支付公司"
              disabled
              :options="payOptions"
              label="orgName"
              value="id"
              class="mr"
            />
            <el-button type="primary" :disabled="orgDisabled" @click="selectOrg">选择</el-button>
          </div>
        </template>
      </o-title>
    </el-card>

    <o-row :col="[3, 21]" :gutter="16" :style="{ height: $tableHeight.value + 'px' }">
      <o-basic-layout title="文件sheet" class="h-100%">
        <div class="bg-white">
          <o-flex v-for="(v, i) in fileInfo.filePages" :key="i">
            <div>{{ v.pageName }}</div>
            <el-tag v-if="v.configureStatus === '1'">已配置</el-tag>
          </o-flex>
        </div>
      </o-basic-layout>

      <div class="bg-white h-100%">
        <o-basic-layout>
          <o-row :col="6">
            <o-select v-model="adjForm.adjTransAmt" title="交易金额调整项" :options="BOOLEAN_OPTIONS" width="300" />
            <o-select v-model="adjForm.adjCreditAmt" title="贷款金额调整项" :options="BOOLEAN_OPTIONS" width="300" />
            <o-select
              v-model="adjForm.adjSettlementAmt"
              title="结算金额调整项"
              :options="BOOLEAN_OPTIONS"
              width="300"
            />
            <div>
              <o-button type="primary">保存配置</o-button>
              <o-button>暂存为草稿</o-button>
            </div>
          </o-row>
        </o-basic-layout>
      </div>
    </o-row>

    <OrgTableDIalog ref="orgTableDIalogRef" />
  </div>
</template>
