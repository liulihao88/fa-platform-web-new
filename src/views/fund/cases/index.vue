<script setup lang="ts">
import { ref, getCurrentInstance, computed } from "vue";
import { getCaseInfoById, getCommonDictionary } from "@/api/analysis.ts";
import { $toast, formatTime } from "@oeos-components/utils";
const { proxy } = getCurrentInstance();

import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
console.log(`91 route`, route);
const caseId = route.query.caseId;
console.log(`83 caseId`, caseId);
const caseDetails: any = ref({});

const init = async () => {
  Promise.allSettled([
    getCaseInfoById({ caseId: caseId }),
    getCommonDictionary("fa_case_process_status")
  ]).then(results => results.forEach(result => console.log(result.status)));
};
init();

const descOptions = computed(() => {
  return [
    {
      label: "案件名称",
      value: caseDetails.value.caseName
    },
    {
      label: "部门受案号",
      value: caseDetails.value.invoiceCount
    },
    {
      label: "受理日期",
      value: caseDetails.value.acceptTime,
      filter: val => formatTime(val, "{y}/{m}/{d}")
    },
    {
      label: "案由",
      value: caseDetails.value.caseReason
    }
  ];
});
</script>

<template>
  <div>
    <o-descriptions :options="descOptions" :column="4" />
    <div>fund/cases/index.vue</div>
  </div>
</template>
