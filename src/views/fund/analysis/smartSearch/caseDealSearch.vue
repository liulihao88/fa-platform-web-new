<template>
  <div  class="h-100% bg-white flex flex-col">
      <div class="case-deal-search">
        <h3>涉案人交易查询</h3>
        <div class="form-row">
            <div class="form-group">
                <label>交易发起方：</label>
                <div class="input-group">
                    <input type="text" value="张三" readonly />
                    <button class="add-btn">+</button>
                </div>
            </div>
            <div class="arrow">→</div>
            <div class="form-group">
                <label>交易对方：</label>
                <div class="input-group">
                    <input type="text" value="卡号：123456789098 匿名用户 胡伟昌" readonly />
                    <button class="add-btn">+</button>
                </div>
            </div>
        </div>
    </div>
     <gSearchBar :items="searchItems" @search="onSearch" @reset="resetSearch" />
      <!-- 表格部分 -->
    <BasicTable class="m2 flex-1" :columns="tableColumns" :dataSource="dataSource" :loading="tableLoading"
      :scroll="{ x: 2000 }" :row-selection="rowSelection" :pagination="pagination" bordered @change="handleTableChange"
      rowKey="id" :canColDrag="true" :showTableSetting="false"
      :tableSetting="{ redo: false, size: true, setting: true, fullScreen: false, cacheKey: 'fund-analysis-intelligent-table' }"
      :canResize="true"  @register="registerTable">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="exportCurrentPage">
          导出本页数据
        </a-button>
        <a-button type="primary" @click="exportMarkedData" :disabled="selectedRowKeys.length === 0">
          导出选择数据
        </a-button>
        <a-button type="primary" @click="exportAllData">
          导出全部数据
        </a-button>
        <a-button type="primary" @click="showArchiveModal">
          生成卷宗信息
        </a-button>
      </template>
      <!-- <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
        <template v-else-if="column.key === 'transAmt'">
          {{ record.transAmt?.toLocaleString() }}
        </template>
        <template v-else-if="column.key === 'operation'">
          <a-button type="link" @click="showDetailModal(record)">查看原信息</a-button>
          <a-button type="link" @click="handleDetail(record)">查看详情</a-button>
        </template>
      </template> -->
    </BasicTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { BasicTable, useTable, TableAction } from '/@/components/Table';
const searchItems = [
    {
        label: '开户银行',
        prop: 'bankName',
        type: 'select',
        placeholder: '请选择开户银行',
    },
    {
        label: '账户',
        prop: 'involvedName',
        type: 'input',
        placeholder: '请输入账户',
    },
      {
        label: '卡号',
        prop: 'involvedName',
        type: 'input',
        placeholder: '请输入卡号',
    },
      {
        label: '交易方向',
        prop: 'involvedName',
        type: 'select',
        placeholder: '请选择交易方向',
    },
      {
        label: '业务日期范围',
        prop: 'involvedName',
        type: 'date',
        placeholder: '请选择业务日期范围',
    },
      {
        label: '交易金额',
        prop: 'involvedName',
        type: 'input',
        placeholder: '请输入交易金额',
        isMore: true,
    },
      {
        label: '交易状态',
        prop: 'involvedName',
        type: 'select',
        placeholder: '请选择交易状态',
        isMore: true,
    },
]
// 表格列配置
const tableColumns = [
  {
    title: '文件名称',
    dataIndex: 'fileName',
    key: 'fileName',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '行号',
    dataIndex: 'rowNum',
    key: 'rowNum',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '机构名称',
    dataIndex: 'orgName',
    key: 'orgName',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '客户号',
    dataIndex: 'showCustomerCd',
    key: 'showCustomerCd',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '客户名称',
    dataIndex: 'customerName',
    key: 'customerName',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '交易账号',
    dataIndex: 'transAccountNo',
    key: 'transAccountNo',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '相关账号',
    dataIndex: 'relAccountNo',
    key: 'relAccountNo',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '户名',
    dataIndex: 'accountName',
    key: 'accountName',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '币种',
    dataIndex: 'currNo',
    key: 'currNo',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '交易状态',
    dataIndex: 'status',
    key: 'status',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '交易方向',
    dataIndex: 'transWay',
    key: 'transWay',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '交易金额',
    dataIndex: 'transAmt',
    key: 'transAmt',
    align: 'right' as const,
    width: 100,
    resizable: true
  },
  {
    title: '交易种类',
    dataIndex: 'transType',
    key: 'transType',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '业务日期',
    dataIndex: 'bizDate',
    key: 'bizDate',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '交易时间',
    dataIndex: 'transTime',
    key: 'transTime',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '余额',
    dataIndex: 'balence',
    key: 'balence',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '对方机构名称',
    dataIndex: 'counterOrgName',
    key: 'counterOrgName',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '对方账号',
    dataIndex: 'counterAccountNo',
    key: 'counterAccountNo',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '对方户名',
    dataIndex: 'counterName',
    key: 'counterName',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '操作',
    key: 'operation',
    align: 'center' as const,
    width: 220,
    fixed: 'right' as const
  }
];
const dataSource = ref<any[]>([])
const conditionJson = ref()
const selectedRowKeys = ref<string[]>([]);
const selectedRowsData = ref<any[]>([]);
const tableLoading = ref(false)
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (selectedKeys: (string | number)[], selectedRows: any[]) => {
      selectedRowKeys.value = selectedKeys as string[];
      selectedRowsData.value = selectedRows;
    },
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
      if (selected) {
        selectedRowKeys.value = selectedRows.map(row => row.id);
      } else {
        selectedRowKeys.value = [];
      }
    },
    // 全选相关配置
    checkStrictly: false,
    columnWidth: 60,
    fixed: true
  };
});
// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPage: 0,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});
const [registerTable, { setPagination }] = useTable({
  columns: tableColumns,
  dataSource,
  loading: tableLoading,
  pagination,
  bordered: true,
  size: 'small',
  scroll: { x: 2000 },
  rowSelection,
  canColDrag: true,
  showTableSetting: true,
  canResize: true,
  minHeight: 300,
  tableSetting: {
    redo: false,
    size: true,
    setting: false,
    fullScreen: false,
    cacheKey: 'fund-analysis-intelligent-table'
  }
});
</script>

<style scoped lang="scss">
.case-deal-search {
    padding: 20px;
    background-color: #fff;
    h3 {
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: bold;
    }
    
    .form-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .form-group {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        background-color: #f9f9f9;
        
        label {
            font-size: 14px;
            white-space: nowrap;
        }
        
        .input-group {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 10px;
            
            input {
                flex: 1;
                padding: 8px;
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                font-size: 14px;
                background-color: white;
            }
            
            .add-btn {
                width: 28px;
                height: 28px;
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                background-color: white;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                
                &:hover {
                    background-color: #f0f0f0;
                }
            }
        }
    }
    
    .arrow {
        font-size: 20px;
        color: #666;
        margin: 0 10px;
    }
}
</style>
