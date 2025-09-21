<template>
  <!-- 搜索卡片 -->
  <a-card class="search-card">
    <a-form class="search-form" :model="formState">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item label="涉案人种类" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
            <a-select v-model:value="formState.involvedKind" placeholder="请选择涉案人种类">
              <a-select-option
                  v-for="item in props.involvedKindOptions"
                  :key="item.value"
                  :value="item.value"
              >
                {{item.label}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="涉案人" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-input v-model:value="formState.involvedName" placeholder="请输入涉案人姓名"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :wrapper-col="{ offset: 2, span: 22 }">
            <a-button type="primary" @click="onSearch">查询</a-button>
            <a-button class="ml2" @click="resetSearch">重置</a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-card>

  <!-- 表格部分 -->
  <a-table :columns="columns" :data-source="dataSource" :loading="tableLoading" bordered>
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ index + 1 }}
      </template>
      <template v-if="column.dataIndex === 'type'">
        <a-tag :color="getTypeColor(record.type)">
          {{ getTypeText(record.type) }}
        </a-tag>
      </template>
      <template v-if="column.dataIndex === 'involvedKind'">
        <a-tag :color="getTypeColor(record.type)">
          {{ getStatusText(record.involvedKind) }}
        </a-tag>
      </template>
      <template v-if="column.dataIndex === 'relationCount'">
        <span :style="{ color: record.relationCount > 0 ? '#1890ff' : '#999' }">
          {{ record.relationCount }}
        </span>
      </template>
      <template v-if="column.key === 'operation'">
        <div class="table-operations">
          <a-button size="small" type="primary" @click="adjustRelation(record)">调整关系</a-button>
          <a-button class="ml1" size="small" type="primary" @click="viewDetails(record)">关系</a-button>
          <a-button class="ml1" size="small" type="primary" @click="showPersonDetail(record)">涉案人详情</a-button>
        </div>
      </template>
    </template>
  </a-table>

  <!-- 调整关系弹窗 -->
  <a-modal v-model:visible="adjustModalVisible" title="调整关系" @ok="handleAdjustOk" :confirm-loading="adjustConfirmLoading">
    <a-form :model="adjustFormState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="关系" required>
        <a-select v-model:value="adjustFormState.involvedKind" placeholder="请选择关系">
          <a-select-option
              v-for="item in props.involvedKindOptions"
              :key="item.value"
              :value="item.value"
          >
            {{item.label}}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 查看详情弹窗 -->
  <a-modal v-model:visible="detailModalVisible" title="涉案人关系" width="800px" :footer="null">
    <a-card>
      <h3>涉案人【{{ currentRecord.involvedName }}】相关方关系：</h3>
      <a-button type="primary" class="add-btn" @click="addNewRelation">新增关系</a-button>
      <a-table :columns="detailColumns" :data-source="detailData" bordered class="relation-table" :pagination="false">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'involvedName'">
            {{ currentRecord.involvedName }}
          </template>
          <template v-if="column.key === 'relatedPersonCode'">
            <div class="editable-cell">
              <div v-if="!record.editing" class="editable-cell-value-wrap">
                {{ getRelatedPersonText(record.relatedPersonCode) }}
              </div>
              <a-select v-else v-model:value="record.relatedPersonCode" style="width: 100%">
                <a-select-option
                    v-for="item in relatedPersonList"
                    :key="item.value"
                    :value="item.value"
                >
                  {{item.label}}
                </a-select-option>
              </a-select>
            </div>
          </template>
          <template v-if="column.key === 'relation'">
            <div class="editable-cell">
              <div v-if="!record.editing" class="editable-cell-value-wrap">
                {{ getRelatedText(record.relation) }}
              </div>
              <a-select v-else v-model:value="record.relation" style="width: 100%">
                <a-select-option
                    v-for="item in props.involvedRelateOptions"
                    :key="item.value"
                    :value="item.value"
                >
                  {{item.label}}
                </a-select-option>
              </a-select>
            </div>
          </template>
          <template v-if="column.key === 'operation'">
            <template v-if="!record.editing">
              <a-button size="small" @click="editRelation(record)">修改</a-button>
              <a-button class="ml1" size="small" type="primary" danger @click="deleteRelation(record)">删除</a-button>
            </template>
            <template v-else>
              <a-button size="small" type="primary" @click="saveRelation(record)">保存</a-button>
              <a-button class="ml1" size="small" @click="cancelEdit(record)">取消</a-button>
            </template>
          </template>
        </template>
      </a-table>
    </a-card>
  </a-modal>
  <!-- 企业详情抽屉 -->
  <a-drawer
      v-model:visible="companyDrawerVisible"
      title="企业详情"
      width="700px"
      placement="right"
  >
    <a-card v-if="currentCompanyDetail">
      <h3>企业基本信息</h3>
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="营业执照">{{ currentCompanyDetail.enterpriseLicenseNum || '-' }}</a-descriptions-item>
        <a-descriptions-item label="法人">{{ currentCompanyDetail.enterpriseLegalPersonName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="证件种类">{{ getTdTypeDesc(currentCompanyDetail.idType)}}</a-descriptions-item>
        <a-descriptions-item label="证件号">{{ currentCompanyDetail.idNum || '-' }}</a-descriptions-item>
        <a-descriptions-item label="电话">{{ currentCompanyDetail.teleNum || '-' }}</a-descriptions-item>
      </a-descriptions>

      <h3 style="margin-top: 20px;">人物关系信息</h3>
      <div v-for="(relation, index) in currentCompanyDetail.relationPersons" :key="index">
        <p>和 {{ relation.name }} - {{ relation.type }}</p>
      </div>

      <h3 style="margin-top: 20px;">账户信息</h3>
      <div v-for="(account, index) in currentCompanyDetail.accounts" :key="index">
        <p><strong>{{ account.bank }}</strong></p>
        <p v-for="(item, idx) in account.items" :key="idx" style="margin-left: 20px;">
          {{ item.type }} {{ item.number }}
        </p>
      </div>
    </a-card>
    <a-skeleton v-else active />
  </a-drawer>

  <!-- 个人详情抽屉 -->
  <a-drawer
      v-model:visible="personDrawerVisible"
      title="个人详情"
      width="700px"
      placement="right"
  >
    <a-card v-if="currentPersonDetail">
      <h3>人员基本信息</h3>
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="证件种类">{{ getTdTypeDesc(currentPersonDetail.idType)}}</a-descriptions-item>
        <a-descriptions-item label="证件号">{{ currentPersonDetail.idNum || '-' }}</a-descriptions-item>
        <a-descriptions-item label="电话">{{ currentPersonDetail.teleNum || '-' }}</a-descriptions-item>
      </a-descriptions>

      <h3 style="margin-top: 20px;">人物关系信息</h3>
      <div v-for="(relation, index) in currentPersonDetail.relationPersons" :key="index">
        <p>和 {{ relation.name }} - {{ relation.type }}</p>
      </div>

      <h3 style="margin-top: 20px;">账户信息</h3>
      <div v-for="(account, index) in currentPersonDetail.relationPersons" :key="index">
        <p><strong>{{ account.bank }}</strong></p>
        <p v-for="(item, idx) in account.items" :key="idx" style="margin-left: 20px;">
          {{ item.type }} {{ item.number }}
        </p>
      </div>
    </a-card>
    <a-skeleton v-else active />
  </a-drawer>
</template>

<script lang="ts" name="tab1" setup>
import {ref, reactive, onMounted, defineProps} from 'vue';
import { message } from 'ant-design-vue';
import { useRoute } from "vue-router";
import {
  involvedPersonListApi,
  updatePersonRelationApi,
  getInvolvedRelationApi,
  getInvolvedPersonApi,
  updateInvolvedPersonApi,
  getCompanyOrPersonDetailApi
} from "@/views/fund/analysis/user.api";

const { query } = useRoute();
const formState = reactive({
  involvedKind: undefined,
  involvedName: ''
});
interface Props {
  involvedRelateOptions: Array<{value: string, label: string}>;
  involvedKindOptions: Array<{value: string, label: string}>;
  idCardTypeOptions: Array<{value: string, label: string}>;


}

const props = defineProps<Props>();
const tableLoading = ref(false);
const searchLoading = ref(false);
// 调整关系弹窗相关状态
const adjustModalVisible = ref(false);
const adjustConfirmLoading = ref(false);

const relatedPersonList = ref([]);

const adjustFormState = reactive({
  id: "",
  involvedKind: "",
  involvedName: "",
  involvedKindCode: 0
});

// 查看详情弹窗相关状态
const detailModalVisible = ref(false);
const currentRecord = reactive({});
const detailData = ref([]);
// 添加详情抽屉相关状态
const companyDrawerVisible = ref(false);
const personDrawerVisible = ref(false);
const currentCompanyDetail = ref(null);
const currentPersonDetail = ref(null);

const detailColumns = ref([
  {
    title: '序号',
    key: 'index',
    width: 100,
  },
  {
    title: '相关方',
    dataIndex: 'involvedName',
    key: 'involvedName',
    width: 200,
  },
  {
    title: '关系',
    dataIndex: 'relation',
    key: 'relation',
    width: 150,
  },
  {
    title: '相关方',
    dataIndex: 'relatedPersonCode',
    key: 'relatedPersonCode',
    width: 200,
  },
  {
    title: '操作',
    key: 'operation',
    width: 150,
  }
]);

const columns = ref([
  {
    title: '序号',
    key: 'index',
    width: 80,
  },
  {
    title: '涉案人种类',
    dataIndex: 'involvedKind',
    width: 120,
  },
  {
    title: '涉案人',
    dataIndex: 'involvedName',
    width: 200,
  },
  {
    title: '关系数量',
    dataIndex: 'relationCount',
    key: 'relationCount',
    width: 100,
  },
  {
    title: '操作',
    key: 'operation',
    width: 200,
  }
]);

const dataSource = ref([]);

// 页面初始化时调用接口
onMounted(() => {
  fetchInvolvedList();
});

// 获取涉案人列表
const fetchInvolvedList = async () => {
  try {
    tableLoading.value = true;

    const params = {
      caseId: query.caseId,
     // involvedName: formState.involvedName,
     // involvedKind: formState.involvedKind,
    };

    const response = await involvedPersonListApi(params);
    dataSource.value = response;
  } catch (error) {
  } finally {
    tableLoading.value = false;
    searchLoading.value = false;
  }
};

const onSearch = () => {
  fetchInvolvedList()
};

const adjustRelation = (record) => {
  Object.assign(adjustFormState, record);
  adjustModalVisible.value = true;
};

const handleAdjustOk = () => {
  adjustConfirmLoading.value = true;

  const params = {
    id: adjustFormState.id,
    involvedKindCode: Number(adjustFormState.involvedKind),
  };

  updatePersonRelationApi(params).then(() => {
    adjustConfirmLoading.value = false;
    adjustModalVisible.value = false;
    fetchInvolvedList();
  }).catch(() => {
    adjustConfirmLoading.value = false;
    message.error('调整失败');
  })
};

// 添加显示涉案人详情的方法
const showPersonDetail = async (record) => {
  try {
    const response = await getCompanyOrPersonDetailApi({ involvedId: record.id });
    const {customerType} = response // 1企业 2个人
    if(customerType == 1){
      currentCompanyDetail.value = response;
      companyDrawerVisible.value = true;
    }else if(customerType == 2){
      currentPersonDetail.value = response;
      personDrawerVisible.value = true;
    }
  } catch (error) {
    message.error('获取详情失败');
  }
};

// getInvolvedPersonApi
const getRelationPersonListByInvolvedId = (record) => {
  const params = {
    involvedId: record.id,
  };
  getInvolvedPersonApi(params).then((res) => {
    // 为每条数据添加编辑状态和原始数据备份
    relatedPersonList.value = res || []
  }).catch(() => {
  })
};


const viewDetails = (record) => {
  if(relatedPersonList.value.length == 0){ // 查询关联的涉案人的关联人下拉选
    getRelationPersonListByInvolvedId(record)
  }
  Object.assign(currentRecord, record);
  const params = {
    involvedId: record.id,
  };

  getInvolvedRelationApi(params).then((res) => {
    // 为每条数据添加编辑状态和原始数据备份
    detailData.value = res.map((item, index) => ({
      ...item,
      index: index + 1,
      editing: false,
      originalData: { ...item }
    }));
    detailModalVisible.value = true;
  }).catch(() => {
    message.error('获取详情失败');
  })
};

const editRelation = (record) => {
  // 先取消其他正在编辑的行
  detailData.value.forEach(item => {
    if (item.editing && item.key !== record.key) {
      cancelEdit(item);
    }
  });

  record.editing = true;
};

const saveRelation = (record) => {
  // 验证数据
  if (!record.relatedPersonId || !record.relationCode) {
    message.error('请填写完整信息');
    return;
  }
  const params = {
    id: record.id,
    involvedId: currentRecord.id,
    relationCode: record.relationCode,
    relatedPersonId: record.relatedPersonId,
  };

  updateInvolvedPersonApi(params).then(() => {
    record.editing = false;
    fetchInvolvedList();
    detailModalVisible.value = false
  }).catch(() => {
    record.editing = false;
    detailModalVisible.value = false
  })

};

const cancelEdit = (record) => {
  // 恢复原始数据
  if (record.originalData) {
    Object.assign(record, record.originalData);
  }
  record.editing = false;
};

const deleteRelation = (record) => {
  // 模拟删除关系
  detailData.value = detailData.value.filter(item => item.key !== record.key);
  message.success('删除成功');
};

const addNewRelation = () => {
  const newRecord = {
    key: `${Date.now()}`,
    index: detailData.value.length + 1,
    involvedName: '',
    relatedPerson: '',
    relation: '请选择关系',
    editing: true,
    originalData: null
  };

  detailData.value.push(newRecord);
};

const getTypeColor = (type) => {
  const colors = {
    victim: 'green',
    suspect: 'red',
    other: 'orange'
  };
  return colors[type] || 'default';
};

const getTypeText = (type) => {
  const texts = {
    victim: '受害人',
    suspect: '嫌疑人',
    other: '其他人'
  };
  return texts[type] || '未知';
};

const resetSearch = () => {
  formState.involvedKind = undefined;
  formState.involvedName = '';
  fetchInvolvedList()
};
// 状态文本 - 从fileProcessOptions中获取
const getStatusText = (statusValue) => {
  if (!props.involvedKindOptions || !Array.isArray(props.involvedKindOptions)) {
    return '未知';
  }
  const option = props.involvedKindOptions.find(opt => opt.value === statusValue);
  return option ? option.label : '未知';
};

const getTdTypeDesc = (statusValue) => {
  if (!props.idCardTypeOptions || !Array.isArray(props.idCardTypeOptions)) {
    return '未知';
  }
  const option = props.idCardTypeOptions.find(opt => opt.value === statusValue);
  return option ? option.label : '未知';
};


// 状态文本 - 从fileProcessOptions中获取
const getRelatedText = (statusValue) => {
  if (!props.involvedRelateOptions || !Array.isArray(props.involvedRelateOptions)) {
    return '未知';
  }
  const option = props.involvedRelateOptions.find(opt => opt.value === statusValue);
  return option ? option.label : '未知';
};

const getRelatedPersonText = (statusValue) => {
  if (!relatedPersonList.value || !Array.isArray(relatedPersonList)) {
    return '未知';
  }
  const option = relatedPersonList.value.find(opt => opt.value === statusValue);
  return option ? option.label : '未知';
};


</script>

<style scoped>
.search-form :deep(label) {
  width: 100%;
}

.search-form :deep(.ant-form-item-control) {
  width: 100%;
}

.search-form :deep(.ant-input) {
  width: 100%;
}

.search-form :deep(.ant-select) {
  width: 100%;
}

.ml1 {
  margin-left: 8px;
}

.ml2 {
  margin-left: 16px;
}

.add-btn {
  margin-bottom: 16px;
}

.editable-cell {
  position: relative;
}

.editable-cell-value-wrap {
  padding: 5px 12px;
  cursor: pointer;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.editable-cell-value-wrap:hover {
  border: 1px dashed #d9d9d9;
  border-radius: 2px;
}
</style>