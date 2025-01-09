import {requestApi} from './requestApi'

/**
 *
 */

export const getRegisteredJobToday = async ({jobId}) => {
  

  try {
    const result = await requestApi({
      requestPath: '/getRegisteredJobToday',
      method: 'post',
      requestBody: {
        jobId,
      },
      
    })

    return result.data
  } catch (error) {
    console.log('jobId request error => ', error)
    return null
  }
}
/**
 *
 */

export const getActiveJob = async ({jobId}) => {
  

  try {
    const result = await requestApi({
      requestPath: '/getActiveJob',
      method: 'post',
      requestBody: {
        jobId,
      },
      
    })

    return result.data
  } catch (error) {
    console.log('getActiveJob request error => ', error)
    return null
  }
}
/**
 *
 */

export const getApplyListBo = async ({jobId}) => {
  

  try {
    const result = await requestApi({
      requestPath: '/getApplyListBo',
      method: 'post',
      requestBody: {
        jobId,
      },
      
    })

    return result.data
  } catch (error) {
    console.log('getApplyListBo request error => ', error)
    return null
  }
}
/**
 *
 */

export const getRegistereJobsdAtDate = async ({createdAtStr}) => {
  

  try {
    const result = await requestApi({
      requestPath: '/getRegistereJobsdAtDate',
      method: 'post',
      requestBody: {
        createdAtStr,
      },
      
    })

    return result.data
  } catch (error) {
    console.log('getRegistereJobsdAtDate request error => ', error)
    return null
  }
}
