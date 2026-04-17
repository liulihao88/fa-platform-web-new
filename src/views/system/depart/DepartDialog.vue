<script setup lang="ts">
import { computed, ref } from 'vue'
import { clone, validForm } from '@oeos-components/utils'
import { addDepart, editDepart, getDepartIdTree } from '@/api/system'
import { normalizeTreeOptions } from '@/views/system/utils'

defineOptions({
  name: 'SystemDepartDialog',
})

const emits = defineEmits(['success'])

const isShow = ref(false)
const title = ref('新增部门')
const formRef = ref()
const parentTreeData = ref<any[]>([])
const categoryOptions = ref<any[]>([])

const baseForm = {
  id: '',
  departName: '',
  parentId: '',
  orgCode: '',
  orgCategory: '1',
  departOrder: 0,
  mobile: '',
  fax: '',
  address: '',
  memo: '',
}

const form = ref(clone(baseForm))

const rules = {
  departName: [{ required: true, message: '请输入机构/部门名称', trigger: ['blur', 'change'] }],
} as any

const rootCategoryOptions = [{ label: '公司', value: '1' }]
const childCategoryOptions = [
  { label: '部门', value: '2' },
  { label: '岗位', value: '3' },
]

function getCategoryOptions(isChild: boolean) {
  return isChild ? childCategoryOptions : rootCategoryOptions
}

async function save() {
  await validForm(formRef.value)
  if (form.value.id) {
    await editDepart(form.value)
  } else {
    await addDepart(form.value)
  }
  isShow.value = false
  emits('success')
}

async function open(options: { row?: any; isChild?: boolean; title?: string } = {}) {
  const treeData = await getDepartIdTree()
  parentTreeData.value = normalizeTreeOptions(treeData || [])

  const isChild = !!options.isChild
  categoryOptions.value = getCategoryOptions(isChild)
  title.value = options.title || (options.row?.id ? '编辑部门' : isChild ? '添加下级部门' : '新增部门')

  form.value = clone({
    ...baseForm,
    ...(options.row || {}),
    orgCategory: options.row?.orgCategory || categoryOptions.value[0]?.value,
  })

  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" :title="title" width="760px" :confirm="save">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="机构名称" prop="departName">
            <o-input v-model="form.departName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上级部门" prop="parentId">
            <el-tree-select
              v-model="form.parentId"
              node-key="id"
              :data="parentTreeData"
              :props="{ label: 'label', children: 'children' }"
              check-strictly
              filterable
              clearable
              default-expand-all
              class="w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机构编码" prop="orgCode">
            <o-input v-model="form.orgCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机构类型" prop="orgCategory">
            <o-radio v-model="form.orgCategory" :options="categoryOptions" showType="button" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="departOrder">
            <el-input-number v-model="form.departOrder" :min="0" class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电话" prop="mobile">
            <o-input v-model="form.mobile" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="传真" prop="fax">
            <o-input v-model="form.fax" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地址" prop="address">
            <o-input v-model="form.address" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="memo">
            <o-input v-model="form.memo" type="textarea" :rows="3" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </o-dialog>
</template>
