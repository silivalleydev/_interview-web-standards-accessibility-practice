import React, { useState } from 'react'
import { Button, CircularProgress } from '@material-ui/core'
import { removeRejoinLimit } from '../api/users'


const LeftAtButton = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false)
  const getReviewRateByEmployer = async () => {
    if (confirm('해당 사용자의 탈퇴 제한을 푸시겠습니까?')) {
      setIsLoading(true)

      const result = await removeRejoinLimit(user.uid)
      if (result.status === 'OK') {
        setIsLoading(false)
        alert('탈퇴 제한 풀기를 완료했습니다.')
      }
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="contained"
      size={'small'}
      onClick={getReviewRateByEmployer}
    >
      제한풀기
      {isLoading && <CircularProgress size={12} style={{ marginLeft: 5 }} />}
    </Button>
  )
}

export default LeftAtButton
