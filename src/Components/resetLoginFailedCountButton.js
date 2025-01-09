import React, { useState } from 'react'
import { Button, CircularProgress } from '@material-ui/core'
import { resetLoginFailedCount } from '../api/users'
import LockResetIcon from '@mui/icons-material/LockReset';

const ResetLoginFailedCountButton = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleButton = async () => {
    if (confirm(' 로그인 실패 횟수 초기화 하시겠습니까?')) {
      setIsLoading(true)
      const result = await resetLoginFailedCount(user.uid)
      if (result?.status === 'OK') {
        setIsLoading(false)
        alert('초기화 처리 되었습니다.')
      } else {
        setIsLoading(false)
        alert('실패했습니다.')
      }
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleButton}
      color='secondary'
      variant='outlined'
      size='small'

    >
      로그인 실패 횟수 초기화
      {/* {!isLoading && <LockResetIcon fontSize='small' color='error' />} */}
      {isLoading && <CircularProgress size={12} style={{ marginLeft: 5 }} />}
    </Button>
  )
}

export default ResetLoginFailedCountButton
