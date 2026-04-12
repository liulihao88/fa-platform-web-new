<script setup lang="ts">
import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue'
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
import { useRelativeHeight } from '@/hooks'
import { useCommonHook } from '@/store'

const route = useRoute()
const pageRef = useTemplateRef('pageRef')
const tableSectionRef = useTemplateRef('tableSectionRef')
const { height: tableHeight } = useRelativeHeight(tableSectionRef, pageRef, { minHeight: 320, offset: 50 })
const { getDictItems, setCommonItems, sysAllDictItems } = useCommonHook()

const searchForm = reactive({
  customerName: '',
  idNum: '',
  cardNum: '',
  accountNum: '',
})

const searchItems = [
  { label: '涉案人名称', prop: 'customerName', type: 'input', placeholder: '请输入涉案人名称' },
  { label: '证件号码', prop: 'idNum', type: 'input', placeholder: '请输入证件号码' },
  { label: '涉案人卡号', prop: 'cardNum', type: 'input', placeholder: '请输入涉案人卡号' },
  { label: '涉案人账号', prop: 'accountNum', type: 'input', placeholder: '请输入涉案人账号' },
] as any[]

const data = ref<Record<string, any>[]>([])
const loading = ref(false)
const relationVisible = ref(false)
const personDetailVisible = ref(false)
const personDetail = ref<Record<string, any>>({})
const currentRecord = ref<Record<string, any>>({})
const relationData = ref<Record<string, any>[]>([])
const relatedPersonList = ref<Record<string, any>[]>([])

const relatedOptions = computed(() => getDictItems('fa_involved_person_relation') || [])
const kindOptions = computed(() => getDictItems('fa_involved_person_type') || [])

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
      { content: '关系', handler: viewRelations },
      { content: '涉案人详情', handler: showPersonDetail },
    ],
  },
] as any[]

const relationColumns = [
  { label: '序号', prop: 'index', width: 70, align: 'center' },
  { label: '相关方', prop: 'customerName', minWidth: 140 },
  { label: '关系', prop: 'relation', minWidth: 140, useSlot: true },
  { label: '相关方', prop: 'relatedPersonCode', minWidth: 180, useSlot: true },
  { label: '操作', prop: 'operation', width: 160, useSlot: true },
] as any[]

const personDetailOptions = computed(() => [
  { label: '客户名称', value: personDetail.value.customerName || '--' },
  { label: '客户类型', value: personDetail.value.customerType || '--' },
  { label: '营业执照', value: personDetail.value.licenseNum || '--' },
  { label: '法人姓名', value: personDetail.value.legalPersonName || '--' },
  { label: '证件种类', value: personDetail.value.idType || '--' },
  { label: '证件号码', value: personDetail.value.idNum || '--' },
  { label: '联系电话', value: personDetail.value.teleNum || '--' },
  { label: '法人证件类型', value: personDetail.value.legalIdType || '--' },
  { label: '法人证件号码', value: personDetail.value.legalIdNum || '--' },
  { label: '机构编码', value: personDetail.value.orgCd || '--' },
  { label: '机构名称', value: personDetail.value.orgName || '--' },
  { label: '客户状态', value: personDetail.value.customerStatus || '--' },
  { label: '工作单位', value: personDetail.value.workUnit || '--' },
  { label: '地税号', value: personDetail.value.localTaxNum || '--' },
  { label: '国税号', value: personDetail.value.countryTaxNum || '--' },
  { label: '家庭电话', value: personDetail.value.homeTel || '--' },
  { label: '单位电话', value: personDetail.value.unitTel || '--' },
  { label: '通讯地址', value: personDetail.value.communicationAddr || '--' },
  { label: '家庭住址', value: personDetail.value.homeAddr || '--' },
  { label: '单位地址', value: personDetail.value.unitAddr || '--' },
  { label: '邮寄地址', value: personDetail.value.mailAddr || '--' },
  { label: '邮政编码', value: personDetail.value.postCode || '--' },
  { label: '备注', value: personDetail.value.comment || '--' },
  { label: '开户账号', value: personDetail.value.accountNum || '--' },
])

function getKindText(kind: string | number) {
  return kindOptions.value.find((item) => Number(item.value) === Number(kind))?.label || '--'
}

function getRelatedText(value: string | number) {
  return relatedOptions.value.find((item) => Number(item.value) === Number(value))?.label || '--'
}

function getRelatedPersonText(id: string) {
  return relatedPersonList.value.find((item) => item.id === id)?.customerName || '--'
}

async function fetchList() {
  loading.value = true
  try {
    const res = await caseInvolvedList({
      caseId: route.query.caseId,
      ...searchForm,
    })
    data.value = Array.isArray(res) ? res : res?.records || []
  } finally {
    loading.value = false
  }
}

function handleSearch(params: Record<string, any>) {
  Object.assign(searchForm, params || {})
  fetchList()
}

function handleReset() {
  Object.assign(searchForm, {
    customerName: '',
    idNum: '',
    cardNum: '',
    accountNum: '',
  })
  fetchList()
}

async function showPersonDetail(record: Record<string, any>) {
  personDetail.value = await getCompanyOrPersonDetailApi({ involvedId: record.id })
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
  $toast('保存成功')
  await viewRelations(currentRecord.value)
}

fetchList()

onMounted(async () => {
  await Promise.all([ensureDictLoaded('fa_involved_person_relation'), ensureDictLoaded('fa_involved_person_type')])
})
</script>

<template>
  <div ref="pageRef" class="case-manage-page">
    <g-search-bar :items="searchItems" class="m-b-12" @search="handleSearch" @reset="handleReset" />
    <div ref="tableSectionRef" class="case-manage-page__table">
      <o-table :columns="columns" :data="data" :loading="loading" :height="tableHeight">
        <template #involvedKind="{ value }">
          <o-tag>{{ getKindText(value) }}</o-tag>
        </template>
      </o-table>
    </div>

    <o-dialog v-model="relationVisible" title="涉案人关系" width="920px" fillSlot :showConfirm="false">
      <o-flex direction="column" class="h-100%">
        <div class="case-manage-page__relation-head">
          <div>涉案人【{{ currentRecord.customerName || '--' }}】相关方关系</div>
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
      <o-descriptions :options="personDetailOptions" :column="2" label-width="auto" :showAll="true" />
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
</style>
