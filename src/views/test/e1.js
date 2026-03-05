//update-begin---author:chenrui ---date:2025/1/7  for：[QQYUN-10775]验证码可以复用 #7674------------
randCodeData.checkKey =
  new Date().getTime() + Math.random().toString(36).slice(-4); // 1629428467008;
//update-end---author:chenrui ---date:2025/1/7  for：[QQYUN-10775]验证码可以复用 #7674------------
getCodeInfo(randCodeData.checkKey).then(res => {
  randCodeData.randCodeImage = res;
  randCodeData.requestCodeSuccess = true;
});

[
  {
    id: "2026836384183017473",
    createBy: "joan",
    createTime: "2026-02-26 09:47:05",
    updateBy: "joan",
    updateTime: "2026-02-27 13:57:29",
    sysOrgCode: null,
    caseCode: "测试0226",
    caseReason: null,
    deptCaseCode: null,
    fileNum: 3,
    processStatus: "004",
    fileImportNum: 0,
    importDataNum: 306,
    repeatDataNum: "98",
    errorFileNum: 0,
    processDate: "2026-02-26",
    succFileNum: 3
  },
  {
    id: "2019233950631804930",
    createBy: "joan",
    createTime: "2026-02-05 10:17:44",
    updateBy: "joan",
    updateTime: "2026-02-05 15:58:45",
    sysOrgCode: null,
    caseCode: "long",
    caseReason: null,
    deptCaseCode: null,
    fileNum: 0,
    processStatus: "010",
    fileImportNum: 0,
    importDataNum: 0,
    repeatDataNum: "0",
    errorFileNum: 0,
    processDate: "2026-02-05",
    succFileNum: 0
  },
  {
    id: "2019224748513378305",
    createBy: "fauser",
    createTime: "2026-02-05 09:41:10",
    updateBy: "fauser",
    updateTime: "2026-02-08 11:26:29",
    sysOrgCode: null,
    caseCode: "测试0204",
    caseReason: null,
    deptCaseCode: null,
    fileNum: 0,
    processStatus: "010",
    fileImportNum: 0,
    importDataNum: 0,
    repeatDataNum: "0",
    errorFileNum: 0,
    processDate: "2026-02-05",
    succFileNum: 0
  },
  {
    id: "2018955357477486593",
    createBy: "fauser",
    createTime: "2026-02-04 15:50:42",
    updateBy: null,
    updateTime: null,
    sysOrgCode: null,
    caseCode: "测试0204",
    caseReason: null,
    deptCaseCode: null,
    fileNum: 0,
    processStatus: "000",
    fileImportNum: 0,
    importDataNum: 0,
    repeatDataNum: "0",
    errorFileNum: 0,
    processDate: "2026-02-04",
    succFileNum: 0
  }
];
