<script setup lang="ts">
import { ref } from 'vue'
import { clone, validForm } from '@oeos-components/utils'
import { addRole, checkRoleCode, editRole } from '@/api/system'

defineOptions({
  name: 'SystemRoleDialog',
})

const emits = defineEmits(['success'])

const isShow = ref(false)
const title = ref('新增角色')
const readOnly = ref(false)
const formRef = ref()

const baseForm = {
  id: '',
  roleName: '',
  roleCode: '',
  description: '',
}

const form = ref(clone(baseForm))

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: ['blur', 'change'] }],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: ['blur', 'change'] },
    {
      validator: async (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入角色编码'))
          return
        }
        const res = await checkRoleCode({
          id: form.value.id || undefined,
          roleCode: value,
        })
        if (res?.success === false) {
          callback(new Error(res?.message || '角色编码已存在'))
          return
        }
        callback()
      },
      trigger: ['blur'],
    },
  ],
} as any

async function save() {
  if (readOnly.value) {
    isShow.value = false
    return
  }
  await validForm(formRef.value)
  if (form.value.id) {
    await editRole(form.value)
  } else {
    await addRole(form.value)
  }
  isShow.value = false
  emits('success')
}

function open(row: any = {}, dialogTitle = '新增角色') {
  title.value = dialogTitle
  readOnly.value = dialogTitle.includes('详情')
  form.value = clone({
    ...baseForm,
    ...row,
  })
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" :title="title" width="560px" :showConfirm="!readOnly" :confirm="save">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="角色名称" prop="roleName">
        <o-input v-model="form.roleName" :disabled="readOnly" />
      </el-form-item>
      <el-form-item label="角色编码" prop="roleCode">
        <o-input v-model="form.roleCode" :disabled="readOnly || !!form.id" />
      </el-form-item>
      <el-form-item label="备注" prop="description">
        <o-input v-model="form.description" type="textarea" :rows="3" :disabled="readOnly" />
      </el-form-item>
    </el-form>
  </o-dialog>
</template>
