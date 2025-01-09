import React, { useState } from 'react'
import { Button, CircularProgress } from '@material-ui/core'
import { removePenalty } from '../api/users'


const PenaltyButton = ({ user, setChangeStatus, changeStatus }) => {
  const [isLoading, setIsLoading] = useState(false)
  const getReviewRateByEmployer = async () => {
    if (confirm('해당 사용자의 패널티를 해제하겠습니까?')) {
      setIsLoading(true)

      const result = await removePenalty(user.uid)
      if (result.status === 'OK') {
        setIsLoading(false)
        setChangeStatus(!changeStatus)
        alert('패널티를 해제했습니다.')
      }
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant='outlined'
      size={'small'}
      onClick={getReviewRateByEmployer}
      color='primary'
    >
      패널티 풀기
      {isLoading && <CircularProgress size={12} style={{ marginLeft: 5 }} />}
    </Button>
  )
}

export default PenaltyButton
