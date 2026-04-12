<script setup lang="ts">
import { ref } from 'vue'
import { editFaCase, addFaCase } from '@/api/analysis'
import { validate, isEmpty, clone, validForm } from '@oeos-components/utils'
const isShow = ref(false)
const formRef = ref()
const emits = defineEmits(['success'])
interface Form {
  id?: number
  caseCode: string
  caseReason: string
  deptCaseCode: string
  processDate: string
}
const baseForm: Form = {
  caseCode: '',
  caseReason: '',
  deptCaseCode: '',
  processDate: '',
}

const form = ref({
  ...baseForm,
})

const save = async () => {
  await validForm(formRef.value)
  if (title.value === '新增') {
    await addFaCase(form.value)
  } else {
    await editFaCase(form.value)
  }
  isShow.value = false
  emits('success')
}

const rules = {
  caseCode: [
    {
      required: true,
      message: '请输入案件名称',
      trigger: ['blur', 'change'],
    },
  ],
} as any
const title = ref('编辑')
const open = async (row: any = {}, dialogTitle = '编辑') => {
  title.value = dialogTitle
  if (!isEmpty(row)) {
    form.value = clone(row)
  } else {
    form.value = clone(baseForm)
  }
  isShow.value = true
}
defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" :title="title" :confirm="save">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="案件名称" prop="caseCode">
          <o-input v-model="form.caseCode" />
        </el-form-item>
        <el-form-item label="案由" prop="caseReason">
          <o-input v-model="form.caseReason" />
        </el-form-item>
        <el-form-item label="部门案件编号" prop="deptCaseCode">
          <o-input v-model="form.deptCaseCode" />
        </el-form-item>
        <el-form-item label="受理时间" prop="processDate">
          <o-date-range v-model="form.processDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
    </o-dialog>
  </div>
</template>
