<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import support1Image from '@/assets/images/filedesc/support1.png'
</script>

<template>
  <div>
    <div>test/t4.vue</div>
    <g-img :src="support1Image" :preview-src-list="[support1Image]" />
  </div>
</template>
