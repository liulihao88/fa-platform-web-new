<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
import { useCommonHook } from "@/store";
const { sysAllDictItems, getDictItems } = useCommonHook();
</script>

<template>
  <div>
    <div>test/t2.vue</div>
    <!-- {{ sysAllDictItems }} -->
    {{ getDictItems("ol_form_biz_type") }}
  </div>
</template>
