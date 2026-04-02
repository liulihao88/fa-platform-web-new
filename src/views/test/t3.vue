<template>
  <vue-office-excel :src="excel" style="height: 100vh" @rendered="renderedHandler" @error="errorHandler" />
</template>

<script setup lang="ts">
//引入VueOfficeExcel组件
import VueOfficeExcel from '@vue-office/excel/lib/v3/index.js'
//引入相关样式
import '@vue-office/excel/lib/v3/index.css'

const excel = 'http://static.shanhuxueyuan.com/demo/excel.xlsx' //设置文档地址
const renderedHandler = () => {
  console.log('渲染完成')
}
const errorHandler = () => {
  console.log('渲染失败')
}
</script>
