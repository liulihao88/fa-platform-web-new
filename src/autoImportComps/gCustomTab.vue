<template>
    <div class="flex bg-white overflow-hidden" :class="{ 'flex-col': mode === 'vertical' }">
        <div v-for="(tab, index) in tabs" :key="tab.prop"
            class="flex-1 mb-2 px-4 py-3 text-center cursor-pointer transition-all duration-300 border border-gray-300"
            :class="{
                'bg-blue-500 text-white border-blue-500': activeTab === tab.prop,
                'hover:bg-blue-50': activeTab !== tab.prop,
            }" @click="handleTabClick(tab.prop)">
            {{ tab.label }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface TabItem {
    label: string
    prop: string
}

const props = defineProps<{
    tabs: TabItem[]
    mode?: 'vertical' | 'horizontal'
    modelValue?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
}>()

const activeTab = ref(props.modelValue || (props.tabs.length > 0 ? props.tabs[0].prop : ''))

function handleTabClick(prop: string) {
    activeTab.value = prop
    emit('update:modelValue', prop)
    emit('change', prop)
}

watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue) {
            activeTab.value = newValue
        }
    },
)
</script>

<style scoped></style>
