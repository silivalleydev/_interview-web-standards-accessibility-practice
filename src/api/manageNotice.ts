import { requestApi } from "./requestApi";

/**
 * getAllNoticeCollection
 */

export const getAllNoticeCollection = async () => {


  try {
    const result = await requestApi({
      requestPath: "/getNotice",
      method: "post",
    });

    return result.data;
  } catch (error) {
    console.log("jobId request error => ", error);
    return null;
  }
};
/**
 * 공지쓰기
 */

type createNoticeType = {
  actionUrl: string;
  active: boolean;
  buttonTxt: string;
  content: string;
  expiredAt: string;
  icon: string;
  read: boolean;
  subType: string;
  target: string;
  title: string;
  type: string;
};

export const createNotice = async ({
  actionUrl,
  active = false,
  buttonTxt = "",
  content,
  expiredAt,
  icon = "string",
  read = false,
  subType = "string",
  target = "string",
  title,
  type = "string",
}: createNoticeType) => {


  try {
    const result = await requestApi({
      requestPath: "/createNotice",
      method: "post",
      requestBody: {
        actionUrl,
        active,
        buttonTxt,
        content,
        expiredAt,
        icon,
        read,
        subType,
        target,
        title,
        type,
      },

    });


    return result.data;
  } catch (error) {
    console.log("createNotice request error => ", error);
    return null;
  }
};
/**
 * updateNotice
 */

type updateNoticeType = {
  uid: string;
  active: boolean;
};

export const updateNotice = async ({ uid, active }: updateNoticeType) => {


  try {
    const result = await requestApi({
      requestPath: "/updateNotice",
      method: "post",
      requestBody: {
        uid,
        active,
      },

    });

    return result.data;
  } catch (error) {
    console.log("updateNotice request error => ", error);
    return null;
  }
};
