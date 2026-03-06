<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
import EasyCron from "@/components/easyCron/index.vue";
</script>

<template>
  <div>
    <EasyCron />
  </div>
</template>
