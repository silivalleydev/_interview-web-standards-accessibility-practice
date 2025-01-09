import { requestApi, requestApi2 } from "./requestApi";

/**
 * 지원한 알바
 */
type recoverSeekerHiringStatusType = {
  jobId: string;
  seekerId: string;
};
export const recoverSeekerHiringStatus = async ({ jobId, seekerId }: recoverSeekerHiringStatusType) => {

  try {
    const result = await requestApi({
      requestPath: "/recoverSeekerHiringStatus",
      method: "post",
      requestBody: {
        jobId,
        seekerId,
      }
    });


    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 유저 단 건 조회
 */
type getUserNonMaskingBoType = {
  uid: string;
};
export const getUserNonMaskingBo = async ({ uid }: getUserNonMaskingBoType) => {

  try {
    const result = await requestApi({
      requestPath: "/getUserNonMaskingBo",
      method: "post",
      requestBody: {
        uid,
      },
    });


    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 불합격 처리
 */
type sendFailResultToSeekerType = {
  jobId: string;
  seekerId: string;
};
export const sendFailResultToSeeker = async ({ jobId, seekerId }: sendFailResultToSeekerType) => {

  try {
    const result = await requestApi({
      requestPath: "/sendFailResultToSeeker",
      method: "post",
      requestBody: {
        jobId,
        seekerId,
      }
    });


    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * getApplyJobListBo
 */
type getApplyJobListBoType = {
  seekerUid: string;
};
export const getApplyJobListBo = async ({ seekerUid, hiringStatus = '' }: getApplyJobListBoType) => {

  try {
    const result = await requestApi({
      requestPath: "/getApplyJobListBo",
      method: "post",
      requestBody: {
        seekerUid,
        hiringStatus
      }
    });

    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 알바 근무중 리스트 가져오기
 */
type getApplidSeekerListBoType = {
  seekerUid: string;
};
export const getApplidSeekerListBo = async ({ seekerUid }: getApplyJobListBoType) => {

  try {
    const result = await requestApi({
      requestPath: "/getApplidSeekerListBo",
      method: "post",
      requestBody: {
        seekerUid,
      }
    });

    return result.data;
  } catch (error) {
    return null;
  }
};




/**
 * 지원한 알바 단 건 조회
 */

export const getSeeker = async (seekerUid: string) => {
  try {
    const result = await requestApi2({
      requestPath: `private/user/users/${seekerUid}`,
      method: "get"
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
