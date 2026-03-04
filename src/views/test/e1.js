//update-begin---author:chenrui ---date:2025/1/7  for：[QQYUN-10775]验证码可以复用 #7674------------
randCodeData.checkKey =
  new Date().getTime() + Math.random().toString(36).slice(-4); // 1629428467008;
//update-end---author:chenrui ---date:2025/1/7  for：[QQYUN-10775]验证码可以复用 #7674------------
getCodeInfo(randCodeData.checkKey).then(res => {
  randCodeData.randCodeImage = res;
  randCodeData.requestCodeSuccess = true;
});
