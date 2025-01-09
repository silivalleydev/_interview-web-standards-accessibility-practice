import moment from "moment";
import { requestApi, requestApi2 } from "./requestApi";
import { getFormattedDate } from "../utils/utils";

/**
 * 입금예정내역 지우기
 */
type clearReservationFromPaymentType = {
  jobId: string;
};
export const clearReservationFromPayment = async ({ jobId }: clearReservationFromPaymentType) => {
  

  try {
    const result = await requestApi({
      requestPath: "/clearReservationFromPayment",
      method: "post",
      requestBody: {
        jobId,
      },
    });

    return result.data;
  } catch (error) {
    console.log("clearReservationFromPayment request error => ", error);
    return null;
  }
};
/**
 * 입금예정내역 지우기
 */
type getEmployersBizInfoType = {
  uids: string[];
};
export const getEmployersBizInfo = async ({ uids }: getEmployersBizInfoType) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/tax/getUserListTaxInfo",
      method: "post",
      requestBody: {
        employerUidList: uids,
        page: 0,
        pageSize: 1000
      },
    });

    return result.data;
  } catch (error) {
    console.log("getEmployersBizInfo request error => ", error);
    return null;
  }
};

/**
 * 결제 내역 조회 Spring
 */

export const loadPaymentHistoryByDate = async ({ payDayStartStr, payDayEndStr }: loadPaymentHistoryByDateType) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/job/loadPaymentHistoryByDate",
      method: "post",
      requestBody: {
        payDayStartStr,
        payDayEndStr,
        page: 0,
        pageSize: 100
      },
    });
    return result.data;
  } catch (error) {
    console.log("loadPaymentHistoryByDate2 request error => ", error);
    return null;
  }
};
/**
 * 입금얘정일 변경
 */

export const updatePayDay = async ({ jobId, changeDate }) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/job/updatePayDay",
      method: "post",
      requestBody: {
        jobId,
        changeDate
      },
    });
    return result.data;
  } catch (error) {
    console.log("loadPaymentHistoryByDate2 request error => ", error);
    return null;
  }
};


export const getScheduledDepositDetails = async ({ payDayStartStr, payDayEndStr, page, pageSize }) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/job/getScheduledDepositList",
      method: "post",
      requestBody: {
        payDayFromStr :  payDayStartStr|| moment().subtract(5, 'day').format('YYYY-MM-DD'),
        payDayToStr :  payDayEndStr && getFormattedDate(new Date(payDayEndStr), 'day', -1) || moment().add(25, 'day').format('YYYY-MM-DD'),
        page: (page - 1) >=0 ? page - 1 : 0,
        pageSize
      },
    });
    return result.data;
  } catch (error) {
    console.log("getScheduledDepositList request error => ", error);
    return null;
  }
};


type loadPaymentHistoryByDateDownloadType = {
  payDayFromStr: string;
  payDayToStr: string;
  downloadReason :string,
  password :string
};

export const getScheduledDepositDetailsDownload = async ({ payDayFromStr, payDayToStr, downloadReason, password }: loadPaymentHistoryByDateDownloadType) => {
  

  try {
    const result = await requestApi2({
      requestPath: "/private/job/getScheduledDepositList/download",
      method: "post",
      requestBody: {
        payDayFromStr,
        payDayToStr : getFormattedDate(new Date(payDayToStr), 'day', -1),
        downloadReason,
        password
      },
      config: {
        responseType: 'blob',        
    }
    });
    return result.data;
  } catch (error) {
    console.log("getScheduledDepositList request error => ", error);
    return null;
  }
};

