<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import { uploadFile } from '@/utils/request'
import {
  addDepart,
  deleteBatchDepart,
  editDepart,
  exportDepart,
  getDepartPermission,
  getDepartPermissionTree,
  getDepartTree,
  saveDepartPermission,
  searchDepartTree,
} from '@/api/system'
import { $toast, clone, validForm } from '@oeos-components/utils'
import {
  collectNodeDescendantKeys,
  collectTreeKeys,
  getStorageFlag,
  mergeKeys,
  normalizeTreeOptions,
  removeKeys,
  setStorageFlag,
} from '@/views/system/utils'
import DepartDialog from './DepartDialog.vue'
import DepartDataRuleDialog from './DepartDataRuleDialog.vue'

defineOptions({
  name: 'SystemDepartPage',
})

const STORAGE_KEY = 'fa-system-depart-auth-config'

const { proxy } = getCurrentInstance()

const headerRef = ref()
const treeRef = ref()
const permissionTreeRef = ref()
const dialogRef = ref()
const dataRuleDialogRef = ref()
const detailFormRef = ref()

const treeKey = ref(0)
const permissionTreeKey = ref(0)
const loadingTree = ref(false)
const loadingPermission = ref(false)
const searchKeyword = ref('')
const lazyMode = ref(true)
const treeData = ref<any[]>([])
const checkedTreeKeys = ref<Array<string | number>>([])
const selectedDepart = ref<any>(null)
const detailForm = ref<any>(null)
const permissionTreeData = ref<any[]>([])
const checkedPermissionKeys = ref<Array<string | number>>([])
const defaultPermissionKeys = ref<Array<string | number>>([])
const expandedPermissionKeys = ref<Array<string | number>>([])
const relationMode = ref(true)
const activeTab = ref('base')

const treeConfig = ref(
  getStorageFlag(STORAGE_KEY, {
    expand: 'openAll',
    level: 'relation',
  }),
)

const items = [{ label: '部门名称', prop: 'keyWord', type: 'input', placeholder: '请输入部门名称' }]

const checkedDepartCount = computed(() => checkedTreeKeys.value.length)
const categoryOptions = computed(() =>
  detailForm.value?.parentId
    ? [
        { label: '部门', value: '2' },
        { label: '岗位', value: '3' },
      ]
    : [{ label: '公司', value: '1' }],
)

const detailRules = {
  departName: [{ required: true, message: '请输入机构/部门名称', trigger: ['blur', 'change'] }],
} as any

function rebuildTree() {
  treeKey.value += 1
}

function rebuildPermissionTree() {
  permissionTreeKey.value += 1
  nextTick(() => {
    permissionTreeRef.value?.setCheckedKeys(checkedPermissionKeys.value, false)
  })
}

function clearSelectedTree() {
  checkedTreeKeys.value = []
  treeRef.value?.setCheckedKeys?.([], false)
}

async function loadRootTree() {
  lazyMode.value = true
  treeData.value = []
  checkedTreeKeys.value = []
  rebuildTree()
}

async function handleTreeSearch(form?) {
  searchKeyword.value = form?.keyWord || ''
  if (!searchKeyword.value) {
    await loadRootTree()
    return
  }
  loadingTree.value = true
  try {
    const res = await searchDepartTree({
      keyWord: searchKeyword.value,
    })
    lazyMode.value = false
    treeData.value = normalizeTreeOptions(res || [])
    checkedTreeKeys.value = []
    rebuildTree()
    await nextTick()
    const firstNode = treeData.value?.[0]
    if (firstNode) {
      treeRef.value?.setCurrentKey(firstNode.id)
      selectDepart(firstNode)
    }
  } finally {
    loadingTree.value = false
  }
}

async function loadTreeNode(node, resolve) {
  try {
    loadingTree.value = true
    const params = node.level === 0 ? undefined : { pid: node.data.id }
    const res = await getDepartTree(params)
    const list = normalizeTreeOptions(res || [])
    if (node.level === 0 && !selectedDepart.value && list[0]) {
      nextTick(() => {
        treeRef.value?.setCurrentKey(list[0].id)
        selectDepart(list[0])
      })
    }
    resolve(list)
  } finally {
    loadingTree.value = false
  }
}

function handleTreeCheck(_node, payload) {
  checkedTreeKeys.value = payload.checkedKeys || []
}

function selectDepart(node) {
  selectedDepart.value = node
  detailForm.value = clone(node)
  activeTab.value = 'base'
  loadPermissionTree()
}

function handleTreeNodeClick(data) {
  selectDepart(data)
}

async function handleSaveDetail() {
  if (!detailForm.value?.id) return
  await validForm(detailFormRef.value)
  await editDepart(detailForm.value)
  $toast.success('保存成功')
  await loadRootTree()
}

function handleCreate() {
  dialogRef.value?.open({
    title: '新增部门',
  })
}

function handleAddChild() {
  if (!selectedDepart.value) {
    $toast.warning('请先选择一个部门')
    return
  }
  dialogRef.value?.open({
    title: '添加下级部门',
    isChild: true,
    row: {
      parentId: selectedDepart.value.id,
    },
  })
}

async function handleBatchDelete() {
  if (checkedTreeKeys.value.length === 0) {
    $toast.warning('请先勾选需要删除的部门')
    return
  }
  await deleteBatchDepart(checkedTreeKeys.value.join(','))
  clearSelectedTree()
  selectedDepart.value = null
  detailForm.value = null
  await loadRootTree()
}

function handleImport() {
  uploadFile({
    url: '/sys/sysDepart/importExcel',
    multiple: false,
    callback: {
      success: () => loadRootTree(),
    },
  })
}

async function handleExport() {
  const params = checkedTreeKeys.value.length > 0 ? { selections: checkedTreeKeys.value.join(',') } : {}
  await exportDepart(params)
}

async function loadPermissionTree() {
  if (!selectedDepart.value?.id) return
  loadingPermission.value = true
  try {
    const treeRes = await getDepartPermissionTree()
    permissionTreeData.value = normalizeTreeOptions(treeRes?.treeList || [])
    expandedPermissionKeys.value =
      treeConfig.value.expand === 'openAll' ? collectTreeKeys(permissionTreeData.value) : []
    relationMode.value = treeConfig.value.level !== 'standAlone'
    const res = await getDepartPermission(selectedDepart.value.id)
    checkedPermissionKeys.value = Array.isArray(res) ? res : []
    defaultPermissionKeys.value = [...checkedPermissionKeys.value]
    rebuildPermissionTree()
  } finally {
    loadingPermission.value = false
  }
}

function savePermissionConfig(partial: Record<string, any>) {
  treeConfig.value = {
    ...treeConfig.value,
    ...partial,
  }
  setStorageFlag(STORAGE_KEY, treeConfig.value)
}

function handlePermissionCheck(node, payload) {
  if (!relationMode.value) {
    checkedPermissionKeys.value = payload.checkedKeys || []
    return
  }
  const currentKey = node.id ?? node.key
  const descendants = collectNodeDescendantKeys(node)
  const currentChecked = (payload.checkedKeys || []).some((item) => String(item) === String(currentKey))
  checkedPermissionKeys.value = currentChecked
    ? mergeKeys(checkedPermissionKeys.value, descendants)
    : removeKeys(checkedPermissionKeys.value, descendants)
  nextTick(() => {
    permissionTreeRef.value?.setCheckedKeys(checkedPermissionKeys.value, false)
  })
}

function handlePermissionNodeClick(node) {
  if (!node?.ruleFlag || !selectedDepart.value?.id) return
  dataRuleDialogRef.value?.open({
    departId: selectedDepart.value.id,
    functionId: node.id ?? node.key,
  })
}

function handleExpandPermission(expanded: boolean) {
  expandedPermissionKeys.value = expanded ? collectTreeKeys(permissionTreeData.value) : []
  savePermissionConfig({ expand: expanded ? 'openAll' : 'closeAll' })
  rebuildPermissionTree()
}

function syncPermissionCheckedKeys(keys = checkedPermissionKeys.value) {
  nextTick(() => {
    permissionTreeRef.value?.setCheckedKeys?.(keys, false)
  })
}

function handleSelectAllPermissions() {
  checkedPermissionKeys.value = collectTreeKeys(permissionTreeData.value)
  syncPermissionCheckedKeys(checkedPermissionKeys.value)
}

function handleClearPermissions() {
  checkedPermissionKeys.value = []
  syncPermissionCheckedKeys([])
}

function handleRelationMode(relation: boolean) {
  relationMode.value = relation
  savePermissionConfig({ level: relation ? 'relation' : 'standAlone' })
  syncPermissionCheckedKeys(checkedPermissionKeys.value)
}

async function handleSavePermission() {
  if (!selectedDepart.value?.id) return
  loadingPermission.value = true
  try {
    await saveDepartPermission({
      departId: selectedDepart.value.id,
      permissionIds: checkedPermissionKeys.value.join(','),
      lastpermissionIds: defaultPermissionKeys.value.join(','),
    })
    defaultPermissionKeys.value = [...checkedPermissionKeys.value]
    $toast.success('权限保存成功')
  } finally {
    loadingPermission.value = false
  }
}

watch(
  () => selectedDepart.value?.id,
  (value) => {
    if (!value) return
    loadPermissionTree()
  },
)

loadRootTree()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef" class="mb2">
      <g-search-bar :items="items" @search="handleTreeSearch" @reset="handleTreeSearch">
        <gSelectedCount :count="checkedDepartCount" class="mr" @clear="clearSelectedTree" />
        <g-more-button
          :btns="[
            { content: '新增', type: 'primary', icon: 'el-icon-plus', handler: handleCreate },
            { content: '添加下级', type: 'primary', icon: 'el-icon-plus', handler: handleAddChild },
            { content: '导入', type: 'primary', icon: 'el-icon-upload', handler: handleImport },
            { content: '导出', type: 'primary', icon: 'el-icon-download', handler: handleExport },
            {
              content: '批量删除',
              type: 'danger',
              icon: 'el-icon-delete',
              disabled: () => checkedDepartCount === 0,
              isShow: () => checkedDepartCount !== 0,
              handler: handleBatchDelete,
            },
          ]"
          mode="opt"
          trigger="hover"
        />
      </g-search-bar>
    </div>

    <div class="depart-layout" :style="{ height: `${$tableHeight.value}px` }">
      <el-card shadow="never" class="depart-tree-card">
        <template #header>
          <span>部门树</span>
        </template>

        <el-scrollbar height="100%">
          <el-tree
            v-if="lazyMode"
            :key="treeKey"
            ref="treeRef"
            lazy
            node-key="id"
            show-checkbox
            highlight-current
            check-strictly
            :load="loadTreeNode"
            :props="{ label: 'label', children: 'children', isLeaf: 'isLeaf' }"
            :expand-on-click-node="false"
            @check="handleTreeCheck"
            @node-click="handleTreeNodeClick"
          />

          <el-tree
            v-else
            :key="treeKey"
            ref="treeRef"
            node-key="id"
            show-checkbox
            highlight-current
            check-strictly
            :data="treeData"
            :props="{ label: 'label', children: 'children' }"
            default-expand-all
            :expand-on-click-node="false"
            @check="handleTreeCheck"
            @node-click="handleTreeNodeClick"
          />
        </el-scrollbar>
      </el-card>

      <el-card shadow="never" class="depart-detail-card">
        <template #header>
          <span>{{ selectedDepart?.label || '部门详情' }}</span>
        </template>

        <el-empty v-if="!detailForm" description="请先从左侧选择一个部门" />

        <template v-else>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="base">
              <el-form ref="detailFormRef" :model="detailForm" :rules="detailRules" label-width="100px" class="pt2">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="机构名称" prop="departName">
                      <o-input v-model="detailForm.departName" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="上级部门" prop="parentName">
                      <o-input :model-value="selectedDepart?.parentName || '-'" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="机构编码" prop="orgCode">
                      <o-input v-model="detailForm.orgCode" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="机构类型" prop="orgCategory">
                      <o-radio v-model="detailForm.orgCategory" :options="categoryOptions" showType="button" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="排序" prop="departOrder">
                      <el-input-number v-model="detailForm.departOrder" :min="0" class="w-full" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="电话" prop="mobile">
                      <o-input v-model="detailForm.mobile" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="传真" prop="fax">
                      <o-input v-model="detailForm.fax" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="地址" prop="address">
                      <o-input v-model="detailForm.address" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="备注" prop="memo">
                      <o-input v-model="detailForm.memo" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>

              <div class="mt2 flex justify-end">
                <el-button type="primary" @click="handleSaveDetail">保存</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane label="部门权限" name="permission">
              <div class="mb2 flex flex-wrap gap-2">
                <el-button @click="handleSelectAllPermissions">选择全部</el-button>
                <el-button @click="handleClearPermissions">取消选择</el-button>
                <el-button @click="handleExpandPermission(true)">展开全部</el-button>
                <el-button @click="handleExpandPermission(false)">折叠全部</el-button>
                <el-button :type="relationMode ? 'primary' : 'default'" @click="handleRelationMode(true)">
                  层级关联
                </el-button>
                <el-button :type="!relationMode ? 'primary' : 'default'" @click="handleRelationMode(false)">
                  层级独立
                </el-button>
                <el-button type="primary" :loading="loadingPermission" @click="handleSavePermission">
                  保存权限
                </el-button>
              </div>

              <el-scrollbar class="permission-box">
                <el-tree
                  :key="permissionTreeKey"
                  ref="permissionTreeRef"
                  node-key="id"
                  show-checkbox
                  check-strictly
                  highlight-current
                  :data="permissionTreeData"
                  :props="{ label: 'label', children: 'children' }"
                  :default-expanded-keys="expandedPermissionKeys"
                  :default-checked-keys="checkedPermissionKeys"
                  :expand-on-click-node="false"
                  @check="handlePermissionCheck"
                  @node-click="handlePermissionNodeClick"
                >
                  <template #default="{ data }">
                    <span class="flex items-center gap-2">
                      <span>{{ data.label }}</span>
                      <el-tag v-if="data.ruleFlag" size="small" type="danger">规则</el-tag>
                    </span>
                  </template>
                </el-tree>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-card>
    </div>

    <DepartDialog ref="dialogRef" @success="loadRootTree" />
    <DepartDataRuleDialog ref="dataRuleDialogRef" />
  </div>
</template>

<style scoped lang="scss">
.depart-layout {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 16px;
}

.depart-tree-card,
.depart-detail-card {
  min-height: 0;
}

.depart-tree-card :deep(.el-card__body),
.depart-detail-card :deep(.el-card__body) {
  height: calc(100% - 56px);
  padding: 16px;
}

.permission-box {
  height: calc(100% - 44px);
  min-height: 420px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

@media (width <= 1200px) {
  .depart-layout {
    grid-template-columns: 1fr;
  }

  .permission-box {
    min-height: 360px;
  }
}
</style>
