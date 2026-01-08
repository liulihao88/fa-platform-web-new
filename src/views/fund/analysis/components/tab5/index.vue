<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
</script>

<template>
  <div>
   <a-row :gutter="16">
    <a-col :span="4">
      <a-card title="发起交易方">
        <div>胡雪岩</div>
      </a-card>
    </a-col>
    <a-col :span="4">
      <a-card title="交易对手方">
      <div>
          <div>卡号: 1233333333</div>
          <div>匿名用户</div>
          <div>胡伟昌</div>
      </div>
      </a-card>
    </a-col>
    <a-col :span="16">
      <a-space>
        <a-button>导出本页数据</a-button>
        <a-button>导出选择数据</a-button>
        <a-button>导出全部数据</a-button>
        <a-button>生成卷宗信息</a-button>
      </a-space>
    </a-col>
  </a-row>
  </div>
</template>
