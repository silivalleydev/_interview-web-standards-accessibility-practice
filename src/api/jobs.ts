import { requestApi, requestApi2 } from "./requestApi";

/**
 * 공고 가져오기
 */
export const getJobs = async (data = {}) => {

  try {
    const result = await requestApi({
      requestPath: "/getJobsBo",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 공고 가져오기
 */
export const getJobById = async (jobId) => {

  try {
    const result = await requestApi({
      requestPath: "/getJobsBo",
      method: "post",
      requestBody: {
        uid: jobId,
      },
    });

    if (result.data && result.data.data && result.data.data.length > 0) {
      return result.data.data[0];
    } else {
      return false;
    }
   
  } catch (error) {
    return null;
  }
};
/**
 * 공고 가져오기
 */
export const getFinishedJobs = async ({
  startDateStr,
  endDateStr
}) => {

  try {
    const result = await requestApi({
      requestPath: "/getFinishedJobs",
      method: "post",
      requestBody: {
        startDateStr,
        endDateStr
      },
    });

    return result.data;

   
  } catch (error) {
    return null;
  }
};

/**
 * 공고 지원자 가져오기
 */
export const getApplyList = async (data = {}) => {

  try {
    const result = await requestApi({
      requestPath: "/getApplyListBo",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("getApplyList request error => ", error);
    return null;
  }
};

/**
 * 공고 복사
 */
export const copyJob = async ({
  jobId,
  seekerAssigningTime,
  startDateTime,
  endDate,
  salary,
  hoursPerDay,
  workPeriod,
  restTime,
  matchingFee,
}) => {

  try {
    const result = await requestApi({
      requestPath: "/copyJob",
      method: "post",
      requestBody: {
        jobId,
        seekerAssigningTime,
        startDateTime,
        endDate,
        salary,
        hoursPerDay,
        workPeriod,
        restTime,
        matchingFee,
      },
    });
    return result.data;
  } catch (error) {
    console.log("getApplyList request error => ", error);
    return null;
  }
};
/**
 * 공고 배정하기
 */
export const assignJobSeeker = async (data = {}) => {

  try {
    const result = await requestApi({
      requestPath: "/assignJobSeeker",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("assignJobSeeker request error => ", error);
    return null;
  }
};
/**
 * SPRING NRW 공고 배정하기
 */
export const assignJobSeekerSpring = async (data = {}) => {

  try {
    const result = await requestApi2({
      requestPath: "/private/job/apply/assign",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("assignJobSeeker request error => ", error);
    return null;
  }
};
/**
 * SPRING 재지원/복구
 */
export const restoreApply = async ({jobUid,seekerUid}) => {

  try {
    const result = await requestApi2({
      requestPath: "/private/job/apply/restoreApply",
      method: "post",
      requestBody: {
        jobUid,
        seekerUid
      },
    });
    return result.data;
  } catch (error) {
    console.log("restoreApply request error => ", error);
    return null;
  }
};

/**
 * 급여이체 처리
 */
export const salaryTransfer = async (data = {}) => {

  try {
    const result = await requestApi({
      requestPath: "/salaryTransfer",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("salaryTransfer request error => ", error);
    return null;
  }
};
/**
 * 재배정 처리
 */

export const reAssignJobSeeker = async (data = {}) => {
  try {
    const result = await requestApi({
      requestPath: "/reAssignJobSeeker",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("reAssignJobSeeker request error => ", error);
    return null;
  }
};
export const changeSeekerFromAbsentToReportOnlyStatusReq = async (data = {}) => {

  try {
    const result = await requestApi({
      requestPath: "/changeSeekerFromAbsentToReportOnlyStatus",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("reAssignJobSeeker request error => ", error);
    return null;
  }
};
export const changeSeekerStatusToReportReq = async (data = {}) => {
  try {


    const result = await requestApi({
      requestPath: "/changeSeekerStatusToReport",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("reAssignJobSeeker request error => ", error);
    return null;
  }
};

/**
 * 공고 배정하기
 */
export const manualProcessPayment = async ({ jobId, hiredSeekerId, amount }) => {
  try {
    const result = await requestApi({
      requestPath: "/manualProcessPayment",
      method: "post",
      requestBody: {
        jobId,
        hiredSeekerId,
        amount,
      },
    });
    return result.data;
  } catch (error) {
    console.log("manualProcessPayment request error => ", error);
    return null;
  }
};
/**
 * 모집 중지
 */

type stopReservationType = {
  jobId: string;
  employerUid: string;
  usedCash: boolean;
  reason: string;
  hiredSeekerId: string;
  accessToken: string;
};
export const stopReservation = async ({
  jobId,
  employerUid,
  usedCash,
  reason,
  hiredSeekerId,
}: stopReservationType) => {

  try {
    const result = await requestApi({
      requestPath: "/stopReservation",
      method: "post",
      requestBody: {
        jobId,
        employerUid,
        usedCash,
        reason,
        hiredSeekerId,
      },
    });

    return result.data;
  } catch (error) {
    console.log("stopReservation request error => ", error);
    return null;
  }
};
type processPaymentRefundType = {
  jobId: string;
  refundAmount: number;
  refundReason: string;
  cashRefund: number
};
export const processPaymentRefund = async ({
  jobId,
  refundAmount,
  refundReason,
  cashRefund,
}: processPaymentRefundType) => {

  try {
    const result = await requestApi({
      requestPath: "/processPaymentRefund",
      method: "post",
      requestBody: {
        jobId,
        refundAmount,
        refundReason,
        cashRefund
      },
    });

    return result.data;
  } catch (error) {
    console.log("stopReservation request error => ", error);
    return null;
  }
};
type reportForJobType = {
  fromType: string;
  reportType: string;
  jobId: string;
  seekerUid: string;
  detailReason: string;
};
export const reportForJob = async ({
  fromType,
  reportType,
  jobId,
  seekerUid,
  detailReason,
}: reportForJobType) => {

  try {
    const result = await requestApi({
      requestPath: "/reportForJob",
      method: "post",
      requestBody: {
        fromType,
        reportType,
        jobId,
        seekerUid,
        detailReason,
      },
    });

    return result.data;
  } catch (error) {
    console.log("stopReservation request error => ", error);
    return null;
  }
};
/**
 * 공고 배정하기
 */

type cancelHiredSeekerType = {
  jobId: string;
  seekerId: string;
  reportAbsence: boolean;
};
export const cancelHiredSeeker = async ({ jobId, seekerId, reportAbsence = false }: cancelHiredSeekerType) => {

  try {
    const result = await requestApi({
      requestPath: "/cancelHiredSeeker",
      method: "post",
      requestBody: {
        jobId,
        seekerId,
        reportAbsence,
      },
    });
    return result.data;
  } catch (error) {
    console.log("cancelHiredSeeker request error => ", error);
    return null;
  }
};
/**
 * 공고 배정하기
 */

type createBonusSoonType = {
  jobId: string;
  reason: string;
};
export const createBonusSoon = async ({ jobId, reason, newJobData = {} }: createBonusSoonType) => {

  try {
    const result = await requestApi({
      requestPath: "/createBonusSoon",
      method: "post",
      requestBody: {
        jobId,
        reason,
        newJobData,
      },
    });
    return result.data;
  } catch (error) {
    console.log("createBonusSoon request error => ", error);
    return null;
  }
};

type updateOperationMemoJobType = {
  uid: string;
  operationMemo: string;
};
/**
 * 운영팀 메모 한마디
 */
export const updateOperationMemoJob = async ({ uid, operationMemo }: updateOperationMemoJobType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateJob",
      method: "post",
      requestBody: {
        uid,
        operationMemo,
      },
    });
    return result.data;
  } catch (error) {
    console.log("operationMemo request error => ", error);
    return null;
  }
};

/**
 * 배정매니저 한마디
 */

type updateAdminNoteJobType = {
  uid: string;
  adminNote: string;
};
export const updateAdminNoteJob = async ({ uid, adminNote }: updateAdminNoteJobType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateJob",
      method: "post",
      requestBody: {
        uid,
        adminNote,
      },
    });
    return result.data;
  } catch (error) {
    console.log("adminNote request error => ", error);
    return null;
  }
};
/**
 * 상황종료
 */

type updateMarkAsHiddenRegistrationType = {
  uid: string;
  markAsHiddenRegistration: boolean;
};
export const updateMarkAsHiddenRegistration = async ({
  uid,
  markAsHiddenRegistration,
}: updateMarkAsHiddenRegistrationType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateJob",
      method: "post",
      requestBody: {
        uid,
        markAsHiddenRegistration,
      },
    });
    return result.data;
  } catch (error) {
    console.log("updateMarkAsHiddenRegistration request error => ", error);
    return null;
  }
};
/**
 * 배예시 수정
 */

type updateSeekerAssigningTimeType = {
  jobId: string;
  newTime: Date;
  oldTime: string;
  seekerAssigningTimeInSeconds: string;
};
export const updateSeekerAssigningTime = async ({
  jobId,
  newTime,
  oldTime,
  seekerAssigningTimeInSeconds,
}: updateSeekerAssigningTimeType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateSeekerAssigningTime",
      method: "post",
      requestBody: {
        jobId,
        newTime,
        oldTime,
        seekerAssigningTimeInSeconds,
      },
    });
    return result.data;
  } catch (error) {
    console.log("updateSeekerAssigningTime request error => ", error);
    return null;
  }
};
/**
 * 알바에게 문자 발송
 */

type sendAdminMessageToSeekeraType = {
  jobId: string;
  seekerId: string;
  content: string;
  title: string;
};
export const sendAdminMessageToSeeker = async ({ jobId, seekerId, content, title }: sendAdminMessageToSeekeraType) => {

  try {
    const result = await requestApi({
      requestPath: "/sendAdminMessageToSeeker",
      method: "post",
      requestBody: {
        jobId,
        seekerId,
        content,
        title,
      },
    });
    return result.data;
  } catch (error) {
    console.log("sendAdminMessageToSeeker request error => ", error);
    return null;
  }
};
/**
 * 지원한 알바에 대한 메모
 */

type updateJobApplyType = {
  uid: string;
  adminMemo: string;
};
export const updateJobApply = async ({ uid, adminMemo, jobId ,seekerId ,reviews }: updateJobApplyType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateJobApplyBo",
      method: "post",
      requestBody: {
        uid,
        adminMemo,
        jobId,
        seekerId,
        reviews
      },
    });
    return result.data;
  } catch (error) {
    console.log("updateJobApply request error => ", error);
    return null;
  }
};
/**
 * 공고 리뷰 점수 가져오기
 */

type getReviewBoType = {
  jobId: string;
};
export const getReviewBo = async ({ jobId }: getReviewBoType) => {

  try {
    const result = await requestApi({
      requestPath: "/getReviewBo",
      method: "post",
      requestBody: {
        jobId,
      },
    });
    return result.data;
  } catch (error) {
    console.log("updateJobApply request error => ", error);
    return null;
  }
};
/**
 * 뽀너순 변경
 */

type changeSalaryBonusSoonType = {
  jobId: string;
  seekerId: string;
  bonusSoon: number;
};
export const changeSalaryBonusSoon = async ({ jobId, seekerId, bonusSoon }: changeSalaryBonusSoonType) => {

  try {
    const result = await requestApi({
      requestPath: "/changeSalaryBonusSoon",
      method: "post",
      requestBody: {
        jobId,
        seekerId,
        bonusSoon,
      },
    });
    return result.data;
  } catch (error) {
    console.log("updateJobApply request error => ", error);
    return null;
  }
};
