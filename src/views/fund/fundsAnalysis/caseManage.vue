<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, reactive, ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { $toast } from '@oeos-components/utils'
import {
  caseInvolvedList,
  getCommonDictionary,
  getCompanyOrPersonDetailApi,
  getInvolvedPersonApi,
  getInvolvedRelationApi,
  updateInvolvedPersonApi,
} from '@/api/analysis'
import { buildDescriptionOptions } from '@/utils/gFunc'
import { useGlobalTablePageSize, useRelativeHeight } from '@/hooks'
import { useCommonHook } from '@/store'

const route = useRoute()
const { proxy } = getCurrentInstance()
const pageRef = useTemplateRef('pageRef')
const tableSectionRef = useTemplateRef('tableSectionRef')
const { height: tableHeight } = useRelativeHeight(tableSectionRef, pageRef, { minHeight: 320, offset: 50 })
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()
const { getDictItems, setCommonItems, sysAllDictItems } = useCommonHook()

const searchForm = reactive({
  pageNo: 1,
  pageSize: 10,
  customerName: '',
  idNum: '',
  cardNum: '',
  accountNum: '',
})
syncPageSize(searchForm)

const searchItems = [
  { label: '涉案人名称', prop: 'customerName', type: 'input', placeholder: '请输入涉案人名称' },
  { label: '证件号码', prop: 'idNum', type: 'input', placeholder: '请输入证件号码' },
  { label: '涉案人卡号', prop: 'cardNum', type: 'input', placeholder: '请输入涉案人卡号' },
  { label: '涉案人账号', prop: 'accountNum', type: 'input', placeholder: '请输入涉案人账号' },
] as any[]

const data = ref<Record<string, any>[]>([])
const total = ref(0)
const loading = ref(false)
const relationVisible = ref(false)
const personDetailVisible = ref(false)
const personDetail = ref<Record<string, any>>({})
const currentRecord = ref<Record<string, any>>({})
const relationData = ref<Record<string, any>[]>([])
const relatedPersonList = ref<Record<string, any>[]>([])

const relatedOptions = computed(() => getDictItems('fa_involved_person_relation') || [])
const kindOptions = computed(() => getDictItems('fa_involved_person_type') || [])
const idTypeOptions = computed(() => getDictItems('fa_id_type') || [])

async function ensureDictLoaded(code: string) {
  if ((getDictItems(code) || []).length > 0) return
  const res = await getCommonDictionary(code)
  const items = Array.isArray(res) ? res : res?.result || []
  setCommonItems('sysAllDictItems', {
    ...(sysAllDictItems || {}),
    [code]: items,
  })
}

const columns = [
  { label: '涉案人种类', prop: 'involvedKind', width: 120, useSlot: true },
  { label: '涉案人', prop: 'customerName', minWidth: 200 },
  { label: '证件号码', prop: 'idNum', minWidth: 200 },
  { label: '涉案人卡号', prop: 'cardNum', minWidth: 160 },
  { label: '涉案人账号', prop: 'accountNum', minWidth: 160 },
  {
    key: 'operation',
    label: '操作',
    fixed: 'right',
    btns: [
      // { content: '关系', handler: viewRelations },
      { handler: showPersonDetail, ...proxy.setDetailAttrs({ content: '涉案人详情' }) },
    ],
  },
] as any[]

const relationColumns = [
  { label: '相关方', prop: 'customerName', minWidth: 140 },
  { label: '关系', prop: 'relation', minWidth: 100, useSlot: true },
  { label: '相关方', prop: 'relatedPersonCode', minWidth: 180, useSlot: true },
  { label: '操作', prop: 'operation', width: 160, useSlot: true, align: 'center' },
] as any[]

const personDetailOptions = computed(() =>
  buildDescriptionOptions(
    [
      { label: '客户名称', prop: 'customerName' },
      { label: '客户类型', prop: 'customerType' },
      { label: '营业执照', prop: 'licenseNum' },
      { label: '法人姓名', prop: 'legalPersonName' },
      { label: '证件种类', prop: 'idType', filter: (value) => getIdTypeText(value) },
      { label: '证件号码', prop: 'idNum' },
      { label: '联系电话', prop: 'teleNum' },
      { label: '法人证件类型', prop: 'legalIdType' },
      { label: '法人证件号码', prop: 'legalIdNum' },
      { label: '机构编码', prop: 'orgCd' },
      { label: '机构名称', prop: 'orgName' },
      { label: '客户状态', prop: 'customerStatus' },
      { label: '工作单位', prop: 'workUnit' },
      { label: '地税号', prop: 'localTaxNum' },
      { label: '国税号', prop: 'countryTaxNum' },
      { label: '家庭电话', prop: 'homeTel' },
      { label: '单位电话', prop: 'unitTel' },
      { label: '通讯地址', prop: 'communicationAddr' },
      { label: '家庭住址', prop: 'homeAddr' },
      { label: '单位地址', prop: 'unitAddr' },
      { label: '邮寄地址', prop: 'mailAddr' },
      { label: '邮政编码', prop: 'postCode' },
      { label: '备注', prop: 'comment' },
    ],
    personDetail.value,
  ),
)

function getKindText(kind: string | number) {
  return kindOptions.value.find((item) => Number(item.value) === Number(kind))?.label || '嫌疑人'
}

function getKindType(kind: string | number) {
  const typeMap = {
    1: 'success',
    2: 'danger',
    3: 'warning',
  }
  return typeMap[Number(kind)] || 'info'
}

function getIdTypeText(value: string | number) {
  return idTypeOptions.value.find((item) => String(item.value) === String(value))?.label || value || '-'
}

function getRelatedText(value: string | number) {
  return relatedOptions.value.find((item) => Number(item.value) === Number(value))?.label || '-'
}

function getRelatedPersonText(id: string) {
  return relatedPersonList.value.find((item) => item.id === id)?.customerName || '-'
}

async function fetchList() {
  loading.value = true
  try {
    const res = await caseInvolvedList({
      caseId: route.query.caseId,
      ...searchForm,
    })
    data.value = Array.isArray(res) ? res : res?.records || []
    total.value = Array.isArray(res) ? res.length : res?.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch(params: Record<string, any>) {
  searchForm.pageNo = 1
  Object.assign(searchForm, params || {})
  fetchList()
}

function handleReset() {
  Object.assign(searchForm, {
    pageNo: 1,
    pageSize: searchForm.pageSize,
    customerName: '',
    idNum: '',
    cardNum: '',
    accountNum: '',
  })
  fetchList()
}

function handleUpdate(pageNo: number, pageSize: number) {
  searchForm.pageNo = pageNo
  updatePageSize(searchForm, pageSize)
  fetchList()
}

async function showPersonDetail({ row }: { row: Record<string, any> }) {
  personDetail.value = await getCompanyOrPersonDetailApi({ involvedId: row.id })
  personDetailVisible.value = true
}

async function loadRelatedPersonList(record: Record<string, any>) {
  const res = await getInvolvedPersonApi({ involvedId: record.id })
  relatedPersonList.value = Array.isArray(res) ? res : res?.records || []
}

async function viewRelations(record: Record<string, any>) {
  currentRecord.value = record
  await loadRelatedPersonList(record)
  const res = await getInvolvedRelationApi({ involvedId: record.id })
  relationData.value = (Array.isArray(res) ? res : []).map((item: any, index: number) => ({
    ...item,
    index: index + 1,
    editing: false,
    tempRelation: item.relation,
    tempRelatedPersonCode: item.relatedPersonCode,
  }))
  relationVisible.value = true
}

function addRelation() {
  relationData.value.push({
    id: '',
    index: relationData.value.length + 1,
    customerName: currentRecord.value.customerName,
    relation: '',
    relatedPersonCode: '',
    editing: true,
    tempRelation: '',
    tempRelatedPersonCode: '',
  })
}

function editRelation(row: Record<string, any>) {
  row.editing = true
  row.tempRelation = row.relation
  row.tempRelatedPersonCode = row.relatedPersonCode
}

function cancelRelation(row: Record<string, any>) {
  if (!row.id) {
    relationData.value = relationData.value.filter((item) => item !== row)
    relationData.value.forEach((item, index) => {
      item.index = index + 1
    })
    return
  }
  row.editing = false
  row.tempRelation = row.relation
  row.tempRelatedPersonCode = row.relatedPersonCode
}

async function saveRelation(row: Record<string, any>) {
  if (!row.tempRelation || !row.tempRelatedPersonCode) {
    $toast('请填写完整信息', 'w')
    return
  }
  await updateInvolvedPersonApi({
    id: row.id,
    involvedId: currentRecord.value.id,
    relationCode: row.tempRelation,
    relatedPersonId: row.tempRelatedPersonCode,
  })
  await viewRelations(currentRecord.value)
}

fetchList()

onMounted(async () => {
  await Promise.all([
    ensureDictLoaded('fa_involved_person_relation'),
    ensureDictLoaded('fa_involved_person_type'),
    ensureDictLoaded('fa_id_type'),
  ])
})
</script>

<template>
  <div ref="pageRef" class="case-manage-page">
    <g-search-bar :items="searchItems" class="m-b-12" @search="handleSearch" @reset="handleReset" />
    <div ref="tableSectionRef" class="case-manage-page__table">
      <o-table
        :columns="columns"
        :data="data"
        :total="total"
        :loading="loading"
        :pageSize="searchForm.pageSize"
        :pageNumber="searchForm.pageNo"
        :height="tableHeight"
        @update="handleUpdate"
      >
        <template #involvedKind="{ value }">
          <o-tag :type="getKindType(value)">
            {{ getKindText(value) }}
          </o-tag>
        </template>
      </o-table>
    </div>

    <o-dialog v-model="relationVisible" title="涉案人关系" width="920px" fillSlot :showConfirm="false">
      <o-flex direction="column" class="h-100%">
        <div class="case-manage-page__relation-head">
          <div>涉案人【{{ currentRecord.customerName || '-' }}】相关方关系</div>
          <el-button type="primary" icon="el-icon-plus" @click="addRelation">新增关系</el-button>
        </div>
        <o-table
          class="f-1"
          style="min-height: 0"
          :columns="relationColumns"
          :data="relationData"
          :showPage="false"
          height="100%"
        >
          <template #relation="{ row }">
            <el-select v-if="row.editing" v-model="row.tempRelation" placeholder="请选择关系">
              <el-option
                v-for="item in relatedOptions"
                :key="item.value"
                :label="item.label"
                :value="Number(item.value)"
              />
            </el-select>
            <span v-else>{{ getRelatedText(row.relation) }}</span>
          </template>
          <template #relatedPersonCode="{ row }">
            <el-select v-if="row.editing" v-model="row.tempRelatedPersonCode" placeholder="请选择相关方">
              <el-option v-for="item in relatedPersonList" :key="item.id" :label="item.customerName" :value="item.id" />
            </el-select>
            <span v-else>{{ getRelatedPersonText(row.relatedPersonCode) }}</span>
          </template>
          <template #operation="{ row }">
            <template v-if="row.editing">
              <el-button type="primary" link icon="el-icon-check" @click="saveRelation(row)">保存</el-button>
              <el-button link icon="el-icon-close" @click="cancelRelation(row)">取消</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link icon="el-icon-edit" @click="editRelation(row)">修改</el-button>
            </template>
          </template>
        </o-table>
      </o-flex>
    </o-dialog>

    <o-dialog v-model="personDetailVisible" title="涉案人详情" width="1000px" :showConfirm="false">
      <div class="case-manage-page__detail">
        <el-card header="基本信息">
          <o-descriptions :options="personDetailOptions" :column="3" label-width="auto" :showAll="true" />
        </el-card>
        <el-card header="开户信息" class="mt2">
          <div class="case-manage-page__account-org">{{ personDetail.orgName || '-' }}</div>
          <div class="case-manage-page__account-line">银行账号 {{ personDetail.accountNum || '-' }}</div>
        </el-card>
      </div>
    </o-dialog>
  </div>
</template>

<style scoped lang="scss">
.case-manage-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.case-manage-page__table {
  min-height: 0;
}

.case-manage-page__relation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.case-manage-page__detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.case-manage-page__account-org {
  font-weight: 600;
}

.case-manage-page__account-line {
  margin-top: 8px;
  margin-left: 20px;
}
</style>
