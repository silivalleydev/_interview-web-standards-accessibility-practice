import { requestApi } from "./requestApi";

/**
 * 리뷰 가져오기
 */
type getReviewsCollectionType = {
  startAt: string;
};
export const getReviewsCollection = async ({ startAt }: getReviewsCollectionType) => {

  try {
    const result = await requestApi({
      requestPath: "/getReviewsCollection",
      method: "post",
      requestBody: {
        startAt,
      }
    });

    return result.data;
  } catch (error) {
    console.log("getReviewsCollection request error => ", error);
    return null;
  }
};
/**
 * 유저 리뷰와 경력정보 전체 가져오기(getUserReviewNResumes)
 */

export const getUserReviewNResumes = async (userUid:string ) => {

  try {
    const result = await requestApi({
      requestPath: "/getUserReviewNResumes",
      method: "post",
      requestBody: {
        userUid,
      }
    });

    return result.data;
  } catch (error) {
    console.log("getUserReviewNResumes request error => ", error);
    return null;
  }
};
