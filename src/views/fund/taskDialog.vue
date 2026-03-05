<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
import { editQuartzJob } from "@/api/analysis";
import { $toast, validate, isEmpty } from "@oeos-components/utils";
const isShow = ref(false);

const baseForm = {
  jobClassName: "",
  cronExpression: "",
  paramterType: "string",
  parameter: "",
  status: 0,
  description: ""
};

const form = ref({
  ...baseForm,
  templateForm: baseForm
});

const save = async () => {
  await editQuartzJob(form.value);
  isShow.value = false;
  $toast("保存成功");
};

const rules = {
  jobClassName: [validate()],
  cronExpression: [validate("请选择")]
};

const open = async (row = {}) => {
  if (!isEmpty(row)) {
    form.value = row;
  } else {
    form.value = form.value.templateForm;
  }
  isShow.value = true;
};

const chooseCron = () => {
  console.log("chooseCron");
};

defineExpose({
  open
});
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" title="编辑任务" @confirm="save">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="任务名称" prop="jobClassName">
          <o-input v-model="form.jobClassName" />
        </el-form-item>
        <el-form-item label="Cron表达式" prop="cronExpression">
          <o-input v-model="form.cronExpression">
            <template #prepend>
              <el-button type="primary" @click="chooseCron">选择</el-button>
            </template>
          </o-input>
        </el-form-item>
        <el-form-item label="参数类型" prop="paramterType">
          <o-select
            v-model="form.paramterType"
            :options="[
              {
                label: '字符串',
                value: 'string'
              },
              {
                label: 'JSON对象',
                value: 'object'
              }
            ]"
          />
        </el-form-item>
        <el-form-item label="参数" prop="parameter">
          <o-input v-model="form.parameter" />
        </el-form-item>
        <el-form-item label="任务名称" prop="jobClassName">
          <o-input v-model="form.jobClassName" />
        </el-form-item>
      </el-form>
    </o-dialog>
  </div>
</template>
