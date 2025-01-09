import React, { useEffect, useState } from "react";

import TextField from "@material-ui/core/TextField";
import logo from "../image/ic_soon_main_logo.png";
import { Button, CardContent, Card, CircularProgress, CardHeader } from "@material-ui/core";
import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import { signInUser } from "../api/users";
import Grid from '@mui/material/Grid';
import { usePRD } from "../api/requestApi";
const PasswordChange = React.lazy(() => import("./PasswordChange"));

const PleaseTellWhoYouAre = ({ loginCallback, MonsterMainStore, window }) => {


  const [inProgress, setInProgress] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isDevEnv, setIsDevEnv] = React.useState(false);

  useEffect(() => {

    const isDev = ((window.location.host.includes('dev-admin') || window.location.host.includes('localhost')) && usePRD === false)
    if (isDev) {
      setIsDevEnv(true)
    }

  }, [window])

  useEffect(() => {
    let intervalId = setInterval(() => {
      const isRefreshFailed = localStorage.getItem("@refreshFailed");
      if (isRefreshFailed === 'true') {
        alert('토큰이 만료되었습니다. 로그인 재시도 해주세요')
        localStorage.setItem("@refreshFailed", "")
        clearInterval(intervalId)
      }
    }, 1000)
  }, [])


  const signIn = async (e = null, otherpassword = null) => {
    setInProgress(true);

    const serverLoginResult = await signInUser({
      adminId: id,
      password: otherpassword || password,
    });

    switch (serverLoginResult.status) {
      case "UNAVAILABLE_FOR_LEGAL_REASONS":
      case "UPGRADE_REQUIRED":
        alert(serverLoginResult?.data?.note);
        setInProgress(false);
        setIsChangePassword(true);
        return;

      case "BAD_REQUEST":
      case "UNAUTHORIZED":
      case "LOCKED":
      case "GONE":
        alert(serverLoginResult?.data?.note);
        setInProgress(false);
        return;

      case "OK":
        loginCallback(id);
        MonsterMainStore.setCurrentUser(id, serverLoginResult?.data?.accessToken);
        break;

      default:
        alert("로그인에 실패했습니다.");
        setInProgress(false);
    }
  };



  if (isChangePassword) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,


        }}
      >
        <div
          style={{
            display: "flex",
            width: "100vw",
            height: "100vh",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: 'hidden'

          }}
        >
          <Card variant="outlined">
            <CardHeader
              subheader={
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: 'black', fontWeight: 'bold' }}>비밀번호 변경</div>
                  <img src={logo} style={{ height: 15 }} />
                </div>
              }
            />
            <CardContent>
              <PasswordChange id={id} originPassword={password} signIn={signIn} setPassword={setPassword} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }



  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,


      }}
    >
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: 'hidden'

        }}
      >

        <Card variant="outlined">
          <CardHeader
            subheader={
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'black', fontWeight: 'bold' }}>로그인</div>
                {isDevEnv && <div style={{ color: 'red', fontWeight: 'bold' }}>(개발환경)</div>}
                <img src={logo} style={{ height: 15 }} />
              </div>
            }
          />
          <CardContent>
            <div className="sign-in-box" >
              <Grid container rowGap={3} >

                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                  variant="standard"
                  label="아이디"
                  fullWidth
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />

                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                  variant="standard"
                  label="비밀번호"
                  fullWidth
                  type="password"
                  value={password}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      signIn()
                    }
                  }}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>

              <div>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={inProgress || !id || !password}
                  onClick={signIn}
                  style={{ width: "100%", backgroundColor: (!id || !password) ? "gray" : "#574EDF", color: 'white' }}
                >
                  {inProgress ? <CircularProgress size={16} /> : "로그인"}
                </Button>


              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default inject("MonsterMainStore")(observer(PleaseTellWhoYouAre));
