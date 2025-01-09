import { requestApi, requestApi2 } from "./requestApi";

/**
 * 날짜범위 내의 고객사 등록 공고 리스트 
 */
type loadReservationsByDateEnterpriseCodeType = {
  page: number
  createdAtStartStr:string,
  createdAtEndStr: string,
  enterpriseCode: string,
   
}

export const loadReservationsByDateEnterpriseCodeList = async ({ 
  page=1,
  createdAtStartStr,
  createdAtEndStr,
  enterpriseCode
}: loadReservationsByDateEnterpriseCodeType) => {


  try {
    const result = await requestApi({
      requestPath: "/loadReservationsByDateEnterpriseCode",
      method: "post",
      requestBody: {
        page,
        createdAtStartStr,
        createdAtEndStr,
        enterpriseCode
     
      },
    });

    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 유저 엔터프라이즈 코드삭제
 */

export const deleteUserEnterpriseCode = async (
  userUid
) => {
  

  try {
    const result = await requestApi({
      requestPath: "/deleteUserEnterpriseCode",
      method: "post",
      requestBody: {
        userUid
      },
    });

    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 코드별 엔터프라이즈 유저들 모든 정보 가져오기
 */
type getEnterpriseUsersType = {
    userUid?:string,
    code: string,
    page:number
    pageSize:number
   
}

export const getEnterpriseUsersList = async ({ 
  userUid,
  code,
  page=0,
  pageSize
}: getEnterpriseUsersType) => {
  

  try {

    const requestBody = {
      code,
      userUid,
      page,
      pageSize: 15
    }


    if (!userUid) {
      delete requestBody['userUid'];
    }


    const result = await requestApi2({
      requestPath: "/private/Enterprise/getEnterpriseUsers",
      method: "post",
      requestBody,
    });

    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 유저 엔터프라이즈 코드부여
 */
type updateUserEnterpriseCodeType = {
    userUid:string,
    code: string,
   
}

export const updateUserEnterpriseCode = async ({ 
  userUid,
  code
}: updateUserEnterpriseCodeType) => {
  

  try {
    const result = await requestApi({
      requestPath: "/updateUserEnterpriseCode",
      method: "post",
      requestBody: {
        code,
        userUid,
     
      },
    });

    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 고객사 코드 생성
 */
type createEnterpriseCodeType = {
    code:string,
    enterpriseName: string,
    fixMatchingFee: string,
    isProgressPayment: boolean
}

export const createEnterpriseCode = async ({ code,
    enterpriseName,
    fixMatchingFee,
    isProgressPayment 
}: createEnterpriseCodeType) => {

  try {
    const result = await requestApi({
      requestPath: "/createEnterpriseCode",
      method: "post",
      requestBody: {
        code,
        enterpriseName,
        fixMatchingFee,
        isProgressPayment
      },
    });

    return result.data;
  } catch (error) {
    return null;
  }
};

/**
 * 고객사 코드 삭제
 */


export const deleteEnterpriseCode = async (uid) => {
    
  
    try {
      const result = await requestApi({
        requestPath: "/deleteEnterpriseCode",
        method: "post",
        requestBody: {
          uid
        },
      });
  
      return result.data;
    } catch (error) {
      return null;
    }
  };
  
/**
 * 엔터프라이즈 리스트 가져오기
 */


export const getEnterpriseCodeList = async () => {

  try {
    const result = await requestApi2({
      requestPath: "/private/Enterprise/getEnterprise",
      method: "post",
      requestBody: {
        page: 0,
        pageSize: 1000000
      }
   
    });

    return result.data;
  } catch (error) {
    console.log("getEnterpriseCodeList request error => ", error);
    return null;
  }
};
