import { requestApi, requestApi2 } from "./requestApi";

/**
 * 할인캐시 충전하기
 */
type updateAddCashForEmployerType = {
  userUid: string;
  balance: number;
  detail: string;
};
export const updateAddCashForEmployer = async ({ userUid, balance, detail }: updateAddCashForEmployerType) => {

  try {
    const result = await requestApi({
      requestPath: "/addCashForEmployerBo",
      method: "post",
      requestBody: {
        userUid,
        balance,
        detail,
      },
    });

    return result.data;
  } catch (error) {
    console.log("addCashForEmployer request error => ", error);
    return null;
  }
};

/**
 * 할인캐시 충전이력
 */

type getEmployerCashTransactionHistoryType = {
  uid: string;
};
export const getEmployerCashTransactionHistory = async ({ uid }: getEmployerCashTransactionHistoryType) => {

  try {
    const result = await requestApi({
      requestPath: "/getEmployerCashTransactionHistory",
      method: "post",
      requestBody: {
        uid,
      },
    });

    return result.data;
  } catch (error) {
    console.log("getEmployerCashTransactionHistory request error => ", error);
    return null;
  }
};
/**
 * 할인캐시 불러오기
 */

type getUserCashBalanceType = {
  uid: string;
};
export const getUserCashBalance = async ({ uid }: getUserCashBalanceType) => {

  try {
    const result = await requestApi({
      requestPath: "/getUserCashBalance",
      method: "post",
      requestBody: {
        uid,
      },
    });

    return result.data;
  } catch (error) {
    console.log("getUserCashBalance request error => ", error);
    return null;
  }
};
/**
 * 할인캐시 환불처리
 */

type refundCashType = {
  jobId: string;
  cashRefund: number;
  employerUid: string;
};
export const refundCash = async ({ jobId, cashRefund, employerUid }: refundCashType) => {

  try {
    const result = await requestApi({
      requestPath: "/refundCash",
      method: "post",
      requestBody: {
        jobId,
        cashRefund,
        employerUid,
      },
    });

    return result.data;
  } catch (error) {
    console.log("refundCash request error => ", error);
    return null;
  }
};

/**
 * 사장님 환불처리
 */

type refundForEmployereType = {
  jobId: string;
  refundAmount: number;
};
export const refundForEmployer = async ({ jobId, refundAmount }: refundForEmployereType) => {

  try {
    const result = await requestApi({
      requestPath: "/refundForEmployer",
      method: "post",
      requestBody: {
        jobId,
        refundAmount,
      }
    });

    return result.data;
  } catch (error) {
    console.log("refundForEmployer request error => ", error);
    return null;
  }
};
/**
 * 급여 이체 처리
 */

type paymentForSeekerType = {
  jobId: string;
  moneyToProcess: number;
  bonusSoon: string;
};
export const paymentForSeeker = async ({ jobId, moneyToProcess, bonusSoon }: paymentForSeekerType) => {

  try {
    const result = await requestApi({
      requestPath: "/paymentForSeeker",
      method: "post",
      requestBody: {
        jobId,
        moneyToProcess,
        bonusSoon
      }
    });

    return result.data;
  } catch (error) {
    console.log("refundForEmployer request error => ", error);
    return null;
  }
};

/**
 * 싸장님 마지막 예약
 */
type getEmployerLastHiringType = {
  employerUid: string;
};
export const getEmployerLastHiring = async ({ employerUid }: getEmployerLastHiringType) => {

  try {
    const result = await requestApi({
      requestPath: "/getJobsBo",
      method: "post",
      requestBody: {
        employerUid,
      }
    });

    return result.data;
  } catch (error) {
    console.log("updateEmployerMemo request error => ", error);
    return null;
  }
};
/**
 * 싸장님 메모
 */
type updateEmployerMemoType = {
  uid: string;
  adminMemo: string;
};
export const updateEmployerMemo = async ({ uid, adminMemo }: updateEmployerMemoType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateUserBo",
      method: "post",
      requestBody: {
        uid,
        adminMemo,
      }
    });

    return result.data;
  } catch (error) {
    console.log("updateEmployerMemo request error => ", error);
    return null;
  }
};
/**
 * 싸장님 성실성 평점, 전문성 평점
 */
type getReviewRateByEmployerType = {
  employerUid: string;
};
export const getReviewRateByEmployer = async ({ employerUid }: getReviewRateByEmployerType) => {

  try {
    const result = await requestApi({
      requestPath: "/getReviewRateByEmployer",
      method: "post",
      requestBody: {
        employerUid,
      }
    });

    return result.data;
  } catch (error) {
    console.log("getReviewRateByEmployer request error => ", error);
    return null;
  }
};
/**
 * 사업자번호. 세금계산서
 */
type getUserTaxInfoBoType = {
  userUid: string;
};
export const getUserTaxInfoBo = async ({ userUid }: getUserTaxInfoBoType) => {

  try {
    const result = await requestApi2({
      requestPath: `/private/tax/getUserTaxInfoBoDecrypt`,
      method: "post",
      requestBody: {
        employerUid: userUid
      }
    });

    return result.data;
  } catch (error) {
    console.log("getUserTaxInfoBo request error => ", error);
    return null;
  }
};
/**
 *  스토어 정보(점포명, 업종, 주소)
 */
type getStoresBoType = {
  userUid: string;
};
export const getStoresBo = async ({ userUid }: getStoresBoType) => {

  try {
    const result = await requestApi({
      requestPath: "/getStoresBo",
      method: "post",
      requestBody: {
        userUid,
      }
    });

    return result.data;
  } catch (error) {
    console.log("getStoresBo request error => ", error);
    return null;
  }
};
/**
 *  오늘 가입한 사장님 수
 */

type getUserCountByCreatedAtType = {
  startDateStr: string,
  endDateStr: string,
};

export const getUserCountByCreatedAt = async ({startDateStr,endDateStr}) => {

  try {
    const result = await requestApi({
      requestPath: "/getUserCountByCreatedAt",
      method: "post",
      requestBody: {
        startDateStr,
        endDateStr,
        type: "store",
      }
    });

    return result.data;
  } catch (error) {
    console.log("getUserCountByCreatedAt request error => ", error);
    return null;
  }
};
/**
 *   Export data
 */

export const loadEmployersByRegistrationDate = async ({ startDateStr, endDateStr }) => {

  try {
    const result = await requestApi({
      requestPath: "/loadEmployersByRegistrationDate",
      method: "post",
      requestBody: {
        startDateStr,
        endDateStr,
      },
    });

    return result.data;
  } catch (error) {
    return null;
  }
};

/**
 * uid 로 유저 검색
 */
type storeUserByUidType = {
  uid: string;
};
export const storeUserByUid = async ({ uid }: storeUserByUidType) => {

  try {
    const result = await requestApi({
      requestPath: "/getUsersBo",
      method: "post",
      requestBody: {
        uid,
        $or: [
          {  type: "store" },
          {  leftAt: { $exists: true } }
        ]
      }
    });

    return result.data;
  } catch (error) {
    console.log("storeUserByUid request error => ", error);
    return null;
  }
};
/**
 * 이름으로 유저 검색
 */
type storeUserByNameType = {
  username: string;
};
export const storeuserByName = async ({ username }: storeUserByNameType) => {

  try {
    const result = await requestApi({
      requestPath: "/getUsersBo",
      method: "post",
      requestBody: {
        username,
        type: "store",
      }
    });

    return result.data;
  } catch (error) {
    console.log("storeUsername request error => ", error);
    return null;
  }
};
/**
 * 핸드폰번호로 유저 검색
 */
type storeUserByPhonenumberType = {
  phoneNumber: string;
};
export const storeUserByPhonenumber = async ({ phoneNumber }: storeUserByPhonenumberType) => {

  try {
    const result = await requestApi({
      requestPath: "/getUsersBo",
      method: "post",
      requestBody: {
        phoneNumber,
        type: "store",
      }
    });

    return result.data;
  } catch (error) {
    console.log("storeUserByphoneNumber request error => ", error);
    return null;
  }
};
