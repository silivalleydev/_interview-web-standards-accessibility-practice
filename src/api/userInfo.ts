import { requestApi, requestApi2 } from "./requestApi";

/**
 * 입금예정내역 지우기
 */
type updateSeekerManualScoreType = {
  seekerUid: string;
  manualScore: number;
};

export const updateSeekerManualScore = async ({ seekerUid, manualScore }: updateSeekerManualScoreType) => {

  try {
    const result = await requestApi({
      requestPath: "/updateSeekerManualScore",
      method: "post",
      requestBody: {
        seekerUid,
        manualScore,
      }
    });

    return result.data;
  } catch (error) {
    console.log("updateSeekerManualScore request error => ", error);
    return null;
  }
};
