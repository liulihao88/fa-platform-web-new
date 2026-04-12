<script setup lang="ts">
import { ref } from 'vue'
import { editDictItem, addDictItem, checkDictItem } from '@/api/analysis'
import { $toast, validate, isEmpty, clone, validForm } from '@oeos-components/utils'
import { useCommonHook } from '@/store'
const { getDictItems } = useCommonHook()
const isShow = ref(false)
const formRef = ref()
const emits = defineEmits(['success'])
interface Form {
  id?: string
  dictId?: number
  itemText: string
  itemValue: string
  itemColor: string
  description: string
  sortOrder: number
  status: number
}
const baseForm: Form = {
  itemText: '',
  itemValue: '',
  itemColor: '',
  description: '',
  sortOrder: 0,
  status: 1,
  id: '',
}

const form = ref({
  ...baseForm,
})

const save = async () => {
  await validForm(formRef.value)
  if (title.value === '新增') {
    await addDictItem(form.value)
  } else {
    await editDictItem(form.value)
  }
  isShow.value = false
  emits('success')
}

const rules = {
  itemText: [validate() as any],
  itemValue: [
    {
      required: true,
      message: '请输入数据值',
      trigger: ['blur', 'change'],
    },
    {
      validator: async (rule, value, callback) => {
        let res = await checkDictItem({ dictId: form.value.dictId, itemValue: value, id: form.value.id })
        if (res?.code == 200) {
          callback()
        } else {
          callback(new Error(res?.message || '数据值已存在'))
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
} as any
const title = ref('编辑')
const open = async (row: any = {}, dialogTitle = '编辑') => {
  row.status = row.status ? row.status.toString() : '1'
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
        <el-form-item label="名称" prop="itemText">
          <o-input v-model="form.itemText" />
        </el-form-item>
        <el-form-item label="数据值" prop="itemValue">
          <o-input v-model="form.itemValue" />
        </el-form-item>
        <el-form-item label="颜色" prop="itemColor">
          <g-color-picker v-model="form.itemColor" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" size="small" controls-position="right" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <o-input v-model="form.description" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <o-radio v-model="form.status" :options="getDictItems('dict_item_status')" showType="button" />
        </el-form-item>
      </el-form>
    </o-dialog>
  </div>
</template>
