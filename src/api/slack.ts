import { requestApi, requestApi2 } from "./requestApi";




/**
 * 슬랙 보내기
 */


export const shareToSlack = async ({
  slackChannelCode = "SOON-DEV-TEST",
  targetCode = "NONE",
  jobId = "",
  employerUid = "",
  seekerUid = "",
  tossOid = "",
  tossTid = "",
  contractId = "",
}) => {
  const requestBody = {
    slackChannelCode,
    targetCode,
    jobId,
    employerUid,
    seekerUid,
    tossOid,
    tossTid,
    contractId
  }

  if (!jobId) {
    delete requestBody['jobId'];
  }
  if (!employerUid) {
    delete requestBody['employerUid'];
  }
  if (!seekerUid) {
    delete requestBody['seekerUid'];
  }
  if (!tossOid) {
    delete requestBody['tossOid'];
  }
  if (!tossTid) {
    delete requestBody['tossTid'];
  }
  if (!contractId) {
    delete requestBody['contractId'];
  }

  try {
    const result = await requestApi2({
      requestPath: `/private/tool/slack`,
      method: "post",
      requestBody,
    });

    return result.data;
  } catch (error) {
    console.log("리뷰 리스트(신) error => ", error);
    return null;
  }
};

