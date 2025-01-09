import { requestApi } from "./requestApi";

/**
 * 최근 지원자순 필터
 */
export const loadJobsForSearchingapi = async (data = {}) => {
  

  try {
    const result = await requestApi({
      requestPath: "/loadJobsForSearching",
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
 * 배정0회 사장님예약
 */
export const loadJobsForIsHiringApi = async (data = {}) => {
  

  try {
    const result = await requestApi({
      requestPath: "/loadJobsForIsHiring",
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
 * 뽀너쑨공고
 */
export const loadJobsForBonusoonApi = async (data = {}) => {
  

  try {
    const result = await requestApi({
      requestPath: "/loadJobsForBonusoon",
      method: "post",
      requestBody: {
        ...data,
      }
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 동일알바
 */
export const loadJobsForSameJobApi = async (data = {}) => {
  

  try {
    const result = await requestApi({
      requestPath: "/loadJobsForSameJob",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("loadJobsForSameJob request error => ", error);
    return null;
  }
};
/**
 * 시작일순
 */
export const loadReservationsOrderByStartDateApi = async (data = {}) => {
  

  try {
    const result = await requestApi({
      requestPath: "/loadReservationsOrderByStartDate",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("loadReservationsOrderByStartDate error => ", error);
    return null;
  }
};
/**
 * 배정에정시간 필터
 */
export const loadReservationsOrderByAssigningTimeApi = async (data = {}) => {
  

  try {
    const result = await requestApi({
      requestPath: "/loadReservationsOrderByAssigningTime",
      method: "post",
      requestBody: {
        ...data,
      },
    });
    return result.data;
  } catch (error) {
    console.log("loadReservationsOrderByAssigningTimeApi request error => ", error);
    return null;
  }
};
/**
 * 공고등록일
 */
export const loadJobsForCreatedAt = async ({ createdAtStartStr, createdAtEndStr }) => {
  

  try {
    const result = await requestApi({
      requestPath: "/loadJobsForCreatedAt",
      method: "post",
      requestBody: {
        createdAtStartStr,
        createdAtEndStr,
      },
    });
    return result.data;
  } catch (error) {
    console.log("loadJobsForCreatedAt request error => ", error);
    return null;
  }
};
/**
 * 출근일
 */
export const loadJobsForStartDate = async ({ startDateStr, endDateStr, page = 1 }) => {
  

  try {
    const result = await requestApi({
      requestPath: "/loadJobsForStartDate",
      method: "post",
      requestBody: {
        page,
        startDateStr,
        endDateStr,
      },
    });

    return result.data;
  } catch (error) {
    console.log("loadJobsForStartDate(출근일 필터) request error => ", error);
    return null;
  }
};
/**
 * uid 검색
 */

export const loadReservationsByEmployerId = async ({ employerUid, page = 1 }) => {
  

  try {
    const result = await requestApi({
      requestPath: "/getJobs",
      method: "post",
      requestBody: {
        employerUid,
        page,
      },
    });

    return result.data;
  } catch (error) {
    console.log("loadReservationsByEmployerId(uid 검색) request error => ", error);
    return null;
  }
};
/**
 * job id 검색
 */

export const loadReservationsByJobId = async ({ uid, page = 1 }) => {
  

  try {
    const result = await requestApi({
      requestPath: "/getJobsBo",
      method: "post",
      requestBody: {
        uid,
        page,
      },
    });

    return result.data;
  } catch (error) {
    console.log("loadReservationsByJobId(job id 검색) request error => ", error);
    return null;
  }
};
/**
 * 사장님 이름
 */

export const loadReservationsByEmployerName = async ({ username, page = 1 }) => {
  

  try {
    const result = await requestApi({
      requestPath: "/getJobs",
      method: "post",
      requestBody: {
        "store.username": username,
        page,
      },
    });

    return result.data;
  } catch (error) {
    console.log("loadReservationsByEmployerName(사장이름 검색) request error => ", error);
    return null;
  }
};
/**
 * 스토어 이름 검색
 */

export const loadReservationsByStoreName = async ({ storeName, page = 1 }) => {
  

  try {
    const result = await requestApi({
      requestPath: "/getJobs",
      method: "post",
      requestBody: {
        "store.name": storeName,
        page,
      },
    });

    return result.data;
  } catch (error) {
    console.log("loadReservationsByStoreName(스토어 이름 검색) request error => ", error);
    return null;
  }
};
/**
 * 핸드폰 번호 검색
 */

export const loadReservationsByEmployerPhone = async ({ phoneNumber, page = 1 }) => {
  

  try {
    const result = await requestApi({
      requestPath: "/getJobs",
      method: "post",
      requestBody: {
        "store.phoneNumber": phoneNumber,
        page,
      },
    });

    return result.data;
  } catch (error) {
    console.log("loadReservationsByEmployerPhone(사장 핸드폰 번호  검색) request error => ", error);
    return null;
  }
};
