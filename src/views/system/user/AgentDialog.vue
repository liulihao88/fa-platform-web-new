<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, computed } from 'vue'
import { clone, validForm } from '@oeos-components/utils'
import { useCommonHook } from '@/store'
import { addUserAgent, deleteUserAgent, editUserAgent, getUserAgent } from '@/api/system'
import UserSelectDialog from '@/views/system/components/UserSelectDialog.vue'

defineOptions({
  name: 'SystemUserAgentDialog',
})

const emits = defineEmits(['success'])
const { getDictItems } = useCommonHook()

const isShow = ref(false)
const formRef = ref()
const userSelectDialogRef = ref()
const form = ref<any>({})

const statusOptions = computed(() => getDictItems('valid_status') || [])

const baseForm = {
  id: '',
  userName: '',
  agentUserName: '',
  startTime: '',
  endTime: '',
  status: '1',
}

const rules = {
  userName: [{ required: true, message: '缺少用户名', trigger: ['blur', 'change'] }],
  agentUserName: [{ required: true, message: '请选择代理人', trigger: ['blur', 'change'] }],
  startTime: [{ required: true, message: '请选择代理开始时间', trigger: ['blur', 'change'] }],
  endTime: [{ required: true, message: '请选择代理结束时间', trigger: ['blur', 'change'] }],
} as any

function getDefaultEndTime(startTime: string) {
  return dayjs(startTime).add(30, 'year').format('YYYY-MM-DD HH:mm:ss')
}

async function save() {
  await validForm(formRef.value)
  const payload = clone(form.value)
  if (payload.id) {
    await editUserAgent(payload)
  } else {
    await addUserAgent(payload)
  }
  isShow.value = false
  emits('success')
}

async function handleDelete() {
  if (!form.value.id) return
  await deleteUserAgent(form.value.id)
  isShow.value = false
  emits('success')
}

function handleSelectUser(rows: any[]) {
  const user = rows?.[0]
  if (!user) return
  form.value.agentUserName = user.username
}

function openSelector() {
  userSelectDialogRef.value?.open({
    title: '选择代理人',
    multiple: false,
    excludedUsernames: [form.value.userName],
  })
}

async function open(userName: string) {
  const data = (await getUserAgent(userName)) || {}
  console.log(`34 data`, data)
  const startTime = data?.startTime || dayjs().format('YYYY-MM-DD HH:mm:ss')
  form.value = clone({
    ...baseForm,
    userName,
    ...data,
    startTime,
    endTime: data?.endTime || getDefaultEndTime(startTime),
  })
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" title="用户代理" width="720px" :confirm="save">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="用户账号" prop="userName">
        <o-input v-model="form.userName" disabled />
      </el-form-item>
      <el-form-item label="代理人" prop="agentUserName">
        <div class="flex w-full gap-2">
          <o-input v-model="form.agentUserName" readonly />
          <el-button type="primary" @click="openSelector">选择</el-button>
        </div>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <o-radio v-model="form.status" :options="statusOptions" showType="button" />
      </el-form-item>
      <el-form-item v-if="form.id" label="">
        <el-button type="danger" plain @click="handleDelete">删除代理</el-button>
      </el-form-item>
    </el-form>

    <UserSelectDialog ref="userSelectDialogRef" @select="handleSelectUser" />
  </o-dialog>
</template>
