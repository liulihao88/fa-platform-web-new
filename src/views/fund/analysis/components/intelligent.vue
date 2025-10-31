<template>
  <!-- 标准数据-筛选 -->
  <a-card class="m2">
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
                <JSearchSelect
                    dict="fa_trans_query_col"
                    :getPopupContainer="retBodyContainer"
                    style="width: 100%"
                    @change="(value) => updateItem(item.id, { field: value })"
                    v-model:value="item.field"
                    placeholder="选择字段">
                </JSearchSelect>
              </div>
              <div class="condition-cell">
                <JSearchSelect
                    :getPopupContainer="retBodyContainer"
                    style="width: 100%"
                    @change="(value) => updateItem(item.id, { condition: value })"
                    dict="fa_trans_query_rule"
                    v-model:value="item.condition"
                    placeholder="选择逻辑">
                </JSearchSelect>
              </div>
              <div class="condition-cell">
                <!-- 输入框 -->
                <a-input
                    v-if="getFieldComponentType(item.field) === 'input'"
                    v-model:value="item.value"
                    placeholder="输入值"
                    allowClear
                    @change="(e) => updateItem(item.id, { value: e.target.value })"
                />
                <!-- 日期选择器 -->
                <a-date-picker
                    v-else-if="getFieldComponentType(item.field) === 'date'"
                    v-model:value="item.value"
                    style="width: 100%"
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                    valueFormat="YYYY-MM-DD"
                    @change="(value) => updateItem(item.id, { value })"
                />
                <!-- 日期时间选择器 -->
                <a-date-picker
                    v-else-if="getFieldComponentType(item.field) === 'datetime'"
                    v-model:value="item.value"
                    showTime
                    style="width: 100%"
                    placeholder="选择日期时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    valueFormat="YYYY-MM-DD HH:mm:ss"
                    @change="(value) => updateItem(item.id, { value })"
                />
                <!-- 下拉选择器 -->
                <a-select
                    v-else-if="getFieldComponentType(item.field) === 'select'"
                    v-model:value="item.value"
                    :options="getSelectOptions(item.field)"
                    placeholder="请选择"
                    style="width: 100%"
                    allowClear
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
                      <JSearchSelect
                          dict="fa_trans_query_col"
                          :getPopupContainer="retBodyContainer"
                          v-model:value="subItem.field"
                          placeholder="选择字段"
                          style="width: 100%"
                          allowClear
                          @change="(value) => updateSubItem(item.id, subIndex, subItem.id, { field: value })"
                      />
                    </div>
                    <div class="condition-cell">
                      <JSearchSelect
                          dict="fa_trans_query_rule"
                          :getPopupContainer="retBodyContainer"
                          v-model:value="subItem.condition"
                          placeholder="选择逻辑"
                          style="width: 100%"
                          allowClear
                          @change="(value) => updateSubItem(item.id, subIndex, subItem.id, { condition: value })"
                      />

                    </div>
                    <div class="condition-cell">
                      <!-- 输入框 -->
                      <a-input
                          v-if="getFieldComponentType(subItem.field) === 'input'"
                          v-model:value="subItem.value"
                          placeholder="输入值"
                          allowClear
                          @change="(e) => updateSubItem(item.id, subIndex, subItem.id, { value: e.target.value })"
                      />
                      <!-- 日期选择器 -->
                      <a-date-picker
                          v-else-if="getFieldComponentType(subItem.field) === 'date'"
                          v-model:value="subItem.value"
                          style="width: 100%"
                          placeholder="选择日期"
                          format="YYYY-MM-DD"
                          valueFormat="YYYY-MM-DD"
                          @change="(value) => updateSubItem(item.id, subIndex, subItem.id, { value })"
                      />
                      <!-- 日期时间选择器 -->
                      <a-date-picker
                          v-else-if="getFieldComponentType(subItem.field) === 'datetime'"
                          v-model:value="subItem.value"
                          showTime
                          style="width: 100%"
                          placeholder="选择日期时间"
                          format="YYYY-MM-DD HH:mm:ss"
                          valueFormat="YYYY-MM-DD HH:mm:ss"
                          @change="(value) => updateSubItem(item.id, subIndex, subItem.id, { value })"
                      />
                      <!-- 下拉选择器 -->
                      <a-select
                          v-else-if="getFieldComponentType(subItem.field) === 'select'"
                          v-model:value="subItem.value"
                          :options="getSelectOptions(subItem.field)"
                          placeholder="请选择"
                          style="width: 100%"
                          allowClear
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
                            <JSearchSelect
                                dict="fa_trans_query_col"
                                :getPopupContainer="retBodyContainer"
                                v-model:value="subItem3.field"
                                placeholder="选择字段"
                                style="width: 100%"
                                allowClear
                                @change="(value) => updateSubItem(subItem.id, subIndex3, subItem3.id, { field: value })"
                            />
                          </div>
                          <div class="condition-cell">
                            <JSearchSelect
                                dict="fa_trans_query_rule"
                                :getPopupContainer="retBodyContainer"
                                v-model:value="subItem3.condition"
                                placeholder="选择逻辑"
                                style="width: 100%"
                                allowClear
                                @change="(value) => updateSubItem(subItem.id, subIndex3, subItem3.id, { condition: value })"
                            />

                          </div>
                          <div class="condition-cell">
                            <!-- 输入框 -->
                            <a-input
                                v-if="getFieldComponentType(subItem3.field) === 'input'"
                                v-model:value="subItem3.value"
                                placeholder="输入值"
                                allowClear
                                @change="(e) => updateSubItem(subItem.id, subIndex3, subItem3.id, { value: e.target.value })"
                            />
                            <!-- 日期选择器 -->
                            <a-date-picker
                                v-else-if="getFieldComponentType(subItem3.field) === 'date'"
                                v-model:value="subItem3.value"
                                style="width: 100%"
                                placeholder="选择日期"
                                format="YYYY-MM-DD"
                                valueFormat="YYYY-MM-DD"
                                @change="(value) => updateSubItem(subItem.id, subIndex3, subItem3.id, { value })"
                            />
                            <!-- 日期时间选择器 -->
                            <a-date-picker
                                v-else-if="getFieldComponentType(subItem3.field) === 'datetime'"
                                v-model:value="subItem3.value"
                                showTime
                                style="width: 100%"
                                placeholder="选择日期时间"
                                format="YYYY-MM-DD HH:mm:ss"
                                valueFormat="YYYY-MM-DD HH:mm:ss"
                                @change="(value) => updateSubItem(subItem.id, subIndex3, subItem3.id, { value })"
                            />
                            <!-- 下拉选择器 -->
                            <a-select
                                v-else-if="getFieldComponentType(subItem3.field) === 'select'"
                                v-model:value="subItem3.value"
                                :options="getSelectOptions(subItem3.field)"
                                placeholder="请选择"
                                style="width: 100%"
                                allowClear
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
                                  <JSearchSelect
                                      dict="fa_trans_query_col"
                                      :getPopupContainer="retBodyContainer"
                                      v-model:value="subItem4.field"
                                      placeholder="选择字段"
                                      style="width: 100%"
                                      allowClear
                                      @change="(value) => updateSubItem(subItem3.id, subIndex4, subItem4.id, { field: value })"
                                  />
                                </div>
                                <div class="condition-cell">
                                  <JSearchSelect
                                      dict="fa_trans_query_rule"
                                      :getPopupContainer="retBodyContainer"
                                      v-model:value="subItem4.condition"
                                      placeholder="选择逻辑"
                                      style="width: 100%"
                                      allowClear
                                      @change="(value) => updateSubItem(subItem3.id, subIndex4, subItem4.id, { condition: value })"
                                  />

                                </div>
                                <div class="condition-cell">
                                  <!-- 输入框 -->
                                  <a-input
                                      v-if="getFieldComponentType(subItem4.field) === 'input'"
                                      v-model:value="subItem4.value"
                                      placeholder="输入值"
                                      allowClear
                                      @change="(e) => updateSubItem(subItem3.id, subIndex4, subItem4.id, { value: e.target.value })"
                                  />
                                  <!-- 日期选择器 -->
                                  <a-date-picker
                                      v-else-if="getFieldComponentType(subItem4.field) === 'date'"
                                      v-model:value="subItem4.value"
                                      style="width: 100%"
                                      placeholder="选择日期"
                                      format="YYYY-MM-DD"
                                      valueFormat="YYYY-MM-DD"
                                      @change="(value) => updateSubItem(subItem3.id, subIndex4, subItem4.id, { value })"
                                  />
                                  <!-- 日期时间选择器 -->
                                  <a-date-picker
                                      v-else-if="getFieldComponentType(subItem4.field) === 'datetime'"
                                      v-model:value="subItem4.value"
                                      showTime
                                      style="width: 100%"
                                      placeholder="选择日期时间"
                                      format="YYYY-MM-DD HH:mm:ss"
                                      valueFormat="YYYY-MM-DD HH:mm:ss"
                                      @change="(value) => updateSubItem(subItem3.id, subIndex4, subItem4.id, { value })"
                                  />
                                  <!-- 下拉选择器 -->
                                  <a-select
                                      v-else-if="getFieldComponentType(subItem4.field) === 'select'"
                                      v-model:value="subItem4.value"
                                      :options="getSelectOptions(subItem4.field)"
                                      placeholder="请选择"
                                      style="width: 100%"
                                      allowClear
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
                                        <JSearchSelect
                                            dict="fa_trans_query_col"
                                            :getPopupContainer="retBodyContainer"
                                            v-model:value="subItem5.field"
                                            placeholder="选择字段"
                                            style="width: 100%"
                                            allowClear
                                            @change="(value) => updateSubItem(subItem4.id, subIndex5, subItem5.id, { field: value })"
                                        />
                                      </div>
                                      <div class="condition-cell">
                                        <JSearchSelect
                                            dict="fa_trans_query_rule"
                                            :getPopupContainer="retBodyContainer"
                                            v-model:value="subItem5.condition"
                                            placeholder="选择逻辑"
                                            style="width: 100%"
                                            allowClear
                                            @change="(value) => updateSubItem(subItem4.id, subIndex5, subItem5.id, { condition: value })"
                                        />

                                      </div>
                                      <div class="condition-cell">
                                        <!-- 输入框 -->
                                        <a-input
                                            v-if="getFieldComponentType(subItem5.field) === 'input'"
                                            v-model:value="subItem5.value"
                                            placeholder="输入值"
                                            allowClear
                                            @change="(e) => updateSubItem(subItem4.id, subIndex5, subItem5.id, { value: e.target.value })"
                                        />
                                        <!-- 日期选择器 -->
                                        <a-date-picker
                                            v-else-if="getFieldComponentType(subItem5.field) === 'date'"
                                            v-model:value="subItem5.value"
                                            style="width: 100%"
                                            placeholder="选择日期"
                                            format="YYYY-MM-DD"
                                            valueFormat="YYYY-MM-DD"
                                            @change="(value) => updateSubItem(subItem4.id, subIndex5, subItem5.id, { value })"
                                        />
                                        <!-- 日期时间选择器 -->
                                        <a-date-picker
                                            v-else-if="getFieldComponentType(subItem5.field) === 'datetime'"
                                            v-model:value="subItem5.value"
                                            showTime
                                            style="width: 100%"
                                            placeholder="选择日期时间"
                                            format="YYYY-MM-DD HH:mm:ss"
                                            valueFormat="YYYY-MM-DD HH:mm:ss"
                                            @change="(value) => updateSubItem(subItem4.id, subIndex5, subItem5.id, { value })"
                                        />
                                        <!-- 下拉选择器 -->
                                        <a-select
                                            v-else-if="getFieldComponentType(subItem5.field) === 'select'"
                                            v-model:value="subItem5.value"
                                            :options="getSelectOptions(subItem5.field)"
                                            placeholder="请选择"
                                            style="width: 100%"
                                            allowClear
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

      <div class="mt4">
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
              @change="switchSavedCondition"
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
      </div>
    </div>
  </a-card>

  <!-- 表格部分 -->
  <BasicTable 
      class="m2" 
      :columns="columns" 
      :dataSource="dataSource" 
      :loading="tableLoading"
      :scroll="{ x: 2000 }"
      :row-selection="rowSelection"
      :pagination="pagination"
      bordered
      @change="handleTableChange"
      rowKey="id"
      :canColDrag="true"
      :showTableSetting="true"
      :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-intelligent-table' }"
      :canResize="true"
      :minHeight="300"
      @register="registerTable"
  >
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" @click="exportCurrentPage">
        导出本页数据
      </a-button>
      <a-button
        type="primary"
        @click="exportMarkedData"
        :disabled="selectedRowKeys.length === 0"
      >
        导出选择数据
      </a-button>
      <a-button type="primary" @click="showArchiveModal">
        生成卷宗信息
      </a-button>
    </template>
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
      </template>
      <template v-else-if="column.key === 'transAmt'">
        {{ record.transAmt?.toLocaleString() }}
      </template>
      <template v-else-if="column.key === 'operation'">
        <a-button type="link" @click="showDetailModal(record)">查看原信息</a-button>
      </template>
    </template>
  </BasicTable>

  <!-- 卷宗信息预览Modal -->
  <BasicModal
      v-model:visible="archiveModalVisible"
      title="卷宗信息预览"
      width="1200px"
      :footer="null"
  >
    <a-card>
      <div class="archive-preview">
        <!-- 卷宗预览内容 -->
        <div class="preview-content">
          <a-textarea v-model:value="archiveModalPreviewData" placeholder="卷宗信息" :rows="14" />
        </div>
        <a-row class="mt4">
          <a-col span="8" offset="16">
            <a-button class="mr4" @click="archiveModalVisible = false">关闭</a-button>
            <a-button type="primary" @click="sendArchive">发送</a-button>
          </a-col>
        </a-row>
      </div>
    </a-card>
  </BasicModal>

  <!-- 查看原信息Modal -->
  <BasicModal
    v-model:visible="detailModalVisible"
    title="查看原信息"
    width="1200px"
    useWrapper="true"
    :footer="null"
    @cancel="closeDetailModal"
  >
    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <!-- 银行客户信息 -->
      <a-tab-pane key="bankCustomer" tab="银行客户信息">
        <BasicTable
          :columns="bankCustomerColumns"
          :dataSource="bankCustomerDataSource"
          :loading="bankCustomerLoading"
          :pagination="bankCustomerPagination"
          bordered
          size="small"
          :scroll="{ x: 1500, y: 400 }"
          @change="handleBankCustomerTableChange"
          :canColDrag="true"
          :showTableSetting="true"
          :tableSetting="{ redo: true, size: true, setting: true, fullScreen: true, cacheKey: 'intelligent-bank-customer-table' }"
          :canResize="true"
          :minHeight="300"
        />
      </a-tab-pane>

      <!-- 银行交易流水 -->
      <a-tab-pane key="bankTransaction" tab="银行交易流水">
        <BasicTable
          :columns="bankTransactionColumns"
          :dataSource="bankTransactionDataSource"
          :loading="bankTransactionLoading"
          :pagination="bankTransactionPagination"
          bordered
          size="small"
          :scroll="{ x: 1500, y: 400 }"
          @change="handleBankTransactionTableChange"
          :canColDrag="true"
          :showTableSetting="true"
          :tableSetting="{ redo: true, size: true, setting: true, fullScreen: true, cacheKey: 'intelligent-bank-transaction-table' }"
          :canResize="true"
          :minHeight="300"
        />
      </a-tab-pane>

      <!-- 非银行客户信息 -->
      <a-tab-pane key="nonBankCustomer" tab="非银行客户信息">
        <BasicTable
          :columns="nonBankCustomerColumns"
          :dataSource="nonBankCustomerDataSource"
          :loading="nonBankCustomerLoading"
          :pagination="nonBankCustomerPagination"
          bordered
          size="small"
          :scroll="{ x: 1500, y: 400 }"
          @change="handleNonBankCustomerTableChange"
          :canColDrag="true"
          :showTableSetting="true"
          :tableSetting="{ redo: true, size: true, setting: true, fullScreen: true, cacheKey: 'intelligent-non-bank-customer-table' }"
          :canResize="true"
          :minHeight="300"
        />
      </a-tab-pane>

      <!-- 非银行交易流水 -->
      <a-tab-pane key="nonBankTransaction" tab="非银行交易流水">
        <BasicTable
          :columns="nonBankTransactionColumns"
          :dataSource="nonBankTransactionDataSource"
          :loading="nonBankTransactionLoading"
          :pagination="nonBankTransactionPagination"
          bordered
          size="small"
          :scroll="{ x: 1500, y: 400 }"
          @change="handleNonBankTransactionTableChange"
          :canColDrag="true"
          :showTableSetting="true"
          :tableSetting="{ redo: true, size: true, setting: true, fullScreen: true, cacheKey: 'intelligent-non-bank-transaction-table' }"
          :canResize="true"
          :minHeight="300"
        />
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
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
  // 添加查看原信息相关API
  standardCustomerApi,
  standardTransApi,
  standardNonBankCustomerApi,
  standardNonBankTransApi
} from './../user.api'

// ts语法
import { useRoute } from 'vue-router';
import { useRouter } from "vue-router";
import {useMethods} from "@/hooks/system/useMethods";
import JSearchSelect from "@/components/Form/src/jeecg/components/JSearchSelect.vue";
import { copyTextToClipboard } from '@/hooks/web/useCopyToClipboard';
import {BasicModal, useModalInner} from '/@/components/Modal';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
const { handleExportXls } = useMethods();
const router = useRouter();
const { query } = useRoute();
const archiveModalVisible = ref(false);
const archiveModalPreviewData = ref('');

// 查看原信息相关状态
const detailModalVisible = ref(false);
const activeTab = ref('bankCustomer');
const currentRecord = ref<any>(null);

// 银行客户信息表格状态
const bankCustomerDataSource = ref([]);
const bankCustomerLoading = ref(false);
const bankCustomerPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 银行交易流水表格状态
const bankTransactionDataSource = ref([]);
const bankTransactionLoading = ref(false);
const bankTransactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 非银行客户信息表格状态
const nonBankCustomerDataSource = ref([]);
const nonBankCustomerLoading = ref(false);
const nonBankCustomerPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 非银行交易流水表格状态
const nonBankTransactionDataSource = ref([]);
const nonBankTransactionLoading = ref(false);
const nonBankTransactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 行选择配置 - 增加全选功能
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

const formRef = ref();
const tableLoading = ref(false);
const searchLoading = ref(false);

// 选中的行数据
const selectedRowKeys = ref<string[]>([]);
const selectedRowsData = ref<any[]>([]);
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
const columns = [
  {
    title: '发起行',
    dataIndex: 'orgCd',
    key: 'orgCd',
    align: 'center' as const,
    resizable: true
  },
  {
    title: '户名',
    dataIndex: 'customerName',
    key: 'customerName',
    ellipsis: true,
    resizable: true
  },
  {
    title: '账号/卡号',
    dataIndex: 'transAccountNo',
    key: 'transAccountNo',
    ellipsis: true,
    resizable: true
  },
  {
    title: '流水号',
    dataIndex: 'transNo',
    key: 'transNo',
    ellipsis: true,
    resizable: true
  },
  {
    title: '交易渠道',
    dataIndex: 'channel',
    key: 'channel',
    ellipsis: true,
    resizable: true
  },
  {
    title: '币种',
    dataIndex: 'currNo',
    key: 'currNo',
    align: 'center' as const,
    resizable: true
  },
  {
    title: '交易方向',
    dataIndex: 'transWay',
    key: 'transWay',
    align: 'center' as const,
    resizable: true
  },
  {
    title: '交易金额',
    dataIndex: 'transAmt',
    key: 'transAmt',
    align: 'right' as const,
    resizable: true
  },
  {
    title: '交易种类',
    dataIndex: 'transType',
    key: 'transType',
    align: 'center' as const,
    resizable: true
  },
  {
    title: '业务日期',
    dataIndex: 'bizDate',
    key: 'bizDate',
    align: 'center' as const,
    resizable: true
  },
  {
    title: '交易时间',
    dataIndex: 'transTime',
    key: 'transTime',
    align: 'center' as const,
    resizable: true
  },
  {
    title: '对方开户银行',
    dataIndex: 'counterOrgName',
    key: 'counterOrgName',
    ellipsis: true,
    resizable: true
  },
  {
    title: '对方户名',
    dataIndex: 'counterName',
    key: 'counterName',
    ellipsis: true,
    resizable: true
  },
  {
    title: '对方账号/卡号',
    dataIndex: 'counterAccountNo',
    key: 'counterAccountNo',
    ellipsis: true,
    resizable: true
  },
  {
    title: '交易状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center' as const,
    resizable: true
  },
  {
    title: '操作',
    key: 'operation',
    align: 'center' as const,
    width: 100,
    fixed: 'right' as const
  }
];

// 银行客户信息列配置
const bankCustomerColumns = [
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true },
  { title: '归属银行', dataIndex: 'orgCd', width: 100, resizable: true },
  { title: '客户号', dataIndex: 'customerId', width: 100, resizable: true },
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true },
  { title: '客户名称', dataIndex: 'customerName', width: 100, resizable: true },
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true },
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true },
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '账号', dataIndex: 'accountNum', width: 100, resizable: true },
  { title: '卡号', dataIndex: 'cardNum', width: 100, resizable: true },
  { title: '状态', dataIndex: 'customerStatus', width: 100, resizable: true },
  { title: '开户日期', dataIndex: 'openDate', width: 100, resizable: true },
  { title: '余额', dataIndex: 'balence', width: 100, resizable: true },
  { title: '账户类型', dataIndex: 'accountType', width: 100, resizable: true },
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true },
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true },
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true }
];

// 银行交易流列配置
const bankTransactionColumns = [
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true },
  { title: '归属机构', dataIndex: 'orgCd', width: 100, resizable: true },
  { title: '账号', dataIndex: 'accountNum', width: 100, resizable: true },
  { title: '卡号', dataIndex: 'cardNum', width: 100, resizable: true },
  { title: '流水号', dataIndex: 'transNo', width: 100, resizable: true },
  { title: '交易渠道', dataIndex: 'channel', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '交易方向', dataIndex: 'transWay', width: 100, resizable: true },
  { title: '交易金额', dataIndex: 'transAmt', width: 100, resizable: true },
  { title: '贷方发生额', dataIndex: 'creditAmt', width: 100, resizable: true },
  { title: '余额', dataIndex: 'balence', width: 100, resizable: true },
  { title: '交易种类', dataIndex: 'transType', width: 100, resizable: true },
  { title: '业务日期', dataIndex: 'bizDate', width: 100, resizable: true },
  { title: '交易时间', dataIndex: 'transTime', width: 100, resizable: true },
  { title: '设备MAC', dataIndex: 'macAddress', width: 100, resizable: true },
  { title: '交易IP地址', dataIndex: 'ipAddress', width: 100, resizable: true },
  { title: '交易状态', dataIndex: 'status', width: 100, resizable: true },
  { title: '对方机构', dataIndex: 'counterOrgName', width: 100, resizable: true },
  { title: '对方客户号', dataIndex: 'counterCustomerId', width: 100, resizable: true },
  { title: '对方账号', dataIndex: 'counterAccountNo', width: 100, resizable: true },
  { title: '对方户名', dataIndex: 'counterName', width: 100, resizable: true },
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true },
  { title: '户名', dataIndex: 'customerName', width: 100, resizable: true },
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true },
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true },
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true },
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true },
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true },
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true },
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true }
];

// 非银行客户信息列配置
const nonBankCustomerColumns = [
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true },
  { title: '归属机构', dataIndex: 'orgCd', width: 100, resizable: true },
  { title: '客户号', dataIndex: 'customerId', width: 100, resizable: true },
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true },
  { title: '客户名称', dataIndex: 'customerName', width: 100, resizable: true },
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true },
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true },
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true },
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true },
  { title: '是否商户', dataIndex: 'isMerchant', width: 100, resizable: true },
  { title: '商户号', dataIndex: 'merchantId', width: 100, resizable: true },
  { title: '终端号', dataIndex: 'portId', width: 100, resizable: true },
  { title: '结算银行', dataIndex: 'settlementOrg', width: 100, resizable: true },
  { title: '结算账号', dataIndex: 'settlementAccountNum', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '状态', dataIndex: 'customerStatus', width: 100, resizable: true },
  { title: '账户类型', dataIndex: 'accountType', width: 100, resizable: true },
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true },
  { title: '开户日期', dataIndex: 'openDate', width: 100, resizable: true },
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true },
  { title: '商户名称', dataIndex: 'merchantName', width: 100, resizable: true },
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true }
];

// 非银行交易流列配置
const nonBankTransactionColumns = [
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true },
  { title: '归属机构', dataIndex: 'orgCd', width: 100, resizable: true },
  { title: '商户号', dataIndex: 'merchantId', width: 100, resizable: true },
  { title: '终端号', dataIndex: 'portId', width: 100, resizable: true },
  { title: '订单号', dataIndex: 'orderNo', width: 100, resizable: true },
  { title: '商户名称', dataIndex: 'merchantName', width: 100, resizable: true },
  { title: '商品名称', dataIndex: 'productName', width: 100, resizable: true },
  { title: '流水号', dataIndex: 'transNo', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '交易方向', dataIndex: 'transWay', width: 100, resizable: true },
  { title: '交易金额', dataIndex: 'transAmt', width: 100, resizable: true },
  { title: '贷方发生额', dataIndex: 'creditAmt', width: 100, resizable: true },
  { title: '交易种类', dataIndex: 'transType', width: 100, resizable: true },
  { title: '业务日期', dataIndex: 'bizDate', width: 100, resizable: true },
  { title: '交易时间', dataIndex: 'transTime', width: 100, resizable: true },
  { title: '设备MAC', dataIndex: 'macAddress', width: 100, resizable: true },
  { title: '交易IP地址', dataIndex: 'ipAddress', width: 100, resizable: true },
  { title: '交易状态', dataIndex: 'status', width: 100, resizable: true },
  { title: '交易卡开户行', dataIndex: 'openOrgCd', width: 100, resizable: true },
  { title: '户名', dataIndex: 'customerName', width: 100, resizable: true },
  { title: '交易卡号', dataIndex: 'cardNum', width: 100, resizable: true },
  { title: '卡类型', dataIndex: 'cardType', width: 100, resizable: true },
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true },
  { title: '创建日期', dataIndex: 'createTime', width: 100, resizable: true },
  { title: '客户号', dataIndex: 'customerId', width: 100, resizable: true },
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true },
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true },
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true },
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true },
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true },
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true },
  { title: '结算行', dataIndex: 'settlementOrg', width: 100, resizable: true },
  { title: '结算账号', dataIndex: 'settlementAccountNum', width: 100, resizable: true },
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true }
];

const dataSource = ref([]);

const [registerTable] = useTable({
  columns,
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
    redo: true, 
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-intelligent-table'
  }
});

// 动态查询组件相关逻辑
// 关系枚举
const relationOptions = [
  { label: '且', value: 'and' },
  { label: '或', value: 'or' },
];

// 逻辑运算符枚举 - 使用新的数据结构
const operatorOptions = ref([
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'ne' },
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'ge' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'le' },
  { label: '包含', value: 'like' },
  { label: '不包含', value: 'not_like' }
]);

// 字段枚举 - 使用新的数据结构
const fieldOptions = ref([
  { value: 'org_cd', label: '发起行' },
  { value: 'customer_name', label: '户名' },
  { value: 'rel_account_no', label: '账号/卡号' },
  { value: 'trans_no', label: '流水号' },
  { value: 'channel', label: '交易渠道' },
  { value: 'curr_no', label: '币种' },
  { value: 'trans_way', label: '交易方向' },
  { value: 'trans_amt', label: '交易金额' },
  { value: 'trans_type', label: '交易种类' },
  { value: 'biz_date', label: '业务日期' },
  { value: 'trans_time', label: '交易时间' },
  { value: 'counter_org_cd', label: '对方开户银行' },
  { value: 'counter_name', label: '对方户名' },
  { value: 'counter_account_no', label: '对方账号/卡号' },
  { value: 'status', label: '交易状态' }
]);

// 下拉选选项配置
const selectOptions = {
  // 币种选项
  curr_no: [
    { label: '人民币', value: 'CNY' },
    { label: '美元', value: 'USD' },
    { label: '港元', value: 'HKD' },
    { label: '澳门元', value: 'MOP' },
    { label: '欧元', value: 'EUR' },
    { label: '日元', value: 'JPY' },
    { label: '新台币', value: 'TWD' },
  ],
  // 交易方向选项
  trans_way: [
    { label: '转入', value: '01' },
    { label: '转出', value: '02' }
  ],
  // 交易种类选项
  trans_type: [
    { label: '现金', value: '001' },
    { label: '转账', value: '002' },
    { label: '消费', value: '003' },
    { label: '退款', value: '004' },
    { label: '投资', value: '005' },
    { label: '收益', value: '006' },
    { label: '利息', value: '007' },
    { label: '还款', value: '008' },
    { label: '回款', value: '009' },
    { label: '费用', value: '010' },
    { label: '违约金', value: '011' },
  ],
  // 交易状态选项
  status: [
    { label: '正常', value: '00' },
    { label: '撤销', value: '01' },
    { label: '冲账', value: '02' },
    { label: '抹账', value: '03' },
    { label: '其他', value: '99' },
  ]
};

// 判断字段类型
// 判断字段类型 - 修复：根据字段名而不是逻辑运算符判断组件类型
const getFieldComponentType = (field: string) => {
  console.info('字段类型判断------>', field);
  switch (field) {
    case 'biz_date':
      return 'date'; // 日期选择器
    case 'trans_time':
      return 'datetime'; // 日期时间选择器
    case 'curr_no':
    case 'trans_way':
    case 'trans_type':
    case 'status':
      return 'select'; // 下拉选择器
    default:
      return 'input'; // 输入框
  }
};
// 获取下拉选项
const getSelectOptions = (field: string) => {
  return selectOptions[field] || [];
};
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
          if (item.groups && item.groups.length > 0) {
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

// 更新条件项时，如果字段改变，重置逻辑运算符和值
const updateItem = (itemId: string, updates: Partial<ConditionItem>) => {
  const findAndUpdate = (items: ConditionItem[]): boolean => {
    for (const item of items) {
      if (item.id === itemId) {
        // 如果字段改变
        if (updates.field !== undefined && updates.field !== item.field) {
          // 字段改变，重置逻辑运算符和值
          updates.condition = '';
          updates.value = '';
        }
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

// 同样修改 updateSubItem 方法
// 同样修改 updateSubItem 方法
const updateSubItem = (parentId: string, groupIndex: number, itemId: string, updates: Partial<ConditionItem>) => {
  const findAndUpdateSubItem = (items: ConditionItem[]): boolean => {
    for (const item of items) {
      if (item.id === parentId) {
        if (item.groups && item.groups[groupIndex]) {
          const subItemIndex = item.groups[groupIndex].items.findIndex(subItem => subItem.id === itemId);
          if (subItemIndex !== -1) {
            const currentItem = item.groups[groupIndex].items[subItemIndex];

            // 如果字段改变
            if (updates.field !== undefined && updates.field !== currentItem.field) {
              // 字段改变，重置逻辑运算符和值
              updates.condition = '';
              updates.value = '';
            }

            Object.assign(currentItem, updates);
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

// 删除条件 - 确保第一级至少保留一个条件
const removeCondition = (conditionId: string) => {
  const findAndRemove = (items: ConditionItem[]): boolean => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === conditionId) {
        // 检查是否是第一级的唯一条件
        if (items === rootGroups.value.items && items.length === 1) {
          message.warning('至少需要保留一个查询条件');
          return true;
        }
        items.splice(i, 1);
        return true;
      }
      // 添加类型检查以避免"对象可能为未定义"的错误
      if (items[i].groups && items[i].groups!.length > 0) {
        for (const group of items[i].groups!) {
          const found = findAndRemove(group.items);
          if (found) return true;
        }
      }
    }
    return false;
  };

  if (rootGroups.value.items) {
    findAndRemove(rootGroups.value.items);
  }
};

// 重置条件
const resetConditions = () => {
  rootGroups.value = {
    operate: 'and',
    items: [{
      id: generateId(),
      condition: '',
      field: '',
      value: '',
      groups: []
    }]
  };
};

// 保存筛选条件 - 确保数据结构正确
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
    console.info('888888888888888888',group)
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

  // 处理数据格式，确保与后端一致
  const processGroupForSave = (group: ConditionGroup): any => {
    return {
      operate: group.operate,
      items: group.items.map(item => ({
        id: item.id,
        // 注意：这里要交换字段和逻辑运算符的映射
        condition: item.condition,
        field: item.field,
        value: item.value,
        groups: (item.groups || []).map(subGroup => processGroupForSave(subGroup))
      }))
    };
  };

  const saveData = processGroupForSave(rootGroups.value);
  console.info('条件1111111111111111--------->',saveData)
  const grouptootData = {
    grouproot: saveData
  }
  console.info('222222222222222222222--------->',grouptootData)
  const params = {
    caseId: query.caseId,
    name: conditionName.value,
    queryType: 'trans',
    conditionJson: JSON.stringify(grouptootData) // 包装成数组
  };

  console.log('保存的数据:', params);

  saveQueryConditionApi(params).then(() => {
    getQueryConditionList(); // 保存成功，刷新下拉选枚举
    saveMode.value = false;
    conditionName.value = '';
  }).catch(error => {
    console.error('保存失败:', error);

  });
};

// 切换已保存的条件，回显到查询组件内
const switchSavedCondition = (conditionId: string) => {

  const condition = savedConditions.value.find(item => item.id === conditionId);
  if (condition && condition.conditions) {
    try {
      const parsedConditions = JSON.parse(condition.conditions);
      console.log('解析的条件数据:', parsedConditions);

      if (parsedConditions) {
        const savedGroup = parsedConditions.grouproot;

        // 递归处理条件数据，修复字段和逻辑运算符的映射
        const processConditionGroup = (group: any): ConditionGroup => {
          return {
            operate: group.operate || 'and',
            items: (group.items || []).map((item: any) => ({
              id: item.id || generateId(),
              // 修复：交换 condition 和 field 的映射
              condition: item.condition || '',
              field: item.field || '',
              value: item.value || '',
              groups: (item.groups || []).map((subGroup: any) => processConditionGroup(subGroup))
            }))
          };
        };

        rootGroups.value = processConditionGroup(savedGroup);
      } else {
        // 如果没有有效条件，创建空条件
        rootGroups.value = {
          operate: 'and',
          items: []
        };
        addRootCondition();
      }
    } catch (error) {
      console.error('解析保存的条件失败:', error);
      // 出错时重置条件
      rootGroups.value = {
        operate: 'and',
        items: []
      };
      addRootCondition();
    }
  } else {
    message.warning('未找到对应的筛选条件');
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

    if (response && response.length) {
      savedConditions.value = response.map(item => ({
        id: item.id,
        name: item.name,
        conditions: item.conditionJson
      }));
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
      conditionJson: JSON.stringify({grouproot:rootGroups.value}),
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
  selectedRowsData.value = [];
  pagination.current = 1;
  fetchIntelligentList();
};

// 导出本页数据
const exportCurrentPage = async () => {
  const params = {
    caseId: query.caseId,
    ids: selectedRowKeys.value,
    conditionJson: JSON.stringify({grouproot:rootGroups.value}),
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
    conditionJson: JSON.stringify({grouproot:rootGroups.value}),
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
    conditionJson: JSON.stringify({grouproot:rootGroups.value}),
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  };
  const response = await fileContextInfo(params);
  console.info('接口响应数据:', response);
  archiveModalVisible.value = true;
  archiveModalPreviewData.value = response;
};

// 发送卷宗信息
const sendArchive = () => {
  const success = copyTextToClipboard(archiveModalPreviewData.value);
  if (success) {
    message.success('复制成功！');
  } else {
    message.error('复制失败！');
  }
};

// 显示查看原信息弹窗
const showDetailModal = (record) => {
  currentRecord.value = record;
  activeTab.value = 'bankCustomer';
  detailModalVisible.value = true;
  // 默认加载第一个页签数据
  loadTabData('bankCustomer');
};

// 关闭查看原信息弹窗
const closeDetailModal = () => {
  detailModalVisible.value = false;
  // 重置所有分页
  resetAllPagination();
  // 清空所有数据
  bankCustomerDataSource.value = [];
  bankTransactionDataSource.value = [];
  nonBankCustomerDataSource.value = [];
  nonBankTransactionDataSource.value = [];
};

// 重置所有分页参数
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

// 选项卡切换处理
const handleTabChange = (key) => {
  loadTabData(key);
};

// 加载选项卡数据
const loadTabData = async (tabKey) => {
  if (!currentRecord.value) return;

  try {
    let response;
    const params: any = {
      caseId: query.caseId,
      filePageId: currentRecord.value.caseFilePageId,
      pageNo: 1,
      pageSize: 10
    };

    switch (tabKey) {
      case 'bankCustomer':
        // 银行客户信息需要客户号查询条件
        if (!currentRecord.value.customerCd) {
          message.warning('客户号为空，数据不完整');
          return;
        }
        params.customerCd = currentRecord.value.customerCd;
        bankCustomerLoading.value = true;
        response = await standardCustomerApi(params);
        bankCustomerDataSource.value = response.records || [];
        bankCustomerPagination.total = response.total || 0;
        break;

      case 'bankTransaction':
        // 银行交易流水需要交易账号查询条件
        if (!currentRecord.value.transAccountNo) {
          message.warning('交易账号为空，数据不完整');
          return;
        }
        params.transAccoutNo = currentRecord.value.transAccountNo;
        params.transNo = currentRecord.value.transNo;
        bankTransactionLoading.value = true;
        response = await standardTransApi(params);
        bankTransactionDataSource.value = response.records || [];
        bankTransactionPagination.total = response.total || 0;
        break;

      case 'nonBankCustomer':
        // 非银行客户信息需要客户号查询条件
        if (!currentRecord.value.customerCd) {
          message.warning('客户号为空，数据不完整');
          return;
        }
        params.customerCd = currentRecord.value.customerCd;
        nonBankCustomerLoading.value = true;
        response = await standardNonBankCustomerApi(params);
        nonBankCustomerDataSource.value = response.records || [];
        nonBankCustomerPagination.total = response.total || 0;
        break;

      case 'nonBankTransaction':
        // 非银行交易流水需要交易账号查询条件
        if (!currentRecord.value.transAccountNo) {
          message.warning('交易账号为空，数据不完整');
          return;
        }
        params.transAccoutNo = currentRecord.value.transAccountNo;
        params.transNo = currentRecord.value.transNo;
        nonBankTransactionLoading.value = true;
        response = await standardNonBankTransApi(params);
        nonBankTransactionDataSource.value = response.records || [];
        nonBankTransactionPagination.total = response.total || 0;
        break;
    }
  } catch (error) {
    console.error(`加载${tabKey}数据失败:`, error);
    message.error(`加载数据失败`);
  } finally {
    // 根据tabKey关闭对应的loading状态
    switch (tabKey) {
      case 'bankCustomer':
        bankCustomerLoading.value = false;
        break;
      case 'bankTransaction':
        bankTransactionLoading.value = false;
        break;
      case 'nonBankCustomer':
        nonBankCustomerLoading.value = false;
        break;
      case 'nonBankTransaction':
        nonBankTransactionLoading.value = false;
        break;
    }
  }
};

// 银行客户信息表格分页变化处理
const handleBankCustomerTableChange = (pagination) => {
  bankCustomerPagination.current = pagination.current;
  bankCustomerPagination.pageSize = pagination.pageSize;
  
  // 重新加载数据
  const params = {
    caseId: query.caseId,
    filePageId: currentRecord.value.caseFilePageId,
    customerCd: currentRecord.value?.customerName,
    pageNo: bankCustomerPagination.current,
    pageSize: bankCustomerPagination.pageSize
  };
  
  standardCustomerApi(params).then(response => {
    bankCustomerDataSource.value = response.records || [];
    bankCustomerPagination.total = response.total || 0;
  }).catch(error => {
    console.error('加载银行客户信息失败:', error);
    message.error('加载数据失败');
  });
};

// 银行交易流水分页变化处理
const handleBankTransactionTableChange = (pagination) => {
  bankTransactionPagination.current = pagination.current;
  bankTransactionPagination.pageSize = pagination.pageSize;
  
  // 重新加载数据
  const params = {
    caseId: query.caseId,
    filePageId: currentRecord.value.caseFilePageId,
    transAccoutNo: currentRecord.value?.transAccountNo,
    transNo: currentRecord.value?.transNo,
    pageNo: bankTransactionPagination.current,
    pageSize: bankTransactionPagination.pageSize
  };
  
  standardTransApi(params).then(response => {
    bankTransactionDataSource.value = response.records || [];
    bankTransactionPagination.total = response.total || 0;
  }).catch(error => {
    console.error('加载银行交易流水失败:', error);
    message.error('加载数据失败');
  });
};

// 非银行客户信息表格分页变化处理
const handleNonBankCustomerTableChange = (pagination) => {
  nonBankCustomerPagination.current = pagination.current;
  nonBankCustomerPagination.pageSize = pagination.pageSize;
  
  // 重新加载数据
  const params = {
    caseId: query.caseId,
    filePageId: currentRecord.value.caseFilePageId,
    customerCd: currentRecord.value?.customerName,
    pageNo: nonBankCustomerPagination.current,
    pageSize: nonBankCustomerPagination.pageSize
  };
  
  standardNonBankCustomerApi(params).then(response => {
    nonBankCustomerDataSource.value = response.records || [];
    nonBankCustomerPagination.total = response.total || 0;
  }).catch(error => {
    console.error('加载非银行客户信息失败:', error);
    message.error('加载数据失败');
  });
};

// 非银行交易流水分页变化处理
const handleNonBankTransactionTableChange = (pagination) => {
  nonBankTransactionPagination.current = pagination.current;
  nonBankTransactionPagination.pageSize = pagination.pageSize;
  
  // 重新加载数据
  const params = {
    caseId: query.caseId,
    filePageId: currentRecord.value.caseFilePageId,
    transAccoutNo: currentRecord.value?.transAccountNo,
    transNo: currentRecord.value?.transNo,
    pageNo: nonBankTransactionPagination.current,
    pageSize: nonBankTransactionPagination.pageSize
  };
  
  standardNonBankTransApi(params).then(response => {
    nonBankTransactionDataSource.value = response.records || [];
    nonBankTransactionPagination.total = response.total || 0;
  }).catch(error => {
    console.error('加载非银行交易流水失败:', error);
    message.error('加载数据失败');
  });
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
    /*margin: 16px 0;*/
  }

  /* 动态查询组件样式 */
  .dynamic-query {
    width: 100%;
  }

  .query-actions {
    /*margin-bottom: 16px;*/
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
    font-weight: 550;
  }

  .header-item {
    flex: 1;
    padding: 5px 16px;
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
