<template>
  <!-- 标准数据-筛选 -->
  <a-card class="m2" title='标准数据-筛选'>
    <!-- 动态查询组件 -->
    <div class="dynamic-query">
      <div class="query-actions">
        <a-button type="primary" @click="addRootCondition" class="add-root-btn">
          <template #icon><PlusOutlined /></template>
          添加组
        </a-button>
        <a-button @click="resetConditions" class="action-btn">
          <template #icon><ReloadOutlined /></template>
          重置条件
        </a-button>

        <!-- 保存筛选条件区域 -->
        <div class="save-condition-area" v-if="saveMode">
          <a-input
              v-model:value="conditionName"
              placeholder="输入筛选条件名称"
              style="width: 200px; margin-right: 8px;"
              @pressEnter="saveFilterCondition"
          />
          <a-button type="primary" @click="saveFilterCondition" class="action-btn">
            确认保存
          </a-button>
        </div>

        <a-button
            type="dashed"
            @click="saveMode = !saveMode"
            class="action-btn"
            :disabled="rootConditions.length === 0"
        >
          <template #icon><SaveOutlined /></template>
          {{ saveMode ? '取消保存' : '保存筛选条件' }}
        </a-button>

        <!-- 已保存条件下拉选 -->
        <a-select
            v-model:value="selectedSavedCondition"
            placeholder="选择已保存的条件"
            style="width: 200px;"
            allowClear
            @change="loadSavedCondition"
            :options="savedConditions.map(item => ({label: item.name, value: item.id}))"
        />

        <a-button type="primary" @click="onSearch" :loading="searchLoading" class="action-btn search-btn">
          <template #icon><SearchOutlined /></template>
          查询
        </a-button>
      </div>

      <div class="conditions-container">
        <div class="conditions-header">
          <div class="header-item">级数</div>
          <div class="header-item">关系</div>
          <div class="header-item">字段</div>
          <div class="header-item">逻辑</div>
          <div class="header-item">值</div>
          <div class="header-item">操作</div>
        </div>

        <div class="conditions-body" v-if="rootConditions.length > 0">
          <div v-for="(condition, index) in rootConditions" :key="condition.id" class="condition-group">
            <!-- 条件组标题和操作 -->
            <div class="group-header">
              <div class="group-title">条件组 {{ index + 1 }}</div>
              <div class="group-actions">
                <a-button type="link" size="small" danger @click="removeCondition(condition.id)" class="delete-btn">
                  <template #icon><DeleteOutlined /></template>
                  删除组
                </a-button>
              </div>
            </div>

            <!-- 条件行 -->
            <div class="condition-row">
              <div class="condition-cell level-cell">
                <span class="level-badge">第1级</span>
              </div>
              <div class="condition-cell">
                <a-select
                    v-model:value="condition.relation"
                    :options="relationOptions"
                    placeholder="选择关系"
                    style="width: 100%"
                    @change="(value) => updateCondition(condition.id, { relation: value })"
                />
              </div>
              <div class="condition-cell">
                <a-select
                    v-model:value="condition.field"
                    :options="fieldOptions"
                    placeholder="选择字段"
                    style="width: 100%"
                    allowClear
                    @change="(value) => updateCondition(condition.id, { field: value })"
                />
              </div>
              <div class="condition-cell">
                <a-select
                    v-model:value="condition.operator"
                    :options="operatorOptions"
                    placeholder="选择逻辑"
                    style="width: 100%"
                    allowClear
                    @change="(value) => updateCondition(condition.id, { operator: value })"
                />
              </div>
              <div class="condition-cell">
                <a-input
                    v-if="!isIntervalOperator(condition.operator)"
                    v-model:value="condition.value"
                    placeholder="输入值"
                    allowClear
                    @change="(e) => updateCondition(condition.id, { value: e.target.value })"
                />
                <a-date-picker
                    v-else
                    v-model:value="condition.value"
                    showTime
                    style="width: 100%"
                    placeholder="选择日期时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    @change="(value) => updateCondition(condition.id, { value })"
                />
              </div>
              <div class="condition-cell actions-cell">
                <a-button type="link" size="small" @click="addSubCondition(condition.id, 2)" class="add-sub-btn">
                  <template #icon><PlusCircleOutlined /></template>
                  添加子条件
                </a-button>
                <a-button type="link" size="small" danger @click="removeCondition(condition.id)" class="delete-btn">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </div>
            </div>

            <!-- 子条件递归渲染 - 直接写在模板中 -->
            <template v-if="condition.subConditions && condition.subConditions.length > 0">
              <div v-for="subCondition in condition.subConditions" :key="subCondition.id" class="sub-condition-group">
                <!-- 第2级子条件 -->
                <div class="sub-condition-wrapper">
                  <div class="condition-row">
                    <div class="condition-cell level-cell">
                      <span class="level-badge">第2级</span>
                    </div>
                    <div class="condition-cell">
                      <a-select
                          v-model:value="subCondition.relation"
                          :options="relationOptions"
                          placeholder="选择关系"
                          style="width: 100%"
                          @change="(value) => updateCondition(subCondition.id, { relation: value })"
                      />
                    </div>
                    <div class="condition-cell">
                      <a-select
                          v-model:value="subCondition.field"
                          :options="fieldOptions"
                          placeholder="选择字段"
                          style="width: 100%"
                          allowClear
                          @change="(value) => updateCondition(subCondition.id, { field: value })"
                      />
                    </div>
                    <div class="condition-cell">
                      <a-select
                          v-model:value="subCondition.operator"
                          :options="operatorOptions"
                          placeholder="选择逻辑"
                          style="width: 100%"
                          allowClear
                          @change="(value) => updateCondition(subCondition.id, { operator: value })"
                      />
                    </div>
                    <div class="condition-cell">
                      <a-input
                          v-if="!isIntervalOperator(subCondition.operator)"
                          v-model:value="subCondition.value"
                          placeholder="输入值"
                          allowClear
                          @change="(e) => updateCondition(subCondition.id, { value: e.target.value })"
                      />
                      <a-date-picker
                          v-else
                          v-model:value="subCondition.value"
                          showTime
                          style="width: 100%"
                          placeholder="选择日期时间"
                          format="YYYY-MM-DD HH:mm:ss"
                          @change="(value) => updateCondition(subCondition.id, { value })"
                      />
                    </div>
                    <div class="condition-cell actions-cell">
                      <a-button type="link" size="small" @click="addSubCondition(subCondition.id, 3)" class="add-sub-btn">
                        <template #icon><PlusCircleOutlined /></template>
                        添加子条件
                      </a-button>
                      <a-button type="link" size="small" danger @click="removeCondition(subCondition.id)" class="delete-btn">
                        <template #icon><DeleteOutlined /></template>
                        删除
                      </a-button>
                    </div>
                  </div>

                  <!-- 第3级子条件 -->
                  <template v-if="subCondition.subConditions && subCondition.subConditions.length > 0">
                    <div v-for="subCondition3 in subCondition.subConditions" :key="subCondition3.id" class="sub-condition-wrapper">
                      <div class="condition-row">
                        <div class="condition-cell level-cell">
                          <span class="level-badge">第3级</span>
                        </div>
                        <div class="condition-cell">
                          <a-select
                              v-model:value="subCondition3.relation"
                              :options="relationOptions"
                              placeholder="选择关系"
                              style="width: 100%"
                              @change="(value) => updateCondition(subCondition3.id, { relation: value })"
                          />
                        </div>
                        <div class="condition-cell">
                          <a-select
                              v-model:value="subCondition3.field"
                              :options="fieldOptions"
                              placeholder="选择字段"
                              style="width: 100%"
                              allowClear
                              @change="(value) => updateCondition(subCondition3.id, { field: value })"
                          />
                        </div>
                        <div class="condition-cell">
                          <a-select
                              v-model:value="subCondition3.operator"
                              :options="operatorOptions"
                              placeholder="选择逻辑"
                              style="width: 100%"
                              allowClear
                              @change="(value) => updateCondition(subCondition3.id, { operator: value })"
                          />
                        </div>
                        <div class="condition-cell">
                          <a-input
                              v-if="!isIntervalOperator(subCondition3.operator)"
                              v-model:value="subCondition3.value"
                              placeholder="输入值"
                              allowClear
                              @change="(e) => updateCondition(subCondition3.id, { value: e.target.value })"
                          />
                          <a-date-picker
                              v-else
                              v-model:value="subCondition3.value"
                              showTime
                              style="width: 100%"
                              placeholder="选择日期时间"
                              format="YYYY-MM-DD HH:mm:ss"
                              @change="(value) => updateCondition(subCondition3.id, { value })"
                          />
                        </div>
                        <div class="condition-cell actions-cell">
                          <a-button type="link" size="small" @click="addSubCondition(subCondition3.id, 4)" class="add-sub-btn">
                            <template #icon><PlusCircleOutlined /></template>
                            添加子条件
                          </a-button>
                          <a-button type="link" size="small" danger @click="removeCondition(subCondition3.id)" class="delete-btn">
                            <template #icon><DeleteOutlined /></template>
                            删除
                          </a-button>
                        </div>
                      </div>

                      <!-- 第4级子条件 -->
                      <template v-if="subCondition3.subConditions && subCondition3.subConditions.length > 0">
                        <div v-for="subCondition4 in subCondition3.subConditions" :key="subCondition4.id" class="sub-condition-wrapper">
                          <div class="condition-row">
                            <div class="condition-cell level-cell">
                              <span class="level-badge">第4级</span>
                            </div>
                            <div class="condition-cell">
                              <a-select
                                  v-model:value="subCondition4.relation"
                                  :options="relationOptions"
                                  placeholder="选择关系"
                                  style="width: 100%"
                                  @change="(value) => updateCondition(subCondition4.id, { relation: value })"
                              />
                            </div>
                            <div class="condition-cell">
                              <a-select
                                  v-model:value="subCondition4.field"
                                  :options="fieldOptions"
                                  placeholder="选择字段"
                                  style="width: 100%"
                                  allowClear
                                  @change="(value) => updateCondition(subCondition4.id, { field: value })"
                              />
                            </div>
                            <div class="condition-cell">
                              <a-select
                                  v-model:value="subCondition4.operator"
                                  :options="operatorOptions"
                                  placeholder="选择逻辑"
                                  style="width: 100%"
                                  allowClear
                                  @change="(value) => updateCondition(subCondition4.id, { operator: value })"
                              />
                            </div>
                            <div class="condition-cell">
                              <a-input
                                  v-if="!isIntervalOperator(subCondition4.operator)"
                                  v-model:value="subCondition4.value"
                                  placeholder="输入值"
                                  allowClear
                                  @change="(e) => updateCondition(subCondition4.id, { value: e.target.value })"
                              />
                              <a-date-picker
                                  v-else
                                  v-model:value="subCondition4.value"
                                  showTime
                                  style="width: 100%"
                                  placeholder="选择日期时间"
                                  format="YYYY-MM-DD HH:mm:ss"
                                  @change="(value) => updateCondition(subCondition4.id, { value })"
                              />
                            </div>
                            <div class="condition-cell actions-cell">
                              <a-button type="link" size="small" @click="addSubCondition(subCondition4.id, 5)" class="add-sub-btn">
                                <template #icon><PlusCircleOutlined /></template>
                                添加子条件
                              </a-button>
                              <a-button type="link" size="small" danger @click="removeCondition(subCondition4.id)" class="delete-btn">
                                <template #icon><DeleteOutlined /></template>
                                删除
                              </a-button>
                            </div>
                          </div>

                          <!-- 第5级子条件 -->
                          <template v-if="subCondition4.subConditions && subCondition4.subConditions.length > 0">
                            <div v-for="subCondition5 in subCondition4.subConditions" :key="subCondition5.id" class="sub-condition-wrapper">
                              <div class="condition-row">
                                <div class="condition-cell level-cell">
                                  <span class="level-badge">第5级</span>
                                </div>
                                <div class="condition-cell">
                                  <a-select
                                      v-model:value="subCondition5.relation"
                                      :options="relationOptions"
                                      placeholder="选择关系"
                                      style="width: 100%"
                                      @change="(value) => updateCondition(subCondition5.id, { relation: value })"
                                  />
                                </div>
                                <div class="condition-cell">
                                  <a-select
                                      v-model:value="subCondition5.field"
                                      :options="fieldOptions"
                                      placeholder="选择字段"
                                      style="width: 100%"
                                      allowClear
                                      @change="(value) => updateCondition(subCondition5.id, { field: value })"
                                  />
                                </div>
                                <div class="condition-cell">
                                  <a-select
                                      v-model:value="subCondition5.operator"
                                      :options="operatorOptions"
                                      placeholder="选择逻辑"
                                      style="width: 100%"
                                      allowClear
                                      @change="(value) => updateCondition(subCondition5.id, { operator: value })"
                                  />
                                </div>
                                <div class="condition-cell">
                                  <a-input
                                      v-if="!isIntervalOperator(subCondition5.operator)"
                                      v-model:value="subCondition5.value"
                                      placeholder="输入值"
                                      allowClear
                                      @change="(e) => updateCondition(subCondition5.id, { value: e.target.value })"
                                  />
                                  <a-date-picker
                                      v-else
                                      v-model:value="subCondition5.value"
                                      showTime
                                      style="width: 100%"
                                      placeholder="选择日期时间"
                                      format="YYYY-MM-DD HH:mm:ss"
                                      @change="(value) => updateCondition(subCondition5.id, { value })"
                                  />
                                </div>
                                <div class="condition-cell actions-cell">
                                  <a-button type="link" size="small" disabled class="add-sub-btn">
                                    <template #icon><PlusCircleOutlined /></template>
                                    最多5级
                                  </a-button>
                                  <a-button type="link" size="small" danger @click="removeCondition(subCondition5.id)" class="delete-btn">
                                    <template #icon><DeleteOutlined /></template>
                                    删除
                                  </a-button>
                                </div>
                              </div>
                            </div>
                          </template>
                        </div>
                      </template>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div v-else class="empty-state">
          <a-empty description="暂无查询条件，请添加根条件" />
        </div>
      </div>
    </div>
  </a-card>

  <!-- 表格部分 -->
  <a-table
      class="m2"
      :columns="columns"
      :data-source="dataSource"
      :scroll="{ x: 1500 }"
      :loading="tableLoading"
      :row-selection="rowSelection"
      :pagination="pagination"
      bordered
      @change="handleTableChange"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" name="intelligent" setup>
import { SaveOutlined } from '@ant-design/icons-vue';
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  PlusCircleOutlined
} from '@ant-design/icons-vue';

// 引入相关样式
import '@vue-office/excel/lib/index.css'
import {
  intelligentTableListApi
} from './../user.api'

// ts语法
import { useRoute } from 'vue-router';
import { useRouter } from "vue-router";

const router = useRouter();
const { query } = useRoute();

const formRef = ref();
const tableLoading = ref(false);
const searchLoading = ref(false);

// 选中的行数据
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
// 新增状态管理
const saveMode = ref(false);
const conditionName = ref('');
const savedConditions = ref<Array<{id: string, name: string, conditions: Condition[]}>>([]);
const selectedSavedCondition = ref<string>('');

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 表格列配置
const columns = ref([
  {
    title: '序号',
    key: 'index',
    width: 80,
    align: 'center'
  },
  {
    title: '源文件',
    dataIndex: 'sourceFile',
    width: 200,
    ellipsis: true
  },
  {
    title: '文件夹',
    dataIndex: 'folder',
    key: 'folder',
    width: 150,
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'center'
  },
  {
    title: '所属机构',
    dataIndex: 'organization',
    width: 80,
    align: 'center'
  },
  {
    title: '返回信息',
    dataIndex: 'returnInfo',
    width: 150,
    ellipsis: true
  },
  {
    title: '上传时间',
    dataIndex: 'uploadTime',
    width: 150,
    align: 'center'
  },
  {
    title: '成功时间',
    dataIndex: 'successTime',
    width: 150,
    align: 'center'
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 180,
    align: 'center'
  }
]);

const dataSource = ref([]);

// 行选择配置
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (selectedKeys: string[], selectedRows: any[]) => {
      selectedRowKeys.value = selectedKeys;
      selectedRows.value = selectedRows;
    },
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
      if (selected) {
        selectedRowKeys.value = selectedRows.map(row => row.id);
      } else {
        selectedRowKeys.value = [];
      }
    }
  };
});

// 动态查询组件相关逻辑
// 关系枚举
const relationOptions = [
  { label: '与', value: 'and' },
  { label: '或', value: 'or' },
  { label: '非', value: 'not' }
];

// 逻辑运算符枚举
const operatorOptions = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'ne' },
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'ge' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'le' },
  { label: '间隔小于', value: 'interval_lt' },
  { label: '间隔大于', value: 'interval_gt' }
];

// 模拟字段枚举值（实际应从接口获取）
const fieldOptions = ref([
  { label: '文件名', value: 'fileName' },
  { label: '文件大小', value: 'fileSize' },
  { label: '创建时间', value: 'createTime' },
  { label: '修改时间', value: 'modifyTime' },
  { label: '文件类型', value: 'fileType' },
  { label: '上传者', value: 'uploader' }
]);

// 条件数据结构
interface Condition {
  id: string;
  relation: string; // 与/或/非
  field: string; // 字段
  operator: string; // 逻辑运算符
  value: string; // 值
  subConditions: Condition[]; // 子条件
}

// 根条件列表
const rootConditions = ref<Condition[]>([]);

// 判断是否为间隔运算符
const isIntervalOperator = (operator: string) => {
  return operator === 'interval_lt' || operator === 'interval_gt';
};

// 生成唯一ID
const generateId = () => {
  return `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 添加根条件
const addRootCondition = () => {
  if (rootConditions.value.length >= 5) {
    message.warning('最多只能添加5个根条件');
    return;
  }

  rootConditions.value.push({
    id: generateId(),
    relation: 'and',
    field: '',
    operator: '',
    value: '',
    subConditions: []
  });
};

// 保存筛选条件
const saveFilterCondition = () => {
  if (!conditionName.value.trim()) {
    message.error('请输入筛选条件名称');
    return;
  }

  if (rootConditions.value.length === 0) {
    message.error('请至少添加一个查询条件');
    return;
  }

  // 校验条件完整性
  const validateConditions = (conditions: Condition[]): boolean => {
    for (const condition of conditions) {
      if (!condition.field || !condition.operator) {
        return false;
      }
      if (condition.subConditions && condition.subConditions.length > 0) {
        if (!validateConditions(condition.subConditions)) {
          return false;
        }
      }
    }
    return true;
  };

  if (!validateConditions(rootConditions.value)) {
    message.error('请完善所有条件配置（字段和逻辑运算符必填）');
    return;
  }

  const newCondition = {
    name: conditionName.value,
    conditionJson: JSON.parse(JSON.stringify(rootConditions.value)) // 深拷贝
  };

  savedConditions.value.push(newCondition);
  conditionName.value = '';
  saveMode.value = false;

  console.info('筛选条件json',newCondition)
  // todo 保存筛选条件
  message.success('筛选条件保存成功');
};

// 加载已保存的条件
const loadSavedCondition = (conditionId: string) => {
  const condition = savedConditions.value.find(item => item.id === conditionId);
  if (condition) {
    rootConditions.value = JSON.parse(JSON.stringify(condition.conditions));
    message.success('筛选条件加载成功');
  }
};

// 取消保存
const cancelSave = () => {
  saveMode.value = false;
  conditionName.value = '';
};

// 修改添加子条件逻辑 - 添加具体的条件行
const addSubCondition = (parentId: string, level: number) => {
  if (level > 5) {
    message.warning('最多只能添加5级条件');
    return;
  }

  const findAndAddCondition = (conditions: Condition[]): boolean => {
    for (const condition of conditions) {
      if (condition.id === parentId) {
        if (!condition.subConditions) {
          condition.subConditions = [];
        }
        condition.subConditions.push({
          id: generateId(),
          relation: condition.subConditions.length === 0 ? 'and' : 'and', // 第一个子条件默认and
          field: '',
          operator: '',
          value: '',
          subConditions: []
        });
        return true;
      }

      if (condition.subConditions && condition.subConditions.length > 0) {
        const found = findAndAddCondition(condition.subConditions);
        if (found) return true;
      }
    }
    return false;
  };

  findAndAddCondition(rootConditions.value);
};

// 更新条件
const updateCondition = (conditionId: string, updates: Partial<Condition>) => {
  const findAndUpdate = (conditions: Condition[]): boolean => {
    for (const condition of conditions) {
      if (condition.id === conditionId) {
        Object.assign(condition, updates);
        return true;
      }

      if (condition.subConditions && condition.subConditions.length > 0) {
        const found = findAndUpdate(condition.subConditions);
        if (found) return true;
      }
    }
    return false;
  };

  findAndUpdate(rootConditions.value);
};


// 删除条件
const removeCondition = (conditionId: string) => {
  const findAndRemove = (conditions: Condition[]): boolean => {
    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i].id === conditionId) {
        conditions.splice(i, 1);
        return true;
      }

      if (conditions[i].subConditions && conditions[i].subConditions.length > 0) {
        const found = findAndRemove(conditions[i].subConditions);
        if (found) return true;
      }
    }
    return false;
  };

  findAndRemove(rootConditions.value);
};

// 重置条件
const resetConditions = () => {
  rootConditions.value = [];
};

// 页面初始化时调用接口
onMounted(() => {
  fetchIntelligentList();
});

// 获取智能筛选
const fetchIntelligentList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      caseId: query.caseId,
      ids: selectedRowKeys.value,
      conditionJson: JSON.stringify(rootConditions.value),
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const response = await intelligentTableListApi(params);
    console.info('接口响应数据:', response);

    if (response && response.records) {
      dataSource.value = response.records;
      pagination.total = response.total;
      pagination.current = response.current;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    message.error('获取数据失败');
  } finally {
    tableLoading.value = false;
    searchLoading.value = false;
  }
};

// 表格变化处理（分页、排序等）
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchIntelligentList();
};

// 搜索处理
const onSearch = () => {
  pagination.current = 1;
  searchLoading.value = true;
  fetchIntelligentList();
};

// 重置搜索
const resetSearch = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  selectedRowKeys.value = [];
  selectedRows.value = [];
  pagination.current = 1;
  fetchIntelligentList();
};
</script>

<style scoped>
.m2 {
  margin: 16px 0;
}

/* 动态查询组件样式 */
.dynamic-query {
  width: 100%;
}

.query-actions {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-root-btn {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

.add-root-btn:hover {
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
  transform: translateY(-1px);
}

.action-btn {
  border-radius: 6px;
  font-weight: 500;
}

.search-btn {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  border: none;
  box-shadow: 0 2px 4px rgba(82, 196, 26, 0.2);
}

.search-btn:hover {
  box-shadow: 0 4px 8px rgba(82, 196, 26, 0.3);
  transform: translateY(-1px);
}

.conditions-container {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.conditions-header {
  display: flex;
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
  border-bottom: 1px solid #e8e8e8;
  font-weight: 600;
}

.header-item {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  border-right: 1px solid #e8e8e8;
  color: #262626;
}

.header-item:last-child {
  border-right: none;
  flex: 0.8;
}

.conditions-body {
  background-color: #fff;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.condition-group {
  border-bottom: 1px solid #f0f0f0;
}

.condition-group:last-child {
  border-bottom: none;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
}

.group-title {
  font-weight: 600;
  color: #1890ff;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.condition-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  transition: background-color 0.2s;
}

.condition-row:hover {
  background-color: #fafafa;
}

.condition-cell {
  flex: 1;
  padding: 0 8px;
  border-right: 1px solid #f0f0f0;
}

.condition-cell:last-child {
  border-right: none;
  flex: 0.8;
}

.level-cell {
  flex: 0.5;
  text-align: center;
  font-weight: 500;
}

.level-badge {
  display: inline-block;
  padding: 4px 8px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  border-radius: 4px;
  font-size: 12px;
  color: #595959;
  border: 1px solid #d9d9d9;
}

.actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.add-sub-btn, .add-condition-btn {
  color: #1890ff;
  font-size: 12px;
  padding: 0 4px;
  height: auto;
}

.add-sub-btn:hover, .add-condition-btn:hover {
  color: #40a9ff;
  background: rgba(24, 144, 255, 0.05);
}

.delete-btn {
  font-size: 12px;
  padding: 0 4px;
  height: auto;
}

.delete-btn:hover {
  background: rgba(255, 77, 79, 0.05);
}

/* 子条件样式 */
.sub-condition-wrapper {
  margin-left: 32px;
  border-left: 2px solid #e8f4fd;
  padding-left: 12px;
  position: relative;
}

.sub-condition-wrapper::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #e8f4fd, #bae7ff);
}

/* 确保子条件中的按钮样式正确应用 */
.sub-condition-wrapper .add-sub-btn,
.sub-condition-wrapper .delete-btn {
  color: #1890ff;
  font-size: 12px;
  padding: 0 4px;
  height: auto;
}

.sub-condition-wrapper .add-sub-btn:hover {
  color: #40a9ff;
  background: rgba(24, 144, 255, 0.05);
}

.sub-condition-wrapper .delete-btn:hover {
  background: rgba(255, 77, 79, 0.05);
}

/* 新增样式 */
.save-condition-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
}
</style>