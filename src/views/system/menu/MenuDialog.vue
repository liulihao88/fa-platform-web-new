<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { clone, validForm } from '@oeos-components/utils'
import { addMenu, checkMenuPath, editMenu } from '@/api/system'
import { MENU_TYPE_OPTIONS, PERMS_TYPE_OPTIONS, VALID_STATUS_OPTIONS, normalizeTreeOptions } from '@/views/system/utils'

defineOptions({
  name: 'SystemMenuDialog',
})

const props = defineProps<{
  menuTreeData?: any[]
}>()

const emits = defineEmits(['success'])

const isShow = ref(false)
const readOnly = ref(false)
const title = ref('新增菜单')
const formRef = ref()

const baseForm = {
  id: '',
  menuType: 0,
  name: '',
  parentId: '',
  url: '',
  component: 'layouts/default/index',
  componentName: '',
  redirect: '',
  perms: '',
  permsType: '1',
  status: '1',
  icon: '',
  sortNo: 1,
  route: true,
  hidden: 0,
  hideTab: 0,
  keepAlive: false,
  alwaysShow: false,
  internalOrExternal: false,
}

const form = ref(clone(baseForm))

const parentTreeData = computed(() => normalizeTreeOptions(props.menuTreeData || []))
const isButton = computed(() => Number(form.value.menuType) === 2)
const isDir = computed(() => Number(form.value.menuType) === 0)

watch(
  () => form.value.menuType,
  (menuType) => {
    if (Number(menuType) === 0 && !form.value.id && !form.value.component) {
      form.value.component = 'layouts/default/index'
    }
    if (Number(menuType) === 2) {
      form.value.component = ''
      form.value.route = false
      form.value.hidden = 0
      form.value.hideTab = 0
      form.value.keepAlive = false
    }
  },
)

const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: ['blur', 'change'] }],
  parentId: [
    {
      required: true,
      message: '请选择上级菜单',
      trigger: ['blur', 'change'],
      validator: (_rule, value, callback) => {
        if (Number(form.value.menuType) === 0) {
          callback()
          return
        }
        if (value) {
          callback()
          return
        }
        callback(new Error('请选择上级菜单'))
      },
    },
  ],
  url: [
    {
      validator: async (_rule, value, callback) => {
        if (isButton.value) {
          callback()
          return
        }
        if (!value) {
          callback(new Error('请输入访问路径'))
          return
        }
        const res = await checkMenuPath({
          id: form.value.id || undefined,
          url: value,
          alwaysShow: form.value.alwaysShow,
        })
        if (res?.success === false) {
          callback(new Error(res?.message || '访问路径已存在'))
          return
        }
        callback()
      },
      trigger: ['blur'],
    },
  ],
  component: [
    {
      validator: (_rule, value, callback) => {
        if (isButton.value) {
          callback()
          return
        }
        if (value) {
          callback()
          return
        }
        callback(new Error('请输入前端组件'))
      },
      trigger: ['blur', 'change'],
    },
  ],
  perms: [
    {
      validator: (_rule, value, callback) => {
        if (!isButton.value) {
          callback()
          return
        }
        if (value) {
          callback()
          return
        }
        callback(new Error('请输入授权标识'))
      },
      trigger: ['blur', 'change'],
    },
  ],
} as any

function buildComponentName() {
  if (form.value.componentName) return form.value.componentName
  if (!form.value.url) return ''
  return form.value.url.replace(/^\//, '').replaceAll('/', '-').replaceAll(':', '@')
}

async function save() {
  if (readOnly.value) {
    isShow.value = false
    return
  }

  await validForm(formRef.value)
  const payload = {
    ...form.value,
    componentName: buildComponentName(),
  }

  if (payload.id) {
    await editMenu(payload)
  } else {
    await addMenu(payload)
  }

  isShow.value = false
  emits('success')
}

function open(row: any = {}, dialogTitle = '新增菜单') {
  title.value = dialogTitle
  readOnly.value = dialogTitle.includes('详情')
  form.value = clone({
    ...baseForm,
    ...row,
    menuType: row?.menuType ?? baseForm.menuType,
    component: row?.component ?? (Number(row?.menuType) === 0 ? 'layouts/default/index' : ''),
  })
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" :title="title" width="860px" :showConfirm="!readOnly" :confirm="save">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="菜单类型" prop="menuType">
            <o-radio v-model="form.menuType" :options="MENU_TYPE_OPTIONS" showType="button" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="isButton ? '按钮/权限' : '菜单名称'" prop="name">
            <o-input v-model="form.name" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col v-if="!isDir" :span="12">
          <el-form-item label="上级菜单" prop="parentId">
            <el-tree-select
              v-model="form.parentId"
              node-key="id"
              :data="parentTreeData"
              :props="{ label: 'label', children: 'children' }"
              check-strictly
              filterable
              clearable
              default-expand-all
              :disabled="readOnly"
              class="w-full"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="!isButton" :span="12">
          <el-form-item label="访问路径" prop="url">
            <o-input v-model="form.url" :disabled="readOnly" placeholder="请输入访问路径" />
          </el-form-item>
        </el-col>
        <el-col v-if="!isButton" :span="12">
          <el-form-item label="前端组件" prop="component">
            <o-input v-model="form.component" :disabled="readOnly" placeholder="请输入前端组件" />
          </el-form-item>
        </el-col>
        <el-col v-if="!isButton" :span="12">
          <el-form-item label="组件名称" prop="componentName">
            <o-input
              v-model="form.componentName"
              :disabled="readOnly"
              :placeholder="form.url?.replaceAll('/', '-') || '自动生成'"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="isDir" :span="12">
          <el-form-item label="默认跳转" prop="redirect">
            <o-input v-model="form.redirect" :disabled="readOnly" placeholder="目录页可配置默认跳转地址" />
          </el-form-item>
        </el-col>
        <el-col v-if="isButton" :span="12">
          <el-form-item label="授权标识" prop="perms">
            <o-input v-model="form.perms" :disabled="readOnly" placeholder="请输入授权标识" />
          </el-form-item>
        </el-col>
        <el-col v-if="isButton" :span="12">
          <el-form-item label="授权策略" prop="permsType">
            <o-radio v-model="form.permsType" :options="PERMS_TYPE_OPTIONS" showType="button" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col v-if="isButton" :span="12">
          <el-form-item label="状态" prop="status">
            <o-radio v-model="form.status" :options="VALID_STATUS_OPTIONS" showType="button" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col v-if="!isButton" :span="12">
          <el-form-item label="菜单图标" prop="icon">
            <o-input v-model="form.icon" :disabled="readOnly" placeholder="请输入图标编码" />
          </el-form-item>
        </el-col>
        <el-col v-if="!isButton" :span="12">
          <el-form-item label="排序" prop="sortNo">
            <el-input-number v-model="form.sortNo" :min="0" :disabled="readOnly" class="w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider v-if="!isButton">路由配置</el-divider>

      <el-row v-if="!isButton" :gutter="16">
        <el-col :span="8">
          <el-form-item label="是否路由" prop="route">
            <el-switch v-model="form.route" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="隐藏路由" prop="hidden">
            <el-switch v-model="form.hidden" :active-value="1" :inactive-value="0" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="隐藏 Tab" prop="hideTab">
            <el-switch v-model="form.hideTab" :active-value="1" :inactive-value="0" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="缓存路由" prop="keepAlive">
            <el-switch v-model="form.keepAlive" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="聚合路由" prop="alwaysShow">
            <el-switch v-model="form.alwaysShow" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="打开方式" prop="internalOrExternal">
            <el-switch v-model="form.internalOrExternal" :disabled="readOnly" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </o-dialog>
</template>
