<template>
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
    <div  class="mt4 mb2">
      <a-steps
          :current="currentStep"
          :items="stepOptions"
      ></a-steps>
    </div>

    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="上传文件">
        <tab1 :fileProcessOptions="fileProcessOptions"></tab1>
      </a-tab-pane>
      <a-tab-pane key="2" tab="涉案人管理" force-render>
        <tab2
            :idCardTypeOptions="idCardTypeOptions"
            :involvedRelateOptions="involvedRelateOptions"
            :involvedKindOptions="involvedKindOptions" ></tab2>
      </a-tab-pane>
      <a-tab-pane key="3" tab="标准数据查看">
        <tab3></tab3>
      </a-tab-pane>
      <a-tab-pane key="4" tab="重复数据查看">
        <tab4></tab4>
      </a-tab-pane>
    </a-tabs>
  </a-card>

</template>

<script lang="ts" name="system-user" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {caseDetailApi} from './user.api'
import { getCommonDictionary } from '/@/utils/index';
import tab1 from './components/tab1/table.vue'
import tab2 from './components/tab2/table.vue'
import tab3 from './components/tab3/table.vue'
import tab4 from './components/tab4/table.vue'
const {query} = useRoute();
const activeKey = ref('1');
const caseInfo = ref({});
const stepOptions = ref([]);
const fileProcessOptions = ref([]);
const involvedRelateOptions = ref([]);
const involvedKindOptions = ref([]);
const idCardTypeOptions = ref([]);


const currentStep = ref(0);

// 页面初始化时调用接口
onMounted(() => {
  if(query.caseId){
    fetchCaseInfo();
  }
  getCommonDictionary('fa_case_process_status').then((res:[])=>{
    stepOptions.value = res
  })
  getCommonDictionary('fa_file_process_status').then((res:[])=>{
    fileProcessOptions.value = res
  })
  getCommonDictionary('fa_involved_person_relation').then((res:[])=>{
    involvedRelateOptions.value = res
  })
  getCommonDictionary('fa_involved_person_type').then((res:[])=>{
    involvedKindOptions.value = res
  })

  getCommonDictionary('fa_id_type').then((res:[])=>{
    idCardTypeOptions.value = res
  })


});


// 模拟从服务端获取案件信息的函数
const fetchCaseInfo = async () => {
  caseDetailApi({caseId: query.caseId}).then((res)=>{
      console.info('111111111111111',res)
      currentStep.value = Number(res.fileProcessStatus)
      caseInfo.value = res;
   // currentStep.value = mockResponse.data.currentStep;
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
