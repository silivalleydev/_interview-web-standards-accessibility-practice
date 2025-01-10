import React, { useEffect, useState } from "react";

import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import logo from "../image/ic_soon_main_logo.png";

import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import { signInUser } from "../api/users";
import { usePRD } from "../api/requestApi";

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
    // setInProgress(true);
    MonsterMainStore.setCurrentUser('id', 'serverLoginResult?.data?.accessToken');
    loginCallback('id');
  };


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

        <div style={{border: '1px solid lightgray', padding: 16}}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'black', fontWeight: 'bold' }}>로그인</div>
                {isDevEnv && <div style={{ color: '#B30000', fontWeight: 'bold' }}>(개발환경)</div>}
                <img src={logo} alt="logo-img" style={{ height: 15 }} />
              </div>

          <div>
            <div className="sign-in-box" >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}} >

              <div style={{ height: 40}}></div>
                <Input
                  required
                  variant="standard"
                  placeholder="아이디"
                  fullWidth
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
                <div style={{ height: 15}}></div>

                <Input
                  required
                  variant="standard"
                  placeholder="비밀번호"
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
              </div>

              <div>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={inProgress || !id || !password}
                  onClick={signIn}
                  style={{ width: "100%", backgroundColor: (!id || !password) ? "gray" : "#574EDF", color: 'white' }}
                >
                  {inProgress ? '로딩중...' : "로그인"}
                </Button>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default inject("MonsterMainStore")(observer(PleaseTellWhoYouAre));
