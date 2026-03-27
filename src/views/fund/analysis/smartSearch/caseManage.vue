<template>
    <div class="h-100% bg-white p-4">

        <gSearchBar :items="searchItems" @search="onSearch" @reset="resetSearch" />
        <!-- 表格部分 -->
        <BasicTable :columns="columns" :dataSource="dataSource" :loading="tableLoading" bordered size="small"
            :canResize="true" :showTableSetting="true"
            :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab2-involved-person' }"
            @register="registerTable">
            <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'index'">
                    {{ index + 1 }}
                </template>
                <template v-if="column.dataIndex === 'involvedKind'">
                    <a-tag :color="getKindColor(record.involvedKind)">
                        {{ getKindText(record.involvedKind) }}
                    </a-tag>
                </template>
                <template v-if="column.dataIndex === 'relationCount'">
                    <span :style="{ color: record.relationCount > 0 ? '#1890ff' : '#999' }">
                        {{ record.relationCount }}
                    </span>
                </template>
                <template v-if="column.key === 'operation'">
                    <div class="table-operations">
                        <!-- <a-button size="small" type="primary" @click="adjustRelation(record)">调整</a-button>
                        <a-button class="ml1" size="small" type="primary" @click="viewDetails(record)">关系</a-button> -->
                        <a-button class="ml1" size="small" type="primary"
                            @click="showPersonDetail(record)">涉案人详情</a-button>
                    </div>
                </template>
            </template>
        </BasicTable>

        <!-- 调整关系弹窗 -->
        <BasicModal v-model:visible="adjustModalVisible" title="调整关系" @ok="handleAdjustOk"
            :confirm-loading="adjustConfirmLoading">
            <a-form :model="adjustFormState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
                <a-form-item label="关系" required>
                    <a-select v-model:value="adjustFormState.involvedKind" placeholder="请选择关系">
                        <a-select-option v-for="item in involvedKindOptions" :key="item.value" :value="item.value">
                            {{ item.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </BasicModal>

        <!-- 查看详情弹窗 -->
        <BasicModal v-model:visible="detailModalVisible" title="涉案人关系" width="800px" :footer="null">
            <a-card>
                <h3>涉案人【{{ currentRecord.involvedName }}】相关方关系：</h3>
                <a-button type="primary" class="add-btn" @click="addNewRelation">新增关系</a-button>
                <BasicTable :columns="detailColumns" :dataSource="detailData" bordered size="small"
                    class="relation-table" :pagination="false" :canResize="true" :showTableSetting="true"
                    :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab2-relation-detail' }"
                    @register="registerDetailTable">
                    <template #bodyCell="{ column, record, index }">
                        <template v-if="column.key === 'index'">
                            {{ index + 1 }}
                        </template>
                        <template v-if="column.key === 'involvedName'">
                            {{ currentRecord.involvedName }}
                        </template>
                        <template v-if="column.key === 'relation'">
                            <div class="editable-cell">
                                <div v-if="!record.editing" class="editable-cell-value-wrap">
                                    {{ getRelatedText(record.relation) }}
                                </div>
                                <a-select v-else v-model:value="record.relation" style="width: 100%"
                                    placeholder="请选择关系">
                                    <a-select-option v-for="item in involvedRelateOptions" :key="item.value"
                                        :value="parseInt(item.value)">
                                        {{ item.label }}
                                    </a-select-option>
                                </a-select>
                            </div>
                        </template>
                        <template v-if="column.key === 'relatedPersonCode'">
                            <div class="editable-cell">
                                <div v-if="!record.editing" class="editable-cell-value-wrap">
                                    {{ getRelatedPersonText(record.relatedPersonCode) }}
                                </div>
                                <a-select v-else v-model:value="record.relatedPersonCode" style="width: 100%"
                                    placeholder="请选择相关方">
                                    <a-select-option v-for="item in relatedPersonList" :key="item.id" :value="item.id">
                                        {{ item.customerName }}
                                    </a-select-option>
                                </a-select>
                            </div>
                        </template>
                        <template v-if="column.key === 'operation'">
                            <template v-if="!record.editing">
                                <a-button size="small" @click="editRelation(record)">修改</a-button>
                                <a-button class="ml1" size="small" type="primary" danger
                                    @click="deleteRelation(record)">删除</a-button>
                            </template>
                            <template v-else>
                                <a-button size="small" type="primary" @click="saveRelation(record)">保存</a-button>
                                <a-button class="ml1" size="small" @click="cancelEdit(record)">取消</a-button>
                            </template>
                        </template>
                    </template>
                </BasicTable>
            </a-card>
        </BasicModal>

        <!-- 企业详情抽屉 -->
        <a-drawer v-model:visible="companyDrawerVisible" title="企业详情" width="700px" placement="right">
            <div v-if="currentCompanyDetail">
                <a-card title="企业基本信息">
                    <a-descriptions bordered :column="1">
                        <a-descriptions-item label="营业执照">{{ currentCompanyDetail.enterpriseLicenseNum || '-'
                        }}</a-descriptions-item>
                        <a-descriptions-item label="法人">{{ currentCompanyDetail.enterpriseLegalPersonName || '-'
                        }}</a-descriptions-item>
                        <a-descriptions-item label="证件种类">{{
                            getTdTypeDesc(currentCompanyDetail.idType) }}</a-descriptions-item>
                        <a-descriptions-item label="证件号">{{ currentCompanyDetail.idNum || '-' }}</a-descriptions-item>
                        <a-descriptions-item label="电话">{{ currentCompanyDetail.teleNum || '-' }}</a-descriptions-item>
                    </a-descriptions>
                </a-card>
                <a-card title="人物关系信息" class="mt4">
                    <div v-for="(relation, index) in currentCompanyDetail.relationPersons" :key="index">
                        <p>和 {{ relation.customerNameRel }} - {{ getRelatedText(relation.customerRelation) }}</p>
                    </div>
                </a-card>

                <a-card title="账户信息" class="mt4">
                    <div v-for="(account, index) in currentCompanyDetail.accounts" :key="index">
                        <p><strong>{{ account.bank }}</strong></p>
                        <p v-for="(item, idx) in account.items" :key="idx" style="margin-left: 20px;">
                            {{ item.type }} {{ item.number }}
                        </p>
                    </div>
                </a-card>
            </div>
            <a-skeleton v-else active />
        </a-drawer>

        <!-- 个人详情抽屉 -->
        <a-drawer v-model:visible="personDrawerVisible" title="个人详情" width="700px" placement="right">
            <a-card v-if="currentPersonDetail">
                <h3>人员基本信息</h3>
                <a-descriptions bordered :column="1">
                    <a-descriptions-item label="证件种类">{{ getTdTypeDesc(currentPersonDetail.idType)
                    }}</a-descriptions-item>
                    <a-descriptions-item label="证件号">{{ currentPersonDetail.idNum || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="电话">{{ currentPersonDetail.teleNum || '-' }}</a-descriptions-item>
                </a-descriptions>

                <h3 style="margin-top: 20px;">人物关系信息</h3>
                <div v-for="(relation, index) in currentPersonDetail.relationPersons" :key="index">
                    <p>和 {{ relation.name }} - {{ relation.type }}</p>
                </div>

                <h3 style="margin-top: 20px;">账户信息</h3>
                <div v-for="(account, index) in currentPersonDetail.relationPersons" :key="index">
                    <p><strong>{{ account.bank }}</strong></p>
                    <p v-for="(item, idx) in account.items" :key="idx" style="margin-left: 20px;">
                        {{ item.type }} {{ item.number }}
                    </p>
                </div>
            </a-card>
            <a-skeleton v-else active />
        </a-drawer>
    </div>
</template>

<script lang="ts" name="tab1" setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute } from "vue-router";
import {
    involvedPersonListApi,
    updatePersonRelationApi,
    getInvolvedRelationApi,
    getInvolvedPersonApi,
    updateInvolvedPersonApi,
    getCompanyOrPersonDetailApi
} from "./api";
import { BasicTable, useTable } from '/@/components/Table';
import { BasicModal } from '/@/components/Modal';
import { initDictOptions } from '/@/utils/dict/index';
import { log } from 'console';
const { query } = useRoute();
const formState = reactive({
    involvedKind: undefined,
    involvedName: ''
});
const searchItems = [
    {
        label: '涉案人种类',
        prop: 'involvedKind',
        type: 'select',
        placeholder: '请选择涉案人种类',
        dict: 'fa_involved_person_type'
    },
    {
        label: '涉案人',
        prop: 'involvedName',
        type: 'input',
        placeholder: '请输入涉案人姓名',
    },
]
interface InvolvedPerson {
    id: string;
    involvedName: string;
    involvedKind: number;
    relationCount: number;
    [key: string]: any;
}

interface DetailRecord {
    id: string;
    relation: number;
    relatedPersonCode: string;
    editing: boolean;
    originalData: any;
    key: string;
    index: number;
    [key: string]: any;
}

interface RelatedPerson {
    id: string;
    customerName: string;
    [key: string]: any;
}

interface CompanyDetail {
    enterpriseLicenseNum: string;
    enterpriseLegalPersonName: string;
    idType: string;
    idNum: string;
    teleNum: string;
    relationPersons: any[];
    accounts: any[];
    [key: string]: any;
}

interface PersonDetail {
    idType: string;
    idNum: string;
    teleNum: string;
    relationPersons: any[];
    [key: string]: any;
}

const involvedRelateOptions = ref<any[]>([]);
const involvedKindOptions = ref<any[]>([]);
const idCardTypeOptions = ref<any[]>([]);

const tableLoading = ref(false);
const searchLoading = ref(false);
// 调整关系弹窗相关状态
const adjustModalVisible = ref(false);
const adjustConfirmLoading = ref(false);

const relatedPersonList = ref<RelatedPerson[]>([]);
const detailData = ref<DetailRecord[]>([]);

const adjustFormState = reactive({
    id: "",
    involvedKind: undefined,
    involvedName: "",
    involvedKindCode: 0
});

// 查看详情弹窗相关状态
const detailModalVisible = ref(false);
const currentRecord = reactive<InvolvedPerson>({
    id: '',
    involvedName: '',
    involvedKind: 0,
    relationCount: 0
});
// 添加详情抽屉相关状态
const companyDrawerVisible = ref(false);
const personDrawerVisible = ref(false);
const currentCompanyDetail = ref<CompanyDetail | null>(null);
const currentPersonDetail = ref<PersonDetail | null>(null);

const detailColumns = ref([
    {
        title: '序号',
        key: 'index',
        width: 100,
        resizable: true
    },
    {
        title: '相关方',
        dataIndex: 'involvedName',
        key: 'involvedName',
        width: 200,
        resizable: true
    },
    {
        title: '关系',
        dataIndex: 'relation',
        key: 'relation',
        width: 150,
        resizable: true
    },
    {
        title: '相关方',
        dataIndex: 'relatedPersonCode',
        key: 'relatedPersonCode',
        width: 200,
        resizable: true
    },
    {
        title: '操作',
        key: 'operation',
        width: 150,
        resizable: true
    }
]);

const columns = ref([
    {
        title: '涉案人种类',
        dataIndex: 'involvedKind',
        width: 120,
        resizable: true
    },
    {
        title: '涉案人',
        dataIndex: 'involvedName',
        width: 200,
        resizable: true
    },
    {
        title: '关系数量',
        dataIndex: 'relationCount',
        key: 'relationCount',
        width: 100,
        resizable: true
    },
    {
        title: '操作',
        key: 'operation',
        width: 200,
        resizable: true
    }
]);

const dataSource = ref([]);

const [registerTable] = useTable({
    columns: columns.value,
    dataSource: dataSource,
    loading: tableLoading,
    bordered: true,
    size: 'small',
    canResize: true,
    showTableSetting: true,
    tableSetting: {
        redo: false,
        size: true,
        setting: false,
        fullScreen: true,
        cacheKey: 'fund-analysis-tab2-involved-person'
    }
});

const [registerDetailTable] = useTable({
    columns: detailColumns.value,
    dataSource: detailData,
    bordered: true,
    size: 'small',
    pagination: false,
    canResize: true,
    showTableSetting: true,
    tableSetting: {
        redo: false,
        size: true,
        setting: false,
        fullScreen: true,
        cacheKey: 'fund-analysis-tab2-relation-detail'
    }
});

// 页面初始化时调用接口
onMounted(() => {
    fetchInvolvedList();
});

// 获取涉案人列表
const fetchInvolvedList = async () => {
    try {
        tableLoading.value = true;
        const params = {
            caseId: query.caseId,
            involvedName: formState.involvedName,
            involvedKind: formState.involvedKind,
        };
        const response = await involvedPersonListApi(params);
        dataSource.value = response;
    } catch (error) {
        message.error('获取涉案人列表失败');
    } finally {
        tableLoading.value = false;
        searchLoading.value = false;
    }
};

const onSearch = (params: Record<string, any>) => {
    Object.assign(formState, params);
    searchLoading.value = true;
    fetchInvolvedList();
};

const adjustRelation = (record) => {
    Object.assign(adjustFormState, record);
    adjustModalVisible.value = true;
};

const handleAdjustOk = () => {
    adjustConfirmLoading.value = true;

    const params = {
        id: adjustFormState.id,
        involvedKindCode: Number(adjustFormState.involvedKind),
    };

    updatePersonRelationApi(params).then(() => {
        adjustConfirmLoading.value = false;
        adjustModalVisible.value = false;
        message.success('调整成功');
        fetchInvolvedList();
    }).catch(() => {
        adjustConfirmLoading.value = false;
        message.error('调整失败');
    })
};

// 添加显示涉案人详情的方法
const showPersonDetail = async (record) => {
    try {
        const response = await getCompanyOrPersonDetailApi({ involvedId: record.id });
        const { customerType } = response // 1企业 2个人
        console.log(response,'0000');
        if (customerType == 1 || customerType == '企业'||!customerType) {
            currentCompanyDetail.value = response;
            companyDrawerVisible.value = true;
        } else if (customerType == 2 || customerType == '个人') {
            currentPersonDetail.value = response;
            personDrawerVisible.value = true;
        }
    } catch (error) {
        message.error('获取详情失败');
    }
};

// getInvolvedPersonApi
const getRelationPersonListByInvolvedId = (record) => {
    const params = {
        involvedId: record.id,
    };
    getInvolvedPersonApi(params).then((res) => {
        // 为每条数据添加编辑状态和原始数据备份
        relatedPersonList.value = res || []
    }).catch(() => {
        message.error('获取关联人员列表失败');
    })
};

const viewDetails = (record) => {
    if (relatedPersonList.value.length == 0) { // 查询关联的涉案人的关联人下拉选
        getRelationPersonListByInvolvedId(record)
    }
    Object.assign(currentRecord, record);
    const params = {
        involvedId: record.id,
    };

    getInvolvedRelationApi(params).then((res) => {
        // 为每条数据添加编辑状态和原始数据备份
        detailData.value = res.map((item, index) => ({
            ...item,
            key: item.id || `temp-${index}`,
            index: index + 1,
            editing: false,
            originalData: { ...item }
        }));
        detailModalVisible.value = true;
    }).catch(() => {
        message.error('获取详情失败');
    })
};

const editRelation = (record) => {
    // 先取消其他正在编辑的行
    detailData.value.forEach(item => {
        if (item.editing && item.key !== record.key) {
            cancelEdit(item);
        }
    });

    record.editing = true;
};

const saveRelation = async (record) => {
    // 验证数据
    if (!record.relatedPersonCode || !record.relation) {
        message.error('请填写完整信息');
        return;
    }

    try {
        const params = {
            id: record.id,
            involvedId: currentRecord.id,
            relationCode: record.relation,
            relatedPersonId: record.relatedPersonCode,
        };

        await updateInvolvedPersonApi(params);
        record.editing = false;
        // 刷新数据
        const refreshParams = {
            involvedId: currentRecord.id,
        };
        const res = await getInvolvedRelationApi(refreshParams);
        detailData.value = res.map((item, index) => ({
            ...item,
            key: item.id || `temp-${index}`,
            index: index + 1,
            editing: false,
            originalData: { ...item }
        }));
    } catch (error) {
        message.error('保存失败');
    }
};

const cancelEdit = (record) => {
    // 恢复原始数据
    if (record.originalData) {
        Object.assign(record, record.originalData);
    }
    record.editing = false;
};

const deleteRelation = async (record) => {
    try {
        // 这里应该调用删除API
        // await deleteInvolvedRelationApi(record.id);
        detailData.value = detailData.value.filter(item => item.key !== record.key);
        message.success('删除成功');
    } catch (error) {
        message.error('删除失败');
    }
};

const addNewRelation = () => {
    const newRecord: DetailRecord = {
        id: `temp-${Date.now()}`,
        key: `temp-${Date.now()}`,
        index: detailData.value.length + 1,
        involvedName: '',
        relatedPersonCode: '',
        relation: 0,
        editing: true,
        originalData: null
    };

    detailData.value.push(newRecord);
};

const getKindColor = (kind) => {
    const colors = {
        1: 'green',
        2: 'red',
        3: 'orange'
    };
    return colors[kind] || 'default';
};

const getKindText = (kind) => {
    if (!involvedKindOptions.value || !Array.isArray(involvedKindOptions.value)) {
        return '未知';
    }
    const option = involvedKindOptions.value.find(opt => parseInt(opt.value) == kind);
    return option ? option.label : '未知';
};

const resetSearch = () => {
    formState.involvedKind = undefined;
    formState.involvedName = '';
    fetchInvolvedList()
};

const getTdTypeDesc = (statusValue) => {
    if (!idCardTypeOptions.value || !Array.isArray(idCardTypeOptions.value)) {
        return '未知';
    }
    const option = idCardTypeOptions.value.find(opt => opt.value === statusValue);
    return option ? option.label : '未知';
};

const getRelatedText = (statusValue) => {
    if (!involvedRelateOptions.value || !Array.isArray(involvedRelateOptions.value)) {
        return '未知';
    }
    const option = involvedRelateOptions.value.find(opt => parseInt(opt.value) === statusValue);
    return option ? option.label : '未知';
};

const getRelatedPersonText = (id) => {
    if (!relatedPersonList.value || !Array.isArray(relatedPersonList.value)) {
        return '未知';
    }
    const person = relatedPersonList.value.find(item => item.id === id);
    return person ? person.customerName : '未知';
};
onMounted(() => {
    initDictOptions('fa_involved_person_relation').then((res: []) => {
        involvedRelateOptions.value = res
    })
    initDictOptions('fa_involved_person_type').then((res: []) => {
        console.log(res, '0000')
        involvedKindOptions.value = res || []
    })
    initDictOptions('fa_id_type').then((res: []) => {
        idCardTypeOptions.value = res
    })
});
</script>

<style scoped>
.search-form :deep(label) {
    width: 100%;
}

.search-form :deep(.ant-form-item-control) {
    width: 100%;
}

.search-form :deep(.ant-input) {
    width: 100%;
}

.search-form :deep(.ant-select) {
    width: 100%;
}

.search-card :deep(.ant-card-body) {
    padding-bottom: 0px !important;
}

.ml1 {
    margin-left: 8px;
}

.ml2 {
    margin-left: 16px;
}

.add-btn {
    margin-bottom: 16px;
}

.editable-cell {
    position: relative;
}

.editable-cell-value-wrap {
    padding: 5px 12px;
    cursor: pointer;
    min-height: 32px;
    display: flex;
    align-items: center;
}

.editable-cell-value-wrap:hover {
    border: 1px dashed #d9d9d9;
    border-radius: 2px;
}
</style>
