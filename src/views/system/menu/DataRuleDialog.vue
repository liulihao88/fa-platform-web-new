<script setup lang="ts">
import { computed, ref } from 'vue'
import { clone, validForm } from '@oeos-components/utils'
import { useCommonHook } from '@/store'
import { addMenuRule, editMenuRule, getSystemDictItems } from '@/api/system'
import { SYSTEM_VARIABLE_OPTIONS, VALID_STATUS_OPTIONS } from '@/views/system/utils'

defineOptions({
  name: 'SystemMenuDataRuleDialog',
})

const props = defineProps<{
  permissionId: string | number
}>()

const emits = defineEmits(['success'])
const { getDictItems } = useCommonHook()

const isShow = ref(false)
const title = ref('新增规则')
const formRef = ref()
const localRuleConditions = ref<any[]>([])

const baseForm = {
  id: '',
  ruleName: '',
  ruleColumn: '',
  ruleConditions: '',
  ruleValue: '',
  status: '1',
}

const form = ref(clone(baseForm))

const ruleConditionOptions = computed(() =>
  localRuleConditions.value.length > 0 ? localRuleConditions.value : getDictItems('rule_conditions') || [],
)
const isSqlRule = computed(() => form.value.ruleConditions === 'USE_SQL_RULES')

const rules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: ['blur', 'change'] }],
  ruleConditions: [{ required: true, message: '请选择条件规则', trigger: ['blur', 'change'] }],
  ruleValue: [{ required: true, message: '请输入规则值', trigger: ['blur', 'change'] }],
  ruleColumn: [
    {
      validator: (_rule, value, callback) => {
        if (isSqlRule.value || value) {
          callback()
          return
        }
        callback(new Error('请输入规则字段'))
      },
      trigger: ['blur', 'change'],
    },
  ],
} as any

async function loadRuleConditions() {
  if ((getDictItems('rule_conditions') || []).length > 0) return
  localRuleConditions.value = await getSystemDictItems('rule_conditions')
}

function appendVariable(value: string) {
  form.value.ruleValue = form.value.ruleValue ? `${form.value.ruleValue}${value}` : value
}

async function save() {
  await validForm(formRef.value)
  const payload = {
    ...form.value,
    permissionId: props.permissionId,
  }
  if (payload.id) {
    await editMenuRule(payload)
  } else {
    await addMenuRule(payload)
  }
  isShow.value = false
  emits('success')
}

async function open(row: any = {}, dialogTitle = '新增规则') {
  await loadRuleConditions()
  title.value = dialogTitle
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
  <o-dialog v-model="isShow" :title="title" width="760px" :confirm="save">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="规则名称" prop="ruleName">
        <o-input v-model="form.ruleName" />
      </el-form-item>
      <el-form-item v-if="!isSqlRule" label="规则字段" prop="ruleColumn">
        <o-input v-model="form.ruleColumn" />
      </el-form-item>
      <el-form-item label="条件规则" prop="ruleConditions">
        <o-select v-model="form.ruleConditions" :options="ruleConditionOptions" />
      </el-form-item>
      <el-form-item label="规则值" prop="ruleValue">
        <o-input v-model="form.ruleValue" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="系统变量">
        <div class="flex flex-wrap gap-2">
          <el-button v-for="item in SYSTEM_VARIABLE_OPTIONS" :key="item.value" @click="appendVariable(item.value)">
            {{ item.label }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <o-radio v-model="form.status" :options="VALID_STATUS_OPTIONS" showType="button" />
      </el-form-item>
    </el-form>
  </o-dialog>
</template>
