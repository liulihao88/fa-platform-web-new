<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { getFaCaseInfoList } from '@/api/analysis'
import { useRouter, useRoute } from 'vue-router'
import { $toast, getStorage, setStorage } from '@oeos-components/utils'
const router = useRouter()
const { proxy } = getCurrentInstance()
const route = useRoute()
import { useCommonHook } from '@/store'
const { setCommonItems, sysAllDictItems, getDictItems } = useCommonHook()
import { useDetail } from '@/hooks'
const { toDetail } = useDetail()

const baseSearch = {
  order: 'desc',
  pageNo: 1,
  pageSize: 10,
  column: 'createTime',
}
const data = ref([])
const total = ref(0)
const headerRef = ref()

const editRow = (row) => {}

const columns = [
  {
    label: '案件名称',
    prop: 'caseCode',
  },
  {
    label: '案由',
    prop: 'caseReason',
  },
  {
    label: '部门受案号',
    prop: 'sysOrgCode',
    width: 100,
  },
  {
    label: '受理时间',
    prop: 'createTime',
  },
  {
    label: '文件处理状态',
    prop: 'processStatus',

    filter: (value) => {
      return getDictItems('fa_case_process_status').find((v) => v.value === value).label
    },
  },
  /**
   *  {
    title: '处理进度',
    align:"center",
    resizable: true,
    dataIndex: 'processStatus',
    customRender: ({ text }) => {
      // 进度条显示规则
      const progressMap = {
        '000': 0,
        '001': 20,
        '010': 40,
        '002': 60,
        '003': 80,
        '004': 100
      };

      const percent = progressMap[text] || 0;

      return h('div', { style: 'display: flex; align-items: center;' }, [
        h('div', {
          style: 'width: 100%; background-color: #f5f5f5; border-radius: 10px; overflow: hidden;'
        }, [
          h('div', {
            style: `width: ${percent}%; height: 20px; background: linear-gradient(90deg, #1890ff, #40a9ff); transition: width 0.3s; text-align: center; line-height: 20px; color: white; font-size: 12px;`,
          }, `${percent}%`)
        ])
      ]);
    }
  },
   */
  {
    label: '处理进度',
    prop: 'processStatus',
    width: 150,
    useSlot: true,
  },
  {
    label: '文件数量',
    prop: 'fileNum',
    width: 100,
  },
  {
    label: '成功数量',
    prop: 'succFileNum',
    width: 100,
  },
  {
    label: '失败数量',
    prop: 'errorFileNum',
    width: 100,
  },
  {
    label: '导入行数',
    prop: 'importDataNum',
    width: 100,
  },
  {
    label: '去重行数',
    prop: 'repeatDataNum',
    width: 100,
  },
  {
    key: 'operation',
    label: '操作',
    width: 200,
    btns: [
      {
        content: '数据处理',
        handler: handleRow,
      },
      {
        content: '智能筛查',
        handler: filterRow,
      },
      {
        content: '编辑',
        comp: 'o-icon',
        attrs: {
          name: 'edit',
          content: '编辑',
        },
        handler: editRow,
      },
    ],
  },
]

const parseProcess = (text) => {
  const progressMap = {
    '000': 0,
    '001': 20,
    '010': 40,
    '002': 60,
    '003': 80,
    '004': 100,
  }

  const percent = progressMap[text] || 0
  return percent
}
async function handleRow(row) {
  console.log(`81 row`, row)
  // router.push({
  //   name: 'Cases',
  //   query: {
  //     caseId: row.id,
  //   },
  // })
  toDetail('Cases', { caseId: row.id })
  setStorage('caseId', row.id)
}
async function filterRow(row) {
  toDetail('FundsAnalysis', { caseId: row.id })
}

const init = async () => {
  let res = await getFaCaseInfoList(baseSearch)
  console.log(`02 res`, res)
  data.value = res.records
  total.value = res.total
}
init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef">我是头部</div>
    <o-table ref="tableRef" :columns="columns" :data="data" :total="total" :height="$tableHeight.value">
      <template #processStatus="{ value }">
        <o-progress :percentage="parseProcess(value)" text-inside="true" />
      </template>
    </o-table>
  </div>
</template>
