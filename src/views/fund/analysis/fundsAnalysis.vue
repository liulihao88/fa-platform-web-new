<template>
  <a-card class="case-body">
    <a-card class="case-body">
      <a-row>
        <a-col span="6">
          案件名称：{{caseInfo.caseName}}
        </a-col>
        <a-col span="6">
          部门受案号: {{caseInfo.departmentCaseNumber}}
        </a-col>
        <a-col span="6">
          受理日期：{{caseInfo.acceptTime}}
        </a-col>
      </a-row>
    </a-card>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="智能筛查">
        <intelligent/>
      </a-tab-pane>
<!--      <a-tab-pane key="2" tab="流水溯源" force-render>

      </a-tab-pane>-->
    </a-tabs>
  </a-card>

</template>

<script lang="ts" name="fundAnalysis" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {caseDetailApi} from './user.api'
import intelligent from './components/intelligent.vue'

const {query} = useRoute();
const activeKey = ref('1');
const caseInfo = ref({});

// 页面初始化时调用接口
onMounted(() => {
  if(query.caseId){
    fetchCaseInfo();
  }
});


// 模拟从服务端获取案件信息的函数
const fetchCaseInfo = async () => {
  caseDetailApi({caseId: query.caseId}).then((res)=>{
      caseInfo.value = res;
  })
};

</script>

<style scoped>

.case-body:deep(.ant-card-body){
  padding: 10px 24px;
}
.case-body:deep(.ant-tabs-nav){
  margin-bottom: 0;
}

</style>
