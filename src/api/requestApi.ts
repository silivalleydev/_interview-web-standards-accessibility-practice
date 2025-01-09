import axios, {AxiosResponse} from 'axios'
import { refreshTokenUser } from './users'
import { deleteCookie, getTokenFromCookie } from '../utils/soonUtill'

// const HOST = 'https://deva-lambda-api.sooooon.com/admin'
export const HOST = 'https://api.sooooon.com/api/aws-admin'
export const DEV_HOST = 'https://dev-api.sooooon.com/api/aws-admin'
export const HOST_VPN = 'https://r8j4azwvnd-vpce-03e7fac345fac9bae.execute-api.ap-northeast-2.amazonaws.com/vpn/api/aws-admin'
// const SOON_APP_HOST =
//   'https://deva-app-api.sooooon.com'
export const SOON_APP_HOST = 'https://api.sooooon.com/api/admin'
export const SOON_APP_DEV_HOST = 'https://dev-api.sooooon.com/api/admin'
export const SOON_APP_HOST_VPN =
  'https://r8j4azwvnd-vpce-03e7fac345fac9bae.execute-api.ap-northeast-2.amazonaws.com/vpn/api/admin'

export const usePRD = false

type RequestApiParameterType = {
  requestPath: string
  method: 'post' | 'get' | 'put' | 'delete'
  headers?: object
  requestBody?: object
  config?: object
}

/**
 * api 요청 함수
 */
export const requestApi = async ({
  requestPath,
  method,
  headers,
  requestBody = {},
}: RequestApiParameterType): Promise<AxiosResponse<any>> => {
  const data = JSON.stringify(requestBody)
  const isDev = (window.location.host.includes('dev-admin') || window.location.host.includes('localhost') && usePRD === false)
  const isVpn = window.location.host.includes('admin-vpn')
  const accessToken = getTokenFromCookie('@accessToken');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
    Authorization: `Bearer ${accessToken}`
  }
  if (!accessToken) {
    delete defaultHeaders['Authorization'];
  }

  const config = {
    method,
    url: (isVpn ? HOST_VPN : (isDev ? DEV_HOST : HOST)) + requestPath,
    headers: defaultHeaders,
    data,
  }
  axios.defaults.withCredentials = true

  return await axios(config)
    .then(function (response) {

      const status =response?.data?.status
      switch (status) {
        case "FORBIDDEN":
          alert(response?.data?.message);
          window.location.href = '/reservation'; 
          return;
        case "REQUEST_TIMEOUT":
          alert('세션이 만료되었습니다.');
          deleteCookie('@accessToken')
          deleteCookie('@refreshToken')
          localStorage.setItem("@id", "");
          window.location.href = '/'; 
          return;
        case "CONFLICT":
          alert('중복으로 로그인되어 로그아웃 처리되었습니다.');
          deleteCookie('@accessToken')
          deleteCookie('@refreshToken')
          localStorage.setItem("@id", "");
          window.location.href = '/'; 
          return;
        default:
          break;
      }
      
      return response
    })
    .catch(async function (error) {
      if (error?.response?.status === 401) {
        const refreshTockenResult =  await refreshTokenUser()


        if(refreshTockenResult?.status === "OK"){  
          const accessToken = getTokenFromCookie('@accessToken');
      

          return await requestApi({
            requestPath,
            method,
            headers 
            : {...defaultHeaders,Authorization: `Bearer ${accessToken}`,},
            config,
            requestBody
          })
  
        }else{
          deleteCookie('@accessToken')
          deleteCookie('@refreshToken')
          localStorage.setItem("@id", "");
          localStorage.setItem("@refreshFailed", "true");
          window.location.href = '/'; 
        }
      return error.response

    }
  })
}
/**
 * api 요청 함수 스프링
 */
export const requestApi2 = async ({
  requestPath,
  method,
  headers,
  config = {},
  requestBody = {},
}: RequestApiParameterType): Promise<AxiosResponse<any>> => {
  const data = typeof requestBody === 'object' ? JSON.stringify(requestBody) : requestBody;
  const isDev = (window.location.host.includes('dev-admin') || window.location.host.includes('localhost') && usePRD === false)
  const isVpn = window.location.host.includes('admin-vpn')

  const accessToken = getTokenFromCookie('@accessToken');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    "accept": "*/*",
    ...headers,
    Authorization: `Bearer ${accessToken}`
  }
  if (!accessToken) {
    delete defaultHeaders['Authorization'];
  }
  const defaultConfig = {
    method,
    url: (isVpn ? SOON_APP_HOST_VPN : (isDev ? SOON_APP_DEV_HOST : SOON_APP_HOST)) + requestPath,
    headers: defaultHeaders,
    data,
    ...config
  }


  if (Object.keys(data).length === 0) {
    delete defaultConfig['data']
  }

  return await axios(defaultConfig)
    .then(function (response) {
      const status =response?.data?.status
      switch (status) {
        case "FORBIDDEN":
          alert(response?.data?.message);
          window.location.href = '/reservation'; 
          return;
        case "REQUEST_TIMEOUT":
          alert('세션이 만료되었습니다.');
          deleteCookie('@accessToken')
          deleteCookie('@refreshToken')
          localStorage.setItem("@id", "");
          window.location.href = '/'; 
          return;
        case "CONFLICT":
          alert('중복으로 로그인되어 로그아웃 처리되었습니다.');
          deleteCookie('@accessToken')
          deleteCookie('@refreshToken')
          localStorage.setItem("@id", "");
          window.location.href = '/'; 
          return;
        default:
          break;
      }
      return response

    })
    .catch(async function (error) {
if (error?.response?.status === 401) {
        const refreshTockenResult =  await refreshTokenUser()
        if(refreshTockenResult?.status === "OK"){
          const accessToken = getTokenFromCookie('@accessToken');


          return await requestApi({
            requestPath,
            method,
            headers 
            : {...defaultHeaders,Authorization: `Bearer ${accessToken}`,}
            ,
            config,
            requestBody
          })
  
        }else{
          deleteCookie('@accessToken')
          deleteCookie('@refreshToken')
          localStorage.setItem("@id", "");
          localStorage.setItem("@refreshFailed", "true");
          window.location.href = '/'; 
        }

      console.log((isVpn ? SOON_APP_HOST_VPN : (isDev ? SOON_APP_DEV_HOST : SOON_APP_HOST)) + requestPath, 'req api => ', error)
      return error.response
    }
 
    return error.response
  })
}
