<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const data = ref([])
const editRow = (row) => {}
const columns = [
  {
    label: '名字',
    prop: 'name',
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '编辑',
        handler: editRow,
        comp: 'o-icon',
        attrs: {
          name: 'edit',
          type: 'svg',
          content: '编辑',
        },
      },
      {
        content: '删除',
        handler: deleteRow,
        comp: 'o-icon',
        attrs: {
          name: 'delete',
          type: 'svg',
          content: '删除',
        },
      },
    ],
  },
]
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
