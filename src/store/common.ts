/**
 *
import { useCommonHook } from "@/store";
const { setCommonItems, sysAllDictItems, getDictItems } = useCommonHook();
getDictItems("ol_form_biz_type")

 */

import { defineStore } from "pinia";
import { store } from "@/store/index";
export const useCommonStore = defineStore("common", {
  state: () => ({
    sysAllDictItems: {},
    userInfo: {}
  }),
  actions: {
    setCommonItems(key, obj) {
      console.log(`18 key`, key);
      this[key] = obj;
    },
    getDictItems(code) {
      return this.sysAllDictItems[code];
    }
  },
  persist: {
    pick: ["sysAllDictItems"]
  }
});

export function useCommonHook() {
  return useCommonStore(store);
}
