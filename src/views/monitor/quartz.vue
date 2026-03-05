<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
import TaskDialog from "@/views/fund/taskDialog.vue";
import { getQuartzJobList } from "@/api/analysis";
import { $toast, getType } from "@oeos-components/utils";
const { proxy } = getCurrentInstance();

const taskDialogRef = ref();
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
    label: "任务类名",
    prop: "jobClassName"
  },
  {
    label: "Cron表达式",
    prop: "cronExpression"
  },
  {
    key: "operation",
    label: "操作",
    btns: [
      {
        content: "编辑",
        // comp: "o-icon",
        handler: editRow
        // attrs: {
        //   name: "edit",
        //   type: "svg",
        //   content: "数据处理"
        // }
      }
      // {
      //   content: "删除",
      //   comp: "o-icon",
      //   attrs: {
      //     name: "delete",
      //     type: "svg",
      //     content: "智能筛查"
      //   }
      // }
    ]
  }
];

function editRow(row) {
  console.log(`66 row`, row);
  if (getType(row.parameter) === "object") {
    row.paramterType = "json";
  } else {
    row.paramterType = "string";
  }
  taskDialogRef.value.open(row);
}

const init = async () => {
  let res = await getQuartzJobList(baseSearch);
  console.log(`02 res`, res);
  data.value = res.records;
  total.value = res.total;
};
init();
</script>

<template>
  <div>
    <o-table ref="tableRef" :columns="columns" :data="data" :total="total" />
    <TaskDialog ref="taskDialogRef" />
  </div>
</template>
