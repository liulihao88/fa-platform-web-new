<script setup lang="ts">
import { ref } from 'vue'
import { clone, isEmpty, validForm, validate } from '@oeos-components/utils'
import { addFaOrgsConfigure, editFaOrgsConfigure } from '@/api/analysis'

type OrgForm = {
  id?: string
  orgName: string
  names: string
  alias: string
  commonts: string
  orgType: number | string
}

const emits = defineEmits(['success'])

const isShow = ref(false)
const formRef = ref()
const title = ref('新增机构')
const readOnly = ref(false)

const baseForm: OrgForm = {
  orgName: '',
  names: '',
  alias: '',
  commonts: '',
  orgType: '',
}

const form = ref<OrgForm>(clone(baseForm))

const typeOptions = [
  { label: '银行', value: 1 },
  { label: '非银行', value: 2 },
]

const rules = {
  orgName: [validate('请输入机构官方名称') as any],
  names: [validate('请输入通常叫法') as any],
  orgType: [validate('请选择机构种类') as any],
} as any

async function save() {
  if (readOnly.value) {
    isShow.value = false
    return
  }
  await validForm(formRef.value)
  if (form.value.id) {
    await editFaOrgsConfigure(form.value)
  } else {
    await addFaOrgsConfigure(form.value)
  }
  isShow.value = false
  emits('success')
}

async function open(row: Partial<OrgForm> = {}, dialogTitle = '新增机构') {
  title.value = dialogTitle
  readOnly.value = dialogTitle.includes('详情')
  form.value = !isEmpty(row) ? clone({ ...baseForm, ...row }) : clone(baseForm)
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" :title="title" width="720px" :showConfirm="!readOnly" :confirm="save">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
      <el-form-item label="机构官方名称" prop="orgName">
        <o-input v-model="form.orgName" :disabled="readOnly" />
      </el-form-item>
      <el-form-item label="通常叫法" prop="names">
        <o-input v-model="form.names" :disabled="readOnly" />
      </el-form-item>
      <el-form-item label="别名" prop="alias">
        <o-input v-model="form.alias" :disabled="readOnly" />
      </el-form-item>
      <el-form-item label="注释" prop="commonts">
        <o-input v-model="form.commonts" type="textarea" :rows="3" :disabled="readOnly" />
      </el-form-item>
      <el-form-item label="种类" prop="orgType">
        <o-select v-model="form.orgType" :options="typeOptions" :disabled="readOnly" />
      </el-form-item>
    </el-form>
  </o-dialog>
</template>
