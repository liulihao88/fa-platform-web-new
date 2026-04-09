<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStoreHook } from '@/store/modules/user'
import { updatePassword } from '@/api/account'

const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const formState = reactive({
  username: '',
  oldpassword: '',
  password: '',
  confirmPassword: '',
})
const strengthLevel = computed(() => {
  const password = formState.password
  if (!password) return 0

  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password))) score += 1

  return Math.min(score, 3)
})

const rules = {
  oldpassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { pattern: /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,20}$/, message: '8-20位，需包含字母和数字', trigger: 'blur' },
  ],
  confirmPassword: [
    {
      required: true,
      validator: (_rule, value) => {
        if (!value) {
          return Promise.reject('请输入确认新密码')
        }
        if (value !== formState.password) {
          return Promise.reject('两次输入的密码不一致!')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

function resetForm() {
  formState.oldpassword = ''
  formState.password = ''
  formState.confirmPassword = ''
  formRef.value?.clearValidate()
}

function open(payload: { username: string }) {
  formState.username = payload.username
  resetForm()
  visible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  loading.value = true
  try {
    const res = await updatePassword({
      username: formState.username,
      oldpassword: formState.oldpassword,
      password: formState.password,
    })
    if (res?.success) {
      ElMessage.success('密码修改成功，请重新登录！3s后自动退出登录')
      visible.value = false
      window.setTimeout(() => {
        useUserStoreHook().logOut()
      }, 3000)
      return
    }
    ElMessage.warning(res?.message || '密码修改失败')
  } finally {
    loading.value = false
  }
}

defineExpose({
  open,
})
</script>

<template>
  <el-dialog v-model="visible" title="修改密码" width="720px" destroy-on-close>
    <el-form ref="formRef" :model="formState" :rules="rules" label-width="120px">
      <el-form-item label="旧密码" prop="oldpassword">
        <el-input v-model="formState.oldpassword" type="password" show-password placeholder="请输入旧密码" />
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="formState.password" type="password" show-password placeholder="请输入新密码" />
        <div class="strength-meter">
          <span :class="['strength-segment', { active: strengthLevel >= 1 }]" />
          <span :class="['strength-segment', { active: strengthLevel >= 2 }]" />
          <span :class="['strength-segment', { active: strengthLevel >= 3 }]" />
        </div>
        <div class="password-tip">8-20位，需包含字母和数字</div>
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input v-model="formState.confirmPassword" type="password" show-password placeholder="请输入确认新密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button icon="el-icon-close" @click="visible = false">取消</el-button>
        <el-button type="primary" icon="el-icon-check" :loading="loading" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.password-tip {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: #909399;
}

.strength-meter {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  margin-top: 10px;
}

.strength-segment {
  height: 12px;
  background: #dcdfe6;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.strength-segment.active {
  background: #409eff;
}
</style>
