<template>
  <!-- 标准数据-筛选 -->
  <a-card class="m2" title='标准数据-筛选'>
    <!-- 动态查询组件 -->
    <div class="dynamic-query">
      <div class="conditions-container">
        <div class="conditions-header">
          <div class="header-item">级数</div>
          <div class="header-item">关系</div>
          <div class="header-item">字段</div>
          <div class="header-item">逻辑</div>
          <div class="header-item">值</div>
          <div class="header-item">操作</div>
        </div>

        <div class="conditions-body" v-if="rootGroups && rootGroups.items && rootGroups.items.length > 0">
          <!-- 第一级条件 -->
          <div v-for="(item, index) in rootGroups.items" :key="item.id" class="condition-group">
            <!-- 第一级条件行 -->
            <div class="condition-row">
              <div class="condition-cell level-cell">
                <span class="level-badge">第1级</span>
              </div>
              <div class="condition-cell">
                <a-select
                    v-model:value="rootGroups.operate"
                    :options="relationOptions"
                    placeholder="选择关系"
                    style="width: 100%"
                    @change="(value) => updateGroup({ operate: value })"
                />
              </div>
              <div class="condition-cell">
<!--                <a-select
                    v-model:value="item.field"
                    :options="fieldOptions"
                    placeholder="选择字段"
                    style="width: 100%"
                    allowClear
                    @change="(value) => updateItem(item.id, { field: value })"
                />-->

                <JSearchSelect
                    :getPopupContainer="retBodyContainer"
                    style="width: 100%"
                    @change="(value) => updateItem(item.id, { field: value })"
                    dict="fa_trans_query_rule"
                    v-model:value="item.field"
                    placeholder="选择字段">

                </JSearchSelect>
              </div>
              <div class="condition-cell">
<!--                <a-select
                    v-model:value="item.condition"
                    :options="operatorOptions"
                    placeholder="选择逻辑"
                    style="width: 100%"
                    allowClear
                    @change="(value) => updateItem(item.id, { condition: value })"
                />-->
                <JSearchSelect
                    :getPopupContainer="retBodyContainer"
                    style="width: 100%"
                    @change="(value) => updateItem(item.id, { condition: value })"
                    dict="fa_trans_query_col"
                    v-model:value="item.condition"
                    placeholder="选择逻辑">

                </JSearchSelect>
              </div>
              <div class="condition-cell">
                <a-input
                    v-if="!isIntervalOperator(item.condition)"
                    v-model:value="item.value"
                    placeholder="输入值"
                    allowClear
                    @change="(e) => updateItem(item.id, { value: e.target.value })"
                />
                <a-date-picker
                    v-else
                    v-model:value="item.value"
                    showTime
                    style="width: 100%"
                    placeholder="选择日期时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    @change="(value) => updateItem(item.id, { value })"
                />
              </div>
              <div class="condition-cell actions-cell">
                <a-button type="link" size="small" @click="addSameLevelCondition(null, 1)" class="add-same-btn">
                  <template #icon><PlusOutlined /></template>
                  添加同级
                </a-button>
                <a-button type="link" size="small" @click="addSubGroup(item.id, 1)" class="add-sub-btn" :disabled="1 >= 5">
                  <template #icon><PlusCircleOutlined /></template>
                  {{ 1 >= 5 ? '最多5级' : '添加子级' }}
                </a-button>
                <a-button type="link" size="small" danger @click="removeCondition(item.id)" class="delete-btn">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </div>
            </div>

            <!-- 第二级子条件 -->
            <template v-if="item.groups && item.groups.length > 0">
              <div v-for="(subGroup, subIndex) in item.groups" :key="subIndex" class="sub-group-wrapper">
                <div v-for="(subItem, subItemIndex) in subGroup.items" :key="subItem.id" class="condition-item-wrapper">
                  <div class="condition-row">
                    <div class="condition-cell level-cell">
                      <span class="level-badge">第2级</span>
                    </div>
                    <div class="condition-cell">
                      <a-select
                          v-model:value="subGroup.operate"
                          :options="relationOptions"
                          placeholder="选择关系"
                          style="width: 100%"
                          @change="(value) => updateSubGroup(item.id, subIndex, { operate: value })"
                      />
                    </div>
                    <div class="condition-cell">
                      <a-select
                          v-model:value="subItem.field"
                          :options="fieldOptions"
                          placeholder="选择字段"
                          style="width: 100%"
                          allowClear
                          @change="(value) => updateSubItem(item.id, subIndex, subItem.id, { field: value })"
                      />
                    </div>
                    <div class="condition-cell">
                      <a-select
                          v-model:value="subItem.condition"
                          :options="operatorOptions"
                          placeholder="选择逻辑"
                          style="width: 100%"
                          allowClear
                          @change="(value) => updateSubItem(item.id, subIndex, subItem.id, { condition: value })"
                      />
                    </div>
                    <div class="condition-cell">
                      <a-input
                          v-if="!isIntervalOperator(subItem.condition)"
                          v-model:value="subItem.value"
                          placeholder="输入值"
                          allowClear
                          @change="(e) => updateSubItem(item.id, subIndex, subItem.id, { value: e.target.value })"
                      />
                      <a-date-picker
                          v-else
                          v-model:value="subItem.value"
                          showTime
                          style="width: 100%"
                          placeholder="选择日期时间"
                          format="YYYY-MM-DD HH:mm:ss"
                          @change="(value) => updateSubItem(item.id, subIndex, subItem.id, { value })"
                      />
                    </div>
                    <div class="condition-cell actions-cell">
                      <a-button type="link" size="small" @click="addSameLevelCondition(item.id, 2)" class="add-same-btn">
                        <template #icon><PlusOutlined /></template>
                        添加同级
                      </a-button>
                      <a-button type="link" size="small" @click="addSubGroup(subItem.id, 2)" class="add-sub-btn" :disabled="2 >= 5">
                        <template #icon><PlusCircleOutlined /></template>
                        {{ 2 >= 5 ? '最多5级' : '添加子级' }}
                      </a-button>
                      <a-button type="link" size="small" danger @click="removeCondition(subItem.id)" class="delete-btn">
                        <template #icon><DeleteOutlined /></template>
                        删除
                      </a-button>
                    </div>
                  </div>

                  <!-- 第三级子条件 -->
                  <template v-if="subItem.groups && subItem.groups.length > 0">
                    <div v-for="(subGroup3, subIndex3) in subItem.groups" :key="subIndex3" class="sub-group-wrapper">
                      <div v-for="(subItem3, subItemIndex3) in subGroup3.items" :key="subItem3.id" class="condition-item-wrapper">
                        <div class="condition-row">
                          <div class="condition-cell level-cell">
                            <span class="level-badge">第3级</span>
                          </div>
                          <div class="condition-cell">
                            <a-select
                                v-model:value="subGroup3.operate"
                                :options="relationOptions"
                                placeholder="选择关系"
                                style="width: 100%"
                                @change="(value) => updateSubGroup(subItem.id, subIndex3, { operate: value })"
                            />
                          </div>
                          <div class="condition-cell">
                            <a-select
                                v-model:value="subItem3.field"
                                :options="fieldOptions"
                                placeholder="选择字段"
                                style="width: 100%"
                                allowClear
                                @change="(value) => updateSubItem(subItem.id, subIndex3, subItem3.id, { field: value })"
                            />
                          </div>
                          <div class="condition-cell">
                            <a-select
                                v-model:value="subItem3.condition"
                                :options="operatorOptions"
                                placeholder="选择逻辑"
                                style="width: 100%"
                                allowClear
                                @change="(value) => updateSubItem(subItem.id, subIndex3, subItem3.id, { condition: value })"
                            />
                          </div>
                          <div class="condition-cell">
                            <a-input
                                v-if="!isIntervalOperator(subItem3.condition)"
                                v-model:value="subItem3.value"
                                placeholder="输入值"
                                allowClear
                                @change="(e) => updateSubItem(subItem.id, subIndex3, subItem3.id, { value: e.target.value })"
                            />
                            <a-date-picker
                                v-else
                                v-model:value="subItem3.value"
                                showTime
                                style="width: 100%"
                                placeholder="选择日期时间"
                                format="YYYY-MM-DD HH:mm:ss"
                                @change="(value) => updateSubItem(subItem.id, subIndex3, subItem3.id, { value })"
                            />
                          </div>
                          <div class="condition-cell actions-cell">
                            <a-button type="link" size="small" @click="addSameLevelCondition(subItem.id, 3)" class="add-same-btn">
                              <template #icon><PlusOutlined /></template>
                              添加同级
                            </a-button>
                            <a-button type="link" size="small" @click="addSubGroup(subItem3.id, 3)" class="add-sub-btn" :disabled="3 >= 5">
                              <template #icon><PlusCircleOutlined /></template>
                              {{ 3 >= 5 ? '最多5级' : '添加子级' }}
                            </a-button>
                            <a-button type="link" size="small" danger @click="removeCondition(subItem3.id)" class="delete-btn">
                              <template #icon><DeleteOutlined /></template>
                              删除
                            </a-button>
                          </div>
                        </div>

                        <!-- 第四级子条件 -->
                        <template v-if="subItem3.groups && subItem3.groups.length > 0">
                          <div v-for="(subGroup4, subIndex4) in subItem3.groups" :key="subIndex4" class="sub-group-wrapper">
                            <div v-for="(subItem4, subItemIndex4) in subGroup4.items" :key="subItem4.id" class="condition-item-wrapper">
                              <div class="condition-row">
                                <div class="condition-cell level-cell">
                                  <span class="level-badge">第4级</span>
                                </div>
                                <div class="condition-cell">
                                  <a-select
                                      v-model:value="subGroup4.operate"
                                      :options="relationOptions"
                                      placeholder="选择关系"
                                      style="width: 100%"
                                      @change="(value) => updateSubGroup(subItem3.id, subIndex4, { operate: value })"
                                  />
                                </div>
                                <div class="condition-cell">
                                  <a-select
                                      v-model:value="subItem4.field"
                                      :options="fieldOptions"
                                      placeholder="选择字段"
                                      style="width: 100%"
                                      allowClear
                                      @change="(value) => updateSubItem(subItem3.id, subIndex4, subItem4.id, { field: value })"
                                  />
                                </div>
                                <div class="condition-cell">
                                  <a-select
                                      v-model:value="subItem4.condition"
                                      :options="operatorOptions"
                                      placeholder="选择逻辑"
                                      style="width: 100%"
                                      allowClear
                                      @change="(value) => updateSubItem(subItem3.id, subIndex4, subItem4.id, { condition: value })"
                                  />
                                </div>
                                <div class="condition-cell">
                                  <a-input
                                      v-if="!isIntervalOperator(subItem4.condition)"
                                      v-model:value="subItem4.value"
                                      placeholder="输入值"
                                      allowClear
                                      @change="(e) => updateSubItem(subItem3.id, subIndex4, subItem4.id, { value: e.target.value })"
                                  />
                                  <a-date-picker
                                      v-else
                                      v-model:value="subItem4.value"
                                      showTime
                                      style="width: 100%"
                                      placeholder="选择日期时间"
                                      format="YYYY-MM-DD HH:mm:ss"
                                      @change="(value) => updateSubItem(subItem3.id, subIndex4, subItem4.id, { value })"
                                  />
                                </div>
                                <div class="condition-cell actions-cell">
                                  <a-button type="link" size="small" @click="addSameLevelCondition(subItem3.id, 4)" class="add-same-btn">
                                    <template #icon><PlusOutlined /></template>
                                    添加同级
                                  </a-button>
                                  <a-button type="link" size="small" @click="addSubGroup(subItem4.id, 4)" class="add-sub-btn" :disabled="4 >= 5">
                                    <template #icon><PlusCircleOutlined /></template>
                                    {{ 4 >= 5 ? '最多5级' : '添加子级' }}
                                  </a-button>
                                  <a-button type="link" size="small" danger @click="removeCondition(subItem4.id)" class="delete-btn">
                                    <template #icon><DeleteOutlined /></template>
                                    删除
                                  </a-button>
                                </div>
                              </div>

                              <!-- 第五级子条件 -->
                              <template v-if="subItem4.groups && subItem4.groups.length > 0">
                                <div v-for="(subGroup5, subIndex5) in subItem4.groups" :key="subIndex5" class="sub-group-wrapper">
                                  <div v-for="(subItem5, subItemIndex5) in subGroup5.items" :key="subItem5.id" class="condition-item-wrapper">
                                    <div class="condition-row">
                                      <div class="condition-cell level-cell">
                                        <span class="level-badge">第5级</span>
                                      </div>
                                      <div class="condition-cell">
                                        <a-select
                                            v-model:value="subGroup5.operate"
                                            :options="relationOptions"
                                            placeholder="选择关系"
                                            style="width: 100%"
                                            @change="(value) => updateSubGroup(subItem4.id, subIndex5, { operate: value })"
                                        />
                                      </div>
                                      <div class="condition-cell">
                                        <a-select
                                            v-model:value="subItem5.field"
                                            :options="fieldOptions"
                                            placeholder="选择字段"
                                            style="width: 100%"
                                            allowClear
                                            @change="(value) => updateSubItem(subItem4.id, subIndex5, subItem5.id, { field: value })"
                                        />
                                      </div>
                                      <div class="condition-cell">
                                        <a-select
                                            v-model:value="subItem5.condition"
                                            :options="operatorOptions"
                                            placeholder="选择逻辑"
                                            style="width: 100%"
                                            allowClear
                                            @change="(value) => updateSubItem(subItem4.id, subIndex5, subItem5.id, { condition: value })"
                                        />
                                      </div>
                                      <div class="condition-cell">
                                        <a-input
                                            v-if="!isIntervalOperator(subItem5.condition)"
                                            v-model:value="subItem5.value"
                                            placeholder="输入值"
                                            allowClear
                                            @change="(e) => updateSubItem(subItem4.id, subIndex5, subItem5.id, { value: e.target.value })"
                                        />
                                        <a-date-picker
                                            v-else
                                            v-model:value="subItem5.value"
                                            showTime
                                            style="width: 100%"
                                            placeholder="选择日期时间"
                                            format="YYYY-MM-DD HH:mm:ss"
                                            @change="(value) => updateSubItem(subItem4.id, subIndex5, subItem5.id, { value })"
                                        />
                                      </div>
                                      <div class="condition-cell actions-cell">
                                        <a-button type="link" size="small" @click="addSameLevelCondition(subItem4.id, 5)" class="add-same-btn">
                                          <template #icon><PlusOutlined /></template>
                                          添加同级
                                        </a-button>
                                        <a-button type="link" size="small" disabled class="add-sub-btn">
                                          <template #icon><PlusCircleOutlined /></template>
                                          最多5级
                                        </a-button>
                                        <a-button type="link" size="small" danger @click="removeCondition(subItem5.id)" class="delete-btn">
                                          <template #icon><DeleteOutlined /></template>
                                          删除
                                        </a-button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </template>
                            </div>
                          </div>
                        </template>
                      </div>
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
      <div class="query-actions">
        <!-- 添加根级条件按钮 -->
<!--        <a-button
            type="primary"
            @click="addRootCondition"
            class="add-root-btn"
        >
          <template #icon><PlusOutlined /></template>
          添加查询条件
        </a-button>-->

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
            :disabled="!rootGroups.items || rootGroups.items.length === 0"
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

        <a-button type="primary" @click="onSearch" :loading="searchLoading">
          <template #icon><SearchOutlined /></template>
          查询
        </a-button>
        <a-button @click="resetConditions" class="action-btn">
          <template #icon><ReloadOutlined /></template>
          重置条件
        </a-button>
      </div>

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
    <a-card>
      <div class="archive-preview">
        <!-- 卷宗预览内容 -->
        <div class="preview-content">
          <p>这里是卷宗信息的预览内容...</p>
          <a-textarea v-model:value="archiveModalPreviewData" placeholder="卷宗信息" :rows="4" />
        </div>
        <a-row>
          <a-col span="8" offset="16">
            <a-button class="mr4" @click="archiveModalVisible = false">关闭</a-button>
            <a-button type="primary" @click="sendArchive">发送</a-button>
          </a-col>
        </a-row>
      </div>
    </a-card>
  </a-modal>
</template>

<script lang="ts" name="intelligent" setup>
import {
  SaveOutlined,
  ExportOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  PlusCircleOutlined
} from '@ant-design/icons-vue';
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';

// 引入相关样式
import '@vue-office/excel/lib/index.css'
import {
  intelligentTableListApi,
  exportIntelligentPageData,
  fileContextInfo,
  searchConditionListApi,
  saveQueryConditionApi,
} from './../user.api'

// ts语法
import { useRoute } from 'vue-router';
import { useRouter } from "vue-router";
import {useMethods} from "@/hooks/system/useMethods";
import JSearchSelect from "@/components/Form/src/jeecg/components/JSearchSelect.vue";
const { handleExportXls } = useMethods();
const router = useRouter();
const { query } = useRoute();
const archiveModalVisible = ref(false);
const archiveModalPreviewData = ref('');

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
const savedConditions = ref<Array<{id: string, name: string, conditions: string}>>([]);
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
  { label: '与', value: 'and' },
  { label: '或', value: 'or' },
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

// 新的数据结构接口
interface ConditionItem {
  id: string;
  condition: string; // 逻辑运算符
  field: string;     // 字段
  value: string;     // 值
  groups?: ConditionGroup[]; // 子组
}

interface ConditionGroup {
  operate: string;   // 关系逻辑操作
  items: ConditionItem[]; // 同级查询元素
}

const retBodyContainer =()=>{
  return document.body
}

// 判断是否为间隔运算符
const isIntervalOperator = (operator: string) => {
  return operator === 'interval_lt' || operator === 'interval_gt';
};

// 生成唯一ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 根条件组
const rootGroups = ref<ConditionGroup>({
  operate: 'and',
  items: []
});

// 添加根级条件
const addRootCondition = () => {
  if (!rootGroups.value.items) {
    rootGroups.value.items = [];
  }

  if (rootGroups.value.items.length >= 10) {
    message.warning('最多只能添加10个同级条件');
    return;
  }

  rootGroups.value.items.push({
    id: generateId(), // 添加唯一ID
    condition: '',
    field: '',
    value: '',
    groups: []
  });
};

// 添加同级条件
const addSameLevelCondition = (parentId: string | null, level: number) => {
  if (level === 1) {
    // 第一级直接添加到根条件
    addRootCondition();
  } else {
    // 递归查找父级并添加同级条件
    const findAndAddSameLevel = (items: ConditionItem[]): boolean => {
      for (const item of items) {
        if (item.id === parentId) {
          // 找到父级item，在其groups的最后一个组中添加同级条件
          if (!item.groups) {
            item.groups = [{
              operate: 'and',
              items: []
            }];
          }
          if (item.groups.length > 0) {
            const lastGroup = item.groups[item.groups.length - 1];
            if (lastGroup.items.length >= 10) {
              message.warning('最多只能添加10个同级条件');
              return true;
            }
            lastGroup.items.push({
              id: generateId(), // 添加唯一ID
              condition: '',
              field: '',
              value: '',
              groups: []
            });
          }
          return true;
        }
        if (item.groups && item.groups.length > 0) {
          for (const group of item.groups) {
            const found = findAndAddSameLevel(group.items);
            if (found) return true;
          }
        }
      }
      return false;
    };

    findAndAddSameLevel(rootGroups.value.items);
  }
};

// 添加子组
const addSubGroup = (parentId: string, level: number) => {
  if (level >= 5) {
    message.warning('最多只能添加5级条件');
    return;
  }

  const findAndAddSubGroup = (items: ConditionItem[]): boolean => {
    for (const item of items) {
      if (item.id === parentId) {
        if (!item.groups) {
          item.groups = [];
        }
        item.groups.push({
          operate: 'and',
          items: [{
            id: generateId(), // 添加唯一ID
            condition: '',
            field: '',
            value: '',
            groups: []
          }]
        });
        return true;
      }
      if (item.groups && item.groups.length > 0) {
        for (const group of item.groups) {
          const found = findAndAddSubGroup(group.items);
          if (found) return true;
        }
      }
    }
    return false;
  };

  findAndAddSubGroup(rootGroups.value.items);
};

// 更新组
const updateGroup = (updates: Partial<ConditionGroup>) => {
  rootGroups.value = { ...rootGroups.value, ...updates };
};

// 更新子组
const updateSubGroup = (parentId: string, groupIndex: number, updates: Partial<ConditionGroup>) => {
  const findAndUpdateSubGroup = (items: ConditionItem[]): boolean => {
    for (const item of items) {
      if (item.id === parentId) {
        if (item.groups && item.groups[groupIndex]) {
          item.groups[groupIndex] = { ...item.groups[groupIndex], ...updates };
          return true;
        }
      }
      if (item.groups && item.groups.length > 0) {
        for (const group of item.groups) {
          const found = findAndUpdateSubGroup(group.items);
          if (found) return true;
        }
      }
    }
    return false;
  };

  findAndUpdateSubGroup(rootGroups.value.items);
};

// 更新条件项
const updateItem = (itemId: string, updates: Partial<ConditionItem>) => {
  const findAndUpdate = (items: ConditionItem[]): boolean => {
    for (const item of items) {
      if (item.id === itemId) {
        Object.assign(item, updates);
        return true;
      }
      if (item.groups && item.groups.length > 0) {
        for (const group of item.groups) {
          const found = findAndUpdate(group.items);
          if (found) return true;
        }
      }
    }
    return false;
  };

  findAndUpdate(rootGroups.value.items);
};

// 更新子条件项
const updateSubItem = (parentId: string, groupIndex: number, itemId: string, updates: Partial<ConditionItem>) => {
  const findAndUpdateSubItem = (items: ConditionItem[]): boolean => {
    for (const item of items) {
      if (item.id === parentId) {
        if (item.groups && item.groups[groupIndex]) {
          const subItemIndex = item.groups[groupIndex].items.findIndex(subItem => subItem.id === itemId);
          if (subItemIndex !== -1) {
            Object.assign(item.groups[groupIndex].items[subItemIndex], updates);
            return true;
          }
        }
      }
      if (item.groups && item.groups.length > 0) {
        for (const group of item.groups) {
          const found = findAndUpdateSubItem(group.items);
          if (found) return true;
        }
      }
    }
    return false;
  };

  findAndUpdateSubItem(rootGroups.value.items);
};

// 删除条件
const removeCondition = (conditionId: string) => {
  const findAndRemove = (items: ConditionItem[]): boolean => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === conditionId) {
        // 检查是否是唯一的条件
        if (items.length === 1 && rootGroups.value.items && rootGroups.value.items.length === 1) {
          message.warning('至少需要保留一个查询条件');
          return true;
        }
        items.splice(i, 1);
        return true;
      }
      if (items[i].groups && items[i].groups.length > 0) {
        for (const group of items[i].groups) {
          const found = findAndRemove(group.items);
          if (found) return true;
        }
      }
    }
    return false;
  };

  findAndRemove(rootGroups.value.items || []);
};

// 重置条件
const resetConditions = () => {
  rootGroups.value = {
    operate: 'and',
    items: [{
      condition: '',
      field: '',
      value: '',
      groups: []
    }]
  };
};

// 保存筛选条件 - 修改为使用新数据结构
const saveFilterCondition = () => {
  if (!conditionName.value.trim()) {
    message.error('请输入筛选条件名称');
    return;
  }

  if (!rootGroups.value.items || rootGroups.value.items.length === 0) {
    message.error('请至少添加一个查询条件');
    return;
  }

  // 校验条件完整性
  const validateGroup = (group: ConditionGroup): boolean => {
    if (!group.items || group.items.length === 0) {
      return false;
    }

    for (const item of group.items) {
      if (!item.field || !item.condition) {
        return false;
      }
      if (item.groups && item.groups.length > 0) {
        for (const subGroup of item.groups) {
          if (!validateGroup(subGroup)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  if (!validateGroup(rootGroups.value)) {
    message.error('请完善所有条件配置（字段和逻辑运算符必填）');
    return;
  }

  const params = {
    caseId: query.caseId,
    name: conditionName.value,
    queryType:'01',
    conditionJson: JSON.stringify([rootGroups.value]) // 包装成数组以符合要求的格式
  };

  saveQueryConditionApi(params).then(() => {
    getQueryConditionList(); // 保存成功，刷新下拉选枚举
    saveMode.value = false;
    conditionName.value = '';
  });
};

// 加载已保存的条件
const loadSavedCondition = (conditionId: string) => {
  const condition = savedConditions.value.find(item => item.id === conditionId);
  if (condition) {
    const parsedConditions = JSON.parse(condition.conditions);
    if (parsedConditions && parsedConditions.length > 0) {
      rootGroups.value = parsedConditions[0]; // 取第一个组作为根组
    }
    message.success('筛选条件加载成功');
  } else {
    rootGroups.value = {
      operate: 'and',
      items: []
    };
  }
};

// 查询筛选条件列表
const getQueryConditionList = async () => {
  try {
    const params = {
      caseId: query.caseId,
    };

    const response = await searchConditionListApi(params);
    console.info('查询条件列表响应数据:', response);
    if (response && Array.isArray(response)) {
      savedConditions.value = response;
    } else {
      savedConditions.value = [];
    }
  } catch (error) {
    console.error('获取查询条件列表失败:', error);
    savedConditions.value = [];
  }
};

// 获取智能筛选
const fetchIntelligentList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      caseId: query.caseId,
      ids: selectedRowKeys.value,
      conditionJson: JSON.stringify([rootGroups.value]), // 包装成数组
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const response = await intelligentTableListApi(params);
    console.info('接口响应数据:', response);

    if (response && response.records) {
      dataSource.value = response.records;
      pagination.total = response.total;
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
    conditionJson: JSON.stringify([rootGroups.value]), // 包装成数组
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
    conditionJson: JSON.stringify([rootGroups.value]), // 包装成数组
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
    conditionJson: JSON.stringify([rootGroups.value]), // 包装成数组
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  };
  const response = await fileContextInfo(params);
  console.info('接口响应数据:', response);
  archiveModalVisible.value = true;
  archiveModalPreviewData.value = response;
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

// 页面初始化
onMounted(() => {
  // 确保有一个初始条件
  if (!rootGroups.value.items || rootGroups.value.items.length === 0) {
    addRootCondition();
  }
  fetchIntelligentList();
  getQueryConditionList();
});
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

/* 子组样式 */
.sub-group-wrapper {
  margin-left: 32px;
  border-left: 2px solid #e8f4fd;
  padding-left: 12px;
  position: relative;
}

.sub-group-wrapper::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #e8f4fd, #bae7ff);
}

/* 确保子组中的按钮样式正确应用 */
.sub-group-wrapper .add-same-btn,
.sub-group-wrapper .add-sub-btn,
.sub-group-wrapper .delete-btn {
  color: #1890ff;
  font-size: 12px;
  padding: 0 4px;
  height: auto;
}

.sub-group-wrapper .add-same-btn:hover,
.sub-group-wrapper .add-sub-btn:hover {
  color: #40a9ff;
  background: rgba(24, 144, 255, 0.05);
}

.sub-group-wrapper .delete-btn:hover {
  background: rgba(255, 77, 79, 0.05);
}

/* 新增样式 */
.save-condition-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
}

.condition-item-wrapper {
  border-bottom: 1px solid #f5f5f5;
}

.condition-item-wrapper:last-child {
  border-bottom: none;
}
</style>