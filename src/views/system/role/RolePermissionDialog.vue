<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { getRolePermission, getRolePermissionTree, saveRolePermission } from '@/api/system'
import {
  collectNodeDescendantKeys,
  collectTreeKeys,
  getStorageFlag,
  mergeKeys,
  normalizeTreeOptions,
  removeKeys,
  setStorageFlag,
} from '@/views/system/utils'
import RoleDataRuleDialog from './RoleDataRuleDialog.vue'

defineOptions({
  name: 'SystemRolePermissionDialog',
})

const STORAGE_KEY = 'fa-system-role-auth-config'

const isShow = ref(false)
const loading = ref(false)
const treeRef = ref()
const dataRuleDialogRef = ref()
const roleId = ref('')
const treeData = ref<any[]>([])
const checkedKeys = ref<Array<string | number>>([])
const defaultCheckedKeys = ref<Array<string | number>>([])
const expandedKeys = ref<Array<string | number>>([])
const treeRenderKey = ref(0)
const relationMode = ref(true)

const treeConfig = ref(
  getStorageFlag(STORAGE_KEY, {
    expand: 'openAll',
    level: 'relation',
  }),
)

function syncTreeCheckedKeys() {
  nextTick(() => {
    treeRef.value?.setCheckedKeys(checkedKeys.value, false)
  })
}

function rebuildTree() {
  treeRenderKey.value += 1
  syncTreeCheckedKeys()
}

function saveConfig(partial: Record<string, any>) {
  treeConfig.value = {
    ...treeConfig.value,
    ...partial,
  }
  setStorageFlag(STORAGE_KEY, treeConfig.value)
}

async function init() {
  loading.value = true
  try {
    const treeRes = await getRolePermissionTree()
    treeData.value = normalizeTreeOptions(treeRes?.treeList || [])
    expandedKeys.value = treeConfig.value.expand === 'openAll' ? collectTreeKeys(treeData.value) : []
    relationMode.value = treeConfig.value.level !== 'standAlone'

    const permRes = await getRolePermission(roleId.value)
    checkedKeys.value = Array.isArray(permRes) ? permRes : []
    defaultCheckedKeys.value = [...checkedKeys.value]
    rebuildTree()
  } finally {
    loading.value = false
  }
}

function handleCheck(node, payload) {
  if (!relationMode.value) {
    checkedKeys.value = payload.checkedKeys || []
    return
  }

  const currentKey = node.id ?? node.key
  const descendants = collectNodeDescendantKeys(node)
  const currentChecked = (payload.checkedKeys || []).some((item) => String(item) === String(currentKey))
  checkedKeys.value = currentChecked
    ? mergeKeys(checkedKeys.value, descendants)
    : removeKeys(checkedKeys.value, descendants)
  syncTreeCheckedKeys()
}

function handleNodeClick(node) {
  if (!node?.ruleFlag) return
  dataRuleDialogRef.value?.open({
    roleId: roleId.value,
    functionId: node.id ?? node.key,
  })
}

function handleExpandAll(expanded: boolean) {
  expandedKeys.value = expanded ? collectTreeKeys(treeData.value) : []
  saveConfig({ expand: expanded ? 'openAll' : 'closeAll' })
  rebuildTree()
}

function handleRelationMode(relation: boolean) {
  relationMode.value = relation
  saveConfig({ level: relation ? 'relation' : 'standAlone' })
  syncTreeCheckedKeys()
}

function handleCheckAll() {
  checkedKeys.value = collectTreeKeys(treeData.value)
  syncTreeCheckedKeys()
}

function handleClearChecked() {
  checkedKeys.value = []
  syncTreeCheckedKeys()
}

async function handleSave() {
  loading.value = true
  try {
    await saveRolePermission({
      roleId: roleId.value,
      permissionIds: checkedKeys.value.join(','),
      lastpermissionIds: defaultCheckedKeys.value.join(','),
    })
    defaultCheckedKeys.value = [...checkedKeys.value]
  } finally {
    loading.value = false
  }
}

function open(options: { roleId: string | number }) {
  roleId.value = String(options.roleId)
  isShow.value = true
  init()
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" title="角色权限配置" width="760px" fillSlot :confirm="handleSave">
    <o-flex direction="column" class="h-100%">
      <div class="mb2 flex flex-wrap gap-2">
        <el-button @click="handleCheckAll">选择全部</el-button>
        <el-button @click="handleClearChecked">取消选择</el-button>
        <el-button @click="handleExpandAll(true)">展开全部</el-button>
        <el-button @click="handleExpandAll(false)">折叠全部</el-button>
        <el-button :type="relationMode ? 'primary' : 'default'" @click="handleRelationMode(true)">层级关联</el-button>
        <el-button :type="!relationMode ? 'primary' : 'default'" @click="handleRelationMode(false)">层级独立</el-button>
      </div>

      <el-scrollbar class="flex-1 min-h-0 border border-[#ebeef5] rounded-[8px] p-3">
        <el-tree
          :key="treeRenderKey"
          ref="treeRef"
          node-key="id"
          show-checkbox
          check-strictly
          highlight-current
          :data="treeData"
          :props="{ label: 'label', children: 'children' }"
          :default-expanded-keys="expandedKeys"
          :default-checked-keys="checkedKeys"
          :expand-on-click-node="false"
          @check="handleCheck"
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <span class="flex items-center gap-2">
              <span>{{ data.label }}</span>
              <el-tag v-if="data.ruleFlag" size="small" type="danger">规则</el-tag>
            </span>
          </template>
        </el-tree>
      </el-scrollbar>
    </o-flex>

    <RoleDataRuleDialog ref="dataRuleDialogRef" />
  </o-dialog>
</template>
