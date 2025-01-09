import { requestApi, requestApi2 } from "./requestApi";

/**
 * 공고 가져오기
 */
export const getStore = async (data = {}) => {

  try {
    const result = await requestApi2({
      requestPath: `/private/store/${data.uid}`,
      method: "get"
    });
    return result.data;
  } catch (error) {
    return null;
  }
};

