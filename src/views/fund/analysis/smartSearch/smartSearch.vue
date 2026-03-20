<template>
  <div class="smart-screening">
    <div class="screening-header">
      <div class="screening-title">智能筛查</div>
    </div>
    <div class="screening-content">
      <div class="screening-table">
        <div class="table-header">
          <div class="header-cell level">级数</div>
          <div class="header-cell relation">关系</div>
          <div class="header-cell field">字段</div>
          <div class="header-cell logic">逻辑</div>
          <div class="header-cell value">值</div>
          <div class="header-cell action">操作</div>
        </div>
        <div class="table-body">
          <template v-if="rootGroups && rootGroups.items && rootGroups.items.length > 0">
            <!-- 第一级条件 -->
            <div v-for="(item, index) in rootGroups.items" :key="item.id" class="condition-group">
              <!-- 第一级条件行 -->
              <div class="condition-row">
                <div class="condition-cell level-cell">
                  <a-tag size="small">第1级</a-tag>
                </div>
                <div class="condition-cell">
                  <a-select v-model:value="rootGroups.operate"
                    :options="getColumnOptions(props.columns.find((c) => c.prop === 'operate'))" placeholder="选择关系"
                    size="small" style="width: 100%" />
                </div>
                <div class="condition-cell">
                  <a-select v-model:value="item.field"
                    :options="getColumnOptions(props.columns.find((c) => c.prop === 'field'))" placeholder="选择字段"
                    size="small" allow-clear style="width: 100%" />
                </div>
                <div class="condition-cell">
                  <a-select v-model:value="item.condition"
                    :options="getColumnOptions(props.columns.find((c) => c.prop === 'condition'))" placeholder="选择逻辑"
                    size="small" allow-clear style="width: 100%" />
                </div>
                <div class="condition-cell">
                  <a-input v-model:value="item.value" placeholder="输入值" size="small" allow-clear style="width: 100%" />
                </div>
                <div class="condition-cell actions-cell">
                  <a-button type="primary" size="small" @click="addSameLevelCondition(null, 1)">添加同级</a-button>
                  <a-button type="success" size="small" @click="addSubGroup(item.id, 1)" :disabled="1 >= 5">
                    {{ 1 >= 5 ? '最多5级' : '添加子级' }}
                  </a-button>
                  <a-button type="primary" danger size="small" @click="removeCondition(item.id)"
                    :disabled="rootGroups.items.length === 1">
                    删除
                  </a-button>
                </div>
              </div>

              <!-- 第二级子条件 -->
              <template v-if="item.groups && item.groups.length > 0">
                <div v-for="(subGroup, subIndex) in item.groups" :key="subIndex" class="sub-group-wrapper">
                  <div v-for="(subItem, subItemIndex) in subGroup.items" :key="subItem.id"
                    class="condition-item-wrapper">
                    <div class="condition-row">
                      <div class="condition-cell level-cell">
                        <a-tag size="small">第2级</a-tag>
                      </div>
                      <div class="condition-cell">
                        <a-select v-model:value="subGroup.operate"
                          :options="getColumnOptions(props.columns.find((c) => c.prop === 'operate'))"
                          placeholder="选择关系" size="small" style="width: 100%" />
                      </div>
                      <div class="condition-cell">
                        <a-select v-model:value="subItem.field"
                          :options="getColumnOptions(props.columns.find((c) => c.prop === 'field'))" placeholder="选择字段"
                          size="small" allow-clear style="width: 100%" />
                      </div>
                      <div class="condition-cell">
                        <a-select v-model:value="subItem.condition"
                          :options="getColumnOptions(props.columns.find((c) => c.prop === 'condition'))"
                          placeholder="选择逻辑" size="small" allow-clear style="width: 100%" />
                      </div>
                      <div class="condition-cell">
                        <a-input v-model:value="subItem.value" placeholder="输入值" size="small" allow-clear
                          style="width: 100%" />
                      </div>
                      <div class="condition-cell actions-cell">
                        <a-button type="primary" size="small" @click="addSameLevelCondition(item.id, 2)">
                          添加同级
                        </a-button>
                        <a-button type="success" size="small" @click="addSubGroup(subItem.id, 2)" :disabled="2 >= 5">
                          {{ 2 >= 5 ? '最多5级' : '添加子级' }}
                        </a-button>
                        <a-button type="primary" danger size="small" @click="removeCondition(subItem.id)">删除</a-button>
                      </div>
                    </div>

                    <!-- 第三级子条件 -->
                    <template v-if="subItem.groups && subItem.groups.length > 0">
                      <div v-for="(subGroup3, subIndex3) in subItem.groups" :key="subIndex3" class="sub-group-wrapper">
                        <div v-for="(subItem3, subItemIndex3) in subGroup3.items" :key="subItem3.id"
                          class="condition-item-wrapper">
                          <div class="condition-row">
                            <div class="condition-cell level-cell">
                              <a-tag size="small">第3级</a-tag>
                            </div>
                            <div class="condition-cell">
                              <a-select v-model:value="subGroup3.operate"
                                :options="getColumnOptions(props.columns.find((c) => c.prop === 'operate'))"
                                placeholder="选择关系" size="small" style="width: 100%" />
                            </div>
                            <div class="condition-cell">
                              <a-select v-model:value="subItem3.field"
                                :options="getColumnOptions(props.columns.find((c) => c.prop === 'field'))"
                                placeholder="选择字段" size="small" allow-clear style="width: 100%" />
                            </div>
                            <div class="condition-cell">
                              <a-select v-model:value="subItem3.condition"
                                :options="getColumnOptions(props.columns.find((c) => c.prop === 'condition'))"
                                placeholder="选择逻辑" size="small" allow-clear style="width: 100%" />
                            </div>
                            <div class="condition-cell">
                              <a-input v-model:value="subItem3.value" placeholder="输入值" size="small" allow-clear
                                style="width: 100%" />
                            </div>
                            <div class="condition-cell actions-cell">
                              <a-button type="primary" size="small" @click="addSameLevelCondition(subItem.id, 3)">
                                添加同级
                              </a-button>
                              <a-button type="success" size="small" @click="addSubGroup(subItem3.id, 3)"
                                :disabled="3 >= 5">
                                {{ 3 >= 5 ? '最多5级' : '添加子级' }}
                              </a-button>
                              <a-button type="primary" danger size="small" @click="removeCondition(subItem3.id)">
                                删除
                              </a-button>
                            </div>
                          </div>

                          <!-- 第四级子条件 -->
                          <template v-if="subItem3.groups && subItem3.groups.length > 0">
                            <div v-for="(subGroup4, subIndex4) in subItem3.groups" :key="subIndex4"
                              class="sub-group-wrapper">
                              <div v-for="(subItem4, subItemIndex4) in subGroup4.items" :key="subItem4.id"
                                class="condition-item-wrapper">
                                <div class="condition-row">
                                  <div class="condition-cell level-cell">
                                    <a-tag size="small">第4级</a-tag>
                                  </div>
                                  <div class="condition-cell">
                                    <a-select v-model:value="subGroup4.operate"
                                      :options="getColumnOptions(props.columns.find((c) => c.prop === 'operate'))"
                                      placeholder="选择关系" size="small" style="width: 100%" />
                                  </div>
                                  <div class="condition-cell">
                                    <a-select v-model:value="subItem4.field"
                                      :options="getColumnOptions(props.columns.find((c) => c.prop === 'field'))"
                                      placeholder="选择字段" size="small" allow-clear style="width: 100%" />
                                  </div>
                                  <div class="condition-cell">
                                    <a-select v-model:value="subItem4.condition"
                                      :options="getColumnOptions(props.columns.find((c) => c.prop === 'condition'))"
                                      placeholder="选择逻辑" size="small" allow-clear style="width: 100%" />
                                  </div>
                                  <div class="condition-cell">
                                    <a-input v-model:value="subItem4.value" placeholder="输入值" size="small" allow-clear
                                      style="width: 100%" />
                                  </div>
                                  <div class="condition-cell actions-cell">
                                    <a-button type="primary" size="small"
                                      @click="addSameLevelCondition(subItem3.id, 4)">
                                      添加同级
                                    </a-button>
                                    <a-button type="success" size="small" @click="addSubGroup(subItem4.id, 4)"
                                      :disabled="4 >= 5">
                                      {{ 4 >= 5 ? '最多5级' : '添加子级' }}
                                    </a-button>
                                    <a-button type="primary" danger size="small" @click="removeCondition(subItem4.id)">
                                      删除
                                    </a-button>
                                  </div>
                                </div>

                                <!-- 第五级子条件 -->
                                <template v-if="subItem4.groups && subItem4.groups.length > 0">
                                  <div v-for="(subGroup5, subIndex5) in subItem4.groups" :key="subIndex5"
                                    class="sub-group-wrapper">
                                    <div v-for="(subItem5, subItemIndex5) in subGroup5.items" :key="subItem5.id"
                                      class="condition-item-wrapper">
                                      <div class="condition-row">
                                        <div class="condition-cell level-cell">
                                          <a-tag size="small">第5级</a-tag>
                                        </div>
                                        <div class="condition-cell">
                                          <a-select v-model:value="subGroup5.operate"
                                            :options="getColumnOptions(props.columns.find((c) => c.prop === 'operate'))"
                                            placeholder="选择关系" size="small" style="width: 100%" />
                                        </div>
                                        <div class="condition-cell">
                                          <a-select v-model:value="subItem5.field"
                                            :options="getColumnOptions(props.columns.find((c) => c.prop === 'field'))"
                                            placeholder="选择字段" size="small" allow-clear style="width: 100%" />
                                        </div>
                                        <div class="condition-cell">
                                          <a-select v-model:value="subItem5.condition" :options="getColumnOptions(props.columns.find((c) => c.prop === 'condition'))
                                            " placeholder="选择逻辑" size="small" allow-clear style="width: 100%" />
                                        </div>
                                        <div class="condition-cell">
                                          <a-input v-model:value="subItem5.value" placeholder="输入值" size="small"
                                            allow-clear style="width: 100%" />
                                        </div>
                                        <div class="condition-cell actions-cell">
                                          <a-button type="primary" size="small"
                                            @click="addSameLevelCondition(subItem4.id, 5)">
                                            添加同级
                                          </a-button>
                                          <a-button type="primary" size="small" disabled>最多5级</a-button>
                                          <a-button type="primary" danger size="small"
                                            @click="removeCondition(subItem5.id)">
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
          </template>
          <div v-else class="empty-state">
            <a-empty description="暂无查询条件，请添加条件" />
          </div>
        </div>
      </div>
      <div class="screening-footer">
        <div class="footer-left">
          <a-button @click="handleSave">保存条件</a-button>
          <div v-if="showSaveInput" class="save-input-area">
            <a-input v-model:value="conditionName" placeholder="输入条件名称" style="width: 200px"></a-input>
            <a-button type="primary" @click="handleConfirmSave">确认保存</a-button>
            <a-button @click="handleCancel">取消保存</a-button>
          </div>
          <a-select v-model:value="savedCondition" placeholder="选择已保存的条件" style="width: 200px" allow-clear
            @change="handleSavedConditionChange">
            <a-select-option v-for="item in savedConditions" :key="item.id" :value="item.id">{{ item.name
            }}</a-select-option>
          </a-select>
        </div>
        <div class="footer-right">
          <a-button type="primary" @click="handleQuery">查询</a-button>
          <a-button @click="handleReset">重置条件</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { initDictOptions } from '/@/utils/dict/index';
import { getSmartSearchList, addSmartSearch } from './api'
import { message } from 'ant-design-vue'

// 存储字典选项的响应式对象
const dictOptions = ref({})

// 生成唯一ID的函数
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

interface ColumnConfig {
  prop: string
  label: string
  type: 'input' | 'select' | 'date'
  placeholder?: string
  clearable?: boolean
  options?: { label: string; value: any }[]
  dateType?: 'date' | 'datetime' | 'daterange' | 'datetimerange'
  valueFormat?: 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm:ss' | 'x'
  format?: 'YYYY/MM/DD'
  dict?: string
  stringToNumber?: boolean
}

interface ConditionItem {
  id: string
  field: string
  condition: string
  value: any
  groups?: ConditionGroup[]
}

interface ConditionGroup {
  operate: string
  items: ConditionItem[]
}

interface SavedCondition {
  id: string
  name: string
  queryJson: string
}

interface SmartScreeningProps {
  columns?: ColumnConfig[]
  modelValue?: ConditionGroup
  caseId?: string | number | null
}

const props = withDefaults(defineProps<SmartScreeningProps>(), {
  columns: () => [
    {
      prop: 'relation',
      label: '关系',
      type: 'select',
      options: [
        { label: '且', value: 'and' },
        { label: '或', value: 'or' },
      ],
    },
    {
      prop: 'field',
      label: '字段',
      type: 'select',
      placeholder: '选择字段',
      options: [
        { label: '选择字段', value: '' },
        { label: '姓名', value: 'name' },
        { label: '年龄', value: 'age' },
        { label: '性别', value: 'gender' },
        { label: '地址', value: 'address' },
      ],
    },
    {
      prop: 'logic',
      label: '逻辑',
      type: 'select',
      placeholder: '选择逻辑',
      options: [
        { label: '选择逻辑', value: '' },
        { label: '等于', value: 'eq' },
        { label: '不等于', value: 'ne' },
        { label: '大于', value: 'gt' },
        { label: '小于', value: 'lt' },
        { label: '大于等于', value: 'ge' },
        { label: '小于等于', value: 'le' },
        { label: '包含', value: 'contains' },
        { label: '不包含', value: 'notContains' },
      ],
    },
    {
      prop: 'value',
      label: '值',
      type: 'input',
      placeholder: '输入值',
    },
  ],
  modelValue: () => ({
    operate: 'and',
    items: [
      {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        field: '',
        condition: '',
        value: '',
        groups: [],
      },
    ],
  }),
  caseId: null,
})

// 根条件组
const rootGroups = ref<ConditionGroup>({
  operate: 'and',
  items: [
    {
      id: generateId(),
      field: '',
      condition: '',
      value: '',
      groups: [],
    },
  ],
})

const savedCondition = ref('')
const showSaveInput = ref(false)
const conditionName = ref('')
const savedConditions = ref<SavedCondition[]>([])
const loading = ref(false)

async function loadSavedConditions() {
  if (!props.caseId) return
  try {
    loading.value = true
    const res = await getSmartSearchList(props.caseId)
    console.log(res)
    if (res) {
      savedConditions.value = res.map((item: any) => ({
        id: item.id,
        name: item.name,
        queryJson: item.conditionJson,
      }))
    }
  } catch (error) {
    console.error('加载保存条件失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSave() {
  showSaveInput.value = true
}

async function handleConfirmSave() {
  if (!conditionName.value.trim()) {
    message.warning('请输入条件名称')
    return
  }
  if (!props.caseId) {
    message.warning('缺少案件ID')
    return
  }
  try {
    await addSmartSearch({
      caseId: props.caseId,
      name: conditionName.value.trim(),
      queryType: 'trans',
      conditionJson: JSON.stringify(rootGroups.value),
    })
    message.success('保存成功')
    showSaveInput.value = false
    conditionName.value = ''
    await loadSavedConditions()
  } catch (error) {
    console.error('保存条件失败:', error)
    message.error('保存失败')
  }
}

function handleCancel() {
  showSaveInput.value = false
  conditionName.value = ''
}

function handleSavedConditionChange(value: string) {
  if (!value) return
  const selected = savedConditions.value.find((item) => item.id === value)
  if (selected && selected.queryJson) {
    try {
      const parsedData = JSON.parse(selected.queryJson)
      // 检查数据结构是否包含 grouproot 字段
      if (parsedData.grouproot) {
        rootGroups.value = parsedData.grouproot
      } else {
        rootGroups.value = parsedData
      }
      console.log(rootGroups.value, 'rootGroups')
      emit('update:modelValue', rootGroups.value)
    } catch (error) {
      console.error('解析保存条件失败:', error)
      message.error('加载条件失败')
    }
  }
}

// 监听caseId变化，加载保存的条件列表
watch(
  () => props.caseId,
  (newCaseId) => {
    if (newCaseId) {
      loadSavedConditions()
    }
  },
  { immediate: true },
)

// 获取列的选项值，支持从字典中动态获取
function getColumnOptions(column: ColumnConfig | undefined) {
  if (column?.dict) {
    return dictOptions.value[column.dict] || []
  }
  return column?.options || []
}

// 加载字典数据
async function loadDictOptions() {
  // 从 columns 中提取所有需要的字典键
  const dictKeys = new Set()
  props.columns.forEach(column => {
    if (column.dict) {
      dictKeys.add(column.dict)
    }
  })

  // 异步加载每个字典的数据
  for (const dictKey of dictKeys) {
    try {
      const options = await initDictOptions(dictKey)
      console.log(dictKey, options, 'options')
      dictOptions.value[dictKey as string] = options
    } catch (error) {
      console.error(`加载字典 ${dictKey} 失败:`, error)
      dictOptions.value[dictKey as string] = []
    }
  }
}

// 组件挂载时加载字典数据
onMounted(() => {
  loadDictOptions()
})

// 监听modelValue变化，实现条件回显
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      rootGroups.value = JSON.parse(JSON.stringify(newValue))
    }
  },
  { immediate: true, deep: true },
)

const emit = defineEmits<{
  (e: 'query', rules: ConditionGroup): void
  (e: 'reset', rules: ConditionGroup): void
  (e: 'update:modelValue', value: ConditionGroup): void
}>()

// 添加同级条件
function addSameLevelCondition(parentId: string | null, level: number) {
  const newItem: ConditionItem = {
    id: generateId(),
    field: '',
    condition: '',
    value: '',
    groups: [],
  }

  if (!parentId) {
    // 添加到顶层
    rootGroups.value.items.push(newItem)
  } else {
    // 查找父级并添加到对应组
    function findParentAndAdd(items: ConditionItem[]) {
      for (const item of items) {
        if (item.id === parentId) {
          // 找到父级，添加到父级所在的组
          if (item.groups && item.groups.length > 0) {
            item.groups[item.groups.length - 1].items.push(newItem)
          }
          return true
        }
        if (item.groups) {
          for (const group of item.groups) {
            if (findParentAndAdd(group.items)) {
              return true
            }
          }
        }
      }
      return false
    }
    findParentAndAdd(rootGroups.value.items)
  }

  // 通知父组件
  emit('update:modelValue', rootGroups.value)
}

// 添加子级条件组
function addSubGroup(itemId: string, level: number) {
  const newGroup: ConditionGroup = {
    operate: 'and',
    items: [
      {
        id: generateId(),
        field: '',
        condition: '',
        value: '',
        groups: [],
      },
    ],
  }

  // 查找目标项并添加子组
  function findItemAndAdd(items: ConditionItem[]) {
    for (const item of items) {
      if (item.id === itemId) {
        if (!item.groups) {
          item.groups = []
        }
        item.groups.push(newGroup)
        return true
      }
      if (item.groups) {
        for (const group of item.groups) {
          if (findItemAndAdd(group.items)) {
            return true
          }
        }
      }
    }
    return false
  }

  findItemAndAdd(rootGroups.value.items)

  // 通知父组件
  emit('update:modelValue', rootGroups.value)
}

// 删除条件
function removeCondition(itemId: string) {
  // 递归查找并删除条件项
  function findAndDelete(items: ConditionItem[]): boolean {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === itemId) {
        items.splice(i, 1)
        return true
      }
      if (items[i].groups) {
        for (const group of items[i].groups || []) {
          if (findAndDelete(group.items)) {
            return true
          }
        }
      }
    }
    return false
  }

  // 阻止删除默认的第一级规则
  if (rootGroups.value.items.length === 1 && findAndDelete(rootGroups.value.items)) {
    // 如果删除后没有规则，添加一个默认规则
    if ((rootGroups.value.items.length as number) === 0) {
      rootGroups.value.items.push({
        id: generateId(),
        field: '',
        condition: '',
        value: '',
        groups: [],
      })
    }
  } else {
    findAndDelete(rootGroups.value.items)
  }

  // 通知父组件
  emit('update:modelValue', rootGroups.value)
}

function handleQuery() {
  emit('query', rootGroups.value)
  console.log('树形搜索条件:', rootGroups.value)
}

function handleReset() {
  rootGroups.value = {
    operate: 'and',
    items: [
      {
        id: generateId(),
        field: '',
        condition: '',
        value: '',
        groups: [],
      },
    ],
  }
  savedCondition.value = ''
  emit('reset', rootGroups.value)
  emit('update:modelValue', rootGroups.value)
}
</script>

<style scoped>
.smart-screening {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.screening-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 10px;
}

.screening-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.screening-content {
  width: 100%;
}

.screening-table {
  border: 1px solid #eaeaea;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #eaeaea;
  font-weight: bold;
}

.header-cell {
  padding: 12px;
  text-align: center;
  border-right: 1px solid #eaeaea;
}

.header-cell:last-child {
  border-right: none;
}

.header-cell.level {
  width: 120px;
}

.header-cell.relation {
  width: 300px;
}

.header-cell.field {
  width: 300px;
}

.header-cell.logic {
  width: 300px;
}

.header-cell.value {
  flex: 1;
  min-width: 200px;
}

.header-cell.action {
  width: 300px;
}

.table-body {
  min-height: 50px;
}

.condition-group {
  border-bottom: 1px solid #eaeaea;
}

.condition-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  position: relative;
}

.condition-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #eaeaea;
}

.condition-cell {
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.condition-cell.level-cell {
  width: 80px;
}

.condition-cell {
  width: 300px;
}

.condition-cell.value {
  flex: 1;
  min-width: 200px;
  justify-content: flex-start;
}

.condition-cell.actions-cell {
  width: 250px;
  gap: 8px;
  justify-content: flex-start;
}

.sub-group-wrapper {
  margin-left: 40px;
  border-left: 1px solid #eaeaea;
  padding-left: 20px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.screening-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-input-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-right {
  display: flex;
  gap: 10px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .header-cell.action {
    width: 200px;
  }

  .condition-cell.actions-cell {
    width: 200px;
    gap: 4px;
  }

  .condition-cell.actions-cell .ant-btn {
    padding: 4px 8px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .smart-screening {
    padding: 10px;
  }

  .table-header {
    font-size: 12px;
  }

  .header-cell {
    padding: 8px;
  }

  .header-cell.level {
    width: 60px;
  }

  .header-cell.relation {
    width: 80px;
  }

  .header-cell.field {
    width: 120px;
  }

  .header-cell.logic {
    width: 100px;
  }

  .header-cell.value {
    min-width: 150px;
  }

  .header-cell.action {
    width: 150px;
  }

  .condition-cell.level-cell {
    width: 60px;
  }

  .condition-cell {
    width: 80px;
  }

  .condition-cell.field {
    width: 120px;
  }

  .condition-cell.logic {
    width: 100px;
  }

  .condition-cell.value {
    min-width: 150px;
  }

  .condition-cell.actions-cell {
    width: 150px;
    flex-wrap: wrap;
  }

  .sub-group-wrapper {
    margin-left: 20px;
    padding-left: 10px;
  }

  .screening-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .footer-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
