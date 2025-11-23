<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
</script>

<template>
  <a-tooltip placement="top" v-bind="$attrs" arrow-point-at-center>
    <slot></slot>
  </a-tooltip>
</template>
