<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
import { getFaCaseInfoList } from "@/api/analysis";
const { proxy } = getCurrentInstance();

const baseSearch = {
  order: "desc",
  pageNo: 1,
  pageSize: 10,
  column: "createTime"
};
const data = ref([]);
const total = ref(0);

const columns = [
  {
    label: "案件名称",
    prop: "caseCode"
  },
  {
    label: "案由",
    prop: "caseReason"
  },
  {
    label: "部门受案号",
    prop: "sysOrgCode"
  },
  {
    label: "受理时间",
    prop: "createTime"
  },
  {
    label: "文件处理状态",
    prop: "processStatus"
  },
  {
    label: "处理进度",
    prop: "name"
  },
  {
    label: "文件数量",
    prop: "fileNum"
  },
  {
    label: "成功数量",
    prop: "succFileNum"
  },
  {
    label: "失败数量",
    prop: "errorFileNum"
  },
  {
    label: "导入行数",
    prop: "importDataNum"
  },
  {
    label: "去重行数",
    prop: "repeatDataNum"
  },
  {
    key: "operation",
    label: "操作",
    btns: [
      {
        content: "编辑",
        comp: "o-icon",
        attrs: {
          name: "edit",
          type: "svg",
          content: "数据处理"
        }
      },
      {
        content: "删除",
        comp: "o-icon",
        attrs: {
          name: "delete",
          type: "svg",
          content: "智能筛查"
        }
      }
    ]
  }
];

const init = async () => {
  let res = await getFaCaseInfoList(baseSearch);
  console.log(`02 res`, res);
  data.value = res.records;
  total.value = res.total;
};
init();
</script>

<template>
  <div>
    <o-table ref="tableRef" :columns="columns" :data="data" :total="total" />
  </div>
</template>
