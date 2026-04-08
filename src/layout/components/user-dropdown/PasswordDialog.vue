<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStoreHook } from '@/store/modules/user'
import { sendChangePwdSms, updatePassword, updateUserPassword } from '@/api/account'

const visible = ref(false)
const loading = ref(false)
const sendCodeLoading = ref(false)
const countdown = ref(0)
const currentPhone = ref('')
const formRef = ref()
const formState = reactive({
  username: '',
  phone: '',
  smscode: '',
  oldpassword: '',
  password: '',
  confirmPassword: '',
})

let countdownTimer: ReturnType<typeof window.setInterval> | null = null

const hasBoundPhone = computed(() => !!currentPhone.value)
const sendCodeText = computed(() => {
  if (sendCodeLoading.value) return '发送中...'
  if (countdown.value > 0) return `${countdown.value}s后重试`
  return '获取验证码'
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
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  smscode: [{ required: true, message: '请输入6位验证码', trigger: 'blur' }],
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

function stopCountdown() {
  if (countdownTimer) {
    window.clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function startCountdown() {
  stopCountdown()
  countdown.value = 60
  countdownTimer = window.setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0
      stopCountdown()
      return
    }
    countdown.value -= 1
  }, 1000)
}

function resetForm() {
  stopCountdown()
  countdown.value = 0
  sendCodeLoading.value = false
  formState.phone = currentPhone.value
  formState.smscode = ''
  formState.oldpassword = ''
  formState.password = ''
  formState.confirmPassword = ''
  formRef.value?.clearValidate()
}

function open(payload: { username: string; phone?: string }) {
  formState.username = payload.username
  currentPhone.value = payload.phone || ''
  resetForm()
  visible.value = true
}

async function handleSendCode() {
  if (!hasBoundPhone.value || countdown.value > 0 || sendCodeLoading.value) return
  sendCodeLoading.value = true
  try {
    const res = await sendChangePwdSms(formState.phone)
    if (res?.success) {
      ElMessage.success('验证码发送成功')
      startCountdown()
      return
    }
    ElMessage.warning(res?.message || '验证码发送失败')
  } finally {
    sendCodeLoading.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  loading.value = true
  try {
    const res = hasBoundPhone.value
      ? await updateUserPassword({
          username: formState.username,
          phone: formState.phone,
          smscode: formState.smscode,
          password: formState.password,
        })
      : await updatePassword({
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

onBeforeUnmount(() => {
  stopCountdown()
})
</script>

<template>
  <el-dialog v-model="visible" title="修改密码" width="400px" destroy-on-close>
    <el-form ref="formRef" :model="formState" :rules="rules" label-position="top">
      <el-form-item v-if="hasBoundPhone" label="验证手机号" prop="phone">
        <el-input v-model="formState.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item v-if="hasBoundPhone" label="验证码" prop="smscode">
        <el-input v-model="formState.smscode" placeholder="请输入6位验证码">
          <template #append>
            <el-button :loading="sendCodeLoading" :disabled="countdown > 0" @click="handleSendCode">
              {{ sendCodeText }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item v-else label="旧密码" prop="oldpassword">
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
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
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
