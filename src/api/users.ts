import { deleteCookie, getTokenFromCookie, setTokenCookie } from "../utils/soonUtill";
import { requestApi, requestApi2 } from "./requestApi";
import * as AWSCognitoIdentity from "amazon-cognito-identity-js";

/**
 * 유저 가져오기
 */
type GetUsersParameterType = {
  type?: "store" | "user";
  uid?: string;
  page?: number;
  requestForPersonalVerification?: string;
};
export const getUsers = async ({
  type,
  uid,
  page,
  requestForPersonalVerification,
  limit = 100,
}: GetUsersParameterType) => {
  try {
    const result = await requestApi({
      requestPath: "/getUsersBo",
      method: "post",
    

      requestBody: {
        type,
        uid,
        page,
        requestForPersonalVerification,
        limit,
      },
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
export const getWithdrawUser = async ({
  userUid = ''
}) => {
  try {
    const result = await requestApi2({
      requestPath: "/private/user/getWithdrawUserInfo",
      method: "post",
    

      requestBody: {
        userUid: userUid.trim()
      },
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
export const getUserSpring = async ({
  uid,
  type,
}: GetUsersParameterType) => {
  try {
    const result = await requestApi2({
      requestPath: `/private/user/${type}/${uid}`,
      method: "get",
    
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
export const getUsersSpring = async ({
  type,
  uid,
  page,
  limit = 100,
  fromCreatedAt
}: GetUsersParameterType) => {
  let param = ''
  if (type) {
    param = (param.length === 0 ? '?type=' + type : '&type=' + type)
  }

  if (uid) {
    param = (param.length === 0 ? '?uid=' + uid : '&uid=' + uid)
  }
  if (fromCreatedAt) {
    param = (param.length === 0 ? '?fromCreatedAt=' + fromCreatedAt : '&fromCreatedAt=' + fromCreatedAt)
  }


  param += `&pageSize=30`
  try {
    const result = await requestApi2({
      requestPath: '/private/user/users' + param,
      method: "get",
    

      requestBody: {
        type,
        uid,
        page,
        pageSize: 30,
        limit,
      },
    });
    return result.data;
  } catch (error) {
    return null;
  }
};

export const getUserById = async (userUid) => {
  try {
    const result = await requestApi({
      requestPath: "/getUsersBo",
      method: "post",
    

      requestBody: {
        uid: userUid,
      },
    });

    if (result.data.length > 0) {
      return result.data[0];
    } else {
      return false;
    }

    return result.data;
  } catch (error) {
    return null;
  }
};
export const getPrivateImageBo = async (objectKey = "") => {
  try {
    const result = await requestApi({
      requestPath: "/getPrivateImageBo",
      method: "post",
    

      requestBody: {
        objectKey,
      },
    });
    return result.data;
  } catch (error) {
    return null;
  }
};

/**
 * 본인인증 요청 확인 API
 */

export type UpdateUserVerificationParameterType = {
  uid: string;
  username: string;
  gender: string;
  birthDate: string;
  koreanSkills: string;
  requestForPersonalVerification: string;
};

export const updateKoreanSkills = async ({ uid, koreanSkills }: UpdateUserVerificationParameterType) => {
  try {
    const result = await requestApi({
      requestPath: "/updateUserBo",
      method: "post",
    
      requestBody: {
        uid,
        koreanSkills,
      },
    });

    return result.data;
  } catch (error) {

    return null;
  }
};

// 사장 <-> 알바 사장 상태 변경
export const transferUser = async ({ uid, phoneNumber, type }) => {
  try {
    const result = await requestApi({
      requestPath: "/updateUserBo",
      method: "post",
    
      requestBody: {
        uid,
        phoneNumber,
        type,
      },
    });

    return result.data;
  } catch (error) {

    return null;
  }
};

export const updateUserAdminMemo = async ({ uid, adminMemo }: UpdateUserVerificationParameterType) => {
  try {
    const result = await requestApi({
      requestPath: "/updateUserBo",
      method: "post",
    
      requestBody: {
        uid,
        adminMemo,
      },
    });

    return result.data;
  } catch (error) {

    return null;
  }
};
export const updateUserAdminMemoSpring = async ({ userUid, adminMemo, memo }) => {
  try {
    const result = await requestApi2({
      requestPath: "/private/user/mergeAdminMemo",
      method: "post",
    
      requestBody: {
        userUid,
        adminMemo,
        memo
      },
    });

    return result.data;
  } catch (error) {

    return null;
  }
};


export const refreshTokenUser = async () => {
  const refreshToken = getTokenFromCookie('@refreshToken');
  try {
    const result = await requestApi2({
      requestPath: `/public/admin/login/refreshAccessToken`,
      method: "post",
      requestBody: {
        refreshToken
      },
    });
    const resultData = result.data || {}

    if(resultData?.status ==='OK'){
      const data = resultData.data || {}
      const newAccessToken = data.accessToken || {}
      setTokenCookie('@accessToken', newAccessToken, 480);
    }else{
      deleteCookie('@accessToken')
      deleteCookie('@refreshToken')

      localStorage.setItem("@id", "");
      localStorage.setItem("@refreshFailed", "true");
      window.location.href = '/'; 
    }


    return resultData;
  } catch (error) {
    deleteCookie('@accessToken')
    deleteCookie('@refreshToken')

    localStorage.setItem("@id", "");
    localStorage.setItem("@refreshFailed", "true");
    window.location.href = '/'; 
    return null;
  }




};




export const removeRejoinLimit = async (uid) => {

  try {
    const result = await requestApi2({
      requestPath: `/private/user/removeRejoinLimit/${uid}`,
      method: "put",
    
    });
    return result.data;
  } catch (error) {
    console.log("removeRejoinLimit request error => ", error);
    return null;
  }
};



/**
 * 프로알바 승급
 */

export const getProAlba = async () => {

  try {
    const result = await requestApi({
      requestPath: "/getUsersBo",
      method: "post",
      requestBody: {
        grade: "PRO",
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("getProAlba request error => ", error);
    return null;
  }
};

export const sendPushToken = async ({
  title,
  body,
  uids = []
}) => {

  try {
    const result = await requestApi({
      requestPath: "/sendPushTokenMax100",
      method: "post",
      requestBody: {
        title,
        body,
        uids,
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("getProAlba request error => ", error);
    return null;
  }
};
/**
 * 유저들 검색
 */

export const getUserAuth = async ({ authInfo }) => {

  try {
    const result = await requestApi({
      requestPath: "/getUserAuth",
      method: "post",
      requestBody: {
        authInfo,
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("getUserAuth request error => ", error);
    return null;
  }
};
/**
 * 알바 횟수 카운트
 */

export const getAppliesCount = async ({ seekerUid }) => {

  try {
    const result = await requestApi({
      requestPath: "/getAppliesCount",
      method: "post",
      requestBody: {
        seekerUid,
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("getUserAuth request error => ", error);
    return null;
  }
};

/**
 * 알바 횟수 카운트
 */

type updateSeekerIntroductionType = {
  uid: string;
  seekerIntroduction: string;
};

export const updateSeekerIntroduction = async ({ uid, seekerIntroduction }: updateSeekerIntroductionType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateUserBo",
      method: "post",
      requestBody: {
        uid,
        seekerIntroduction,
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("updateSeekerIntroduction request error => ", error);
    return null;
  }
};
/**
 * 패널티 먹이기
 */

type goPenaltyThisUserType = {
  uid: string;
  penalty: true;
  penaltyReason: string;
};

export const goPenaltyThisUser = async ({ uid, penalty, penaltyReason }: goPenaltyThisUserType) => {

  try {
    const result = await requestApi({
      requestPath: "/goPenaltyThisUser",
      method: "post",
      requestBody: {
        uid,
        penalty,
        penaltyReason,
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("goPenaltyThisUser request error => ", error);
    return null;
  }
};

// 패널티 해제


export const removePenalty = async (uid) => {

  try {
    const result = await requestApi2({
      requestPath: `/private/user/removePenalty/${uid}`,
      method: "put",
    
    });
    return result.data;
  } catch (error) {
    console.log("removePenalty request error => ", error);
    return null;
  }
};


/**
 * 프로알바 부여
 */

type addProUserType = {
  uid: string;
};

export const addProUser = async ({ uid }: addProUserType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateUserBo",
      method: "post",
      requestBody: {
        uid,
        grade: "PRO",
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("addProUserType request error => ", error);
    return null;
  }
};
/**
 * 프로알바 해제
 */

type removeProUserType = {
  uid: string;
};

export const removeProUser = async ({ uid }: removeProUserType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateUserBo",
      method: "post",
      requestBody: {
        uid,
        grade: "^delete^",
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("removeProUserType request error => ", error);
    return null;
  }
};
/**
 * 프로알바 해제
 */

type getUserByIdsrType = {
  userUids: string[];
};

export const getUserByIds = async ({ userUids }: getUserByIdsrType) => {

  try {
    const result = await requestApi({
      requestPath: "/getUserByIds",
      method: "post",
      requestBody: {
        userUids,
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("userUids request error => ", error);
    return null;
  }
};
/**
 * 알바 횟수 카운트
 */

type putResumesType = {
  uid: string;
  active: boolean;
  employerUid: string;
  seekerUid: string;
  isDoingHere: boolean;
  isVerified: boolean;
  jobId: string;
  jobKind: string;
  startedTime: string;
  endTime: string;
  status: string;
  storeName: string;
};

export const putResumes = async ({
  uid,
  active,
  employerUid,
  seekerUid,
  isDoingHere,
  isVerified,
  jobId,
  jobKind,
  startedTime,
  endTime,
  status,
  storeName,
}: putResumesType) => {

  try {
    const result = await requestApi({
      requestPath: "/putResumes",
      method: "post",
      requestBody: {
        uid,
        active,
        employerUid,
        seekerUid,
        isDoingHere,
        isVerified,
        jobId,
        jobKind,
        startedTime,
        endTime,
        status,
        storeName,
      },
    
    });

    return result.data;
  } catch (error) {
    console.log("putResumes request error => ", error);
    return null;
  }
};
// 펠릭스 API

// 서버 로그인 (5분 계정 잠금, 임시비밀번호, 90일 유저)



export const serverLogin = async ({ adminId, password }) => {
  try {
    const result = await requestApi2({
      requestPath: `/public/admin/login`,
      method: "post",
      requestBody: {
        adminId,
        password,
      },
    });
    const resultData = result.data || {}


    const data = resultData.data || {}
    const newAccessToken = data.accessToken || {}
    const refreshToken = data.refreshToken || {}
    if (resultData?.status === 'OK') {
      setTokenCookie('@accessToken', newAccessToken, 480);
      setTokenCookie('@refreshToken', refreshToken, 480);
      localStorage.setItem("@id", adminId);
    }

    return resultData;
  } catch (error) {
    return null;
  }
};


export const signInUser = async ({ adminId, password }) => {
  try {
    const result = await requestApi2({
      requestPath: `/public/auth/login`,
      method: "post",
      requestBody: {
        adminId,
        password,
      },
    });
    const resultData = result.data || {}

    console.log('resultData??',resultData)
    const data = resultData.data || {}
    const newAccessToken = data.accessToken || ''
    const refreshToken = data.refreshToken || ''
    if (newAccessToken) {
      setTokenCookie('@accessToken', newAccessToken, 480);
      localStorage.setItem("@id", adminId);
    }
    if (refreshToken) {
      setTokenCookie('@refreshToken', refreshToken, 480);
    }

    return resultData;
  } catch (error) {
    return null;
  }
};

// 관계자 로그아웃
export const LogoutUser = async () => {
  try {
    const result = await requestApi2({
      requestPath: `/public/auth/logout`,
      method: "post",
    });

    return result?.data;
  } catch (error) {
    return null;
  }
};




// 계정 등록

export const createUser = async ({ adminId, phoneNumber }) => {
  try {
    const result = await requestApi2({
      requestPath: `/private/admin/create`,
      method: "post",
    
      requestBody: {
        adminId,
        phoneNumber,
      },
    });
    return result.data;
  } catch (error) {
    return null;
  }
};


// 계정초기화

export const initPassword = async ({ adminId }) => {
  try {
    const result = await requestApi2({
      requestPath: `/private/auth/initPassword`,
      method: "post",
    
      requestBody: adminId,
    });
    return result.data || result;
  } catch (error) {
    return null;
  }
};
// SMS 문자 전송 

export const sendSms = async ({adminId, phoneNumber }) => {
  try {
    const result = await requestApi2({
      requestPath: `/public/admin/sms`,
      method: "post",
    
      requestBody:{
        adminId,
        phoneNumber
      }
 
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
// 비밀번호 변경 

export const changePassword = async ({adminId, newPassword, originPassword }) => {
  try {
    const result = await requestApi2({
      requestPath: `/public/admin/changePassword`,
      method: "post",
      requestBody:{
          adminId,
          newPassword,
          originPassword
      }
 
    });
    return result.data;
  } catch (error) {
    return null;
  }
};


// 비밀번호 변경 new
export const changePasswordNew = async ({authCode, newPassword, originPassword }) => {
  const accessToken = getTokenFromCookie('@accessToken');
  console.log(accessToken, 'accessToken')
  try {
    const result = await requestApi2({
      requestPath: `/public/auth/changePassword`,
      method: "post",
      requestBody:{
          authCode,
          newPassword,
          originPassword
      }
 
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
// 활동로그 로그아웃

export const logoutActivityLog = async (adminId: string) => {
  try {
    const result = await requestApi2({
      requestPath: `/private/admin/logout?adminId=${adminId}`,
      method: "post"
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
// 활동로그 세션 로깅

export const sessionActivityLog = async () => {
  try {
    const result = await requestApi2({
      requestPath: `/private/admin/session`,
      method: "post"
    });
    return result.data;
  } catch (error) {
    return null;
  }
};

  // 세션 업데이트(중복로그인)


  export const sessionUpdateLogin = async (isLogin:boolean) => {

    
    try {
      const result = await requestApi2({
        requestPath: `/private/admin/session`,
        method: "put",
        requestBody: {
          isLogin
        },
      });
      return result.data;
    } catch (error) {
      return null;
    }
  };



    // 패널티 부여


    export const appendPenalty = async (uid) => {
  
      
      try {
        const result = await requestApi2({
          requestPath: `/private/user/appendPenalty/${uid}`,
          method: "put",
        });

        return result.data;
      } catch (error) {
        console.log(error)
        return null;
      }
    };

    // 실패횟수
    

    export const resetLoginFailedCount = async (uid) => {
  
      
      try {
        const result = await requestApi2({
          requestPath: `/private/user/resetLoginFailedCount/${uid}`,
          method: "put"
        });

        return result.data;
      } catch (error) {
        console.log(error)
        return null;
      }
    };


  