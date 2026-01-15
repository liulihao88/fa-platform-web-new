import request from "@/utils/request";
import JSEncrypt from "jsencrypt";

export const getCodeInfo = currdatetime => {
  return request(`/sys/randomImage/${currdatetime}`);
};

// 生成加密后的密码
export async function encryptionPassword(...rest) {
  const enRes = await request("common/communicationkey", { type: "common" });
  const publicKey = enRes.communicationKey;
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  const genPwdList = [];
  for (let i = 0; i < rest.length; i++) {
    genPwdList.push(encryptor.encrypt(rest[i]));
  }
  return genPwdList;
}
