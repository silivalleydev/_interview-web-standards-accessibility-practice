import { requestApi, requestApi2 } from "./requestApi";

/**
 * 공고 가져오기
 */
export const getLongtermJobs = async (data = {}) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/job/longterm/findAllByFilter",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    return error.response;
  }
};
export const getLongtermApplyList = async (data = {}) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/job/longterm/apply/findByLongTermJobUid",
      method: "post",
      
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    return error.response;
  }
};
export const getReportList = async ({
  longTermJobUid
}) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/job/longterm/getReportList",
      method: "post",
      
      requestBody: {
        longTermJobUid,
        page: 0,
        pageSize: 999
      },
    });
    return result.data;
  } catch (error) {
    return error.response;
  }
};
export const stopLongtermJob = async ({
  longTermJobUid,
  stopReason
}) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/job/longterm/stopLongTermJob",
      method: "post",
      
      requestBody: {
        longTermJobUid,
        stopReason
      },
    });
    return result.data;
  } catch (error) {
    return error.response;
  }
};
export const updateLongtermJobOperationMemo = async ({
  longTermJobUid,
  operationMemo
}) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/job/longterm/operationMemo",
      method: "post",
      
      requestBody: {
        longTermJobUid,
        operationMemo
      },
    });
    return result.data;
  } catch (error) {
    return error.response;
  }
};
