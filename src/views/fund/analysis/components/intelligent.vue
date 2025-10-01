<template>
  <!-- 标准数据-筛选 -->
  <a-card class="m2" title='标准数据-筛选'>
    <!-- 动态查询组件 -->
    <div class="dynamic-query">
      <div class="query-actions">
        <!-- 保存筛选条件区域 -->
        <div class="save-condition-area" v-if="saveMode">
          <a-input
              v-model:value="conditionName"
              placeholder="输入筛选条件名称"
              style="width: 200px; margin-right: 8px;"
              @press-enter="saveFilterCondition"
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
        <a-button @click="resetConditions" class="action-btn">
          <template #icon><ReloadOutlined /></template>
          重置条件
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
            <!-- 条件行 -->
            <div class="condition-row">
              <div class="condition-cell level-cell">
                <span class="level-badge">第{{ condition.level }}级</span>
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
                <a-button type="link" size="small" @click="addSameLevelCondition(condition.level)" class="add-same-btn">
                  <template #icon><PlusOutlined /></template>
                  添加同级
                </a-button>
                <a-button type="link" size="small" @click="addSubCondition(condition.id, condition.level + 1)" class="add-sub-btn">
                  <template #icon><PlusCircleOutlined /></template>
                  添加子级
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
                      <span class="level-badge">第{{ subCondition.level }}级</span>
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
                      <a-button type="link" size="small" @click="addSameLevelCondition(subCondition.level)" class="add-same-btn">
                        <template #icon><PlusOutlined /></template>
                        添加同级
                      </a-button>
                      <a-button type="link" size="small" @click="addSubCondition(subCondition.id, 3)" class="add-sub-btn">
                        <template #icon><PlusCircleOutlined /></template>
                        添加子级
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
                          <span class="level-badge">第{{ subCondition3.level }}级</span>
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
                          <a-button type="link" size="small" @click="addSameLevelCondition(subCondition3.level)" class="add-same-btn">
                            <template #icon><PlusOutlined /></template>
                            添加同级
                          </a-button>
                          <a-button type="link" size="small" @click="addSubCondition(subCondition3.id, 4)" class="add-sub-btn">
                            <template #icon><PlusCircleOutlined /></template>
                            添加子级
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
                              <span class="level-badge">第{{ subCondition4.level }}级</span>
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
                              <a-button type="link" size="small" @click="addSameLevelCondition(subCondition4.level)" class="add-same-btn">
                                <template #icon><PlusOutlined /></template>
                                添加同级
                              </a-button>
                              <a-button type="link" size="small" @click="addSubCondition(subCondition4.id, 5)" class="add-sub-btn">
                                <template #icon><PlusCircleOutlined /></template>
                                添加子级
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
                                  <span class="level-badge">第{{ subCondition5.level }}级</span>
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
                                  <a-button type="link" size="small" disabled class="add-same-btn">
                                    <template #icon><PlusOutlined /></template>
                                    最多5级
                                  </a-button>
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
          <a-empty description="暂无查询条件，请添加条件" />
        </div>
      </div>
    </div>
    <div class="mt4">
      <a-button type="primary" @click="exportCurrentPage">
        <template #icon><ExportOutlined /></template>
        导出本页数据
      </a-button>
      <a-button
          type="primary"
          @click="exportMarkedData"
          class="ml2"
          :disabled="selectedRowKeys.length === 0"
      >
        <template #icon><FileExcelOutlined /></template>
        导出选择数据
      </a-button>
      <a-button type="primary" @click="showArchiveModal" class="ml2">
        <template #icon><FileTextOutlined /></template>
        生成卷宗信息
      </a-button>
    </div>
  </a-card>

  <!-- 表格部分 -->
  <a-table
      class="m2"
      :columns="columns"
      :data-source="dataSource"
      :scroll="{ x: 2000 }"
      :loading="tableLoading"
      :row-selection="rowSelection"
      :pagination="pagination"
      bordered
      @change="handleTableChange"
      rowKey="id"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
      </template>
      <template v-else-if="column.key === 'transAmt'">
        {{ record.transAmt?.toLocaleString() }}
      </template>
    </template>
  </a-table>
  <!-- 卷宗信息预览Modal -->
  <a-modal
      v-model:visible="archiveModalVisible"
      title="卷宗信息预览"
      width="800px"
      :footer="null"
  >
    <div class="archive-preview">
      <!-- 卷宗预览内容 -->
      <div class="preview-content">
        <p>这里是卷宗信息的预览内容...</p>
        <!-- 根据实际需求展示卷宗信息 -->
      </div>

      <!-- 底部操作按钮 -->
      <div class="modal-footer">
        <a-button @click="archiveModalVisible = false">关闭</a-button>
        <a-button type="primary" @click="sendArchive">发送</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" name="intelligent" setup>
import {
  SaveOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue';
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
  intelligentTableListApi,
  exportIntelligentPageData, getFileConfirmInfo
} from './../user.api'

// ts语法
import { useRoute } from 'vue-router';
import { useRouter } from "vue-router";
import {useMethods} from "@/hooks/system/useMethods";
const { handleExportXls } = useMethods();
const router = useRouter();
const { query } = useRoute();
const archiveModalVisible = ref(false);


// 行选择配置 - 增加全选功能
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
    },
    // 全选相关配置
    checkStrictly: false,
    columnWidth: 60,
    fixed: true
  };
});

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
    title: '发起行',
    dataIndex: 'orgCd',
    key: 'orgCd',
    align: 'center'
  },
  {
    title: '户名',
    dataIndex: 'customerName',
    key: 'customerName',
    ellipsis: true
  },
  {
    title: '账号/卡号',
    dataIndex: 'transAccountNo',
    key: 'transAccountNo',
    ellipsis: true
  },
  {
    title: '流水号',
    dataIndex: 'transNo',
    key: 'transNo',
    ellipsis: true
  },
  {
    title: '交易渠道',
    dataIndex: 'channel',
    key: 'channel',
    ellipsis: true
  },
  {
    title: '币种',
    dataIndex: 'currNo',
    key: 'currNo',
    align: 'center'
  },
  {
    title: '交易方向',
    dataIndex: 'transWay',
    key: 'transWay',
    align: 'center'
  },
  {
    title: '交易金额',
    dataIndex: 'transAmt',
    key: 'transAmt',
    align: 'right'
  },
  {
    title: '交易种类',
    dataIndex: 'transType',
    key: 'transType',
    align: 'center'
  },
  {
    title: '业务日期',
    dataIndex: 'bizDate',
    key: 'bizDate',
    align: 'center'
  },
  {
    title: '交易时间',
    dataIndex: 'transTime',
    key: 'transTime',
    align: 'center'
  },
  {
    title: '对方开户银行',
    dataIndex: 'counterOrgName',
    key: 'counterOrgName',
    ellipsis: true
  },
  {
    title: '对方户名',
    dataIndex: 'counterName',
    key: 'counterName',
    ellipsis: true
  },
  {
    title: '对方账号/卡号',
    dataIndex: 'counterAccountNo',
    key: 'counterAccountNo',
    ellipsis: true
  },
  {
    title: '交易状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center'
  },
]);

const dataSource = ref([]);

// 动态查询组件相关逻辑
// 关系枚举
const relationOptions = [
  { label: '且', value: 'and' },
  { label: '或', value: 'or' },
 /* { label: '非', value: 'not' }*/
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
  level: number; // 新增层级字段
  relation: string; // 与/或/非
  field: string; // 字段
  operator: string; // 逻辑运算符
  value: string; // 值
  subConditions: Condition[]; // 子条件
}



// 判断是否为间隔运算符
const isIntervalOperator = (operator: string) => {
  return operator === 'interval_lt' || operator === 'interval_gt';
};

// 生成唯一ID
const generateId = () => {
  return `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 根条件列表 - 默认显示一个空的第一级条件
const rootConditions = ref<Condition[]>([{
  id: generateId(),
  level: 1,
  relation: 'and',
  field: '',
  operator: '',
  value: '',
  subConditions: []
}]);

// 添加同级条件
const addSameLevelCondition = (level: number) => {
  if (level === 1) {
    // 第一级直接添加到根条件
    if (rootConditions.value.length >= 10) {
      message.warning('最多只能添加10个同级条件');
      return;
    }
    rootConditions.value.push({
      id: generateId(),
      level: 1,
      relation: rootConditions.value.length === 0 ? 'and' : 'and',
      field: '',
      operator: '',
      value: '',
      subConditions: []
    });
  } else {
    // 其他级别需要找到父级添加
    const findParentAndAdd = (conditions: Condition[]): boolean => {
      for (const condition of conditions) {
        if (condition.level === level - 1 && condition.subConditions) {
          if (condition.subConditions.length >= 10) {
            message.warning('最多只能添加10个同级条件');
            return true;
          }
          condition.subConditions.push({
            id: generateId(),
            level: level,
            relation: condition.subConditions.length === 0 ? 'and' : 'and',
            field: '',
            operator: '',
            value: '',
            subConditions: []
          });
          return true;
        }
        if (condition.subConditions && condition.subConditions.length > 0) {
          const found = findParentAndAdd(condition.subConditions);
          if (found) return true;
        }
      }
      return false;
    };

    findParentAndAdd(rootConditions.value);
  }
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
    id: generateId(),
    name: conditionName.value,
    conditions: JSON.parse(JSON.stringify(rootConditions.value)) // 深拷贝
  };

  savedConditions.value.push(newCondition);
  conditionName.value = '';
  saveMode.value = false;
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

// 添加子条件
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
        if (condition.subConditions.length >= 10) {
          message.warning('最多只能添加10个子条件');
          return true;
        }
        condition.subConditions.push({
          id: generateId(),
          level: level,
          relation: condition.subConditions.length === 0 ? 'and' : 'and',
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
  // 检查是否是唯一的根条件
  if (rootConditions.value.length === 1 && rootConditions.value[0].id === conditionId) {
    message.warning('至少需要保留一个查询条件');
    return;
  }

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
  rootConditions.value = [{
    id: generateId(),
    level: 1,
    relation: 'and',
    field: '',
    operator: '',
    value: '',
    subConditions: []
  }];
};

// 页面初始化时调用接口
onMounted(() => {
  // 确保有一个第一级条件
  if (rootConditions.value.length === 0) {
    rootConditions.value.push({
      id: generateId(),
      level: 1,
      relation: 'and',
      field: '',
      operator: '',
      value: '',
      subConditions: []
    });
  }
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
     // pagination.current = response.current || 1;
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

// 导出本页数据
const exportCurrentPage = async () => {
    const params = {
      caseId: query.caseId,
      ids: selectedRowKeys.value,
      conditionJson: JSON.stringify(rootConditions.value),
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };
    handleExportXls('智能查询数据列表', exportIntelligentPageData, params, 'post');
};

// 导出标记数据
const exportMarkedData = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要导出的数据');
    return;
  }
  const params = {
    caseId: query.caseId,
    ids: selectedRowKeys.value,
    conditionJson: JSON.stringify(rootConditions.value),
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  };
  handleExportXls('智能查询数据列表', exportIntelligentPageData, params, 'post');
};

// 显示卷宗信息弹窗
const showArchiveModal = async() => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要生成的数据');
    return;
  }
  const params = {
    caseId: query.caseId,
    ids: selectedRowKeys.value,
    conditionJson: JSON.stringify(rootConditions.value),
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  };
  const response = await getFileConfirmInfo(params);
  console.info('接口响应数据:', response);

  if (response) {
    archiveModalVisible.value = true;
  } else {

  }

};

// 发送卷宗信息
const sendArchive = async () => {
  try {
    // await sendArchiveApi({
    //   // 卷宗相关参数
    // });
    message.success('卷宗信息发送成功');
    archiveModalVisible.value = false;
  } catch (error) {
    message.error('发送失败');
  }
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
  flex: 1.2;
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
  flex: 1.2;
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

.add-same-btn, .add-sub-btn, .add-condition-btn {
  color: #1890ff;
  font-size: 12px;
  padding: 0 4px;
  height: auto;
}

.add-same-btn:hover, .add-sub-btn:hover, .add-condition-btn:hover {
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
.sub-condition-wrapper .add-same-btn,
.sub-condition-wrapper .add-sub-btn,
.sub-condition-wrapper .delete-btn {
  color: #1890ff;
  font-size: 12px;
  padding: 0 4px;
  height: auto;
}

.sub-condition-wrapper .add-same-btn:hover,
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
