<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">新增</a-button>
        <!--        <a-button type="primary" v-auth="'casefiles:fa_case_info:add'" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增</a-button>-->
        <a-button
          type="primary"
          v-auth="'casefiles:fa_case_info:exportXls'"
          preIcon="ant-design:export-outlined"
          @click="onExportXls"
        >
          导出
        </a-button>
        <j-upload-button
          type="primary"
          v-auth="'casefiles:fa_case_info:importExcel'"
          preIcon="ant-design:import-outlined"
          @click="onImportXls"
        >
          导入
        </j-upload-button>

        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button v-auth="'casefiles:fa_case_info:deleteBatch'">
            批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" :divider="true" />
      </template>
      <!--字段回显插槽-->
      <template v-slot:bodyCell="{ column, text }">
        <div v-if="column.dataIndex === 'errorFileNum' && Number(text) > 0" style="background-color: red">
          {{ text }}
        </div>
        <div v-else-if="column.dataIndex === 'repeatDataNum' && Number(text) > 0" style="background-color: red">
          {{ text }}
        </div>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <FaCaseInfoModal @register="registerModal" @success="handleSuccess"></FaCaseInfoModal>
  </div>
</template>

<script lang="ts" name="casefiles-faCaseInfo" setup>
import { ref, reactive, computed, unref, onMounted, onUnmounted } from 'vue'
import { BasicTable, useTable, TableAction } from '/@/components/Table'
import { useModal } from '/@/components/Modal'
import { useListPage } from '/@/hooks/system/useListPage'
import FaCaseInfoModal from './components/FaCaseInfoModal.vue'
import { columns, searchFormSchema, superQuerySchema } from './FaCaseInfo.data'
import { list, deleteOne, batchDelete, getImportUrl, getExportUrl } from './FaCaseInfo.api'
import { downloadFile } from '/@/utils/common/renderUtils'
import { useUserStore } from '/@/store/modules/user'
import { useMessage } from '/@/hooks/web/useMessage'
import { getDateByPicker } from '/@/utils'
import { useRouter } from 'vue-router'
const router = useRouter()
//日期个性化选择
const fieldPickers = reactive({})
const queryParam = reactive<any>({})
const checkedKeys = ref<Array<string | number>>([])
const userStore = useUserStore()
const { createMessage } = useMessage()
//注册model
const [registerModal, { openModal }] = useModal()
//注册table数据
const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
  tableProps: {
    title: '案件管理',
    api: list,
    columns,
    canResize: true,
    bordered: true,
    size: 'small',
    striped: true,
    tableSetting: {
      redo: false, // 禁用刷新按钮
      setting: false,
    },
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: {
      width: 210,
      fixed: 'right',
    },
    beforeFetch: (params) => {
      if (params && fieldPickers) {
        for (let key in fieldPickers) {
          if (params[key]) {
            params[key] = getDateByPicker(params[key], fieldPickers[key])
          }
        }
      }
      return Object.assign(params, queryParam)
    },
  },
  exportConfig: {
    name: '案件管理',
    url: getExportUrl,
    params: queryParam,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess,
  },
})

const [registerTable, { reload, setLoading }, { rowSelection, selectedRowKeys }] = tableContext

// 存储定时器引用
let refreshTimer: any = null

// 组件挂载时启动定时刷新
onMounted(() => {
  refreshTimer = setInterval(() => {
    // 定时刷新时不显示加载动画
    reload()
    setLoading(false)
  }, 10000) // 每10秒刷新一次
})

// 组件卸载前清除定时器
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

// 高级查询配置
const superQueryConfig = reactive(superQuerySchema)

/**
 * 高级查询事件
 */
function handleSuperQuery(params) {
  Object.keys(params).map((k) => {
    queryParam[k] = params[k]
  })
  reload()
}
/**
 * 新增事件
 */
function handleAdd() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
  })
}
/**
 * 编辑事件
 */
function handleEdit(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
  })
}
/**
 * 详情
 */
function handleDetail(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: false,
  })
}
/**
 * 删除事件
 */
async function handleDelete(record) {
  await deleteOne({ id: record.id }, handleSuccess)
}
/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDelete({ ids: selectedRowKeys.value }, handleSuccess)
}
/**
 * 成功回调
 */
function handleSuccess() {
  ;(selectedRowKeys.value = []) && reload()
}
/**
 * 操作栏
 */
function getTableAction(record) {
  return [
    {
      label: '数据处理',
      onClick: handleGoToDetail.bind(null, record),
      // auth: 'casefiles:fa_case_info:edit'
    },
    {
      label: '智能筛查',
      onClick: handleGoToAnalysisDetail.bind(null, record),
      // auth: 'casefiles:fa_case_info:edit'
    },
  ]
}

async function handleGoToDetail(record: Recordable) {
  router.push({ path: '/fund/cases', query: { caseId: record.id } })
}

async function handleGoToAnalysisDetail(record: Recordable) {
  router.push({ path: '/fund/smartSearch', query: { caseId: record.id } })
}

/**
 * 下拉操作栏
 */
function getDropDownAction(record) {
  return [
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
      //  auth: 'casefiles:fa_case_info:edit'
    },
    {
      label: '详情',
      onClick: handleDetail.bind(null, record),
    },
    {
      label: '删除',
      popConfirm: {
        title: '是否确认删除',
        confirm: handleDelete.bind(null, record),
        placement: 'topLeft',
      },
      // auth: 'casefiles:fa_case_info:delete'
    },
  ]
}
</script>

<style lang="less" scoped>
:deep(.ant-picker),
:deep(.ant-input-number) {
  width: 100%;
}
</style>
