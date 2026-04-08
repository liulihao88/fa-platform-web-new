<script setup lang="ts">
import { ref, getCurrentInstance, computed, useTemplateRef, nextTick } from 'vue'
import OrgTableDialog from '@/views/fund/cases/uploadTable/orgTableDialog.vue'
import TextMappingTable from '@/views/fund/cases/uploadTable/textMappingTable.vue'
import TextMappingInfo from '@/views/fund/cases/uploadTable/textMappingInfo.vue'
import {
  getCaseFileTransInfo,
  queryFilePropertyByFileId,
  faOrgsConfigureList,
  faOrgsConfigureAllList,
  updateFaFileConfig,
  updateFaFileConfigModify,
} from '@/api/analysis.ts'
import { $toast, getStorage, isEmpty, notEmpty } from '@oeos-components/utils'
import { BOOLEAN_OPTIONS } from '@/assets/constants.ts'
import { useDetail } from '@/hooks'
const { initToDetail, toDetail } = useDetail()
// initToDetail()
const { proxy } = getCurrentInstance()

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const textMappingTableRef = ref()

const fileId = ref(route.query.fileId)

const payOptions: any = ref([])
const orgTableDialogRef = ref()
const headerRef = useTemplateRef('headerRef')

const adjForm = ref({
  adjTransAmt: '否',
  adjCreditAmt: '否',
  adjSettlementAmt: '否',
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
const pageId = ref('')
const orgDisabled = ref(false)
const saveDisabled = ref(false)
const activePageIndex = ref(0)

const initPayList = async () => {
  let params = {
    isMultiTranslate: true,
    pageSize: 1,
    orgCd: orgCode.value,
  }
  let res = await faOrgsConfigureAllList(params)
  payOptions.value = res.records
}

const queryBankInit = async () => {
  let res = await queryFilePropertyByFileId({
    fileId: fileId.value,
  })
  orgCode.value = res.orgCd
  orgDisabled.value = res.configFlag === true
  if (isEmpty(res.orgCd)) {
    $toast('先选择所属银行/支付公司', 'w')
    return Promise.reject()
  }
}

const init = async () => {
  let sendParams = {
    fileId: fileId.value,
  }
  let res = await getCaseFileTransInfo(sendParams)
  fileInfo.value = res
  const pages = fileInfo.value.filePages ?? []
  if (!pages.length) {
    activePageIndex.value = 0
    pageId.value = ''
  } else {
    if (activePageIndex.value >= pages.length) {
      activePageIndex.value = 0
    }
    pageId.value = pages[activePageIndex.value]?.pageId ?? ''
  }
  await queryBankInit()
  await initPayList()
  if (pageId.value) {
    await nextTick()
    textMappingTableRef.value?.init()
  }
}
init()

const validSelectBankCompay = async () => {
  if (orgCode.value) {
    return Promise.resolve(true)
  } else {
    proxy.$toast('请先选择所属银行/支付公司', 'e')
    return Promise.reject()
  }
}

const handlePageClick = async (index) => {
  await validSelectBankCompay()
  if (activePageIndex.value === index) {
    return
  }

  activePageIndex.value = index
  pageId.value = fileInfo.value?.filePages?.[index]?.pageId ?? ''

  if (pageId.value) {
    await nextTick()
    textMappingTableRef.value?.init()
  }
}

const save = async (type = '') => {
  await validSelectBankCompay()
  await proxy.confirm('多个数据块的配置会一起提交保存 <br>确认配置已完成，点击确认提交', {
    title: '确认操作',
  })
  // 准备请求参数
  const sendData = {
    faFileParameters: textMappingTableRef.value.sourceColumns.map((struct) => struct.faFileParameter),
    orgCode: orgCode.value,
    pageId: pageId.value,
    adjTransAmt: adjForm.value.adjTransAmt,
    adjCreditAmt: adjForm.value.adjCreditAmt,
    adjSettlementAmt: adjForm.value.adjSettlementAmt,
  }

  if (type === 'update') {
    await updateFaFileConfigModify(sendData)
    $toast('更新成功')
  } else {
    // // 调用API保存配置
    await updateFaFileConfig(sendData)
    $toast('保存成功')
  }

  init()
}

const selectOrg = () => {
  orgTableDialogRef.value.open(orgCode.value)
}

const textMappingTableInit = (emitTableData) => {
  const pages = fileInfo.value?.filePages ?? []
  if (pages[activePageIndex.value].configureStatus === '1') {
    saveDisabled.value = true
    return
  }
  if (isEmpty(pages) || isEmpty(emitTableData)) {
    saveDisabled.value = true
    return
  }
  return false
}

const orgTableDialogSuccess = async (orgId) => {
  orgCode.value = orgId
  await initPayList()
  if (pageId.value) {
    await nextTick()
    textMappingTableRef.value?.init()
  }
}

const handleClose = () => {
  // return router.push({
  //   name: 'Cases',
  //   query: {
  //     caseId: getStorage('caseId'),
  //   },
  // })
  toDetail('Cases', { caseId: getStorage('caseId') })
}

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
    <g-close @click="handleClose" />

    <el-row :gutter="16" :style="{ height: $tableHeight.value + 'px' }">
      <el-col :span="3">
        <o-basic-layout title="文件sheet" class="h-100%">
          <div class="bg-white">
            <o-flex
              v-for="(v, i) in fileInfo.filePages"
              :key="i"
              class="sheet-item"
              :class="{ 'sheet-item--active': activePageIndex === i }"
              @click="handlePageClick(i)"
            >
              <div>{{ v.pageName }}</div>
              <el-tag v-if="v.configureStatus === '1'">已配置</el-tag>
            </o-flex>
          </div>
        </o-basic-layout>
      </el-col>

      <el-col :span="21">
        <div class="bg-white h-100%">
          <o-basic-layout>
            <o-flex justify="space-between" class="mapping-toolbar">
              <div class="mapping-toolbar__filters">
                <o-select
                  v-model="adjForm.adjTransAmt"
                  class="mapping-toolbar__select"
                  title="交易金额调整项"
                  :options="BOOLEAN_OPTIONS"
                  width="200"
                />
                <o-select
                  v-model="adjForm.adjCreditAmt"
                  class="mapping-toolbar__select"
                  title="贷款金额调整项"
                  :options="BOOLEAN_OPTIONS"
                  width="200"
                />
                <o-select
                  v-model="adjForm.adjSettlementAmt"
                  class="mapping-toolbar__select"
                  title="结算金额调整项"
                  :options="BOOLEAN_OPTIONS"
                  width="200"
                />
              </div>
              <o-flex align="center" class="mapping-toolbar__actions" style="white-space: nowrap">
                <div
                  class="mr cl-65 fs-14"
                  width="100%"
                  :content="
                    saveDisabled
                      ? '当前文件已做好配置,如需修改映射关系,请将此文件删除,重新配置即可'
                      : '多个数据块配置后一起保存'
                  "
                >
                  {{
                    saveDisabled
                      ? '当前文件已做好配置,如需修改映射关系,请将此文件删除,重新配置即可'
                      : '多个数据块配置后一起保存'
                  }}
                </div>
                <el-button type="primary" :disabled="!saveDisabled" @click="save('update')">更新配置</el-button>
                <el-button type="primary" :disabled="saveDisabled" @click="save()">保存配置</el-button>
                <!-- <el-button :disabled="!!saveDisabled">
                  暂存为草稿 =>{{ typeof saveDisabled }} => {{ saveDisabled }}
                </el-button> -->
              </o-flex>
            </o-flex>
            <TextMappingTable
              v-if="notEmpty(fileInfo) && orgCode"
              ref="textMappingTableRef"
              :orgCode="orgCode"
              :pageId="pageId"
              @textMappingTableInit="textMappingTableInit"
            />
          </o-basic-layout>
        </div>
      </el-col>
    </el-row>

    <OrgTableDialog ref="orgTableDialogRef" @success="orgTableDialogSuccess" />
  </div>
</template>

<style scoped lang="scss">


@media (width <= 1400px) {
  .mapping-toolbar {
    flex-wrap: wrap;
  }

  .mapping-toolbar__actions {
    width: 100%;
  }
}

.sheet-item {
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.sheet-item:hover {
  background: #f5f9ff;
  border-color: #409eff;
}

.sheet-item--active {
  background: #ecf5ff;
  border-color: #409eff;
  box-shadow: inset 0 0 0 1px #409eff;
}

.mapping-toolbar {
  gap: 16px;
  align-items: flex-start;
}

.mapping-toolbar__filters {
  display: flex;
  flex: 0 0 auto;
  gap: 16px;
  align-items: flex-start;
}

.mapping-toolbar__select {
  flex: 0 0 200px;
  width: 200px;
  min-width: 200px;
  max-width: 200px;
}

.mapping-toolbar__actions {
  flex: 1 1 auto;
  min-width: 0;
  text-align: right;
  word-break: break-all;
}

// .mapping-toolbar__select :deep(.el-input),
// .mapping-toolbar__select :deep(.el-select),
.mapping-toolbar__select :deep(.el-select__wrapper) {
  min-width: 60px !important;
}
</style>
