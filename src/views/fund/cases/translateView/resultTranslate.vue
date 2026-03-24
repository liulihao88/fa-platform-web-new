<script setup lang="ts">
import { ref, watch } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { getCaseFileTransInfo, bankCustomerPageList } from '@/api/analysis.ts'

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const data = ref([])

const fileId = route.query.fileId

const activeTab = ref('bankCustomerPageList')
const filePageId = ref('')
const activeSheetId = ref('')
const sendTableParams = ref({
  filePageId: filePageId.value,
  pageNo: 1,
  pageSize: 10,
})

const sheetList = ref([])

const tableData = [
  {
    index: 41,
    file: '光大银行 - ...',
    rowNo: 43,
    bankName: '中国光大银...',
    customerNo: '',
    customerType: '',
  },
  {
    index: 42,
    file: '光大银行 - ...',
    rowNo: 44,
    bankName: '中国光大银...',
    customerNo: '',
    customerType: '',
  },
]

const init = async () => {
  let res = await getCaseFileTransInfo({ fileId: fileId })
  sheetList.value = res.filePages
  filePageId.value = sheetList.value[0]?.pageId || ''
  activeSheetId.value = filePageId.value
  sendTableParams.value.filePageId = filePageId.value
  await initTable()
}
init()
const initTable = async () => {
  let res = await await bankCustomerPageList(activeTab.value, sendTableParams.value)
  data.value = res.records
  data.value = res.total
}

const handleSheetClick = async (sheet: any) => {
  activeSheetId.value = sheet.pageId
  filePageId.value = sheet.pageId
  sendTableParams.value.filePageId = sheet.pageId
  sendTableParams.value.pageNo = 1
  await initTable()
}

watch(
  activeTab,
  (val) => {
    initTable()
  },
  {},
)
</script>

<template>
  <div class="result-translate">
    <div class="panel-header">转换结果</div>

    <div class="result-body">
      <div class="sheet-panel">
        <div class="sheet-title">文件页码</div>
        <div class="sheet-list">
          <div
            v-for="sheet in sheetList"
            :key="sheet.pageId"
            :class="['sheet-item', { 'is-active': activeSheetId === sheet.pageId }]"
            @click="handleSheetClick(sheet)"
          >
            {{ sheet.pageName }}
          </div>
        </div>
      </div>

      <div class="content-panel">
        <el-tabs v-model="activeTab" class="result-tabs">
          <el-tab-pane label="银行客户信息" name="bankCustomerPageList" />
          <el-tab-pane label="银行交易流水" name="bankTransPageList" />
          <el-tab-pane label="非银行客户信息" name="nonBankCustomerPageList" />
          <el-tab-pane label="非银行交易流水" name="nonBankTransPageList" />
        </el-tabs>

        <div class="table-card">
          <div class="table-toolbar">
            <el-icon class="setting-icon"><Setting /></el-icon>
          </div>

          <el-table :data="tableData" border style="width: 100%">
            <el-table-column prop="index" label="序号" width="70" />
            <el-table-column prop="file" label="文件" min-width="110" />
            <el-table-column prop="rowNo" label="行号" width="90" />
            <el-table-column prop="bankName" label="银行名称" min-width="120" />
            <el-table-column prop="customerNo" label="客户号" min-width="100" />
            <el-table-column prop="customerType" label="客户种类" min-width="110" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default>
                <el-button link type="primary">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrap">
            <span class="page-total">第 41-42 条，共 42 条</span>
            <el-pagination layout="prev, pager, next, jumper" :total="42" :page-size="10" :current-page="5" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.result-translate {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border: 1px solid #e5e6eb;
}

.panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}

.result-body {
  display: flex;
  flex: 1;
  gap: 16px;
  min-height: 520px;
  padding: 12px;
}

.sheet-panel {
  flex-shrink: 0;
  width: 150px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.sheet-title {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.sheet-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sheet-item {
  padding: 14px 12px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.sheet-item.is-active {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
}

.content-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.result-tabs {
  padding: 0 4px;
}

.table-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.setting-icon {
  font-size: 18px;
  color: #909399;
  cursor: pointer;
}

.pagination-wrap {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
}

.page-total {
  font-size: 14px;
  color: #606266;
}
</style>
