<template>
    <div class="h-screen">
        <gSplitPane :splitSet="splitSet">
            <template #paneL>
                <div class="h-full">
                    <gCustomTab class="mt-4" v-model="activeTab" :tabs="tabs" mode="vertical"
                        @change="handleTabChange" />
                </div>
            </template>
            <template #paneR>
                <div class="h-full">
                    <component :is="componentMap[activeTab]" />
                </div>
            </template>
        </gSplitPane>
    </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import smartSearchDetail from './smartSearchDetail.vue'
import caseManage from './caseManage.vue'
import caseDealSearch from './caseDealSearch.vue'

const splitSet = reactive({
    minPercent: 10,
    defaultPercent: 15,
    split: 'vertical',
})

const activeTab = ref('smartSearchDetail')
const tabs = [
    { label: '智能筛查', prop: 'smartSearchDetail' },
    { label: '涉案人管理', prop: 'caseManage' },
    { label: '涉案人交易查询', prop: 'caseDealSearch' },
]

// 组件映射
const componentMap = {
    smartSearchDetail,
    caseManage,
    caseDealSearch,
}

function handleTabChange(prop) {
    console.log('当前选中的标签:', prop)
    activeTab.value = prop
}
</script>

<style scoped lang="scss">
.h-screen {
    height: 100vh;
}

.dv-b {
    padding: 20px;
    background-color: #f5f7fa;
    height: 100%;
}

.dv-c {
    padding: 20px;
    background-color: #ffffff;
    height: 100%;
}
</style>
