import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { createUser } from '../api/users'


const CreateUser = ({ setOpenCreateModal, handleGetAdminUser }) => {
  const [inputId, setInputId] = useState<string>('')
  const [inputPhoneNumber, setInputPhoneNumber] = useState<string>('')




  const onClickCreateUserButton = async () => {

    const message = `계정 생성이 성공적으로 완료되었습니다. 
해당 사용자가 로그인 시 임시 비밀번호를 재설정해야 합니다.`;


    const result = await createUser({ adminId: inputId, phoneNumber: inputPhoneNumber })
    if (result.status === 'OK') {
      alert(message)
      handleGetAdminUser()

      setOpenCreateModal(false)
    }
    else if (
      result?.apiError?.message === 'AdminId is already exist.'
    ) {
      alert('AdminId is already exist.')
    }
    else {
      alert('다시 시도해주세요')
    }
  }


  return (
    <div className='sign-up-box'>
      <Grid container rowGap={3} >
        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          required
          variant="standard"
          label="아이디"
          value={inputId}
          fullWidth
          onChange={(e) => setInputId(e.target.value)}
        />

        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          required
          variant="standard"
          label="핸드폰 번호"
          value={inputPhoneNumber}
          fullWidth
          onChange={(e) => setInputPhoneNumber(e.target.value)}
        />

      </Grid>
      <Grid container rowGap={2} style={{ position: 'absolute', bottom: 0, justifyContent: 'center' }} >
        <Button fullWidth variant="contained" color='primary' className='sign-up-button' onClick={onClickCreateUserButton}>계정생성</Button>
      </Grid>


    </div>

  )
}



export default CreateUser
