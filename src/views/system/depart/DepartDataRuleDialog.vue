<script setup lang="ts">
import { ref } from 'vue'
import { getDepartDataRule, saveDepartDataRule } from '@/api/system'

defineOptions({
  name: 'SystemDepartDataRuleDialog',
})

const isShow = ref(false)
const loading = ref(false)
const departId = ref('')
const functionId = ref('')
const dataRuleList = ref<any[]>([])
const dataRuleChecked = ref<Array<string | number>>([])

async function init() {
  loading.value = true
  try {
    const res = await getDepartDataRule(functionId.value, departId.value)
    dataRuleList.value = res?.datarule || []
    dataRuleChecked.value = res?.drChecked ? String(res.drChecked).split(',') : []
  } finally {
    loading.value = false
  }
}

async function save() {
  loading.value = true
  try {
    await saveDepartDataRule({
      departId: departId.value,
      permissionId: functionId.value,
      dataRuleIds: dataRuleChecked.value.join(','),
    })
    isShow.value = false
  } finally {
    loading.value = false
  }
}

function open(options: { departId: string | number; functionId: string | number }) {
  departId.value = String(options.departId)
  functionId.value = String(options.functionId)
  isShow.value = true
  init()
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" title="数据规则配置" width="460px" :confirm="save">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-skeleton-item variant="text" class="w-full mb2" />
        <el-skeleton-item variant="text" class="w-full mb2" />
        <el-skeleton-item variant="text" class="w-full" />
      </template>
      <el-empty v-if="dataRuleList.length === 0" description="当前权限下暂无可配置的数据规则" />
      <el-checkbox-group v-else v-model="dataRuleChecked" class="flex flex-col gap-3">
        <el-checkbox v-for="item in dataRuleList" :key="item.id" :label="item.id">
          {{ item.ruleName }}
        </el-checkbox>
      </el-checkbox-group>
    </el-skeleton>
  </o-dialog>
</template>
