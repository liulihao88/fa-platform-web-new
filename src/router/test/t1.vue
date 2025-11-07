<script setup lang="ts">
  import { ref, getCurrentInstance } from 'vue';
  const { proxy } = getCurrentInstance();
  let obj = {
    name: 'andy',
  };
</script>

<template>
  <div>
    <div>src/router/test/t1.vue</div>
  </div>
</template>
