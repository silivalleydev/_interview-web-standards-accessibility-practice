import React, { useEffect, useState } from 'react'

import { Button } from '@material-ui/core'
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

import { changePassword, changePasswordNew, sendSms } from '../api/users'
import { usePRD } from '../api/requestApi';
import { includes } from 'lodash';


const PasswordChange = ({ id, originPassword, setPassword, signIn }) => {
  const [inputPassword, setInputPassword] = useState<string>('')
  const [inputPasswordReentry, setInputPasswordReentry] = useState<string>('')
  const [inputPhoneNumber, setInputPhoneNumber] = useState<string>('')
  const [sixDigitNumber, setSixDigitNumber] = useState<string>('')
  const [isVaildsixDigitNumber, setIsVaildsixDigitNumber] = useState()
  const [inputSixDigitNumber, setInputSixDigitNumber] = useState<string>('')
  const [isVisibleSixDigitInput, setIsVisibleSixDigitInput] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [phoneNumberErrorMessage, setPhoneNumberErrorMessage] = useState<string>('')
  const [passwordFristTimeCheck, setPasswordFristTimeCheck] = useState<boolean>(true)
  const [phoneNumberFristTimeCheck, setPhoneNumberFristTimeCheck] = useState<boolean>(true)


  const onClickVericationCode = async () => {
    setPhoneNumberErrorMessage('')

    const result = await sendSms({ adminId: id, phoneNumber: inputPhoneNumber });
    if (result.status === 'OK') {
      alert('인증번호가 전송되었습니다.')
      setSixDigitNumber(result.data)
      setIsVisibleSixDigitInput(true)
    } else if (result?.apiError?.detail?.includes('This is not')) {
      setPhoneNumberErrorMessage(`${id}의 핸드폰번호와 일치하지 않습니다.`)
    }
    else {
      alert('다시 시도해주세요')
    }
  }


  const onClickVericationCodeCheck = () => {
    setIsVisibleSixDigitInput(true)
    setPhoneNumberFristTimeCheck(false)
    const isDev = (window.location.host.includes('dev-admin') || window.location.host.includes('localhost') && usePRD === false)


    if (sixDigitNumber === inputSixDigitNumber || isDev) {
      setIsVaildsixDigitNumber(true)
      alert('인증되었습니다.')
    } else {
      if (inputPhoneNumber === '01011111111' || inputPhoneNumber === '01022222222' || inputPhoneNumber === '01033333333') {
        setIsVaildsixDigitNumber(true)
        alert('인증되었습니다.')
        return
      }
      setIsVaildsixDigitNumber(false)
    }
  }




  const checkValidatePassword = () => {
    const password = inputPassword.replace(/ /g, '');
    setErrorMessage('');
    // setPasswordMismatchError(false);
    setPasswordFristTimeCheck(false)
    // 비밀번호 설정 조건
    // const passwordRegex =
    //   /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*\d){1,})(?=(.*\W){1,}).{8,}$/;
    // const passwordRegex =
    //   /^(?=(.*[a-zA-Z]){2,})(?=(.*\d){1,})(?=(.*\W){1,}).{8,}$/;

    // 사용자 ID와 동일한 비밀번호 체크
    if (password === inputPhoneNumber) {
      return setErrorMessage('비밀번호는 사용자 핸드폰번호와 동일할 수 없습니다.');
    }
    // 사용자 ID와 동일한 비밀번호 체크
    if (password === id) {
      return setErrorMessage('비밀번호는 사용자 id와 동일할 수 없습니다.');
    }

    // 세 자리 이상 동일한 숫자 체크
    if (/(.)\1\1/.test(password)) {
      return setErrorMessage(
        '세 자리 이상 동일한 숫자를 사용할 수 없습니다.',
      );
    }

    // 순차적 숫자 체크
    const sequentialNumbers = [
      '123',
      '234',
      '345',
      '456',
      '567',
      '678',
      '789',
      '987',
      '876',
      '765',
      '654',
      '543',
      '432',
      '321',
      '210',
    ];
    if (sequentialNumbers.some((seq) => password.includes(seq))) {
      setErrorMessage(
        '세 자리 이상 순차적 숫자를 사용할 수 없습니다.',
      );
      return false;
    }

    const checkMsg = checkPassword(password, 8, 30, 4);

    // // 비밀번호 유효성 검사
    if (checkMsg) {
      setErrorMessage(
        '8자 이상 영어 대소문자, 숫자, 특수문자 중 4종류 이상 조합해야 합니다.',
      );
      return false;
    }

    if (password !== inputPasswordReentry) {
      // setPasswordMismatchError(true);
      setErrorMessage(
        '비밀번호 재입력과 비밀번호가 일치하지 않습니다.',
      );
      return false;
    }

    // handleChangePassword()

    return true;
  }

  /*
-- 파라메터 - 순서대로 패스워드, 최소길이, 최대길이, 체크 레벨
-- 체크레벨(조합형)
1:숫자or소문자or대문자or특수문자 중 1가지 조건 충족
2:숫자or소문자or대문자or특수문자 중 2가지 조건 충족
3:숫자or소문자or대문자or특수문자 중 3가지 조건 충족
4:숫자+소문자+대문자+특수문자 모두 충족
*/
  function checkPassword(pwd, min, max, checkLevel) {
    let errorMsg = '';

    //파라메터 체크, 기본값 설정
    min = min ?? 8;
    max = max ?? 16;
    checkLevel = checkLevel ?? 3;
    const lenRegExp = new RegExp('^.{' + min + ',' + max + '}$');

    //길이 체크
    if (pwd.match(lenRegExp) == null) {
      errorMsg =
        min == max
          ? `패스워드 길이가 ${min}이 아닙니다.`
          : `패스워드 길이가 최소:${min}, 최대:${max}가 아닙니다.`;
      return errorMsg;
    }

    //조합 체크
    let checked = 0;
    checked += pwd.match(/[0-9]/) != null ? 1 : 0; // 숫자
    checked += pwd.match(/[a-z]/) != null ? 1 : 0; // 알파벳 소문자
    checked += pwd.match(/[A-Z]/) != null ? 1 : 0; // 알파벳 대문자
    checked += pwd.match(/[^0-9a-zA-Z]/) != null ? 1 : 0; //특수문자
    if (checked < checkLevel) {
      errorMsg = `숫자, 알파벳 소문자, 알파벳 대문자, 특수문자 중 ${checkLevel}가지 이상 조합되야 합니다.`;
      return errorMsg;
    }
    return '';
  }


  // useEffect(() => {
  //   setPassword(inputPassword)
  // }, [inputPassword])

  const handleChangePassword = async () => {


    const Cresult = await checkValidatePassword()
    if (!!Cresult === false) {
      return
    }



    const result = await changePasswordNew({
      authCode: inputSixDigitNumber,
      originPassword: originPassword,
      newPassword: inputPassword
    })

    if (result.status === 'BAD_REQUEST') {

      if (result.apiError.message.includes('accessToken was null')) {
        alert('accessToken이 null 입니다.')
        return
      }
      if (result.apiError.message.includes('인증 코드가 일치하지 않습니다.')) {
        alert('인증 코드가 일치하지 않습니다.')
        return
      }
    }

    if (result.status === 'OK') {
      alert('비밀번호 변경이 완료되었습니다.')
      signIn(null, inputPassword)
    }
    else {
      alert('다시 시도해주세요')
    }

  }
  // 브라우저에 렌더링 시 한 번만 실행하는 코드
  // 새로고침 막기 변수
  const preventClose = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    localStorage.setItem("@id", "");
    e.returnValue = ""; // chrome에서는 설정이 필요해서 넣은 코드
  }

  useEffect(() => {
    (() => {
      window.addEventListener("beforeunload", preventClose);
    })();

    return () => {
      window.removeEventListener("beforeunload", preventClose);
    };
  }, []);


  return (
    <div className='change-password-box'>
      <Grid container rowGap={3} >
        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          required
          variant="standard"
          label="아이디"
          value={id}
          fullWidth
          disabled
        />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'row', width: '100%' }}>

          <TextField
            InputLabelProps={{
              shrink: true,
            }}
            required
            variant="standard"
            label="핸드폰 번호"
            value={inputPhoneNumber}
            fullWidth
            error={phoneNumberErrorMessage}
            helperText={phoneNumberErrorMessage}
            disabled={!!isVaildsixDigitNumber === true}
            onChange={(e) => setInputPhoneNumber(e.target.value)}
          />
          <div style={{ position: 'absolute', right: 5 }}>
            <Button disabled={inputPhoneNumber.length < 9 || !!isVaildsixDigitNumber === true} variant='outlined' color='primary' onClick={onClickVericationCode}>{!!isVaildsixDigitNumber === true ? '인증완료' : '인증번호 전송'}</Button>
          </div>

        </div>
        {
          !!isVisibleSixDigitInput === true && !!isVaildsixDigitNumber === false &&

          < div style={{ position: 'relative', display: 'flex', flexDirection: 'row', width: '100%' }}>
            <TextField
              InputLabelProps={{
                shrink: true,
              }}
              required
              error={!!isVaildsixDigitNumber === false && !!phoneNumberFristTimeCheck === false}
              variant="standard"
              label="인증번호"
              helperText={!!phoneNumberFristTimeCheck === false && !!isVaildsixDigitNumber === false ? '인증 번호가 일치하지 않습니다. 다시 시도해주세요.' : ''}
              value={inputSixDigitNumber}
              fullWidth
              onChange={(e) => setInputSixDigitNumber(e.target.value)}
            />
            {/* <div style={{ position: 'absolute', right: 5 }}>
              <Button disabled={inputSixDigitNumber.length !== 6} variant='outlined' color='primary' onClick={onClickVericationCodeCheck}>인증번호 확인</Button>
            </div> */}
          </div>
        }

        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          required
          error={!!passwordFristTimeCheck === false}
          helperText={errorMessage}
          variant="standard"
          label="비밀번호"
          type="password"
          value={inputPassword}
          fullWidth

          onChange={(e) => setInputPassword(e.target.value)}
        />
        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          required
          type="password"

          variant="standard"
          label="비밀번호 재입력"
          value={inputPasswordReentry}
          fullWidth
          onChange={(e) => setInputPasswordReentry(e.target.value)}
        />




      </Grid >
      <Grid container rowGap={2} style={{ position: 'absolute', bottom: 0, justifyContent: 'center' }} >
        <Button fullWidth variant="contained" color='primary' className='sign-up-button' onClick={handleChangePassword}>비밀번호 변경</Button>
      </Grid>


    </div >

  )
}



export default PasswordChange
