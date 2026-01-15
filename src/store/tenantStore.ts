// stores/tenantStore.ts
import { setStorage, getStorage } from "@oeos-components/utils";
import { defineStore } from "pinia";
export const useTenantStore = defineStore("tenant", {
  state: () => ({
    tenantId: getStorage() // 初始为空，登录后设置
  }),
  actions: {
    // 登录后调用，设置租户ID
    setTenantId(tenantId: string) {
      this.tenantId = tenantId;
      // 缓存到 localStorage，Key格式: `${tenantId}-tenantId`
      setStorage(`login-tenantId`, tenantId, true);
      // 本地缓存, 目的是当复制url的时候, 浏览器缓存会不起作用. 这时候用本地缓存
      setStorage(`${tenantId}-login-tenantId`, tenantId);
    },
    // 获取当前租户ID（确保已登录）
    getTenantId(): string {
      if (this.tenantId) {
        return this.tenantId; // 如果内存中有，直接返回
      }
      // 如果没有，尝试从 localStorage 所有 Key 中匹配 `${x}-login-tenantId`
      const sessionTenantId = getStorage("login-tenantId", true);
      if (sessionTenantId) {
        return sessionTenantId; // 返回找到的租户ID
      }

      const storage = window.localStorage; // 或者 window.sessionStorage
      const keys = Object.keys(storage);
      let localTenantId = "";
      keys.forEach(key => {
        if (key.endsWith("-login-tenantId")) {
          localTenantId = getStorage(key);
        }
      });
      return localTenantId; // 如果没有找到，返回空字符串
    }
  }
});
