﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div>
  <!-- 搜索卡片 -->
  <a-card class="search-form-card">
    <a-form
        ref="formRef"
        class="search-form"
        name="advanced_search"
        :model="formState"
        @finish="onSearch"
    >
      <!-- 增加行间距为32px -->
      <a-row gutter="16">
        <a-col :span="24">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item
                  name="folder"
                  label="文件夹"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 18 }"
              >
                <a-input v-model:value="formState.folder" placeholder="请输入文件夹名称" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                  name="fileName"
                  label="文件名称"
                  :labelCol="{ span: 5 }"
                  :wrapperCol="{ span: 18 }"
              >
                <a-input v-model:value="formState.fileName" placeholder="请输入文件名称"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                  name="fileStatus"
                  label="状态"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 18 }"
              >
                <a-select v-model:value="formState.fileStatus" placeholder="请选择状态">
                  <a-select-option
                      v-for="item in props.fileProcessOptions"
                      :key="item.value"
                      :value="item.value"
                  >
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-button type="primary" html-type="submit" :loading="searchLoading">查询</a-button>
              <a-button class="ml2" @click="resetSearch">重置</a-button>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-form>
  </a-card>
  <div>
  <!-- 表格部分 -->
  <BasicTable
    :columns="columns" 
    :dataSource="dataSource"
    :pagination="pagination"
    :loading="tableLoading"
    :scroll="{ x: 1500,y:500 }"
    :bordered="true"
    size="small"
    :canColDrag="true"
    :showTableSetting="true"
    :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-main-table' }"
    :showActionColumn="true"
    :canResize="true"
    @change="handleTableChange"
    @register="registerTable"
  >
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" class="ml2 upload-button" @click="uploadFile">上传文件</a-button>
      <!--<a-button class="ml2" type="primary" @click="confirmFileConvert">文件转换确认</a-button>-->
    </template>
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ index + 1 }}
      </template>
     
      <template v-else-if="column.dataIndex === 'organization'">
        {{ record.organization || '--' }}
      </template>
      <template v-else-if="column.dataIndex === 'returnInfo'">
        {{ record.returnInfo || '--' }}
      </template>
      <template v-else-if="column.dataIndex === 'successTime'">
        {{ record.successTime || '--' }}
      </template>
      <template v-else-if="column.key === 'operation'">
        <div class="table-operations">
          <a-button v-if="checkFilesNames(record)" class="ml1" size="small" type="primary" @click="handleTitleConfigClick(record)">字段映射</a-button>
          <a-button v-if="checkFilesNames(record)" class="ml1" size="small" type="primary" @click="handleEditFileClick(record)">转换查看</a-button>
          <a-button class="ml1" size="small" type="primary" danger @click="deleteFile(record)">删除</a-button>
        </div>
      </template>
    </template>
  </BasicTable>
  </div>
  </div>
  <!-- 编辑文件的Modal弹框 -->
  <BasicModal
      v-model:visible="editModalVisible"
      title="文件转换详情"
      width="100%"
      :useWrapper="true"
      wrap-class-name="full-modal"
      @ok="closeEditModal"
      @cancel="closeEditModal"
      :defaultFullscreen="true"
      :footer="null"
  >
    <div>
      <a-card style="height: 850px">
        <div class="panel-controls">
          <a-button 
            type="primary" 
            size="small" 
            @click="toggleLeftPanel"
            :icon="leftPanelVisible ? '<-' : '->'"
          >
            {{ leftPanelVisible ? '隐藏源文件视图' : '显示源文件视图' }}
          </a-button>
          <a-button 
            type="primary" 
            size="small" 
            @click="toggleRightPanel"
            :icon="rightPanelVisible ? '->' : '<-'"
            class="ml2"
          >
            {{ rightPanelVisible ? '隐藏转换结果' : '显示转换结果' }}
          </a-button>
        </div>
        <splitpanes 
          class="default-theme" 
          :push-other-panes="false"
          @resize="onSplitterResize"
        >
          <pane 
            v-if="leftPanelVisible" 
            :size="leftPanelSize" 
            :min-size="leftPanelVisible ? 0.1 : 0"
          >
            <a-card title="源文件视图" size="small" style="height: 850px">
              <a-row>
                <a-col span="24">文件名称：{{ currentFile.fileName || '-' }}</a-col>
              </a-row>
              <a-row>
                <a-col v-if="['xls', 'xlsx', 'xlsm'].includes(currentFileType)" span="24" style="height: 640px" >
                  <div v-if="fileLoading" class="file-loading">
                    <a-spin size="large" />
                    <p>文件加载中，请稍候...</p>
                  </div>
                  <VueOfficeExcel
                      v-else
                      :src="fileStreamInfo"
                      :options="vueExcelOptions"
                      @rendered="onExcelRendered"
                      @error="onExcelError"
                      :pagination="true"
                      :page-size="20"
                      :min-col-width="100"
                      :max-col-width="300"
                  />
                </a-col>
                <a-col v-if="currentFileType == 'pdf'" span="24">
                  <div v-if="fileLoading" class="file-loading">
                    <a-spin size="large" />
                    <p>文件加载中，请稍候...</p>
                  </div>
                  <div v-else-if="!fileStreamInfo" class="file-loading">
                    <p>文件内容为空</p>
                  </div>
                  <div v-else class="pdf-container">
                    <VueOfficePdf
                        :src="fileStreamInfo"
                        @rendered="onPdfRendered"
                        style="height: 640px;width: 100%"
                        @error="onPdfError"
                        :page-size="10"
                        :min-page-width="700"
                    />
                  </div>
                </a-col>
                <a-col v-else-if="currentFileType === 'csv'" span="24">
                  <!-- CSV预览 - 仿Excel表格样式 -->
                  <div v-if="fileLoading" class="file-loading">
                    <a-spin size="large" />
                    <p>文件加载中，请稍候...</p>
                  </div>
                  <div v-else class="csv-preview">
                    <div v-if="csvData.length === 0" class="csv-empty">
                      <p>没有可显示的数据</p>
                    </div>
                    <div v-else class="csv-table-container">
                      <table class="csv-table" border="1" cellspacing="0" cellpadding="5">
                        <thead>
                        <tr>
                          <th v-for="(header, index) in csvHeaders" :key="index">{{ header }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(row, rowIndex) in csvRows" :key="rowIndex">
                          <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </a-col>

              </a-row>
            </a-card>
          </pane>
          
          <pane 
            v-if="rightPanelVisible" 
            :size="rightPanelSize" 
            :min-size="rightPanelVisible ? 0.1 : 0"
          >
            <a-card title="转换结果" size="small" style="height: 850px">
              <!-- 文件归属银行选择区域 -->
              <!--<a-row style="margin-bottom: 16px;">
                <a-col :span="4">
                  <span style="line-height: 32px;">文件归属银行：</span>
                </a-col>
                <a-col :span="6">
                  <JSearchSelect :disabled="!bankEfit" dict="fa_orgs_configure,org_name,org_cd" v-model:value="selectedBank" placeholder="文件归属银行"  allow-clear ></JSearchSelect>
                </a-col>
                &lt;!&ndash;              <a-col :span="4">
                                <template v-if="bankEfit">
                                  <a-button  type="primary" @click="confirmBank" style="margin-left: 8px;">确认</a-button>
                                  <a-button  type="default" @click="cancelBank" style="margin-left: 8px;">取消</a-button>
                                </template>
                                <a-button v-else type="primary" @click="doBankEdit" style="margin-left: 8px;">修改</a-button>
                              </a-col>&ndash;&gt;
                <a-col :span="4">
                  <a-button size="middle" type="primary" @click="handleConvertConfirmFromEdit">确认</a-button>
                </a-col>
              </a-row>-->

              <!-- Sheet列表区域 -->
              <a-row style="margin-bottom: 16px;height: 850px">
                <a-col :span="4">
                  <div class="sheet-list">
                  <h3>文件页码</h3>
                  <div
                    v-for="sheet in currentFile.filePages"
                    :key="sheet.pageId"
                    :class="['file-item', { active: activeSheet === sheet.pageId }]"
                    @click="selectSheet(sheet)"
                  >
                    {{ sheet.pageName }}
                  </div>
                </div>
                </a-col>
                <a-col :span="20">
                  <a-card class="table-card" style="height: 800px">
                    <a-tabs v-model:activeKey="activeTab" class="table-tab" @change="handleTabChange">
                      <!-- 银行客户信息表格 -->
                      <a-tab-pane key="bankCustomer" tab="银行客户信息">
                        <BasicTable
                            :columns="bankCustomerColumns"
                            :pagination="bankCustomerPagination"
                            size="small"
                            :bordered="true"
                            :scroll="{ x: 1500, y: 500 }"
                            :loading="tableLoading"
                            @change="handleBankCustomerTableChange"
                            :canColDrag="true"
                            :showTableSetting="true"
                            :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-bank-customer-table' }"
                            :canResize="true"
                            :rowClassName="getRowClassName"
                            @register="registerBankCustomerTable"
                            class="file-trans-table"
                        >
                          <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'action'">
                              <TableAction :actions="getTableAction(record)" />
                            </template>
                          </template>
                        </BasicTable>
                      </a-tab-pane>

                      <!-- 银行交易流水表格 -->
                      <a-tab-pane key="bankTransaction" tab="银行交易流水">
                        <BasicTable
                            :columns="bankTransactionColumns"
                            :pagination="bankTransactionPagination"
                            size="small"
                            :bordered="true"
                            :scroll="{ x: 1500, y: 500 }"
                            :loading="tableLoading"
                            @change="handleBankTransactionTableChange"
                            style="margin-bottom: 16px;"
                            :canColDrag="true"
                            :showTableSetting="true"
                            :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-bank-transaction-table' }"
                            :canResize="true"
                            :rowClassName="getRowClassName"
                            @register="registerBankTransactionTable"
                            class="file-trans-table"
                        >
                          <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'action'">
                              <TableAction :actions="getTableAction(record)" />
                            </template>
                          </template>
                        </BasicTable>
                      </a-tab-pane>

                      <!-- 非银行客户信息表格 -->
                      <a-tab-pane key="nonBankCustomer" tab="非银行客户信息">
                        <BasicTable
                            :columns="nonBankCustomerColumns"
                            :pagination="nonBankCustomerPagination"
                            size="small"
                            :bordered="true"
                            :scroll="{ x: 1500, y: 500 }"
                            :loading="tableLoading"
                            @change="handleNonBankCustomerTableChange"
                            style="margin-bottom: 16px;"
                            :rowClassName="getRowClassName"
                            :canColDrag="true"
                            :showTableSetting="true"
                            :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-non-bank-customer-table' }"
                            :canResize="true"
                            @register="registerNonBankCustomerTable"
                            class="file-trans-table"
                        >
                          <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'action'">
                              <TableAction :actions="getTableAction(record)" />
                            </template>
                          </template>
                        </BasicTable>
                      </a-tab-pane>

                      <!-- 非银行交易流水表格 -->
                      <a-tab-pane key="nonBankTransaction" tab="非银行交易流水">
                        <BasicTable
                            :columns="nonBankTransactionColumns"
                            :pagination="nonBankTransactionPagination"
                            :scroll="{ x: 1500, y: 500 }"
                            :bordered="true"
                            :loading="tableLoading"
                            @change="handleNonBankTransactionTableChange"
                            :canColDrag="true"
                            :showTableSetting="true"
                            :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-non-bank-transaction-table' }"
                            :canResize="true"
                            :rowClassName="getRowClassName"
                            @register="registerNonBankTransactionTable"
                            class="file-trans-table"
                        >
                          <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'action'">
                              <TableAction :actions="getTableAction(record)" />
                            </template>
                          </template>
                        </BasicTable>
                      </a-tab-pane>
                    </a-tabs>
                  </a-card>

                </a-col>
              </a-row>
            </a-card>
          </pane>
        </splitpanes>
      </a-card>
    </div>

  </BasicModal>

  <!-- 上传文件的Modal弹框 -->
  <BasicModal
      v-model:visible="uploadModalVisible"
      title="上传文件"
      width="800px"
      :maskClosable="false"
      :keyboard="false"
      :footer="null"
  >
    <div>
      <div style="display: flex; justify-content: space-between;">
        <div>
          <div class="ml4" style="color:red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注：如果压缩文件或者数据文件有密码，需要用密码打开后去掉密码再上传</div>
          <div class="ml4" style="color:red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;上传文件要求：</div>
          <div class="ml4" style="color:red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1、多个文件或者文件夹可以压缩成一个文件上传，支持ZIP压缩包</div>
          <div class="ml4" style="color:red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2、同一个银行的文件放同一个文件夹，文件夹以银行名称命名</div>
        </div>
        <div style="text-align: left; white-space: nowrap;">
          <a href="javascript:void(0)" @click="onFileNameInstructionClick" style="margin-left: 50px;">文件命名说明</a><br>
          <a href="javascript:void(0)" @click="onSupportedFileTypesClick" style="margin-left: 50px;">支持的文件格式</a><br>
          <a href="javascript:void(0)" @click="onUnsupportedFileTypesClick" style="margin-left: 50px;">不支持的文件格式</a>
        </div>
      </div>
      <a-card>
        <a-upload-dragger
            :fileList="fileList"
            :multiple="true"
            :customRequest="onFileListUpload"
            accept=".xls,.xlsx,.xlsm,.csv,.pdf,.zip"
            :beforeUpload="beforeUpload"
            @remove="handleRemove"
            class="custom-upload-dragger"
        >
          <div class="upload-dragger-content">
            <p class="ant-upload-drag-icon">
              <inbox-outlined style="font-size: 48px; color: #1890ff;"></inbox-outlined>
            </p>
            <p class="ant-upload-text">点击或拖拽文件到此处上传</p>
            <p class="ant-upload-hint">
              支持扩展名 .xls .xlsx .xlsm .csv .pdf .zip
            </p>
          </div>
        </a-upload-dragger>

        <div class="upload-list">
          <div v-for="file in fileList" :key="file.uid" class="upload-item">
            <paper-clip-outlined />
            <div class="upload-item-info">
              <div class="upload-item-name">{{ file.name }}</div>
              <div class="upload-item-size">{{ formatFileSize(file.size) }}</div>
              <div class="progress-container">
                <a-progress
                    :percent="file.percent"
                    :status="file.status === 'error' ? 'exception' : file.status === 'done' ? 'success' : 'active'"
                    size="small"
                />
              </div>
            </div>
            <div class="upload-actions">
              <a-button
                  v-if="file.status === 'uploading'"
                  size="small"
                  @click="handleCancel(file)"
              >
                取消
              </a-button>
              <close-outlined
                  v-else
                  style="color: #ff4d4f; cursor: pointer;"
                  @click="handleRemove(file)"
              />
            </div>
          </div>
        </div>

        <div style="margin-top: 16px; text-align: right;">
          <a-button
              type="primary"
              @click="handleUpload"
              :disabled="fileList.length === 0"
              :loading="uploading"
          >
            {{ uploading ? '上传中' : '确认' }}
          </a-button>
        </div>
      </a-card>

    </div>
  </BasicModal>
  <!-- 在模板部分修改文件转换确认的Modal -->
  <BasicModal
      v-model:visible="convertModalVisible"
      title="文件转换确认"
      width="90%"
      :useWrapper="true"
      :maskClosable="false"
      :footer="null"
      :defaultFullscreen="true"
      wrap-class-name="full-modal"
  >
    <a-card>
      <a-row :gutter="16">
        <!-- 左侧文件列表 -->
        <a-col span="6">
          <a-card title="文件列表" size="small">
            <div class="pagination-controls">
              <a-button 
                :disabled="filePagination.current === 1" 
                @click="prevPage"
                size="small"
              >
                上一页
              </a-button>
              <span class="page-info">
                第 {{ filePagination.current }} 页，共 {{ filePagination.totalPage }} 页
              </span>
              <a-button 
                :disabled="filePagination.current === filePagination.totalPage" 
                @click="nextPage"
                size="small"
              >
                下一页
              </a-button>
            </div>
            <div class="file-list-container">
              <div
                  v-for="file in convertFileList"
                  :key="file.id"
                  :class="['file-item', { active: selectedConvertFile?.id === file.id }]"
                  @click="selectConvertFile(file)"
              >
                {{ file.fileName }}
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 右侧表单 -->
        <a-col span="16">
          <a-card title="转换信息" size="small">
            <a-form
                ref="convertFormRef"
                :model="convertFormState"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 14 }"
            >
              <a-form-item label="文件名称">
                <span>{{ convertFormState?.fileName || '-' }}</span>
              </a-form-item>
              <a-form-item label="客户号">
                <span>{{ convertFormState?.customerId || '-' }}</span>
              </a-form-item>
              <a-form-item label="客户名称">
                <span>{{ convertFormState?.customerName || '-' }}</span>
              </a-form-item>
              <a-form-item label="所属银行">
                <span>{{ convertFormState?.orgName || '-' }}</span>
              </a-form-item>
              <a-form-item labelWrap="true" label="上述银行是否正确，需要重新指定">
<!--                <a-select v-model:value="convertFormState.inVertical" placeholder="请选择">
                  <a-select-option value="1">是</a-select-option>
                  <a-select-option value="0">否</a-select-option>
                </a-select>-->
                <JSearchSelect dict="fa_orgs_configure,org_name,org_cd" v-model:value="convertFormState.dataOrg" placeholder="请选择"  allow-clear ></JSearchSelect>
              </a-form-item>
              <a-row>
                <a-col style="color:red" span="16" offset="8">请确定所属银行和嫌疑人姓名，如果不对，请修改正确后确认</a-col>
              </a-row>
              <a-form-item label="判断银行依据">
                <span>{{ convertFormState?.orgNameFrom || '-' }}</span>
              </a-form-item>

              <a-form-item label="所属目录">
                <span>{{ convertFormState?.folderName || '-' }}</span>
              </a-form-item>

              <a-form-item label="数据中的机构">
                <span>{{ convertFormState?.orgName || '-' }}</span>
              </a-form-item>

              <a-form-item label="数据中的卡号">
                <span>{{ convertFormState?.dataCardNum || '-' }}</span>
              </a-form-item>
              <a-form-item label="确认状态">
                <span>{{ convertFormState.status == '1' ||convertFormState.status == '01'?'已确认':'未确认' }}</span>
              </a-form-item>
            </a-form>

            <div style="text-align: right; margin-top: 16px;">
              <a-button type="primary" @click="handleConvertConfirm" style="margin-left: 8px;">确认</a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </BasicModal>

  <!-- 标题配置Modal -->
  <BasicModal
    v-model:visible="titleConfigModalVisible"
    :title="`字段映射 - ${currentTitleConfigFile?.fileName || ''}`"
    width="90%"
    :useWrapper="true"
    :maskClosable="false"
    :footer="null"
    :defaultFullscreen="true"
    wrap-class-name="full-modal"
  >
    <a-card style="height: 100%">
      <!-- 上方：文件名称、文件夹信息 -->
      <a-row :gutter="16" style="margin-bottom: 16px;">
        <a-col :span="24">
          <a-card title="文件信息" size="small">
            <a-row :gutter="16">
              <a-col :span="8">
                <div><strong>文件名称：</strong>{{ currentTitleConfigFile?.folder || '-' }}{{ currentTitleConfigFile?.sourceFile || currentTitleConfigFile?.fileName || '-' }}</div>
              </a-col>
<!--              <a-col :span="8">-->
<!--                <div><strong>文件夹：</strong>{{ currentTitleConfigFile?.folder || '-' }}</div>-->
<!--              </a-col>-->
              <a-col :span="16">
                <div>
                  <strong>所属银行/支付公司：</strong>
                  <JSearchSelect
                    :dictOptions="orgListOptions"
                    v-model:value="currentTitleConfigFile.organizationCode"
                    placeholder="请选择所属银行/支付公司"
                    allow-clear
                    style="width: 60%"
                    :disabled="isOrganizationSelectDisabled"
                    @change="onOrganizationChange"
                  />
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>

      <!-- 下方：左侧文件页码信息，右侧标题配置列表 -->
      <a-row :gutter="16" style="height: calc(100% - 120px);">
        <!-- 左侧：文件页码信息 -->
        <a-col :span="4">
          <a-card title="文件页码" size="small" style="height: 100%">
            <div class="sheet-list">
              <div
                v-for="sheet in currentTitleConfigFile?.filePages"
                :key="sheet.pageId"
                :class="['file-item', { active: activeTitleConfigSheet === sheet.pageId }]"
                @click="selectTitleConfigSheet(sheet)"
              >
                <span>{{ sheet.pageName }}</span>
                <span v-if="sheet.configureStatus === '1'" class="configured-tag">已配置</span>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 右侧：标题配置列表 -->
        <a-col :span="20">
          <a-card title="字段映射" size="small" style="height: 100%" class="titleConfigClass">
            <a-button v-if="isIgnoreTitleConfig" type="primary" @click="saveTitleConfig" :disabled="isCurrentSheetConfigured || isSaveButtonDisabled">忽略配置</a-button>
            <a-tabs v-model:activeKey="titleConfigActiveTab" class="table-tab">
              <a-tab-pane 
                v-for="(dataBlock, index) in titleConfigData.result" 
                :key="`dataBlock${dataBlock.dataBlockNum}`" 
                :tab="`数据块${dataBlock.dataBlockNum}`"
              >
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <div class="ml4" ><span>未映射的字段：</span><span style="color:red">{{dataBlock.noMappingTitle}}</span></div>
                  </div>
                  <div style="text-align: right; white-space: nowrap;">
                    下表数据为示例数据，不是全部数据
                  </div>
                </div>
                <!-- 构造表格数据 -->
                <BasicTable
                  :columns="getTitleConfigColumns(dataBlock.dataBlockStucts)"
                  :dataSource="getTitleConfigTableData(dataBlock.dataBlockStucts)"
                  :pagination="false"
                  :scroll="{ y: 500, x: true }"
                  size="small"
                  :bordered="true"
                  :loading="titleConfigLoading"
                  :canColDrag="true"
                  :showTableSetting="true"
                  :tableSetting="{redo: false, size: true, setting: false, fullScreen: true }"
                  :canResize="false"
                  :showIndexColumn="false"
                  class="title-config-table"
                >
                  <template #tableTitle>
                    <a-button type="primary" @click="saveTitleConfig" :disabled="isCurrentSheetConfigured || isSaveButtonDisabled">保存配置</a-button>
                    <!--<a-button class="ml2" type="primary" @click="confirmFileConvert">文件转换确认</a-button>-->
                  </template>
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'config'">
                        <div v-if="record.type === 'newMetaData'">
                        配置列
                      </div>
                      <div v-else-if="record.type === 'titleColName'">
                        原标题
                      </div>
                      <div v-else-if="record.type === 'datas'">
                        {{ record.dataIndex !== undefined ? (record.dataIndex + 1) : '' }}
                      </div>
                    </template>
                    
                    <template v-else-if="column.dataIndex && column.dataIndex.startsWith('col')">
                      <div v-if="record.type === 'newMetaData'" class="config-select-cell">
                        <JSearchSelect
                          :dictOptions="titleConfigOptions"
                          v-model:value="dataBlock.dataBlockStucts[parseInt(column.dataIndex.replace('col', ''))].faFileParameter.newMetaData"
                          placeholder="请选择配置项"
                          allow-clear
                          style="width: 150px"
                          :disabled="isCurrentSheetConfigured"
                          @change="(value) => handleTitleConfigChange(value, dataBlock, column, record)"
                        />
                      </div>
                      <div v-else-if="record.type === 'titleColName'">
                        <span :style="{ color: dataBlock.dataBlockStucts[parseInt(column.dataIndex.replace('col', ''))].faFileParameter.oriMetaData ? 'inherit' : 'red' }">
                          {{ dataBlock.dataBlockStucts[parseInt(column.dataIndex.replace('col', ''))].faFileParameter.titleColName }}
                        </span>
                      </div>
                      <div v-else-if="record.type === 'datas'">
                        {{ record.datas[parseInt(column.dataIndex.replace('col', ''))] }}
                      </div>
                    </template>
                  </template>
                </BasicTable>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </BasicModal>

  <!-- 文件命名说明组件 -->
  <FileInfo ref="fileInfoRef"></FileInfo>
  <!-- 支持的文件格式组件 -->
  <SupportFormat ref="supportFormatRef"></SupportFormat>
  <!-- 不支持的文件格式组件 -->
  <UnSupportFormat ref="unSupportFormatRef"></UnSupportFormat>
</template>

<script lang="ts" name="tab1" setup>
import { ref,reactive, onMounted, defineProps,computed,nextTick, h, onUnmounted } from 'vue';
import { render } from '/@/utils/common/renderUtils';
import { message, Modal, Select } from 'ant-design-vue';
//引入VueOfficeExcel组件
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePdf from '@vue-office/pdf'
//引入相关样式
import '@vue-office/excel/lib/index.css'
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import JSearchSelect from "@/components/Form/src/jeecg/components/JSearchSelect.vue";
import {
  caseFileListApi,
  deleteFileListApi,
  getFileConverResultApi,
  uploadFileApi,
  getFileStreamByFileId,
  getFileInfoItem,
  saveEditBankApi,
  updateFileOrg,
  getFileConfirmInfo,
  standardCustomerApi,
  standardTransApi,
  standardNonBankCustomerApi,
  standardNonBankTransApi,
  caseFilePageListApi,
  standardFilePageListApi,
  getFileConfigApi,
  updateFileConfigApi,
  getOrgListApi,
  fileConfigDataApi,
  queryFilePropertyByFileIdApi
} from '../../user.api'
//ts语法
import { useRoute } from 'vue-router';
import {useRouter} from "vue-router";
import {BasicModal, useModalInner} from '/@/components/Modal';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import FileInfo from "./fileInfo.vue";
import SupportFormat from "./supportFormat.vue";
import UnSupportFormat from "./unSupportFormat.vue";

const fileInfoRef = ref<InstanceType<typeof FileInfo> | null>(null);
const supportFormatRef = ref<InstanceType<typeof SupportFormat> | null>(null);
const unSupportFormatRef = ref<InstanceType<typeof UnSupportFormat> | null>(null);

const router = useRouter();
interface ConvertFileItem {
  id: string;
  fileName: string;
  value: string;
  label: string;
}

interface Props {
  fileProcessOptions: Array<{value: string, label: string}>;
}

// 添加文件分页配置
const filePagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPage: 0
});

// CSV表头
const csvHeaders = computed(() => {
  if (csvData.value.length > 0) {
    return csvData.value[0];
  }
  return [];
});

// CSV行数据
const csvRows = computed(() => {
  if (csvData.value.length > 1) {
    return csvData.value.slice(1);
  }
  return [];
});
// 新增计算属性：检查当前激活的选项卡是否有数据
const hasTableData = computed(() => {
  switch (activeTab.value) {
    case 'bankCustomer':
      return activeSheetData.value.bankCustomers.length > 0;
    case 'bankTransaction':
      return activeSheetData.value.bankTransactions.length > 0;
    case 'nonBankCustomer':
      return activeSheetData.value.notBankCustomers.length > 0;
    case 'nonBankTransaction':
      return activeSheetData.value.notBankTransactions.length > 0;
    default:
      return false;
  }
});

// 计算属性：检查当前选中的页码是否已配置
const isCurrentSheetConfigured = computed(() => {
  if (!activeTitleConfigSheet.value || !currentTitleConfigFile.value?.filePages) {
    return false;
  }
  
  const currentSheet = currentTitleConfigFile.value.filePages.find(
    sheet => sheet.pageId === activeTitleConfigSheet.value
  );
  
  return currentSheet?.configureStatus === '1';
});
const props = defineProps<Props>();
const formRef = ref();
const {query} = useRoute();
const formState = reactive({
  folder: '',
  fileName: '',
  fileStatus: undefined
});
// 添加全屏状态
const isFullscreen = ref(false);
// 新增状态
const activeTab = ref('bankCustomer'); // 默认激活第一个选项卡
// 新增分页配置
const bankCustomerPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const bankTransactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const nonBankCustomerPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const nonBankTransactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});



// 新增：编辑Modal相关状态
const editModalVisible = ref(false);
const fileStreamInfo = ref<any>();
// 定义支持的文件类型
const supportedTypes = ['pdf', 'csv', 'xls', 'xlsm', 'xlsx']
const currentFileType = ref('');
const csvContent = ref('')
const csvData = ref<any[]>([]);

// 解析CSV数据
const parseCSV = (csvText: string): any[][] => {
  // 处理可能存在的BOM标记
  if (typeof csvText === 'string' && csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }
  
  const lines = csvText.split('\n');
  const result: any[][] = [];
  console.info('lines', lines)
  lines.forEach(line => {
    if (line.trim() !== '') {
      // 简单的CSV解析，按逗号分割（实际项目中可能需要更复杂的解析）
      const cells = line.split(',').map(cell => {
        // 去除可能存在的引号
        return cell.trim().replace(/^"(.*)"$/, '$1');
      });
      result.push(cells);
    }
  });
  console.info('result', result)
  return result;
};
const vueExcelOptions =ref({
  transformImage:true,
  xls:true
})
const currentRecord = ref<any>(null);
const convertModalVisible = ref(false);
const convertFileList = ref<ConvertFileItem[]>([]);
const selectedConvertFile = ref<ConvertFileItem | null>(null);
const convertFormRef = ref();
const convertFormState = ref({
  fileName: '', // 保留原文件名
  orgName: '',
  dataOrg:undefined,
  orgCd:'',
  orgNameFrom: '',
  inVertical: undefined,
  folderName: '',
  directory: '',
  dataCardNum: '',
  status: '',
  customerName:'',
  customerId:''
});

// 添加文件加载状态
const fileLoading = ref(false);
// 添加文件大小限制（以字节为单位）
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

const bankEfit = ref(false);
const selectedBank = ref('');
const activeSheet = ref('');
interface SheetData {
  pageId: string;
  pageName: string;

}

interface ActiveSheetData {
  bankCustomers: any[];
  bankTransactions: any[];
  notBankCustomers: any[];
  notBankTransactions: any[];
}

const activeSheetData = ref<ActiveSheetData>({
  bankCustomers:[],
  bankTransactions:[],
  notBankCustomers:[],
  notBankTransactions:[]
});

// 表格列定义
const bankCustomerColumns = ref([
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true},
  { title: '归属银行', dataIndex: 'orgName', width: 100, resizable: true},
  { title: '客户号', dataIndex: 'customerId', width: 100, resizable: true},
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true},
  { title: '客户名称', dataIndex: 'customerName', width: 100, resizable: true},
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true},
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true},
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true},
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true},
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true},
  { title: '账号', dataIndex: 'accountNum', width: 100, resizable: true},
  { title: '卡号', dataIndex: 'cardNum', width: 100, resizable: true},
  { title: '状态', dataIndex: 'customerStatus', width: 100, resizable: true},
  { title: '开户日期', dataIndex: 'openDate', width: 100, resizable: true},
  { title: '余额', dataIndex: 'balence', width: 100, resizable: true},
  { title: '账户类型', dataIndex: 'accountType', width: 100, resizable: true},
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true},
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true},
  { title: '来源文件', dataIndex: 'fileName', width: 100, resizable: true},
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true}
]);

const bankTransactionColumns = ref([
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true},
  { title: '归属机构', dataIndex: 'orgName', width: 100, resizable: true},
  { title: '账号', dataIndex: 'accountNum', width: 100, resizable: true},
  { title: '卡号', dataIndex: 'cardNum', width: 100, resizable: true},
  { title: '流水号', dataIndex: 'transNo', width: 100, resizable: true},
  { title: '交易渠道', dataIndex: 'channel', width: 100, resizable: true},
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true},
  { title: '交易方向', dataIndex: 'transWay', width: 100, resizable: true},
  { title: '交易金额', dataIndex: 'transAmt', width: 100, resizable: true},
  { title: '贷方发生额', dataIndex: 'creditAmt', width: 100, resizable: true},
  { title: '余额', dataIndex: 'balence', width: 100, resizable: true},
  { title: '交易种类', dataIndex: 'transType', width: 100, resizable: true},
  { title: '业务日期', dataIndex: 'bizDate', width: 100, resizable: true},
  { title: '交易时间', dataIndex: 'transTime', width: 100, resizable: true},
  { title: '设备MAC', dataIndex: 'macAddress', width: 100, resizable: true},
  { title: '交易IP地址', dataIndex: 'ipAddress', width: 100, resizable: true},
  { title: '交易状态', dataIndex: 'status', width: 100, resizable: true},
  { title: '对方机构', dataIndex: 'counterOrgName', width: 100, resizable: true},
  { title: '对方客户号', dataIndex: 'counterCustomerId', width: 100, resizable: true},
  { title: '对方账号', dataIndex: 'counterAccountNo', width: 100, resizable: true},
  { title: '对方户名', dataIndex: 'counterName', width: 100, resizable: true},
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true},
  { title: '户名', dataIndex: 'customerName', width: 100, resizable: true},
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true},
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true},
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true},
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true},
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true},
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true},
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true},
  { title: '来源文件', dataIndex: 'fileName', width: 100, resizable: true},
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true}
]);

// 表格列定义
const nonBankCustomerColumns = ref([
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true},
  { title: '归属机构', dataIndex: 'orgName', width: 100, resizable: true},
  { title: '客户号', dataIndex: 'customerId', width: 100, resizable: true},
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true},
  { title: '客户名称', dataIndex: 'customerName', width: 100, resizable: true},
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true},
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true},
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true},
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true},
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true},
  { title: '是否商户', dataIndex: 'isMerchant', width: 100, resizable: true},
  { title: '商户号', dataIndex: 'merchantId', width: 100, resizable: true},
  { title: '终端号', dataIndex: 'portId', width: 100, resizable: true},
  { title: '结算银行', dataIndex: 'settlementOrg', width: 100, resizable: true},
  { title: '结算账号', dataIndex: 'settlementAccountNum', width: 100, resizable: true},
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true},
  { title: '状态', dataIndex: 'customerStatus', width: 100, resizable: true},
  { title: '账户类型', dataIndex: 'accountType', width: 100, resizable: true},
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true},
  { title: '开户日期', dataIndex: 'openDate', width: 100, resizable: true},
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true},
  { title: '商户名称', dataIndex: 'merchantName', width: 100, resizable: true},
  { title: '来源文件', dataIndex: 'fileName', width: 100, resizable: true},
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true}
]);


const nonBankTransactionColumns = ref([
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true},
  { title: '归属机构', dataIndex: 'orgName', width: 100, resizable: true},
  { title: '商户号', dataIndex: 'merchantId', width: 100, resizable: true},
  { title: '终端号', dataIndex: 'portId', width: 100, resizable: true},
  { title: '订单号', dataIndex: 'orderNo', width: 100, resizable: true},
  { title: '商户名称', dataIndex: 'merchantName', width: 100, resizable: true},
  { title: '商品名称', dataIndex: 'productName', width: 100, resizable: true},
  { title: '流水号', dataIndex: 'transNo', width: 100, resizable: true},
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true},
  { title: '交易方向', dataIndex: 'transWay', width: 100, resizable: true},
  { title: '交易金额', dataIndex: 'transAmt', width: 100, resizable: true},
  { title: '贷方发生额', dataIndex: 'creditAmt', width: 100, resizable: true},
  { title: '交易种类', dataIndex: 'transType', width: 100, resizable: true},
  { title: '业务日期', dataIndex: 'bizDate', width: 100, resizable: true},
  { title: '交易时间', dataIndex: 'transTime', width: 100, resizable: true},
  { title: '设备MAC', dataIndex: 'macAddress', width: 100, resizable: true},
  { title: '交易IP地址', dataIndex: 'ipAddress', width: 100, resizable: true},
  { title: '交易状态', dataIndex: 'status', width: 100, resizable: true},
  { title: '交易卡开户行', dataIndex: 'openOrgCd', width: 100, resizable: true},
  { title: '户名', dataIndex: 'customerName', width: 100, resizable: true},
  { title: '交易卡号', dataIndex: 'cardNum', width: 100, resizable: true},
  { title: '卡类型', dataIndex: 'cardType', width: 100, resizable: true},
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true},
  { title: '创建日期', dataIndex: 'createTime', width: 100, resizable: true},
  { title: '客户号', dataIndex: 'customerId', width: 100, resizable: true},
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true},
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true},
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true},
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true},
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true},
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true},
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true},
  { title: '结算行', dataIndex: 'settlementOrg', width: 100, resizable: true},
  { title: '结算账号', dataIndex: 'settlementAccountNum', width: 100, resizable: true},
  { title: '来源文件', dataIndex: 'fileName', width: 100, resizable: true},
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true}
]);


//const nonBankCustomerColumns = ref([...bankCustomerColumns.value]);
//const nonBankTransactionColumns = ref([...bankTransactionColumns.value]);

interface CurrentFile {
  id?: string;
  fileName: string;
  fileAddress: string;
  filePages: SheetData[];
  organization: string;
  organizationCode: string;

}

let currentFile = reactive<CurrentFile>({
  fileName: '',
  fileAddress: '',
  filePages: [],
  organization: '',
  organizationCode:''
});
// 上传Modal相关状态
const uploadModalVisible = ref(false);
const fileList = ref<any[]>([]);
const uploading = ref(false);
const tableLoading = ref(false);
const searchLoading = ref(false);

const columns = ref([
  {
    title: '源文件',
    dataIndex: 'sourceFile',
    width: 200,
    resizable: true
  },
  {
    title: '文件夹',
    dataIndex: 'folder',
    key: 'folder',
    width: 150,
    resizable: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    resizable: true,
    customRender: ({ text }) => {
      // 定义需要显示为红色的状态码
      const redStatusCodes = ['900', '901', '902', '904', '999'];
      const displayText = render.renderDict(text, 'fa_file_process_status');
      
      // 如果状态码在红色状态码列表中，则显示为红色
      if (redStatusCodes.includes(text)) {
        return h('span', { style: 'color: red;' }, displayText);
      }
      
      return displayText;
    },
  },
  {
    title: '处理进度',
    dataIndex: 'status',
    width: 150,
    resizable: true,
    customRender: ({ text }) => {
      // 进度条显示规则
      const progressMap = {
        '000': 0,
        '002': 0,
        '003': 25,
        '100': 50,
        '101': 75,
        '102': 100
      };
      
      const percent = progressMap[text] || 0;
      
      return h('div', { style: 'display: flex; align-items: center; width: 100%' }, [
        h('div', { 
          style: 'width: 100%; background-color: #f5f5f5; border-radius: 10px; overflow: hidden;'
        }, [
          h('div', {
            style: `width: ${percent}%; height: 20px; background: linear-gradient(90deg, #1890ff, #40a9ff); transition: width 0.3s; text-align: center; line-height: 20px; color: white; font-size: 12px;`,
          }, `${percent}%`)
        ])
      ]);
    }
  },
  {
    title: '配置进度',
    dataIndex: 'configureProgress',
    width: 80,
    resizable: true,
    customRender: ({ text }) => {
      const percent = text || 0;
      return h('div', { style: 'display: flex; align-items: center; width: 100%' }, [
        h('div', {
          style: 'width: 100%; background-color: #f5f5f5; border-radius: 10px; overflow: hidden;'
        }, [
          h('div', {
            style: `width: ${percent}%; height: 20px; background: linear-gradient(90deg, #1890ff, #40a9ff); transition: width 0.3s; text-align: center; line-height: 20px; color: white; font-size: 12px;`,
          }, `${percent}%`)
        ])
      ]);
    }
  },
  {
    title: '返回信息',
    dataIndex: 'returnInfo',
    width: 150,
    resizable: true
  },
  {
    title: '上传时间',
    dataIndex: 'uploadTime',
    width: 150,
    resizable: true
  },
  {
    title: '成功时间',
    dataIndex: 'successTime',
    width: 150,
    resizable: true
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    fixed: 'right' as const,
    width: 200,
    ifShow: true, // 确保操作列始终显示
    resizable: true
  }
]);
const dataSource = ref([]);

// 添加分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

interface FaFileParameter {
  id: string;
  caseId: string;
  caseFileId: string;
  caseFilePageId: string;
  dataBlock: string;
  colSequence: string;
  dataRowNum: string;
  dataType: string;
  newMetaData: string;
  titleColName: string;
  oriMetaData: string;
}

interface DataBlockStruct {
  faFileParameter: FaFileParameter;
  datas: string[];
  availableOptions?: FileConfigOption[];
}

interface DataBlock {
  dataBlockNum: number;
  dataBlockStucts: DataBlockStruct[];
  noMappingTitle: string;
}

// 添加配置选项类型
interface FileConfigOption {
  value: string;
  text: string;
}

// 标题配置相关状态
const titleConfigModalVisible = ref(false);
const currentTitleConfigFile = ref<any>(null);
const activeTitleConfigSheet = ref('');
const titleConfigActiveTab = ref('dataBlock1');
const titleConfigData = ref<{
  result: DataBlock[];
}>({
  result: []
});

// 添加标题配置加载状态
const titleConfigLoading = ref(false);

// 所属银行/支付公司下拉框是否禁用
const isOrganizationSelectDisabled = ref(false);

// 保存按钮是否禁用（防止重复提交）
const isSaveButtonDisabled = ref(false);

// 添加下拉选项状态
const titleConfigOptions = ref<FileConfigOption[]>([]);
const orgListOptions = ref<{value: string, text: string}[]>([]);

const [registerTable] = useTable({
  columns: columns.value,
  dataSource: dataSource,
  loading: tableLoading,
  pagination: pagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500 },
  canColDrag: true,
  showTableSetting: true,
  showActionColumn: true,
  canResize: true,
  // 添加最小高度确保表格在全屏时正确显示
  minHeight: 300,
  tableSetting: { 
    redo: false,
    size: false,
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-main-table'
  }
});

const [registerBankCustomerTable] = useTable({
  columns: bankCustomerColumns.value,
  dataSource: computed(() => activeSheetData.value.bankCustomers),
  loading: tableLoading,
  pagination: bankCustomerPagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500, y: 500 },
  canColDrag: true,
  showTableSetting: true,
  canResize: true,
  minHeight: 300,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-bank-customer-table'
  }
});

const [registerBankTransactionTable] = useTable({
  columns: bankTransactionColumns.value,
  dataSource: computed(() => activeSheetData.value.bankTransactions),
  loading: tableLoading,
  pagination: bankTransactionPagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500, y: 500 },
  canColDrag: true,
  showTableSetting: true,
  canResize: true,
  minHeight: 300,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-bank-transaction-table'
  }
});

const [registerNonBankCustomerTable] = useTable({
  columns: nonBankCustomerColumns.value,
  dataSource: computed(() => activeSheetData.value.notBankCustomers),
  loading: tableLoading,
  pagination: nonBankCustomerPagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500, y: 500 },
  canColDrag: true,
  showTableSetting: true,
  canResize: true,
  minHeight: 300,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-non-bank-customer-table'
  }
});

const [registerNonBankTransactionTable] = useTable({
  columns: nonBankTransactionColumns.value,
  dataSource: computed(() => activeSheetData.value.notBankTransactions),
  loading: tableLoading,
  pagination: nonBankTransactionPagination,
  bordered: true,
  scroll: { x: 1500, y: 500 },
  canColDrag: true,
  showTableSetting: true,
  canResize: true,
  minHeight: 300,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-non-bank-transaction-table'
  }
});

// 添加定时器引用
const fileListRefreshTimer = ref<number | null>(null);

// 页面初始化时调用接口
onMounted(() => {
  pagination.current = 1;
  fetchFileList();
  
  // 设置定时刷新，每10秒刷新一次文件列表
  fileListRefreshTimer.value = window.setInterval(() => {
    fetchFileList(true);
  }, 10000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (fileListRefreshTimer.value) {
    clearInterval(fileListRefreshTimer.value);
    fileListRefreshTimer.value = null;
  }
});

// 修改后的方法
const handleConvertConfirmFromEdit = () => {
  if (!currentRecord.value) {
    message.warning('没有可转换的文件');
    return;
  }

  // 默认选择当前文件
  selectedConvertFile.value = convertFileList.value[0];

  // 加载表单数据
  getFileConvertInfo(currentRecord.value.id);

  // 切换Modal
  editModalVisible.value = false;
  convertModalVisible.value = true;
};

// 不展示压缩文件后缀的文件
const checkFilesNames=(record)=> {
  const {sourceFile,fileName} = record
  const lowerFile1 = sourceFile.toLowerCase();
  const lowerFile2 = fileName.toLowerCase();

  return !(lowerFile1.endsWith(".zip") || lowerFile1.endsWith(".rar") ||
      lowerFile2.endsWith(".zip") || lowerFile2.endsWith(".rar"));
}

// 获取文件列表
const fetchFileList = async (isAutoRefresh = false) => {
  try {
    // 如果是自动刷新，则不显示loading效果
    if (!isAutoRefresh) {
      tableLoading.value = true;
    }

    const params = {
      caseId: query.caseId,
      folder: formState.folder,
      fileName: formState.fileName,
      fileStatus: formState.fileStatus,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const response = await caseFilePageListApi(params);
    dataSource.value = response.records || [];
    pagination.total = response.total || 0;
  } catch (error) {
    console.error('获取文件列表失败:', error);
    dataSource.value = [];
    pagination.total = 0;
  } finally {
    // 如果是自动刷新，则不显示loading效果
    if (!isAutoRefresh) {
      tableLoading.value = false;
      searchLoading.value = false;
    }
  }
};

// 添加表格分页变化处理方法
const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchFileList();
};

// 修改onFileListUpload方法
const onFileListUpload = (data) => {
  const file = fileList.value.find(item => item.uid === data.file.uid);
  if (file) {
    file.status = 'uploading';
  }

  const params = {
    file: data.file,
    data: { caseId: query.caseId },
  };

  uploadFileApi(params,true).then((res)=>{
    if (res.code === 200) {
      // 上传成功，更新文件状态
      const uploadedFile = fileList.value.find(item => item.uid === data.file.uid);
      if (uploadedFile) {
        uploadedFile.status = 'done';
        uploadedFile.percent = 100;
        // 触发响应式更新
        fileList.value = [...fileList.value];
      }
    }else{
      const uploadedFile = fileList.value.find(item => item.uid === data.file.uid);
      if (uploadedFile) {
        uploadedFile.status = 'error';
        uploadedFile.percent = 0;
        // 触发响应式更新
        fileList.value = [...fileList.value];
      }
      message.error(`${res.message || '上传失败'} `);
    }

  })
};

// 搜索处理
const onSearch = () => {
  searchLoading.value = true;
  pagination.current = 1;
  fetchFileList();
};

// 重置搜索
const resetSearch = () => {
  formRef.value.resetFields();
  pagination.current = 1;
  fetchFileList()
};

// 上传文件
const uploadFile = () => {
  uploadModalVisible.value = true
};

// 上传前校验
const beforeUpload = (file) => {
  // 检查是否已存在同名文件
  const isExist = fileList.value.some(item => item.name === file.name);
  if (isExist) {
    message.warning(`文件 ${file.name} 已经存在上传列表中`);
    return false;
  }

  // 添加到文件列表
  fileList.value = [...fileList.value, {
    uid: file.uid,
    name: file.name,
    size: file.size,
    type: file.type,
    originFileObj: file,
    percent: 0,
    status: 'pending'
  }];

};

// 移除文件
const handleRemove = (file) => {
  fileList.value = fileList.value.filter(item => item.uid !== file.uid);
};

// 取消上传
const handleCancel = (file) => {
  file.status = 'removed';
  message.info(`已取消上传: ${file.name}`);
  handleRemove(file);
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
};

// 执行上传
const handleUpload = async () => {
  if (fileList.value.length === 0) {
    message.warning('请选择要上传的文件');
    return;
  }
  uploading.value = false;
  uploadModalVisible.value = false;
  fileList.value = [];

  // 刷新文件列表
  fetchFileList();
};

// 修改selectSheet方法
const selectSheet = async (sheet) => {
  activeSheet.value = sheet.pageId;
  activeTab.value = 'bankCustomer'; // 重置为第一个选项卡

  // 重置所有分页参数
  resetAllPagination();

  // 清空所有数据
  activeSheetData.value = {
    bankCustomers: [],
    bankTransactions: [],
    notBankCustomers: [],
    notBankTransactions: []
  };

  // 加载第一个选项卡的数据
  await loadTabData('bankCustomer');
};
// 新增：重置所有分页参数方法
const resetAllPagination = () => {
  bankCustomerPagination.current = 1;
  bankCustomerPagination.total = 0;
  bankTransactionPagination.current = 1;
  bankTransactionPagination.total = 0;
  nonBankCustomerPagination.current = 1;
  nonBankCustomerPagination.total = 0;
  nonBankTransactionPagination.current = 1;
  nonBankTransactionPagination.total = 0;
};

// 新增：表格分页变化处理方法
const handleBankCustomerTableChange = (pagination) => {
  bankCustomerPagination.current = pagination.current;
  bankCustomerPagination.pageSize = pagination.pageSize;
  loadTabData('bankCustomer');
};

const handleBankTransactionTableChange = (pagination) => {
  bankTransactionPagination.current = pagination.current;
  bankTransactionPagination.pageSize = pagination.pageSize;
  loadTabData('bankTransaction');
};

const handleNonBankCustomerTableChange = (pagination) => {
  nonBankCustomerPagination.current = pagination.current;
  nonBankCustomerPagination.pageSize = pagination.pageSize;
  loadTabData('nonBankCustomer');
};

const handleNonBankTransactionTableChange = (pagination) => {
  nonBankTransactionPagination.current = pagination.current;
  nonBankTransactionPagination.pageSize = pagination.pageSize;
  loadTabData('nonBankTransaction');
};

// 新增：选项卡切换处理方法
const handleTabChange = (key) => {
  // 如果当前选项卡没有数据，则加载数据
  if (!hasTableData.value) {
    loadTabData(key);
  }
};

// 新增：加载选项卡数据方法
const loadTabData = async (tabKey) => {
  if (!activeSheet.value) return;

  try {
    tableLoading.value = true;

    let pageNo, pageSize, params, response;

    switch (tabKey) {
      case 'bankCustomer':
        pageNo = bankCustomerPagination.current;
        pageSize = bankCustomerPagination.pageSize;
        params = {
          filePageId: activeSheet.value,
          pageNo,
          pageSize
        };
        response = await standardCustomerApi(params);
        activeSheetData.value.bankCustomers = response.records || response.bankCustomers || [];
        bankCustomerPagination.total = response.total || 0;
        break;

      case 'bankTransaction':
        pageNo = bankTransactionPagination.current;
        pageSize = bankTransactionPagination.pageSize;
        params = {
          filePageId: activeSheet.value,
          pageNo,
          pageSize
        };
        response = await standardTransApi(params);
        activeSheetData.value.bankTransactions = response.records || response.bankTransactions || [];
        bankTransactionPagination.total = response.total || 0;
        break;

      case 'nonBankCustomer':
        pageNo = nonBankCustomerPagination.current;
        pageSize = nonBankCustomerPagination.pageSize;
        params = {
          filePageId: activeSheet.value,
          pageNo,
          pageSize
        };
        response = await standardNonBankCustomerApi(params);
        activeSheetData.value.notBankCustomers = response.records || response.notBankCustomers || [];
        nonBankCustomerPagination.total = response.total || 0;
        break;

      case 'nonBankTransaction':
        pageNo = nonBankTransactionPagination.current;
        pageSize = nonBankTransactionPagination.pageSize;
        params = {
          filePageId: activeSheet.value,
          pageNo,
          pageSize
        };
        response = await standardNonBankTransApi(params);
        activeSheetData.value.notBankTransactions = response.records || response.notBankTransactions || [];
        nonBankTransactionPagination.total = response.total || 0;
        break;
    }
  } catch (error) {
    console.error(`加载${tabKey}数据失败:`, error);
    message.error(`加载数据失败`);
  } finally {
    tableLoading.value = false;
  }
};


//
const doBankEdit = () => {
  bankEfit.value = true
};

const cancelBank = () => {
  bankEfit.value = false
};
// 确认银行选择
const confirmBank = () => {
  const params = {
    fileId: currentFile.id,
    organizationCode: selectedBank.value
  }
  saveEditBankApi(params).then(()=>{
    bankEfit.value = false
  }).catch(()=>{
    bankEfit.value = false
  })
};

const getFileConvertInfo =(id)=>{
   getFileConfirmInfo({fileId:id}).then((response)=>{
    convertFormState.value = response
  }).catch((err)=>{
    resetConvertForm()
  })

}

const handleEditFileClick = (record) => {
  // 定义可打开模态框的状态
  const validStatuses = [ '101', '102'];
  // 定义加载中的状态
  const loadingStatuses = ['000','003', '100', '001', '002', '004', '005'];
  // 定义错误状态
  const errorStatuses = ['900', '901', '902', '904', '999'];

  if (validStatuses.includes(record.status)) {
    // 状态允许打开模态框
    editFile(record);
  } else if (loadingStatuses.includes(record.status)) {
    // 文件正在加载中
    message.warning('文件数据正在解析中，请稍后');
  } else if (errorStatuses.includes(record.status)) {
    // 文件加载错误
    message.error('文件加载错误，请修改后再运行');
  } else {
    // 其他状态默认提示
    message.warning('当前状态不支持转换查看');
  }
};

// 修改editFile方法，在显示Modal后加载数据
const editFile = async (record) => {
  // 先显示模态框
  editModalVisible.value = true;
  currentRecord.value = record;
  // 查询转换基本信息
  const convertInfo = await getFileConverResultApi({fileId:record.id})
  const fileInfo = await getFileInfoItem({fileId:record.id})
  const { fileType } = fileInfo
  currentFileType.value = (fileType || '').toLowerCase()

  if (supportedTypes.includes(currentFileType.value)) {
    previewFile(record)
  } else {
    message.error(`不支持的文件类型: ${fileType}`)
    return; // 如果文件类型不支持，直接返回，不显示Modal
  }

  Object.assign(currentFile, convertInfo || {});
  if(convertInfo.organizationCode){
    selectedBank.value = convertInfo.organizationCode
  }

  // 重置分页和数据
  resetAllPagination();
  activeSheetData.value = {
    bankCustomers: [],
    bankTransactions: [],
    notBankCustomers: [],
    notBankTransactions: []
  };

  // 默认选择第一个sheet并加载数据
  const {filePages} = convertInfo
  if (filePages && filePages.length > 0) {
    await selectSheet(filePages[0]);
  }



  nextTick(() => {
    // 先显示模态框
    //editModalVisible.value = true;
    // 在模态框显示后再重置分隔条到居中位置
    setTimeout(() => {
      resetSplitPanelsToCenter();
    }, 100);
  });

};
// 清理创建的对象URL
const cleanupUrl = () => {
  if (fileStreamInfo.value) {
    fileStreamInfo.value = ''
  }
}

// 预览文件excel或者pdf或者csv文件
const previewFile = (record)=>{
  const responseType = currentFileType.value === 'csv'?'arraybuffer':'arraybuffer';
  
  // 设置加载状态
  fileLoading.value = true;
  
  // 先获取文件信息，检查文件大小
  getFileInfoItem({fileId:record.id}).then(fileInfo => {
    const fileSize = fileInfo.fileSize || 0;
    
    // 检查文件大小是否超过限制
    if (fileSize > MAX_FILE_SIZE) {
      Modal.confirm({
        title: '文件过大提示',
        content: `当前文件大小为 ${(fileSize / (1024 * 1024)).toFixed(2)}MB，超过系统建议的3MB限制，预览可能会影响浏览器性能。是否继续预览？`,
        okText: '继续预览',
        cancelText: '取消',
        onOk: () => {
          // 用户选择继续，执行文件加载
          loadFileContent(record, responseType);
        },
        onCancel: () => {
          // 用户取消预览
          fileLoading.value = false;
          fileStreamInfo.value = '';
        }
      });
    } else {
      // 文件大小在限制范围内，直接加载
      loadFileContent(record, responseType);
    }
  }).catch(error => {
    console.error('获取文件信息失败:', error);
    // 即使无法获取文件大小，也尝试加载文件
    loadFileContent(record, responseType);
  });
}

// 实际加载文件内容的方法
const loadFileContent = (record, responseType) => {
  getFileStreamByFileId({fileId:record.id}, responseType).then((response)=>{
    console.info('文件类型',currentFileType.value)
    if (currentFileType.value === 'csv') {
      // CSV文件以arraybuffer形式获取，然后转换为文本
      console.info('文件内容',response)
      
      // 尝试多种编码方式解码
      let csvText = '';
      const encodings = ['utf-8', 'gbk', 'gb2312'];
      for (let encoding of encodings) {
        try {
          const decoder = new TextDecoder(encoding, { fatal: true });
          csvText = decoder.decode(response.data);
          console.log(`成功使用 ${encoding} 编码解码文件`);
          break;
        } catch (e) {
          console.log(`使用 ${encoding} 编码解码失败`);
        }
      }
      
      // 处理可能存在的BOM标记
      if (csvText.charCodeAt(0) === 0xFEFF) {
        csvText = csvText.slice(1);
      }
      
      // 解析CSV内容并存储
      csvContent.value = csvText;
      try {
        csvData.value = parseCSV(csvText);
      } catch (e) {
        console.error('解析CSV失败:', e);
        csvData.value = [];
        message.error('CSV文件解析失败');
      }
      fileLoading.value = false;
    } else if (currentFileType.value === 'excel') {
      // Excel文件以blob形式获取，然后转换为URL
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      fileStreamInfo.value = url;
      fileLoading.value = false;
    } else if (currentFileType.value === 'pdf') {
      // PDF文件以blob形式获取，然后转换为URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      fileStreamInfo.value = blob;
      fileLoading.value = false;
    } else {
      // 其他文件类型直接显示
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      fileStreamInfo.value = url;
      fileLoading.value = false;
    }
  }).catch(error => {
    console.error('获取文件流失败:', error);
    fileLoading.value = false;
    message.error('文件加载失败');
  });
}

// Excel渲染事件处理
const onExcelRendered = () => {
  console.log('Excel渲染完成');
  fileLoading.value = false;
};

const onExcelError = (error) => {
  console.error('Excel渲染错误:', error);
  fileLoading.value = false;
  message.error('Excel文件渲染失败');
};

// 添加PDF渲染事件处理
const onPdfRendered = () => {
  console.log('PDF渲染完成');
  fileLoading.value = false;
};

const onPdfError = (error) => {
  console.error('PDF渲染错误:', error);
  fileLoading.value = false;
  message.error('PDF文件渲染失败');
  
  // 可以根据错误类型提供更具体的提示
  if (error?.message?.includes('Invalid PDF')) {
    message.error('PDF文件格式不正确或已损坏');
  } else if (error?.message?.includes('Missing PDF')) {
    message.error('PDF文件内容缺失');
  }
};

// 关闭编辑Modal
const closeEditModal = () => {
  editModalVisible.value = false;
  isFullscreen.value = false;
  // 重置Modal样式
  const modalElement = document.querySelector('.full-modal .ant-modal') as HTMLElement | null;
  if (modalElement) {
    modalElement.style.width = '100%';
    modalElement.style.height = 'auto';
    modalElement.style.top = '';
    modalElement.style.left = '';
    modalElement.style.maxWidth = '';
  }
  // 清空当前文件信息
  Object.assign(currentFile, {
    fileName: '',
    pageNumber: '',
    fileContent: ''
  });
  // 重置分页和数据
  resetAllPagination();
  activeSheetData.value = {
    bankCustomers: [],
    bankTransactions: [],
    notBankCustomers: [],
    notBankTransactions: []
  };
};

// 修改confirmFileConvert方法
const confirmFileConvert = async () => {
  try {
    resetConvertForm();
    // 获取分页文件列表
    await fetchConvertFileList();
    // 默认选择第一个文件
    if(convertFileList.value && convertFileList.value.length){
      selectedConvertFile.value = convertFileList.value[0];
      getFileConvertInfo(selectedConvertFile.value.id)
    }
    // 显示模态框
    convertModalVisible.value = true;
  } catch (error) {
    message.error('获取文件列表失败');
  }
};

// 添加获取转换文件列表的方法（分页）
const fetchConvertFileList = async () => {
  try {
    const params = {
      caseId: query.caseId,
      pageNo: filePagination.current,
      pageSize: filePagination.pageSize
    };
    const response = await standardFilePageListApi(params);
    convertFileList.value = response.records || [];
    filePagination.total = response.total || 0;
    filePagination.totalPage = Math.ceil(filePagination.total / filePagination.pageSize) || 0;
  } catch (error) {
    console.error('获取文件列表失败:', error);
    convertFileList.value = [];
    filePagination.total = 0;
    filePagination.totalPage = 0;
  }
};

const saveTitleConfig = async () => {
  try {
    // 设置按钮为禁用状态，防止重复提交
    isSaveButtonDisabled.value = true;
    
    // 校验是否选择了所属银行/支付公司
    if (!currentTitleConfigFile.value.organizationCode) {
      message.warning('请先选择所属银行/支付公司');
      isSaveButtonDisabled.value = false;
      return;
    }
    // 准备请求参数
    const params = {
      faFileParameters: titleConfigData.value.result.flatMap(dataBlock => 
        dataBlock.dataBlockStucts.map(struct => struct.faFileParameter)
      ),
      orgCode: currentTitleConfigFile.value.organizationCode,
      pageId: activeTitleConfigSheet.value
    };
    
    // 调用API保存配置
    await updateFileConfigApi(params);
    message.success('字段映射已保存');
    
    // 保存成功后，刷新文件列表数据
    fetchFileList();
    
    // 重新加载所属银行/支付公司下拉框和页码列表数据
    await showTitleConfigModal(currentTitleConfigFile.value);
    
    // 如果之前有选中的页码，则重新加载该页码的数据
    if (activeTitleConfigSheet.value) {
      // 查找当前选中的页码对象
      const currentSheet = currentTitleConfigFile.value.filePages?.find(
        sheet => sheet.pageId === activeTitleConfigSheet.value
      );
      
      // 如果找到了页码对象，则重新加载数据
      if (currentSheet) {
        await selectTitleConfigSheet(currentSheet);
      }
    }
  } catch (error) {
    console.error('保存标题配置失败:', error);
    message.error('保存标题配置失败');
  } finally {
    // 无论成功或失败，都取消按钮的禁用状态
    isSaveButtonDisabled.value = false;
  }
};

// 上一页
const prevPage = () => {
  if (filePagination.current > 1) {
    filePagination.current--;
    fetchConvertFileList();
  }
};

// 下一页
const nextPage = () => {
  if (filePagination.current < filePagination.totalPage) {
    filePagination.current++;
    fetchConvertFileList();
  }
};

// 选择文件
const selectConvertFile = (file) => {
  selectedConvertFile.value = file;
  resetConvertForm();
  getFileConvertInfo(file.id)
  // 可以在这里加载文件的预填信息
};

// 重置表单
const resetConvertForm = () => {
  convertFormState.value = {
    fileName: '', // 保留原文件名
    orgName: '',
    orgCd:'',
    orgNameFrom: '',
    inVertical: undefined,
    folderName: '',
    dataOrg: undefined,
    directory: '',
    dataCardNum: '',
    status: '',
    customerName:'',
    customerId:''
  }
};

// 修改文件所属机构
const handleConvertConfirm = async () => {
  try {
    const {dataOrg} = convertFormState.value
    const params = {
      fileId: selectedConvertFile.value?.id,
      caseId: query.caseId,
      organizationCode:dataOrg
    };

    // 修改文件所属机构
    await updateFileOrg(params);
    getFileConvertInfo(selectedConvertFile.value?.id)
/*    // 关闭模态框并刷新列表
    convertModalVisible.value = false;
    fetchFileList();*/
  } catch (error) {
  }
};

// 确认文件转换
/*const confirmFileConvert = async () => {
  Modal.confirm({
    title: '确认转换文件吗',
    content: `确定要转换所有文件吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      convertFileListApi({caseId:query.caseId,}).then(()=>{
        fetchFileList();
      })
    }
  });
};*/


// 删除文件
const deleteFile = async (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除文件吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {

      deleteFileListApi({fileId:record.id}).then(()=>{
        fetchFileList();
      })

    }
  });
};

// 状态颜色映射（可根据需要调整）
const statusColorMap = {
  '1': 'green',    // 成功
  '2': 'red',      // 失败
  '3': 'orange',   // 处理中
  '4': 'blue',     // 待处理
  '5': 'gray'      // 其他状态
};

// 状态颜色
const getStatusColor = (status) => {
  return statusColorMap[status] || 'default';
};

// 状态文本 - 从fileProcessOptions中获取
const getStatusText = (statusValue) => {
  if (!props.fileProcessOptions || !Array.isArray(props.fileProcessOptions)) {
    return '--';
  }
  const option = props.fileProcessOptions.find(opt => opt.value === statusValue);
  return option ? option.label : '--';
};



// 新增：获取表格数据的方法
const getTableAction = (record) => {
  return [
    {
      label: '操作',
      onClick: () => {
        // 可以在这里添加具体的操作
      },
    },
  ];
};

// 添加面板控制相关状态
const leftPanelVisible = ref(true);
const rightPanelVisible = ref(true);
const leftPanelSize = ref(50);
const rightPanelSize = ref(50);

// 保存面板大小用于恢复
const lastLeftPanelSize = ref(50);
const lastRightPanelSize = ref(50);

// 切换左侧面板显示/隐藏
const toggleLeftPanel = () => {
  leftPanelVisible.value = !leftPanelVisible.value;
  
  if (leftPanelVisible.value) {
    // 恢复左侧面板
    leftPanelSize.value = lastLeftPanelSize.value;
    if (!rightPanelVisible.value) {
      rightPanelVisible.value = true;
    }
    rightPanelSize.value = 100 - leftPanelSize.value;
  } else {
    // 隐藏左侧面板
    lastLeftPanelSize.value = leftPanelSize.value;
    rightPanelSize.value = 100;
  }
};

// 切换右侧面板显示/隐藏
const toggleRightPanel = () => {
  rightPanelVisible.value = !rightPanelVisible.value;
  
  if (rightPanelVisible.value) {
    // 恢复右侧面板
    rightPanelSize.value = lastRightPanelSize.value;
    if (!leftPanelVisible.value) {
      leftPanelVisible.value = true;
    }
    leftPanelSize.value = 100 - rightPanelSize.value;
  } else {
    // 隐藏右侧面板
    lastRightPanelSize.value = rightPanelSize.value;
    leftPanelSize.value = 100;
  }
};

// 处理分割面板大小调整
const onSplitterResize = (panes) => {
  if (panes.length >= 2) {
    // 检查左侧面板是否应该隐藏（拖拽到最左侧）
    if (panes[0].size <= 0.1 && leftPanelVisible.value) {
      leftPanelVisible.value = false;
      // 保存当前大小以便恢复
      lastLeftPanelSize.value = leftPanelSize.value;
      rightPanelSize.value = 100;
      return;
    }
    
    // 检查右侧面板是否应该隐藏（拖拽到最右侧）
    if (panes[1].size <= 0.1 && rightPanelVisible.value) {
      rightPanelVisible.value = false;
      // 保存当前大小以便恢复
      lastRightPanelSize.value = rightPanelSize.value;
      leftPanelSize.value = 100;
      return;
    }
    
    // 如果左侧面板之前被隐藏，现在变大了，应该重新显示
    if (!leftPanelVisible.value && panes[0].size > 0.1) {
      leftPanelVisible.value = true;
      leftPanelSize.value = lastLeftPanelSize.value;
      rightPanelSize.value = 100 - leftPanelSize.value;
      return;
    }
    
    // 如果右侧面板之前被隐藏，现在变大了，应该重新显示
    if (!rightPanelVisible.value && panes[1].size > 0.1) {
      rightPanelVisible.value = true;
      rightPanelSize.value = lastRightPanelSize.value;
      leftPanelSize.value = 100 - rightPanelSize.value;
      return;
    }
    
    // 更新面板大小
    leftPanelSize.value = panes[0].size;
    rightPanelSize.value = panes[1].size;
  }
};

// 重置分隔条到居中位置
const resetSplitPanelsToCenter = () => {
  // 设置面板大小为居中
  leftPanelSize.value = 50;
  rightPanelSize.value = 50;
  
  // 保存当前大小以便后续使用
  lastLeftPanelSize.value = 50;
  lastRightPanelSize.value = 50;
  // 显示两个面板
  leftPanelVisible.value = true;
  rightPanelVisible.value = true;
};

// 在脚本部分添加新方法
const getRowClassName = (record) => {
  return record.cleanRule ? 'blue-row' : '';
};

// 新增：处理标题配置按钮点击事件
const handleTitleConfigClick = (record) => {
  // 定义可打开模态框的状态
  const validStatuses = ['003', '100', '101', '904','102'];
  // 定义加载中的状态
  const loadingStatuses = ['000', '001', '002', '004', '005'];
  // 定义错误状态
  const errorStatuses = ['900', '901', '902',  '999'];

  if (validStatuses.includes(record.status)) {
    // 状态允许打开模态框
    showTitleConfigModal(record);
  } else if (loadingStatuses.includes(record.status)) {
    // 文件正在加载中
    message.warning('文件正在加载中，请稍后');
  } else if (errorStatuses.includes(record.status)) {
    // 文件加载错误
    message.error('文件加载错误，请修改后再配置');
  } else {
    // 其他状态默认提示
    message.warning('当前状态不支持标题配置');
  }
};

// 标题配置相关方法
const showTitleConfigModal = async (record) => {
  currentTitleConfigFile.value = record;
  titleConfigModalVisible.value = true;
  
  // 重置激活的页码
  activeTitleConfigSheet.value = '';
  // 清空现有数据
  titleConfigData.value = {
    result: []
  };

  //清空标题配置
  titleConfigOptions.value = [];
  try {

    
    // 获取机构列表选项
    const orgListResponse = await getOrgListApi({});
    if (orgListResponse && Array.isArray(orgListResponse)) {
      orgListOptions.value = orgListResponse.map(item => ({
        value: item.orgCd,
        text: item.orgName
      }));
    } else {
      orgListOptions.value = [];
    }
    
    // 获取文件转换结果信息（包含文件页码信息）
    const fileConvertResult = await getFileConverResultApi({fileId: record.id});
    
    // 获取文件属性信息，设置默认的所属银行/支付公司
    let organizationCode = '';
    try {
      const fileProperty = await queryFilePropertyByFileIdApi({fileId: record.id});
      if (fileProperty && fileProperty.orgCd) {
        organizationCode = fileProperty.orgCd;
      }
      // 根据configFlag判断是否禁用下拉框
      if (fileProperty && fileProperty.configFlag === true) {
        isOrganizationSelectDisabled.value = true;
      } else {
        isOrganizationSelectDisabled.value = false;
      }
    } catch (error) {
      console.warn('获取文件属性信息失败:', error);
      isOrganizationSelectDisabled.value = false;
    }
    
    // 更新当前标题配置文件信息，包括文件页码
    currentTitleConfigFile.value = {
      ...record,
      ...fileConvertResult,
      organizationCode
    };
    
    // 设置默认激活的第一个页码
    // if (fileConvertResult.filePages && fileConvertResult.filePages.length > 0) {
    //   activeTitleConfigSheet.value = fileConvertResult.filePages[0].pageId;
    // }

    // 如果之前有选中的页码，则重新加载该页码的数据
    if (activeTitleConfigSheet.value) {
      // 查找当前选中的页码对象
      const currentSheet = currentTitleConfigFile.value.filePages?.find(
        sheet => sheet.pageId === activeTitleConfigSheet.value
      );

      // 如果找到了页码对象，则重新加载数据
      if (currentSheet) {
        await selectTitleConfigSheet(currentSheet);
      }
    }else{
      if (fileConvertResult.filePages && fileConvertResult.filePages.length > 0) {
        activeTitleConfigSheet.value = fileConvertResult.filePages[0].pageId;
      }
      const currentSheet = fileConvertResult.filePages[0];

      // 如果找到了页码对象，则重新加载数据
      if (currentSheet) {
        await selectTitleConfigSheet(currentSheet);
      }
    }

  } catch (error) {
    console.error('获取标题配置数据失败:', error);
    message.error('获取标题配置数据失败');
  }
};

// 添加全屏状态
const isIgnoreTitleConfig = ref(false);

const selectTitleConfigSheet = async (sheet, newOrgCode = null) => {
  // 使用传入的新orgCode或者当前值
  const orgCode = newOrgCode !== null ? newOrgCode : currentTitleConfigFile.value.organizationCode;
  
  // 校验是否选择了所属银行/支付公司
  if (!orgCode) {
    message.warning('请先选择所属银行/支付公司');
    return;
  }
  
  activeTitleConfigSheet.value = sheet.pageId;
  
  try {
    // 开始加载，设置加载状态为true
    titleConfigLoading.value = true;
    isIgnoreTitleConfig.value = false;
    
    // 获取文件配置选项
    const configResponse = await getFileConfigApi({orgCode: orgCode});

    // 修复数据处理逻辑
    if (configResponse && Array.isArray(configResponse)) {
      titleConfigOptions.value = configResponse.map(item => ({
        value: item,
        text: item
      }));
    } else {
      titleConfigOptions.value = [];
    }

    // 获取标题配置数据
    const titleConfigResponse = await fileConfigDataApi({
      pageId: sheet.pageId,
      orgCode: orgCode
    });

    if (titleConfigResponse && Array.isArray(titleConfigResponse)) {
      titleConfigData.value = {
        result: titleConfigResponse
      };
      // 根据oriMetaData字段过滤下拉框选项 暂时去掉字段过滤
      // titleConfigData.value = {
      //   result: titleConfigResponse.map(dataBlock => {
      //     return {
      //       ...dataBlock,
      //       dataBlockStucts: dataBlock.dataBlockStucts.map(struct => {
      //         return {
      //           ...struct,
      //           // 保存原始配置选项到结构中，用于过滤
      //           availableOptions: configResponse && Array.isArray(configResponse)
      //             ? configResponse.filter(option =>
      //                 !dataBlock.dataBlockStucts.some(s =>
      //                   s.faFileParameter.oriMetaData === option
      //                 )
      //               ).map(item => ({ value: item, text: item }))
      //             : []
      //         };
      //       })
      //     };
      //   })
      // };

      // 设置默认激活的标签页
      if (titleConfigData.value.result.length > 0) {
        titleConfigActiveTab.value = `dataBlock${titleConfigData.value.result[0].dataBlockNum}`;
      }else{
        //如果没有获取到数据，使用模拟数据
        // message.error('未查询到配置数据');
        isIgnoreTitleConfig.value = true;
        // titleConfigActiveTab.value = null;
      }
    } else {
      // 如果没有获取到数据，清空现有数据
      isIgnoreTitleConfig.value = true;
      titleConfigData.value = {
        result: []
      };
      titleConfigActiveTab.value = 'dataBlock1';
    }
  } catch (error) {
    console.error('获取标题配置数据失败:', error);
    message.error('获取标题配置数据失败');
  } finally {
    // 结束加载，设置加载状态为false
    titleConfigLoading.value = false;
  }
};

// 构造标题配置表格数据
const getTitleConfigTableData = (dataBlockStucts: DataBlockStruct[]) => {
  // 获取最大数据行数
  const maxDataRows = Math.max(...dataBlockStucts.map(struct => struct.datas.length), 0);
  
  // 构造表格数据
  const tableData: Array<{
    key: string;
    type: 'newMetaData' | 'titleColName' | 'datas';
    config?: string;
    dataIndex?: number;
    datas?: string[];
  }> = [];
  
  // 添加配置行（newMetaData）
  tableData.push({
    key: 'newMetaData',
    type: 'newMetaData',
    config: '配置列（newMetaData）'
  });
  
  // 添加原标题行（titleColName）
  tableData.push({
    key: 'titleColName',
    type: 'titleColName',
    config: '原标题（titleColName）'
  });
  
  // 添加数据行（datas）
  for (let i = 0; i < maxDataRows; i++) {
    tableData.push({
      key: `data-${i}`,
      type: 'datas',
      dataIndex: i,
      datas: dataBlockStucts.map(struct => struct.datas[i] || '')
    });
  }
  
  return tableData;
};

// 获取过滤后的下拉选项
const getFilteredOptions = (dataBlockStucts: DataBlockStruct[], colIndex: number) => {
  // 获取当前列的结构
  const currentStruct = dataBlockStucts[colIndex];
  if (!currentStruct) return [];
  
  // 如果已经计算过可用选项，直接返回
  if (currentStruct.availableOptions && currentStruct.availableOptions.length > 0) {
    return currentStruct.availableOptions;
  }
  
  // 否则返回所有选项
  return titleConfigOptions.value;
};

// 构造标题配置表格列
const getTitleConfigColumns = (dataBlockStucts: DataBlockStruct[]) => {
  // 构造表格列
  const columns: any[] = [];
  
  // 添加配置列（固定列）,fixed: 'left'
  columns.push({
    title: '配置',
    dataIndex: 'config',
    width: 80
  });
  
  // 添加数据列
  for (let i = 0; i < dataBlockStucts.length; i++) {
    columns.push({
      title: `列${i + 1}`,
      dataIndex: `col${i}`,
      width: 120,
      resizable: true
    });
  }
  
  return columns;
};

const onNewMetaDataChange = (struct, event) => {
  // 处理newMetaData变更
  console.log('newMetaData changed:', struct, event);
};

// 添加处理标题配置变化的函数
const handleTitleConfigChange = (value, dataBlock, column, record) => {
  // 获取列索引
  const colIndex = parseInt(column.dataIndex.replace('col', ''));
  
  // 获取当前列的oriMetaData
  const oriMetaData = dataBlock.dataBlockStucts[colIndex].faFileParameter.oriMetaData;
  
  // 获取标题列名称
  const titleColName = dataBlock.dataBlockStucts[colIndex].faFileParameter.titleColName;
  
  // 如果oriMetaData为空
  if (!oriMetaData) {
    // 重新组装未映射的标题配置
    if (value) {
      // 当选择了非空值时，从未映射标题中移除当前标题列名称
      const noMappingTitles = dataBlock.noMappingTitle.split(',');
      const updatedNoMappingTitles = noMappingTitles.filter(title => title.trim() !== titleColName.trim());
      dataBlock.noMappingTitle = updatedNoMappingTitles.join(',');
    } else {
      // 当选择了空值时，将标题列名称重新加回到未映射标题中
      const noMappingTitles = dataBlock.noMappingTitle.split(',');
      // 检查是否已经存在，避免重复添加
      if (!noMappingTitles.includes(titleColName)) {
        noMappingTitles.push(titleColName);
        dataBlock.noMappingTitle = noMappingTitles.join(',');
      }
    }

  }
};

// 所属银行/支付公司下拉框值变更事件处理
const onOrganizationChange = (value) => {
  // 如果已有选中的页码ID，则触发页码的点击事件重新加载标题配置列表数据
  if (activeTitleConfigSheet.value && currentTitleConfigFile.value) {
    // 查找当前选中的页码对象
    const currentSheet = currentTitleConfigFile.value.filePages?.find(
      sheet => sheet.pageId === activeTitleConfigSheet.value
    );
    
    // 如果找到了页码对象，则重新加载数据
    if (currentSheet) {
      // 传递新的organizationCode值给selectTitleConfigSheet方法
      selectTitleConfigSheet(currentSheet, value);
    }
  }
};

// 文件命名说明点击事件
const onFileNameInstructionClick = () => {
  // TODO: 实现文件命名说明点击逻辑
  console.log('文件命名说明 clicked');
  fileInfoRef.value?.open();
};

// 支持的文件格式点击事件
const onSupportedFileTypesClick = () => {
  // TODO: 实现支持的文件格式点击逻辑
  console.log('支持的文件格式 clicked');
  supportFormatRef.value?.open();
};

// 不支持的文件格式点击事件
const onUnsupportedFileTypesClick = () => {
  // TODO: 实现不支持的文件格式点击逻辑
  console.log('不支持的文件格式 clicked');
  unSupportFormatRef.value?.open();
};

</script>

<style scoped>

.search-form-card :deep{
  .ant-card-body :deep{
    padding-bottom: 0px !important;
  }
}

.panel-controls {
  margin-bottom: 16px;
}

/* 自定义上传拖拽区域样式 */
.custom-upload-dragger :deep{
  .ant-upload-btn :deep{
    height: 280px;
  }

}

.upload-dragger-content {
  text-align: center;
}

/* 增加上传列表项的间距 */
.upload-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.upload-item-info {
  flex: 1;
  margin-left: 8px;
}

.upload-item-name {
  font-weight: 500;
}

.upload-item-size {
  color: #999;
  font-size: 12px;
}

.progress-container {
  margin-top: 4px;
}

.upload-actions {
  margin-left: 8px;
}

.sheet-list {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 10px;
  background: #fff;
  height: 100%;
  max-height: 800px;
  overflow-y: auto;
}
.file-item, .sheet-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.file-item:hover, .sheet-item:hover {
  background-color: #f0f7ff;
}
.file-item.active, .sheet-item.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
}

.configured-tag {
  background-color: #1890ff;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 8px;
  white-space: nowrap;
}

:deep(.x-spreadsheet-sheet){
  width: 100% !important;
}

.file-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.file-loading p {
  margin-top: 16px;
  color: #666;
}

.csv-preview {
  padding: 20px;
  height: 100%;
  overflow: auto;
  background-color: #f5f5f5;
}

.csv-table-container {
  max-height: 600px;
  overflow: auto;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.csv-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.csv-table th {
  background-color: #fafafa;
  font-weight: bold;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 10;
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
}

.csv-table td {
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.csv-table tr:nth-child(even) {
  background-color: #fafafa;
}

.csv-table tr:hover {
  background-color: #f0f7ff;
}

.csv-empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 5px;
}

.pagination-controls .page-info {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.file-list-container {
  /*max-height: 600px;*/
  overflow-y: auto;
}

.file-item {
  padding: 12px;
  border: 1px solid #e8e8e8;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-item:hover {
  background-color: #f5f5f5;
}

.file-item.active {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.table-tab :deep(.ant-table-placeholder .ant-table-cell) {
  border: none!important;
}

/* 标题配置表格中的下拉框样式优化，防止被遮挡 */
.table-tab :deep(.ant-select-dropdown) {
  z-index: 1050;
}

/* 隐藏标题配置表格的表头（只针对标题配置模态框中的表格） */
.titleConfigClass .table-tab :deep(.ant-table-thead) {
  display: none;
}

/* 固定标题配置表格的前两行（配置行和原标题行） */
.titleConfigClass .table-tab :deep(.ant-table-tbody > tr:nth-child(-n+2)) {
  position: sticky;
  top: 0;
  background-color: #fafafa;
  z-index: 100;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
}

.titleConfigClass .table-tab :deep(.ant-table-tbody > tr:nth-child(-n+3)) {
  position: sticky;
  top: 0;
  background-color: #fafafa;
  z-index: 100;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
}

.titleConfigClass .table-tab :deep(.ant-table-tbody > tr:nth-child(2)) {
  top: 0px; /* 精确计算第二行高度 */
}
.titleConfigClass .table-tab :deep(.ant-table-tbody > tr:nth-child(3)) {
  top: 48px; /* 精确计算第三行高度 */
}
/* 为数据行添加顶部边框，使其与固定行更好区分 */
.titleConfigClass .table-tab :deep(.ant-table-tbody > tr:nth-child(n+3)) {
  border-top: 1px solid #f0f0f0;
}

/* 增加下拉框容器的z-index以确保不会被遮挡 */
.titleConfigClass .table-tab :deep(.ant-table-tbody > tr:first-child) {
  z-index: 102 !important;
}

.titleConfigClass .table-tab :deep(.ant-table-tbody > tr:nth-child(2)) {
  z-index: 101 !important;
}

/* 确保下拉选择框展开时不会被其他元素遮挡 */
.titleConfigClass .table-tab :deep(.ant-select) {
  position: relative;
  z-index: 103;
}

/* 确保表格容器不会截断下拉框 */
.titleConfigClass .table-tab :deep(.ant-table-content) {
  overflow: visible;
}

/* 确保表格单元格不会截断下拉框 */
.titleConfigClass .table-tab :deep(.ant-table-tbody > tr > td) {
  overflow: visible;
}

/* 为配置列的单元格添加特殊样式 */
.config-select-cell {
  position: relative;
  z-index: 104;
}

/* 标题配置表格最小高度 */
.title-config-table :deep(.ant-table-body) {
  min-height: 500px;
}

.file-trans-table :deep(.ant-table-body) {
  min-height: 400px;
}

 :deep(.blue-row) {
  background-color: #e6f7ff !important;
}

  :deep(.splitpanes__splitter) {
    background-color: #e8e8e8;
    position: relative;
  }
  
  :deep(.splitpanes__splitter):before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    background-color: #1890ff;
    transition: all 0.3s ease;
  }
  
  :deep(.splitpanes--vertical > .splitpanes__splitter):before {
    width: 4px;
    height: 40px;
    border-radius: 2px;
    margin-left: -2px;
  }
  
  :deep(.splitpanes__splitter:hover):before {
    background-color: #40a9ff;
    width: 6px;
    margin-left: -3px;
  }
  
  .file-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
  }
  
  .file-loading p {
    margin-top: 16px;
    color: #666;
  }
  
  .csv-preview {
    padding: 20px;
    height: 100%;
    overflow: auto;
    background-color: #f5f5f5;
  }
  
  .pdf-container {
    background-color: #f5f5f5;
    padding: 20px;
    height: 100%;
  }
  
  .pdf-container :deep(.vue-office-pdf) {
    background-color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  .csv-table-container {
    max-height: 600px;
    overflow: auto;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .csv-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .csv-table th {
    background-color: #fafafa;
    font-weight: bold;
    text-align: left;
    position: sticky;
    top: 0;
    z-index: 10;
    border: 1px solid #e8e8e8;
    padding: 8px 12px;
  }

  .csv-table td {
    border: 1px solid #e8e8e8;
    padding: 8px 12px;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .csv-table tr:nth-child(even) {
    background-color: #fafafa;
  }

  .csv-table tr:hover {
    background-color: #f0f7ff;
  }

  .csv-empty {
    text-align: center;
    padding: 40px;
    color: #999;
  }
</style>
