import React, { useState } from 'react'
import { Button, CircularProgress } from '@material-ui/core'
import { appendPenalty } from '../api/users'


const AppendPenaltyButton = ({ user, setChangeStatus, changeStatus }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleAppendPenaltyButton = async () => {
    if (confirm('해당 사용자에게 패널티를 부여하겠습니까?')) {
      setIsLoading(true)
      const result = await appendPenalty(user.uid)
      if (result?.status === 'OK') {
        setIsLoading(false)
        setChangeStatus(!changeStatus)
        alert('패널티 처리 되었습니다.')
      } else {
        setIsLoading(false)
        alert('실패했습니다.')
      }
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant='outlined'
      size={'small'}
      onClick={handleAppendPenaltyButton}
      color='secondary'
    >
      {`패널티 
      부여`}
      {isLoading && <CircularProgress size={12} style={{ marginLeft: 5 }} />}
    </Button>
  )
}

export default AppendPenaltyButton
