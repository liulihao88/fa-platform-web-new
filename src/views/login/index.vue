<script setup lang="ts">
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { loginRules } from "./utils/rule";
import { ref, reactive, toRaw } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { bg, avatar, illustration } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { getCodeInfo, login } from "@/api/login";
import {
  validForm,
  setStorage,
  tryCatch,
  $toast,
  debounce
} from "@oeos-components/utils";
import { TOKEN } from "@/assets/constants";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";

defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const formDataRef = ref<FormInstance>();
const codeImg = ref("");

const { initStorage } = useLayout();
initStorage();

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title } = useNav();

const formData = reactive({
  username: "admin",
  password: "1qaz@WSX",
  captcha: ""
});

const randCodeData = reactive<any>({
  randCodeImage: "",
  requestCodeSuccess: false,
  checkKey: null
});

// const onLogin = async (formEl: FormInstance | undefined) => {
//   if (!formEl) return;
//   await formEl.validate(valid => {
//     if (valid) {
//       loading.value = true;
//       useUserStoreHook()
//         .loginByUsername({
//           username: formData.username,
//           password: formData.password
//         })
//         .then(res => {
//           if (res.success) {
//             // 获取后端路由
//             return initRouter().then(() => {
//               disabled.value = true;
//               router
//                 .push(getTopMenu(true).path)
//                 .then(() => {
//                   message("登录成功", { type: "success" });
//                 })
//                 .finally(() => (disabled.value = false));
//             });
//           } else {
//             message("登录失败", { type: "error" });
//           }
//         })
//         .finally(() => (loading.value = false));
//     }
//   });
// };

const onLogin = async () => {
  await validForm(formDataRef.value);
  let sendData = {
    captcha: formData.captcha,
    checkKey: randCodeData.checkKey,
    password: formData.password,
    username: formData.username
  };
  const { data, error } = await tryCatch(login(sendData), loading);
  console.log(`56 error`, error);
  console.log(`76 data`, data);
  if (error) {
    handleChangeCheckCode();
    return;
  }
  console.log(`73 data`, data);
  setStorage(TOKEN, data.token);
  initRouter().then(() => {
    disabled.value = true;
    router
      .push("/fund/analysis")
      .then(() => {
        $toast("登录成功");
      })
      .finally(() => (disabled.value = false));
  });
};

/**
 * 获取验证码
 */
function handleChangeCheckCode() {
  formData.captcha = "";
  //update-begin---author:chenrui ---date:2025/1/7  for：[QQYUN-10775]验证码可以复用 #7674------------
  randCodeData.checkKey =
    new Date().getTime() + Math.random().toString(36).slice(-4); // 1629428467008;
  //update-end---author:chenrui ---date:2025/1/7  for：[QQYUN-10775]验证码可以复用 #7674------------
  getCodeInfo(randCodeData.checkKey).then(res => {
    console.log(`43 res`, res);
    randCodeData.randCodeImage = res;
    randCodeData.requestCodeSuccess = true;
    formData.captcha = randCodeData.randCodeImage;
  });
}
handleChangeCheckCode();

const immediateDebounce: any = debounce(onLogin, 1000);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce(formDataRef.value);
});
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-hidden">{{ title }}</h2>
          </Motion>

          <el-form
            ref="formDataRef"
            :model="formData"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: '请输入账号',
                    trigger: 'blur'
                  }
                ]"
                prop="username"
              >
                <el-input
                  v-model="formData.username"
                  clearable
                  placeholder="账号"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="formData.password"
                  clearable
                  show-password
                  placeholder="密码"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="captcha">
                <o-input
                  v-model="formData.captcha"
                  v-focus
                  placeholder="验证码"
                  :clearable="false"
                  :prefix-icon="useRenderIcon(Lock)"
                >
                  <template #suffix>
                    <img
                      v-if="randCodeData.requestCodeSuccess"
                      :src="randCodeData.randCodeImage"
                      @click="handleChangeCheckCode"
                    />
                    <img
                      v-else
                      style="max-width: initial; margin-top: 2px"
                      :src="codeImg"
                      @click="handleChangeCheckCode"
                    />
                  </template>
                </o-input>
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4!"
                size="default"
                type="primary"
                :loading="loading"
                :disabled="disabled"
                @click="onLogin()"
              >
                登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
