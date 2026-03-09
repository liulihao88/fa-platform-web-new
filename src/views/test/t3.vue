// axios配置 可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动 // The axios configuration can be changed
according to the project, just change the file, other files can be left unchanged import type { AxiosResponse } from
'axios'; import type { RequestOptions, Result } from '/#/axios'; import type { AxiosTransform, CreateAxiosOptions } from
'./axiosTransform'; import { VAxios } from './Axios'; import { checkStatus } from './checkStatus'; import { router }
from '/@/router'; import { useGlobSetting } from '/@/hooks/setting'; import { useMessage } from
'/@/hooks/web/useMessage'; import { RequestEnum, ResultEnum, ContentTypeEnum, ConfigEnum } from '/@/enums/httpEnum';
import { isString } from '/@/utils/is'; import { getToken, getTenantId } from '/@/utils/auth'; import {
setObjToUrlParams, deepMerge } from '/@/utils'; import signMd5Utils from '/@/utils/encryption/signMd5Utils'; import {
useErrorLogStoreWithOut } from '/@/store/modules/errorLog'; import { useI18n } from '/@/hooks/web/useI18n'; import {
joinTimestamp, formatRequestDate } from './helper'; import { useUserStoreWithOut } from '/@/store/modules/user'; import
{ cloneDeep } from "lodash-es"; const globSetting = useGlobSetting(); const urlPrefix = globSetting.urlPrefix; const {
createMessage, createErrorModal } = useMessage(); /** * @description: 数据处理，方便区分多种处理方式 */ const transform:
AxiosTransform = { /** * @description: 处理请求数据。如果数据不是预期格式，可直接抛出错误 */ transformRequestHook: (res:
AxiosResponse
<Result></Result>
