import { requestApi, requestApi2 } from "./requestApi";

/**
 * 관리자 계정 다 건 조회
 */

export const getAdminUsers = async () => {
  try {
    const result = await requestApi2({
      requestPath: "/private/admin",
      method: "get",
    });
    return result.data;
  } catch (error) {
    return null;
  }
};

/**
 * 관리자 계정 수정
 */

type getAdminUpdateType = {
  adminId: string;
  password: string;
  permissionName: string;
  uid: string;
};
export const updateAdmin = async ({ adminId, permissionName, uid }: getAdminUpdateType) => {
  
  try {
    const result = await requestApi2({
      requestPath: "/private/admin/update",
      method: "post",
      requestBody: {
        adminId,
        permissionName,
        uid,
      },
    });
    return result.data;
  } catch (error) {
    console.log("getUsers request error => ", error);
    return null;
  }
};
export const deleteAdmin = async ({ uid }: getAdminUpdateType) => {
  
  try {
    const result = await requestApi2({
      requestPath: `/private/admin/delete/${uid}`,
      method: "delete",
    });
    return result.data;
  } catch (error) {
    return null;
  }
};
