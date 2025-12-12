<template>
  <a-card class="case-body">
    <a-row :gutter="16">
      <a-col :span="24">
        <div class="case-header">
          <!--<h2>{{ caseInfo.caseName }}</h2>-->
          <a-row :gutter="16" class="case-info">
            <a-col :xs="24" :sm="6">
              <span class="info-label">案件名称:</span>
              <span class="info-value"><b>{{ caseInfo.caseName }}</b></span>
            </a-col>
            <a-col :xs="24" :sm="6">
              <span class="info-label">部门受案号:</span>
              <span class="info-value">{{ caseInfo.departmentCaseNumber }}</span>
            </a-col>
            <a-col :xs="24" :sm="6">
              <span class="info-label">受理日期:</span>
              <span class="info-value">{{ formattedAcceptTime }}</span>
            </a-col>
              <a-col :xs="24" :sm="6">
                <div class="reason-box">
                  <div class="info-label" >案由:</div>
                  <gLocalTooltip :content="caseInfo.caseReason">
                  </gLocalTooltip>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>

    <div class="mt4 mb2">
      <a-steps
        :current="currentStep"
        :items="stepOptions"
      ></a-steps>
    </div>

    <div class="case-tabs">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="上传文件">
           <tab1 :filteredFiles="filteredFiles" :fileProcessOptions="fileProcessOptions" @timerUpdate="timerUpdate" ref="tab1Ref" :caseInfo="caseInfo"></tab1>
        </a-tab-pane>
        <!--<a-tab-pane key="2" tab="涉案人管理" force-render>
          <tab2
            :idCardTypeOptions="idCardTypeOptions"
            :involvedRelateOptions="involvedRelateOptions"
            :involvedKindOptions="involvedKindOptions"
          ></tab2>
        </a-tab-pane>-->
        <a-tab-pane key="2" tab="标准数据查看">
          <tab3
              :filteredFiles="filteredFiles"
          ></tab3>
        </a-tab-pane>
        <a-tab-pane key="3" tab="重复数据查看">
          <tab4></tab4>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-card>
</template>

<script lang="ts" name="system-user" setup>
import {ref, onMounted, reactive, computed, watch} from 'vue';
  import { useRoute } from 'vue-router';
  import { caseDetailApi,standardFileListApi } from './user.api'
  import { getCommonDictionary } from '/@/utils/index';
  import dayjs from 'dayjs';
  import tab1 from './components/tab1/table.vue'
  import tab2 from './components/tab2/table.vue'
  import tab3 from './components/tab3/table.vue'
  import tab4 from './components/tab4/table.vue'

  const { query } = useRoute();
  const activeKey = ref('1');
  const caseInfo = ref({});
  const stepOptions = ref([]);
  const fileProcessOptions = ref([]);
  const involvedRelateOptions = ref([]);
  const involvedKindOptions = ref([]);
  const idCardTypeOptions = ref([]);
  const filteredFiles = reactive([])
  const currentStep = ref(0);
  const tab1Ref = ref(null);

  const fetechStepOptions = ()=>{
    if (query.caseId) {
      fetchCaseInfo();
    }
  }





  const timerUpdate = ()=>{
    fetechStepOptions()
  }
  // 模拟从服务端获取案件信息的函数
  const fetchCaseInfo = async () => {
    caseDetailApi({caseId: query.caseId}).then((res)=>{
      console.info('111111111111111',res)
      if(res.fileProcessStatus == '000'){
        currentStep.value = 0;
      }else if(res.fileProcessStatus == '001'){
        currentStep.value = 1;
      }else if(res.fileProcessStatus == '010'){
        currentStep.value = 2;
      }else if(res.fileProcessStatus == '002'){
        currentStep.value = 3;
      }else if(res.fileProcessStatus == '003'){
        currentStep.value = 4;
      }else if(res.fileProcessStatus == '004'){
        currentStep.value = 5;
      }else{
        currentStep.value = 0;
      }


      caseInfo.value = res;
      // currentStep.value = mockResponse.data.currentStep;
    })
  };

  const formattedAcceptTime = computed(() => {
    return caseInfo.value.acceptTime ? dayjs(caseInfo.value.acceptTime).format('YYYY-MM-DD') : '';
  });

    // 页面初始化时调用接口
  onMounted(() => {
    fetechStepOptions()
    //fetchStandardFileList()
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

  watch(activeKey, (val)=>{
  if(val == '1'){
    tab1Ref.value?.restart()
  }else{
    tab1Ref.value?.stop()
  }
  })
</script>

<style scoped>
  .case-body:deep(.ant-card-body) {
    padding: 24px;
  }

  .case-body:deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }

  .case-header {
    border-bottom: 1px solid #e8e8e8;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .case-header h2 {
    margin-bottom: 16px;
    color: #1d2129;
  }

  .case-info {
    margin-bottom: 0;
  }

  .info-label {
    font-weight: 500;
    color: #86909c;
    margin-right: 8px;
    white-space: nowrap; 
  }

  .info-value {
    color: #1d2129;
  }

  .mt4 {
    margin-top: 16px;
  }

  .mb2 {
    margin-bottom: 16px;
  }

  .case-tabs {
    margin-top: 16px;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .case-header h2 {
      font-size: 18px;
    }

    .case-body:deep(.ant-card-body) {
      padding: 16px;
    }
  }
  .reason-box{
    display: flex;
    width: 100%;
    align-items: center;
    position: relative;
    .one-line{
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 1; 
      -webkit-box-orient: vertical;
      overflow: hidden;
      /* 推荐添加的属性 */
      text-overflow: ellipsis; 
      white-space: nowrap; 
    }
  }
</style>
