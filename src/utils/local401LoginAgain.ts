import request from "./request.ts";
import { $toast } from "@oeos-components/utils";
import {
  setTenantStorage,
  getTenantStorage,
  clearTenantStorage,
  _clearCacheWithPrefix
} from "@/utils/gFunc.ts";
import router from "@/router/index.ts";
import { encryptionPassword } from "@/api/login.ts";

// 如果是测试环境, token过期就再次登录获取新token
export async function devLogin(toLogin = false) {
  const isLoginPath = router.currentRoute.value.path === "/login";

  if (window.VueApp.config.globalProperties.$test && !toLogin && !isLoginPath) {
    const sysdomain = getTenantStorage("tenant-sysdomain");
    if (!sysdomain) {
      clearTenantStorage("tenant-token");
      router.push({ name: "Login" });
      return;
    }
    const genPasRes = await encryptionPassword("adminadmin");
    const data = {
      username: "admin",
      password: genPasRes[0],
      sysdomain: sysdomain.tenantId || "T04"
    };
    const res = await request("/auth/signin", "put", {
      type: "common",
      data: data
    });
    const token = `${res.tokenType} ${res.token}`;
    setTenantStorage("tenant-token", token);
  } else {
    menuLogout();
  }
}

export async function menuLogout(msg = "") {
  if (msg) {
    $toast(msg, "e");
  }
  clearTenantStorage("token");
  const nowPath = router.currentRoute.value.path;
  _clearCacheWithPrefix();
  const redirectPath =
    nowPath === "/login" ? "/login" : `/login?redirect=${nowPath}`;
  router.push(redirectPath);
  // router.push(`/login?redirect=${nowPath}`)
}
