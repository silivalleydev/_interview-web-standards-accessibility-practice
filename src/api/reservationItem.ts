import { requestApi } from "./requestApi";

/**
 * getReportByJobId
 */

export const getReportByJobId = async ({ jobId }) => {

  try {
    const result = await requestApi({
      requestPath: "/getReport",
      method: "post",
      requestBody: {
        jobId,
      }
    });

    return result.data;
  } catch (error) {
    console.log("getReportByJobId request error => ", error);
    return null;
  }
};
/**
 * 동일알바
 */

export const getSameJobsById = async ({ sameJobId }) => {

  try {
    const result = await requestApi({
      requestPath: "/getSameJobsById",
      method: "post",
      requestBody: {
        sameJobId,
      }
    });

    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 100% 환불
 */

export const processRemainingRefund = async ( jobId:string ) => {

  try {
    const result = await requestApi({
      requestPath: "/processRemainingRefund",
      method: "post",
      requestBody: {
        jobId,
      }
    });

    return result.data;
  } catch (error) {
    return null;
  }
};
