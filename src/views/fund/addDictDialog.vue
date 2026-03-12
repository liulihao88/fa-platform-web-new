<script setup lang="ts">
import { ref } from 'vue'
import { editDict, addDict } from '@/api/analysis'
import { $toast, validate, isEmpty, clone, validForm } from '@oeos-components/utils'
const isShow = ref(false)
const formRef = ref()
const emits = defineEmits(['success'])
interface Form {
  id?: number
  dictCode: string
  dictName: string
  description: string
}
const baseForm: Form = {
  dictCode: '',
  dictName: '',
  description: '',
}

const form = ref({
  ...baseForm,
})

const save = async () => {
  await validForm(formRef.value)
  if (title.value === '新增字典') {
    await addDict(form.value)
  } else {
    await editDict(form.value)
  }
  isShow.value = false
  $toast('保存成功')
  emits('success')
}

const rules = {
  dictName: [validate() as any],
} as any
const title = ref('编辑字典')
const open = async (row: any = {}, dialogTitle = '编辑字典') => {
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
    <o-dialog ref="dialogRef" v-model="isShow" :title="title" @confirm="save">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="字典名称" prop="dictName">
          <o-input v-model="form.dictName" />
        </el-form-item>
        <el-form-item label="字典编码" prop="dictCode">
          <o-input v-model="form.dictCode" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <o-input v-model="form.description" />
        </el-form-item>
      </el-form>
    </o-dialog>
  </div>
</template>
