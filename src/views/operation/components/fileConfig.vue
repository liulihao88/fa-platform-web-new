<template>
  <a-card title="资金文件配置" class="m2">
    <!-- 搜索区域 -->
    <a-form :model="searchForm" class="search-form">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item
              label="标准数据"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 18 }">
            <a-input v-model:value="searchForm.metaData" placeholder="请输入标准数据" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="别名"
                       :labelCol="{ span: 6 }"
                       :wrapperCol="{ span: 18 }">
            <a-input v-model:value="searchForm.alias" placeholder="请输入别名" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="拥有者"
                       :labelCol="{ span: 6 }"
                       :wrapperCol="{ span: 18 }">
            <a-input v-model:value="searchForm.owner" placeholder="请输入拥有者" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button class="ml2" @click="handleReset">重置</a-button>

          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <!-- 表格部分 -->
    <BasicTable 
        class="m2"
        :columns="columns"
        :dataSource="dataSource"
        :loading="tableLoading"
        :pagination="pagination"
        bordered
        size="small"
        @change="handleTableChange"
        :canColDrag="true"
        :showTableSetting="true"
        :canResize="true"
        :minHeight="300"
        @register="registerTable"
    >
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" class="ml2" @click="handleAdd">添加</a-button>
      </template>
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
        <template v-if="column.dataIndex === 'regionFld'">
            {{ record.regionFld }}
        </template>
        <template v-if="column.dataIndex === 'dataFlag'">
            {{ record.dataFlag }}
        </template>
        <template v-if="column.dataIndex === 'ifToUnify'">
          <a-tag :color="record.ifToUnify === 1 ? 'green' : 'red'">
            {{ record.ifToUnify === 1 ? '是' : '否' }}
          </a-tag>
        </template>
        <template v-if="column.dataIndex === 'ifToUse'">
          <a-tag :color="record.ifToUse === 1 ? 'green' : 'red'">
            {{ record.ifToUse === 1 ? '是' : '否' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'operation'">
          <div class="table-operations">
            <a-button size="small" type="primary" @click="handleEdit(record)">修改</a-button>
<!--            <a-button class="ml1" size="small" danger @click="handleDelete(record)">删除</a-button>-->
          </div>
        </template>
      </template>
    </BasicTable>

    <!-- 添加/修改抽屉 -->
    <a-drawer
        :title="drawerTitle"
        :width="720"
        :visible="drawerVisible"
        :body-style="{ paddingBottom: '80px' }"
        @close="handleDrawerClose"
    >
      <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
      >
        <template v-if="!isEditMode">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="标准数据" name="metaData">
                <a-input
                    v-model:value="formData.metaData"
                    placeholder="请输入标准数据"
                    :disabled="isEditMode"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="数据类类别" name="dataType">
                <a-input
                    v-model:value="formData.dataType"
                    placeholder="请输入数据类别"
                    :disabled="isEditMode"
                />
<!--                <a-select
                    v-model:value="formData.dataType"
                    placeholder="请选择数据类类别"
                    :disabled="isEditMode"
                >
                  <a-select-option value="01">银行客户</a-select-option>
                  <a-select-option value="02">非银行客户</a-select-option>
                </a-select>-->
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="特定模型" name="isSpecialModel">
                <a-select
                    v-model:value="formData.isSpecialModel"
                    placeholder="请选择特定模型"
                    :disabled="isEditMode"
                >
                  <a-select-option :value="0">否</a-select-option>
                  <a-select-option :value="1">是</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="特定银行" name="isSpecialOrg">
                <a-select
                    v-model:value="formData.isSpecialOrg"
                    placeholder="请选择特定银行"
                    :disabled="isEditMode"
                >
                  <a-select-option :value="0">否</a-select-option>
                  <a-select-option :value="1">是</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="特定文件" name="isSpecialFile">
                <a-select
                    v-model:value="formData.isSpecialFile"
                    placeholder="请选择特定文件"
                    :disabled="isEditMode"
                >
                  <a-select-option :value="0">否</a-select-option>
                  <a-select-option :value="1">是</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="字段名称" name="dataNameEng">
                <a-input
                    v-model:value="formData.dataNameEng"
                    placeholder="请输入字段名称"
                    :disabled="isEditMode"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="启用标志" name="ifToUse">
                <a-select
                    v-model:value="formData.ifToUse"
                    placeholder="请选择启用标志"
                    :disabled="isEditMode"
                >
                  <a-select-option :value="0">否</a-select-option>
                  <a-select-option :value="1">是</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </template>


        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="别名" name="alias">
              <a-textarea
                  rows="5"
                  v-model:value="formData.alias"
                  placeholder="请输入别名"
                  :disabled="isEditMode && !isEditMode"
              />
            </a-form-item>
          </a-col>

        </a-row>
      </a-form>

      <div class="drawer-footer">
        <a-button class="mr2" @click="handleDrawerClose">取消</a-button>
        <a-button type="primary" @click="handleSubmit">提交</a-button>
      </div>
    </a-drawer>
  </a-card>
</template>

<script lang="ts" name="FileConfig" setup>
import { ref, reactive, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { configFileListApi, updateConfigFileApi, addConfigFileApi } from '../FaFilesConfigure.api';
import {useRoute} from "vue-router";
import { BasicTable, useTable, TableAction } from '/@/components/Table';

const {query} = useRoute();


interface RecordItem {
  id: string;
  regionFld: number;
  metaData: string;
  dataFlag: string;
  isSpecialModel: number;
  isSpecialOrg: number;
  isSpecialFile: number;
  dataType: string;
  dataNameEng: string;
  ifToUnify: number;
  ifToUse: number;
  alias: string;
  createTime: string;
  createBy: string;
  updateTime: string;
  updateBy: string;
  deleteStatus: string;
  deleteTime: string;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: (total: number, range: [number, number]) => string;
  pageSizeOptions: string[];
}

interface SearchForm {
  metaData: string;
  alias: string;
}

interface FormData {
  id?: string;
  regionFld: number;
  metaData: string;
  dataFlag: string;
  isSpecialModel: number;
  isSpecialOrg: number;
  isSpecialFile: number;
  dataType: string;
  dataNameEng: string;
  ifToUnify: number;
  ifToUse: number;
  alias: string;
}

// 搜索表单
const searchForm = reactive<SearchForm>({
  metaData: '',
  alias: '',
  owner: ''
});

// 分页配置
const pagination = reactive<Pagination>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const tableLoading = ref(false);
const drawerVisible = ref(false);
const isEditMode = ref(false);
const drawerTitle = ref('添加数据');
const formRef = ref<FormInstance>();

const formData = reactive<FormData>({
  regionFld: 0,
  metaData: '',
  dataFlag: '',
  isSpecialModel: 0,
  isSpecialOrg: 0,
  isSpecialFile: 0,
  dataType: '',
  dataNameEng: '',
  ifToUnify: 0,
  ifToUse: 0,
  alias: ''
});

const formRules = {
  metaData: [{ required: true, message: '请输入标准数据', trigger: 'blur' }],
  dataType: [{ required: true, message: '请选择数据类型', trigger: 'change' }],
  dataNameEng: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  alias: [{ required: true, message: '请输入别名', trigger: 'blur' }]
};

const columns = [
  {
    title: '序号',
    key: 'index',
    resizable: true,
  },
  {
    title: '标准数据',
    dataIndex: 'metaData',
    resizable: true,
  },
  {
    title: '别名',
    dataIndex: 'alias',
    width: 250,
    resizable: true,
  },
  {
    title: '数据类别',
    dataIndex: 'regionFld',
    resizable: true,
  },
  {
    title: '拥有者',
    dataIndex: 'owner',
    resizable: true,
  },
  {
    title: '数据类型',
    dataIndex: 'dataType',
    resizable: true,
  },
  {
    title: '标志位',
    dataIndex: 'dataFlag',
    resizable: true,
  },
  {
    title: '特定类型',
    dataIndex: 'isSpecialModel',
    resizable: true,
  },
  {
    title: '特定银行',
    dataIndex: 'isSpecialOrg',
    resizable: true,
  },
  {
    title: '特定文件',
    dataIndex: 'isSpecialFile',
    resizable: true,
  },
  {
    title: '字段名称',
    dataIndex: 'dataNameEng',
    resizable: true,
  },
  {
    title: '启用标志',
    dataIndex: 'ifToUse',
    resizable: true,
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    resizable: true,
  }
];

const dataSource = ref<RecordItem[]>([]);

const [registerTable] = useTable({
  columns,
  dataSource,
  loading: tableLoading,
  pagination,
  bordered: true,
  size: 'small',
  canColDrag: true,
  showTableSetting: true,
  canResize: true,
  minHeight: 300,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: false, 
    fullScreen: false,
    cacheKey: 'file-config-table'
  }
});

// 页面初始化时调用接口
onMounted(() => {
  fetchDataList();
});

// 获取数据列表
const fetchDataList = async () => {
  try {
    tableLoading.value = true;

    const params = {
    //  id:query.errorId,
      ...searchForm,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const response = await configFileListApi(params);

    if (response) {
      dataSource.value = response.records || [];
      pagination.total = response.total || 0;
      pagination.current = response.current || 1;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取数据列表失败:', error);
    message.error('获取数据失败');
    dataSource.value = [];
    pagination.total = 0;
  } finally {
    tableLoading.value = false;
  }
};

// 处理表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchDataList();
};

// 获取区域字段颜色
const getRegionColor = (regionFld: number): string => {
  const colorMap: Record<number, string> = {
    0: 'blue',
    1: 'green',
    2: 'orange'
  };
  return colorMap[regionFld] || 'default';
};

// 获取区域字段文本
const getRegionText = (regionFld: number): string => {
  const textMap: Record<number, string> = {
    0: '标准数据',
    1: '别名',
    2: '查询'
  };
  return textMap[regionFld] || '未知';
};

// 获取数据标志颜色
const getDataFlagColor = (dataFlag: string): string => {
  const colorMap: Record<string, string> = {
    '银行客户': 'green',
    '非银行客户': 'blue'
  };
  return colorMap[dataFlag] || 'default';
};

// 获取数据标志文本
const getDataFlagText = (dataFlag: string): string => {
  return dataFlag || '未知';
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  fetchDataList();
};

// 重置
const handleReset = () => {
  searchForm.metaData = '';
  searchForm.alias = '';
  pagination.current = 1;
  fetchDataList();
};

// 添加
const handleAdd = () => {
  isEditMode.value = false;
  drawerTitle.value = '添加数据';
  drawerVisible.value = true;

  // 重置表单数据
  Object.assign(formData, {
    id: undefined,
    regionFld: 0,
    metaData: '',
    dataFlag: '',
    isSpecialModel: 0,
    isSpecialOrg: 0,
    isSpecialFile: 0,
    dataType: '',
    dataNameEng: '',
    ifToUnify: 0,
    ifToUse: 0,
    alias: ''
  });
};

// 修改
const handleEdit = (record: RecordItem) => {
  isEditMode.value = true;
  drawerTitle.value = '修改别名';
  drawerVisible.value = true;

  // 填充表单数据，但编辑模式下只能修改别名
  Object.assign(formData, {
    id: record.id,
    regionFld: record.regionFld,
    metaData: record.metaData,
    dataFlag: record.dataFlag,
    isSpecialModel: record.isSpecialModel,
    isSpecialOrg: record.isSpecialOrg,
    isSpecialFile: record.isSpecialFile,
    dataType: record.dataType,
    dataNameEng: record.dataNameEng,
    ifToUnify: record.ifToUnify,
    ifToUse: record.ifToUse,
    alias: record.alias
  });
};

// 删除
const handleDelete = (record: RecordItem) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除这条记录吗？`,
    okType: 'danger',
    onOk: async () => {
      try {
        // 这里调用删除接口（如果需要删除功能）
        message.success('删除成功');
        fetchDataList();
      } catch (error) {
        message.error('删除失败');
      }
    }
  });
};

// 关闭抽屉
const handleDrawerClose = () => {
  drawerVisible.value = false;
  formRef.value?.clearValidate();
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    if (isEditMode.value) {
      // 编辑模式：只提交别名
      const updateData = {
        id: formData.id,
        alias: formData.alias
      };
      const response = await updateConfigFileApi(updateData);

      if (response) {
        drawerVisible.value = false;
        fetchDataList();
      } else {
        message.error(response.message || '修改失败');
      }
    } else {
      // 添加模式：提交所有字段
      const response = await addConfigFileApi(formData);
      if (response) {
        drawerVisible.value = false;
        fetchDataList();
      } else {
        message.error(response.message || '添加失败');
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};
</script>
