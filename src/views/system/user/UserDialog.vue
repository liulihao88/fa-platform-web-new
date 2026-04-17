<script setup lang="ts">
import { computed, ref } from 'vue'
import { clone, validForm } from '@oeos-components/utils'
import {
  addUser,
  checkDuplicate,
  editUser,
  getAllPostList,
  getAllRoleOptions,
  getDepartIdTree,
  getUserDepartList,
  getUserRoles,
} from '@/api/system'
import { useCommonHook } from '@/store'
import { ensureArray, flattenTree, normalizeTreeOptions } from '@/views/system/utils'

defineOptions({
  name: 'SystemUserDialog',
})

type OpenOptions = {
  title?: string
  presetRoleIds?: Array<string | number>
  presetRoleOptions?: Array<{ label: string; value: string | number }>
  lockRoles?: boolean
  hideRoleField?: boolean
}

const emits = defineEmits(['success'])
const { getDictItems } = useCommonHook()

const isShow = ref(false)
const readOnly = ref(false)
const title = ref('新增用户')
const formRef = ref()

const roleOptions = ref<any[]>([])
const postOptions = ref<any[]>([])
const departTreeData = ref<any[]>([])
const departChargeOptions = ref<any[]>([])
const lockRoles = ref(false)
const hideRoleField = ref(false)
let openRequestSeq = 0

const baseForm = {
  id: '',
  username: '',
  password: '',
  confirmPassword: '',
  realname: '',
  workNo: '',
  post: [] as Array<string | number>,
  selectedroles: [] as Array<string | number>,
  selecteddeparts: [] as Array<string | number>,
  relTenantIds: '',
  userIdentity: 1,
  departIds: [] as Array<string | number>,
  avatar: '',
  birthday: '',
  sex: '',
  email: '',
  phone: '',
  telephone: '',
  activitiSync: '1',
}

const form = ref(clone(baseForm))

const sexOptions = computed(() => getDictItems('sex') || [])
const activitiSyncOptions = computed(() => getDictItems('activiti_sync') || [])
const isEdit = computed(() => !!form.value.id)
const showChargeDept = computed(() => Number(form.value.userIdentity) === 2)

function stringifyMultiValue(value: any) {
  return ensureArray(value).join(',')
}

function normalizeSelectValue(value: any, fallback = '') {
  if (value === undefined || value === null || value === '') {
    return fallback
  }
  return String(value)
}

function buildDuplicateRule(fieldName: string, fieldLabel: string, extraValidator?: (_value: string) => string | void) {
  return {
    validator: async (_rule, value, callback) => {
      if (!value) {
        callback(new Error(`请输入${fieldLabel}`))
        return
      }
      const extraMessage = extraValidator?.(value)
      if (extraMessage) {
        callback(new Error(extraMessage))
        return
      }
      const res = await checkDuplicate({
        tableName: 'sys_user',
        fieldName,
        fieldVal: value,
        dataId: form.value.id || undefined,
      })
      if (res?.success === false) {
        callback(new Error(res?.message || `${fieldLabel}已存在`))
        return
      }
      callback()
    },
    trigger: ['blur'],
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户账号', trigger: ['blur', 'change'] },
    buildDuplicateRule('username', '用户账号'),
  ],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (isEdit.value) {
          callback()
          return
        }
        if (!value) {
          callback(new Error('请输入登录密码'))
          return
        }
        if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/.test(value)) {
          callback(new Error('密码需至少 8 位，且包含字母、数字和特殊字符'))
          return
        }
        callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
  confirmPassword: [
    {
      validator: (_rule, value, callback) => {
        if (isEdit.value) {
          callback()
          return
        }
        if (!value) {
          callback(new Error('请再次输入密码'))
          return
        }
        if (value !== form.value.password) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
  realname: [{ required: true, message: '请输入用户姓名', trigger: ['blur', 'change'] }],
  workNo: [
    { required: true, message: '请输入工号', trigger: ['blur', 'change'] },
    buildDuplicateRule('work_no', '工号'),
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: ['blur', 'change'] },
    buildDuplicateRule('email', '邮箱', (value) => (/^\S+@\S+\.\S+$/.test(value) ? '' : '请输入正确的邮箱地址')),
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: ['blur', 'change'] },
    buildDuplicateRule('phone', '手机号', (value) => (/^1[3-9]\d{9}$/.test(value) ? '' : '请输入正确的手机号码')),
  ],
  telephone: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        if (!/^0\d{2,3}-[1-9]\d{6,7}$/.test(value)) {
          callback(new Error('请输入正确的座机号码'))
          return
        }
        callback()
      },
      trigger: ['blur'],
    },
  ],
} as any

function syncChargeDepartments(selectedValues = form.value.selecteddeparts) {
  const valueSet = new Set(ensureArray(selectedValues).map(String))
  const flatNodes = flattenTree(departTreeData.value)
  departChargeOptions.value = flatNodes
    .filter((item) => valueSet.has(String(item.id)))
    .map((item) => ({
      label: item.label,
      value: item.id,
    }))

  form.value.departIds = ensureArray(form.value.departIds).filter((item) => valueSet.has(String(item)))
}

async function loadOptions(options: OpenOptions = {}) {
  const [roles, posts, departs] = await Promise.all([getAllRoleOptions(), getAllPostList(), getDepartIdTree()])

  const normalizedDepartTree = normalizeTreeOptions(departs || [])
  departTreeData.value = normalizedDepartTree

  const roleList = roles || []
  const presetOptions = options.presetRoleOptions || []
  const mergedRoleMap = new Map<string, any>()
  ;[...roleList, ...presetOptions].forEach((item) => {
    const value = item.id ?? item.value
    mergedRoleMap.set(String(value), {
      label: item.roleName ?? item.label,
      value,
    })
  })
  roleOptions.value = Array.from(mergedRoleMap.values())

  postOptions.value = (posts || []).map((item) => ({
    label: item.name,
    value: item.id ?? item.code ?? item.name,
  }))
}

async function save() {
  if (readOnly.value) {
    isShow.value = false
    return
  }
  await validForm(formRef.value)

  const payload = clone(form.value)
  payload.post = stringifyMultiValue(payload.post)
  payload.selectedroles = stringifyMultiValue(payload.selectedroles)
  payload.selecteddeparts = stringifyMultiValue(payload.selecteddeparts)
  payload.relTenantIds = stringifyMultiValue(payload.relTenantIds)
  payload.departIds = showChargeDept.value ? stringifyMultiValue(payload.departIds) : ''
  payload.userIdentity = Number(payload.userIdentity)
  payload.sex = payload.sex === '' ? null : Number(payload.sex)
  payload.birthday = payload.birthday || null
  payload.activitiSync = Number(payload.activitiSync)
  delete payload.confirmPassword

  if (payload.id) {
    delete payload.password
    await editUser(payload)
  } else {
    await addUser(payload)
  }

  isShow.value = false
  emits('success')
}

async function open(row: any = {}, options: OpenOptions = {}) {
  const currentOpenSeq = ++openRequestSeq
  title.value = options.title || (row?.id ? '编辑用户' : '新增用户')
  readOnly.value = title.value.includes('详情')
  lockRoles.value = !!options.lockRoles
  hideRoleField.value = !!options.hideRoleField

  await loadOptions(options)

  const nextForm = clone({
    ...baseForm,
    ...row,
    post: ensureArray(row?.post),
    selectedroles: options.presetRoleIds || ensureArray(row?.selectedroles),
    selecteddeparts: ensureArray(row?.selecteddeparts),
    relTenantIds: row?.relTenantIds ?? '',
    userIdentity:
      row?.userIdentity === undefined || row?.userIdentity === null || row?.userIdentity === ''
        ? baseForm.userIdentity
        : Number(row.userIdentity),
    departIds: ensureArray(row?.departIds),
    sex: normalizeSelectValue(row?.sex),
    activitiSync: normalizeSelectValue(row?.activitiSync, baseForm.activitiSync),
  })

  if (options.presetRoleIds?.length) {
    nextForm.selectedroles = options.presetRoleIds
  }

  form.value = nextForm
  syncChargeDepartments(nextForm.selecteddeparts)
  isShow.value = true

  if (!row?.id) {
    return
  }

  void Promise.allSettled([getUserRoles(row.id), getUserDepartList(row.id)]).then(([rolesResult, departsResult]) => {
    if (currentOpenSeq !== openRequestSeq || String(form.value.id || '') !== String(row.id)) {
      return
    }

    if (!options.presetRoleIds?.length && rolesResult.status === 'fulfilled') {
      form.value.selectedroles = ensureArray(rolesResult.value)
    }

    if (departsResult.status === 'fulfilled') {
      const selecteddeparts = (departsResult.value || []).map((item) => item.key ?? item.id)
      form.value.selecteddeparts = selecteddeparts
      syncChargeDepartments(selecteddeparts)
    }
  })
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" :title="title" width="960px" :showConfirm="!readOnly" :confirm="save">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户账号" prop="username">
            <o-input v-model="form.username" :disabled="readOnly || isEdit" />
          </el-form-item>
        </el-col>
        <el-col v-if="!isEdit" :span="12">
          <el-form-item label="登录密码" prop="password">
            <el-input v-model="form.password" show-password :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col v-if="!isEdit" :span="12">
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" show-password :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户姓名" prop="realname">
            <o-input v-model="form.realname" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工号" prop="workNo">
            <o-input v-model="form.workNo" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职务" prop="post">
            <el-select
              v-model="form.post"
              multiple
              collapse-tags
              collapse-tags-tooltip
              class="w-full"
              :disabled="readOnly"
            >
              <el-option v-for="item in postOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="!hideRoleField" :span="12">
          <el-form-item label="角色" prop="selectedroles">
            <el-select
              v-model="form.selectedroles"
              multiple
              collapse-tags
              collapse-tags-tooltip
              class="w-full"
              :disabled="readOnly || lockRoles"
            >
              <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="selecteddeparts">
            <el-tree-select
              v-model="form.selecteddeparts"
              node-key="id"
              multiple
              check-strictly
              filterable
              default-expand-all
              :data="departTreeData"
              :props="{ label: 'label', children: 'children' }"
              :disabled="readOnly"
              class="w-full"
              @change="syncChargeDepartments"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份" prop="userIdentity">
            <o-radio
              v-model="form.userIdentity"
              :options="[
                { label: '普通用户', value: 1 },
                { label: '上级', value: 2 },
              ]"
              showType="button"
              :disabled="readOnly"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="showChargeDept" :span="12">
          <el-form-item label="负责部门" prop="departIds">
            <el-select
              v-model="form.departIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              class="w-full"
              :disabled="readOnly"
            >
              <el-option
                v-for="item in departChargeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="头像地址" prop="avatar">
            <o-input v-model="form.avatar" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              v-model="form.birthday"
              type="date"
              value-format="YYYY-MM-DD"
              class="w-full"
              :disabled="readOnly"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <o-select v-model="form.sex" :options="sexOptions" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <o-input v-model="form.email" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <o-input v-model="form.phone" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="座机" prop="telephone">
            <o-input v-model="form.telephone" :disabled="readOnly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工作流同步" prop="activitiSync">
            <o-radio
              v-model="form.activitiSync"
              :options="activitiSyncOptions"
              showType="button"
              :disabled="readOnly"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </o-dialog>
</template>
