<script setup lang="ts">
import { ref } from 'vue'
import { validForm } from '@oeos-components/utils'
import { updateUserPasswordByAdmin } from '@/api/system'

defineOptions({
  name: 'SystemUserPasswordDialog',
})

const emits = defineEmits(['success'])

const isShow = ref(false)
const formRef = ref()

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

const rules = {
  username: [{ required: true, message: '缺少用户名', trigger: ['blur', 'change'] }],
  password: [
    { required: true, message: '请输入登录密码', trigger: ['blur', 'change'] },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
      message: '密码需至少 8 位，且包含字母、数字和特殊字符',
      trigger: ['blur', 'change'],
    },
  ],
  confirmPassword: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请再次输入密码'))
          return
        }
        if (value !== form.value.password) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
} as any

async function save() {
  await validForm(formRef.value)
  await updateUserPasswordByAdmin(form.value)
  isShow.value = false
  emits('success')
}

function open(username: string) {
  form.value = {
    username,
    password: '',
    confirmPassword: '',
  }
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" title="修改密码" width="520px" :confirm="save">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="用户账号" prop="username">
        <o-input v-model="form.username" disabled />
      </el-form-item>
      <el-form-item label="登录密码" prop="password">
        <el-input v-model="form.password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" show-password />
      </el-form-item>
    </el-form>
  </o-dialog>
</template>
