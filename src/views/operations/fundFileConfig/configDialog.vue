<script setup lang="ts">
import { ref } from 'vue'
import { clone, isEmpty, validForm, validate } from '@oeos-components/utils'
import { addFaFilesConfigure, editFaFilesConfigure } from '@/api/analysis'

type ConfigForm = {
  id?: string
  regionFld: number | string
  metaData: string
  dataFlag: string
  isSpecialModel: number | string
  isSpecialOrg: number | string
  isSpecialFile: number | string
  dataType: string
  dataNameEng: string
  ifToUnify: number | string
  ifToUse: number | string
  alias: string
}

const emits = defineEmits(['success'])

const isShow = ref(false)
const formRef = ref()
const isEdit = ref(false)
const title = ref('新增配置')

const baseForm: ConfigForm = {
  regionFld: '0',
  metaData: '',
  dataFlag: '',
  isSpecialModel: '0',
  isSpecialOrg: '0',
  isSpecialFile: '0',
  dataType: '',
  dataNameEng: '',
  ifToUnify: '0',
  ifToUse: '1',
  alias: '',
}

const form = ref<ConfigForm>(clone(baseForm))

const yesNoOptions = ref([
  { label: '否', value: '0' },
  { label: '是', value: '1' },
])

const rules = {
  metaData: [!isEdit.value && (validate('请输入标准数据') as any)],
  dataType: [!isEdit.value && (validate('请输入数据类型') as any)],
  dataNameEng: [!isEdit.value && (validate('请输入字段名称') as any)],
  alias: [validate('请输入别名') as any],
} as any

async function save() {
  await validForm(formRef.value)
  if (isEdit.value) {
    await editFaFilesConfigure({
      id: form.value.id,
      alias: form.value.alias,
    })
  } else {
    await addFaFilesConfigure({
      ...form.value,
      regionFld: Number(form.value.regionFld),
      isSpecialModel: Number(form.value.isSpecialModel),
      isSpecialOrg: Number(form.value.isSpecialOrg),
      isSpecialFile: Number(form.value.isSpecialFile),
      ifToUnify: Number(form.value.ifToUnify),
      ifToUse: Number(form.value.ifToUse),
    })
  }
  isShow.value = false
  emits('success')
}

async function open(row: Partial<ConfigForm> = {}, dialogTitle = '新增配置') {
  title.value = dialogTitle
  isEdit.value = dialogTitle.includes('编辑')
  form.value = !isEmpty(row)
    ? clone({
        ...baseForm,
        ...row,
        regionFld: row.regionFld?.toString?.() ?? baseForm.regionFld,
        isSpecialModel: row.isSpecialModel?.toString?.() ?? baseForm.isSpecialModel,
        isSpecialOrg: row.isSpecialOrg?.toString?.() ?? baseForm.isSpecialOrg,
        isSpecialFile: row.isSpecialFile?.toString?.() ?? baseForm.isSpecialFile,
        ifToUnify: row.ifToUnify?.toString?.() ?? baseForm.ifToUnify,
        ifToUse: row.ifToUse?.toString?.() ?? baseForm.ifToUse,
      })
    : clone(baseForm)
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" :title="title" width="820px" :confirm="save">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
      <o-row v-if="!isEdit" :gutter="16" :col="12">
        <el-form-item label="标准数据" prop="metaData">
          <o-input v-model="form.metaData" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <o-input v-model="form.dataType" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="特定模型" prop="isSpecialModel">
          <o-select v-model="form.isSpecialModel" :options="yesNoOptions" label="label" value="value" />
        </el-form-item>
        <el-form-item label="特定银行" prop="isSpecialOrg">
          <o-select v-model="form.isSpecialOrg" :options="yesNoOptions" label="label" value="value" />
        </el-form-item>
        <el-form-item label="特定文件" prop="isSpecialFile">
          <o-select v-model="form.isSpecialFile" :options="yesNoOptions" label="label" value="value" />
        </el-form-item>
        <el-form-item label="字段名称" prop="dataNameEng">
          <o-input v-model="form.dataNameEng" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="启用标志" prop="ifToUse">
          <o-select v-model="form.ifToUse" :options="yesNoOptions" label="label" value="value" />
        </el-form-item>
      </o-row>
      <el-form-item label="别名" prop="alias">
        <o-input v-model="form.alias" type="textarea" :rows="4" />
      </el-form-item>
    </el-form>
  </o-dialog>
</template>
