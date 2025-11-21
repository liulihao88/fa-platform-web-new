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
          受理日期：{{formattedAcceptTime}}
        </a-col>
      </a-row>
    </a-card>
  <div class="tabs-box">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="智能筛查">
          <intelligent/>
        </a-tab-pane>
  <!--      <a-tab-pane key="2" tab="流水溯源" force-render>
  
        </a-tab-pane>-->
      </a-tabs>
      <gTooltip class="use-description" :title="useDescriptionTitle" trigger="click">
        <a-button type="primary">操作说明</a-button>
      </gTooltip>
  </div>
  </a-card>

</template>

<script lang="ts" name="fundAnalysis" setup>
import { ref, onMounted, computed, h} from 'vue';
import { useRoute } from 'vue-router';
import {caseDetailApi} from './user.api'
import intelligent from './components/intelligent.vue'
import dayjs from 'dayjs'

const {query} = useRoute();
const activeKey = ref('1');
const caseInfo = ref({});

const useDescriptionTitle = h('div', {}, [
  h('div', '智能筛查操作说明：'),
  h('div', '1、且： 两个条件同时成立； 或：两个条件任意一个成立即可'),
  h('div', '2、筛查的值里面，不支持 （）*.  等特殊字符')
]);

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

const formattedAcceptTime = computed(() => {
  return caseInfo.value.acceptTime
    ? dayjs(caseInfo.value.acceptTime).format('YYYY-MM-DD')
    : '';
});

</script>

<style scoped>

.case-body:deep(.ant-card-body){
  padding: 10px 24px;
}
.case-body:deep(.ant-tabs-nav){
  margin-bottom: 0;
}
.tabs-box{
  position: relative;
  .use-description{
    position: absolute;
    right: 10px;
    top: 4px;
  }
}


</style>
