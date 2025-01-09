import {requestApi} from './requestApi'

/**
 * 오늘 이력서
 */

export const getTodayResumes = async () => {

  try {
    const result = await requestApi({
      requestPath: '/getTodayResumes',
      method: 'post',
    })

    return result.data
  } catch (error) {
    return null
  }
}
/**
 * 어제 이력서
 */

export const getYesterdayResumes = async () => {

  try {
    const result = await requestApi({
      requestPath: '/getYesterdayResumes',
      method: 'post',
    })

    return result.data
  } catch (error) {
    return null
  }
}
