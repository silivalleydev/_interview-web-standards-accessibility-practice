import { getFormattedDate } from "../utils/utils";
import { requestApi2 } from "./requestApi";





// 관리자 로그인 시도


type getAdminLoginAttemptRangeType = {
    adminId? : string
    note? : string
    fromCreatedAtStr? : string
    toCreatedAtStr? : string
    page? : number
    pageSize? : number

}
export const getAdminLoginAttemptRange = async ({
    adminId,
    note,
    fromCreatedAtStr,
    toCreatedAtStr,
    page = 0,
    pageSize = 100
}:getAdminLoginAttemptRangeType) => {
    let params = ''
    if (!fromCreatedAtStr) {
      fromCreatedAtStr = getFormattedDate(new Date(), 'day', 7)
    } else {
      fromCreatedAtStr = getFormattedDate(new Date(fromCreatedAtStr))
    }
    if (!toCreatedAtStr) {
      toCreatedAtStr = getFormattedDate(new Date(), 'day', -1)
    } else {
      toCreatedAtStr = getFormattedDate(new Date(toCreatedAtStr),'day',-1)
    }
    
    if (adminId) {
        params += `&adminId=${adminId}`
    }
    if (note) {
        params += `&note=${note}`
    }
    if (fromCreatedAtStr) {
        params += `&fromCreatedAtStr=${fromCreatedAtStr}`
    }
    if (toCreatedAtStr) {
        params += `&toCreatedAtStr=${toCreatedAtStr}`
    }

    try {
      const result = await requestApi2({
        requestPath: `/private/admin/log/loginattempt?page=${page}&pageSize=${pageSize}${params}`,
        method: "get"
      });
      return result.data;
    } catch (error) {
      return null;
    }
  };




// 계정 로그 다운로드

type downloadLoginattemptLogType = {
    adminId? : string
    note? : string
    fromCreatedAtStr? : string
    toCreatedAtStr? : string
    page? : number
    pageSize? : number
    password : string
    downloadReason : string

}
export const downloadLoginattemptLog = async ({
    adminId,
    note,
    fromCreatedAtStr,
    toCreatedAtStr,
    page = 0,
    pageSize = 15,
    password,
    downloadReason

}:downloadLoginattemptLogType) => {

    let params = ''
    if (!fromCreatedAtStr) {
      fromCreatedAtStr = getFormattedDate(new Date(), 'day', 7)
    } else {
      fromCreatedAtStr = getFormattedDate(new Date(fromCreatedAtStr))
    }
    if (!toCreatedAtStr) {
      toCreatedAtStr = getFormattedDate(new Date(), 'day', -1)
    } else {
      toCreatedAtStr = getFormattedDate(new Date(toCreatedAtStr),'day',-1)
    }
    
    if (adminId) {
        params += `&adminId=${adminId}`
    }
    if (note) {
        params += `&note=${note}`
    }
    if (fromCreatedAtStr) {
        params += `&fromCreatedAtStr=${fromCreatedAtStr}`
    }
    if (toCreatedAtStr) {
        params += `&toCreatedAtStr=${toCreatedAtStr}`
    }
    if (password) {
      params += `&password=${password}`
  }
  if (downloadReason) {
      params += `&downloadReason=${downloadReason}`
  }

    try {
      const result = await requestApi2({
        requestPath: `/private/admin/log/loginattempt/download?page=${page}&pageSize=${pageSize}${params}`,
        method: "get",
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        },
        config: {
            responseType: 'blob',        
        }
      });
      return result.data;
    } catch (error) {
      return null;
    }
  };



// 활동 로그 다 건 조회


type getActivityLogType = {
    adminId? : string
    activityContent? : string
    fromCreatedAtStr? : string
    toCreatedAtStr? : string
    page? : number
    pageSize? : number

}
export const getActivityLog = async ({
    adminId,
    activityContent,
    fromCreatedAtStr,
    toCreatedAtStr,
    page = 0,
    pageSize = 30
}:getActivityLogType) => {

    let params = ''


    if (!fromCreatedAtStr) {
      fromCreatedAtStr = getFormattedDate(new Date(), 'day', 7)
    } else {
      fromCreatedAtStr = getFormattedDate(new Date(fromCreatedAtStr))
    }
    if (!toCreatedAtStr) {
      toCreatedAtStr = getFormattedDate(new Date(), 'day', -1)
    } else {
      toCreatedAtStr = getFormattedDate(new Date(toCreatedAtStr),'day',-1)
    }

    params += `page=${page}`

    if (pageSize) {
        params += `&pageSize=${pageSize}`
    }
    if (adminId) {
        params += `&adminId=${adminId}`
    }
    if (activityContent) {
        params += `&activityContent=${activityContent}`
    }
    if (fromCreatedAtStr) {
        params += `&fromCreatedAtStr=${fromCreatedAtStr}`
    }
    if (toCreatedAtStr) {
        params += `&toCreatedAtStr=${toCreatedAtStr}`
    }

    

    try {
      const result = await requestApi2({
        requestPath: `/private/admin/log/activity?${params}`,
        method: "get"
      });
      return result.data;
    } catch (error) {
      return null;
    }
  };




// 활동 로그 다운로드
type downloadActivityLogType = {
    adminId? : string
    classification? : string
    fromCreatedAtStr? : string
    toCreatedAtStr? : string
    page? : number
    pageSize? : number
    downloadReason :  string
    password :  string
    activityContent :  string

}
export const downloadActivityLog = async ({
    adminId,
    classification,
    fromCreatedAtStr,
    toCreatedAtStr,
    page = 0,
    pageSize = 100,
    downloadReason,
    password
}:downloadActivityLogType) => {

    let params = ''
    

    if (!fromCreatedAtStr) {
      fromCreatedAtStr = getFormattedDate(new Date(), 'day', 7)
    } else {
      fromCreatedAtStr = getFormattedDate(new Date(fromCreatedAtStr))
    }
    if (!toCreatedAtStr) {
      toCreatedAtStr = getFormattedDate(new Date(), 'day', -1)
    } else {
      toCreatedAtStr = getFormattedDate(new Date(toCreatedAtStr),'day',-1)
    }
    if (adminId) {
        params += `&adminId=${adminId}`
    }
    if (classification) {
        params += `&classification=${classification}`
    }
    if (fromCreatedAtStr) {
        params += `&fromCreatedAtStr=${fromCreatedAtStr}`
    }
    if (toCreatedAtStr) {
        params += `&toCreatedAtStr=${toCreatedAtStr}`
    }
    if (password) {
      params += `&password=${password}`
  }
  if (downloadReason) {
      params += `&downloadReason=${downloadReason}`
  }

    try {
      const result = await requestApi2({
        requestPath: `/private/admin/log/activity/download?page=${page}&pageSize=${pageSize}${params}`,
        method: "get",
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        },
        config: {
            responseType: 'blob',        
        }
      });
      return result.data;
    } catch (error) {
      return null;
    }
  };



// 계정 로그 다 건 조회


type getAccountLogType = {
    adminId? : string
    content? : string
    fromCreatedAtStr? : string
    toCreatedAtStr? : string
    page? : number
    pageSize? : number
}

export const getAccountLog = async ({
    adminId,
    content,
    fromCreatedAtStr,
    toCreatedAtStr,
    page = 0,
    pageSize = 15
}:getAccountLogType) => {

    let params = ''
    

    if (!fromCreatedAtStr) {
      fromCreatedAtStr = getFormattedDate(new Date(), 'day', 7)
    } else {
      fromCreatedAtStr = getFormattedDate(new Date(fromCreatedAtStr))
    }
    if (!toCreatedAtStr) {
      toCreatedAtStr = getFormattedDate(new Date(), 'day', -1)
    } else {
      toCreatedAtStr = getFormattedDate(new Date(toCreatedAtStr),'day',-1)
    }

    if (adminId) {
        params += `&adminId=${adminId}`
    }
    if (content) {
        params += `&note=${content}`
    }
    if (fromCreatedAtStr) {
        params += `&fromCreatedAtStr=${fromCreatedAtStr}`
    }
    if (toCreatedAtStr) {
        params += `&toCreatedAtStr=${toCreatedAtStr}`
    }
    

    try {
      const result = await requestApi2({
        requestPath: `/private/admin/log/account?page=${page}&pageSize=${pageSize}${params}`,
        method: "get"
      });
      return result.data;
    } catch (error) {
      return null;
    }
  };




// 계정 로그 다운로드



type downloadAccountLogType = {
    adminId? : string
    content? : string
    fromCreatedAtStr? : string
    toCreatedAtStr? : string
    page? : number
    pageSize? : number
    password : string
    downloadReason : string

}
export const downloadAccountLog = async ({
    adminId,
    content,
    fromCreatedAtStr,
    toCreatedAtStr,
    page = 0,
    pageSize = 15,
    password,
    downloadReason
}:downloadAccountLogType) => {

    let params = ''
    if (!fromCreatedAtStr) {
      fromCreatedAtStr = getFormattedDate(new Date(), 'day', 7)
    } else {
      fromCreatedAtStr = getFormattedDate(new Date(fromCreatedAtStr))
    }
    if (!toCreatedAtStr) {
      toCreatedAtStr = getFormattedDate(new Date(), 'day', -1)
    } else {
      toCreatedAtStr = getFormattedDate(new Date(toCreatedAtStr),'day',-1)
    }
    
    if (adminId) {
        params += `&adminId=${adminId}`
    }
    if (content) {
        params += `&content=${content}`
    }
    if (fromCreatedAtStr) {
        params += `&fromCreatedAtStr=${fromCreatedAtStr}`
    }
    if (toCreatedAtStr) {
        params += `&toCreatedAtStr=${toCreatedAtStr}`
    }
    if (password) {
        params += `&password=${password}`
    }
    if (downloadReason) {
        params += `&downloadReason=${downloadReason}`
    }

    try {
      const result = await requestApi2({
        requestPath: `/private/admin/log/account/download?page=${page}&pageSize=${pageSize}${params}`,
        method: "get",
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        },
        config: {
            responseType: 'blob',        
        }
      });
      return result.data;
    } catch (error) {
      return null;
    }
  };





