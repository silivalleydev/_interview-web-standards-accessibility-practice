import { requestApi, requestApi2 } from "./requestApi";

/**
 * uid 로 유저 검색
 */
type seekerUserByUidType = {
  uid: string;
};
export const seekerUserByUid = async ({ uid }: seekerUserByUidType) => {
  

  try {
    const result = await requestApi({
      requestPath: "/getUsersBo",
      method: "post",
      requestBody: {
        uid,
        $or: [
          { type: "user" },
          { leftAt: { $exists: true } } // 필드가 아예 존재하지 않는 경우
        ]
      },
    });

    return result.data;
  } catch (error) {
    console.log("seekerUserByUid request error => ", error);
    return null;
  }
};
/**
 * 이름으로 유저 검색
 */
type seekerUserByNameType = {
  username: string;
};
export const seekeruserByName = async ({ username }: seekerUserByNameType) => {
  

  try {
    const result = await requestApi({
      requestPath: "/getUsersBo",
      method: "post",
      requestBody: {
        username,
        type: "user",
      },
    });

    return result.data;
  } catch (error) {
    console.log("seekerUsername request error => ", error);
    return null;
  }
};
/**
 * 핸드폰번호로 유저 검색
 */
type seekerUserByPhonenumberType = {
  phoneNumber: string;
};
export const seekerUserByPhonenumber = async ({ phoneNumber }: seekerUserByPhonenumberType) => {
  

  try {
    const result = await requestApi({
      requestPath: "/getUsersBo",
      method: "post",
      requestBody: {
        phoneNumber,
        type: "user",
      },
    });

    return result.data;
  } catch (error) {
    console.log("seekerUserByphoneNumber request error => ", error);
    return null;
  }
};

/**
 * 알바 메모
 */
type updateSeekerMemoType = {
  uid: string;
  adminMemo: string;
};
export const updateSeekerMemo = async ({ uid, adminMemo }: updateSeekerMemoType) => {
  

  try {
    const result = await requestApi({
      requestPath: "/updateUserBo",
      method: "post",
      requestBody: {
        uid,
        adminMemo,
      },
    });


    return result.data;
  } catch (error) {
    return null;
  }
};
/**
 * 누적금액
 */
type loadTotalPaymentForSeekerType = {
  seekerUid: string;
};
export const loadTotalPaymentForSeeker = async ({ seekerUid }: loadTotalPaymentForSeekerType) => {
  

  try {
    const result = await requestApi({
      requestPath: "/loadTotalPaymentForSeeker",
      method: "post",
      requestBody: {
        seekerUid,
      },
    });

    return result.data;
  } catch (error) {
    console.log("loadTotalPaymentForSeeker error => ", error);
    return null;
  }
};

/**
 * 예금주 유저명 비교
 *
 */
type compareUserWithAccountHolderType = {
  userUid: string;
};
export const compareUserWithAccountHolder = async ({ userUid }: compareUserWithAccountHolderType) => {
  

  try {
    const result = await requestApi({
      requestPath: "/compareUserWithAccountHolder",
      method: "post",
      requestBody: {
        userUid,
      },
    });

    return result.data;
  } catch (error) {
    console.log("compareUserWithAccountHolder error => ", error);
    return null;
  }
};
/**
 * 제안하기
 *
 */
type sendSMSForJobSuggestionMessageType = {
  title: string;
  content: string;
  phoneNumber: string;
};
export const sendSMSForJobSuggestionMessage = async ({
  title,
  content,
  phoneNumber,
}: sendSMSForJobSuggestionMessageType) => {
  

  try {
    const result = await requestApi({
      requestPath: "/sendSMSForJobSuggestionMessage",
      method: "post",
      requestBody: {
        title,
        content,
        phoneNumber,
      },
    });

    return result.data;
  } catch (error) {
    console.log("sendSMSForJobSuggestionMessage error => ", error);
    return null;
  }
};

/**
 *  오늘 가입한 알바님 수
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
        type: "user",
      },
    });

    return result.data;
  } catch (error) {
    console.log("getUserCountByCreatedAt request error => ", error);
    return null;
  }
};
/**
 *  리뷰 동기화 기능
 */


export const syncReview = async (uid) => {
  

  try {
    const result = await requestApi2({
      requestPath: `/private/review/sync/${uid}`,
      method: "post",
 
    });

    return result.data;
  } catch (error) {
    console.log("리뷰 동기화 error => ", error);
    return null;
  }
};

/**
 * 리뷰 리스트(신)
 */


export const newReviewList = async (uid) => {
  

  try {
    const result = await requestApi2({
      requestPath: `/private/review/list?page=0&pageSize=1000&seekerUid=${uid}`,
      method: "get",

    });

    return result.data;
  } catch (error) {
    console.log("리뷰 리스트(신) error => ", error);
    return null;
  }
};
/**
 * 리뷰 삭제 단건
 */


export const deleteReview = async ({seekerUid, reviewUid}) => {
  

  try {
    const result = await requestApi2({
      requestPath: `/private/review/${seekerUid}/${reviewUid}`,
      method: "delete",

    });

    return result.data;
  } catch (error) {
    console.log("리뷰 삭제(신) error => ", error);
    return null;
  }
};

