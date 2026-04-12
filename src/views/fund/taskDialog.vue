<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { editQuartzJob, addQuartzJob } from '@/api/analysis'
import { $toast, validate, isEmpty, clone, validForm } from '@oeos-components/utils'
import { JCronValidator } from '@/components/JEasyCron'
import JEasyCron from '@/components/JEasyCron/EasyCronInput.vue'
import { useCommonHook } from '@/store'
const isShow = ref(false)
const formRef = ref()
const { getDictItems } = useCommonHook()
const emits = defineEmits(['success'])

const baseForm = {
  jobClassName: '',
  cronExpression: '* * * * * ? *',
  paramterType: 'string',
  parameter: '',
  status: '0',
  description: '',
}

const form = ref({
  ...baseForm,
})

const save = async () => {
  console.log(form.value)

  await validForm(formRef.value)
  if (title.value === '新增任务') {
    console.log(form.value)

    await addQuartzJob(form.value)
  } else {
    await editQuartzJob(form.value)
  }
  isShow.value = false
  emits('success')
}

const rules = {
  jobClassName: [validate() as any],
  cronExpression: [
    {
      required: true,
      message: '请输入Cron表达式',
      trigger: ['blur', 'change'],
    },
    { validator: JCronValidator, trigger: ['blur', 'change'] },
  ],
} as any
const title = ref('编辑任务')
const open = async (row: any = {}, dialogTitle = '编辑任务') => {
  title.value = dialogTitle
  row.status = row.status ? row.status.toString() : '0'
  if (title.value === '编辑任务') {
    form.value = clone(row)
  } else {
    form.value = clone(baseForm)
  }
  isShow.value = true
}

const chooseCron = () => {
  console.log('chooseCron')
}

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" :title="title" :confirm="save">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="任务名称" prop="jobClassName">
          <o-input v-model="form.jobClassName" />
        </el-form-item>
        <el-form-item label="Cron表达式" prop="cronExpression">
          <JEasyCron v-model="form.cronExpression" class="w-100%" />
        </el-form-item>
        <el-form-item label="参数类型" prop="paramterType">
          <o-select
            v-model="form.paramterType"
            :options="[
              {
                label: '字符串',
                value: 'string',
              },
              {
                label: 'JSON对象',
                value: 'object',
              },
            ]"
          />
        </el-form-item>
        <el-form-item label="参数" prop="parameter">
          <o-input v-model="form.parameter" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <o-radio v-model="form.status" :options="getDictItems('quartz_status')" showType="button" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <o-input v-model="form.description" />
        </el-form-item>
      </el-form>
    </o-dialog>
  </div>
</template>
