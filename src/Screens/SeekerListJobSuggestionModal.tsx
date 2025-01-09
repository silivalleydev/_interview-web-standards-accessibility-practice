import React, { useState, useEffect } from "react";
import admin from "firebase-admin";
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, CircularProgress } from "@material-ui/core";
import close from "../image/image/btn_close.png";
import { sendSMSForJobSuggestionMessage } from "../api/seeker";
import { getUserNonMaskingBo } from "../api/appliedSeeker";

const SeekerListJobSuggestionModal = ({ open, targetUser, onChange, onClose }) => {
  const [jobId, setJobId] = useState("");
  const [message, setMessage] = useState("");
  const [process, setProcess] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');



  const handleGetAppliedSeeker = async () => {
    setMessage('')
    const result = await getUserNonMaskingBo({ uid: targetUser.seeker.uid })
    if (result.status === "OK") {
      setName(result.data.username);
      setPhoneNumber(result.data.phoneNumber);
      let TEMPLATE = (name) =>
        `제안이 도착했습니다! 
    
${name} 알바님 안녕하세요. 
쑨 배정매니저입니다. 
아래 공고에 배정해드리려고 합니다. 

근무 가능하시면 지원부탁드립니다.

> 공고바로가기`;
      setMessage(TEMPLATE(result.data.username));

    }
  };


  useEffect(() => {
    if (open) {
      handleGetAppliedSeeker()
    }
  }, [open])



  const sendSMSForJobSuggestion = async () => {
    setProcess(true);
    if (!jobId) {
      alert("jobId를 입력해주세요");
      setProcess(false);
      return;
    }
    setProcess(false);

    const title = "SOON";
    const link = `https://soon.page.link/?link=https://www.sooooon.com?job=${jobId.trim()}&apn=com.sooooon.android&isi=1441937310&ibi=com.sooooon.ios`;
    const body = message + `\n${link}`;

    const result = await sendSMSForJobSuggestionMessage({
      title,
      content: body,
      phoneNumber: phoneNumber,
    });

    if (result.status === "OK") {
      alert("메세지 전송 완료");
      onClose();
    } else {
      alert("전송 실패");
    }
  };

  const submit = () => {
    sendSMSForJobSuggestion();
  };

  return (
    <Dialog maxWidth={"md"} fullWidth={true} open={open} onClose={onClose}>
      <DialogTitle>공고 제안하기</DialogTitle>
      <img
        onClick={onClose}
        style={{ position: "absolute", right: 23, width: 18, height: 18, cursor: "pointer", top: 23 }}
        src={close}
      />
      <DialogContent>
        <div style={{ border: "1px solid #E8EBF0", padding: 32 }}>
          <table>
            <tr>
              <td style={{ fontSize: 18, fontWeight: "700" }}>JOBID</td>
              <td style={{ paddingLeft: 42, paddingBottom: 6 }}>
                <input
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  style={{
                    fontSize: 18,
                    paddingTop: 15,
                    paddingBottom: 15,
                    paddingLeft: 12,
                    paddingRight: 12,
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                    boxShadow: "none",
                    border: "1px solid #C4CAD4",
                    width: 343,
                    height: 52,
                    borderRadius: 2,
                  }}
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: 48 }}></td>
              <td style={{ color: "#8E95A3", fontSize: 14, paddingLeft: 42, paddingBottom: 48 }}>
                알바님에게 제안할 공고 ID입력
              </td>
            </tr>
            <tr>
              <td style={{ width: 67, fontSize: 18, fontWeight: "700", position: "relative" }}>
                <div style={{ position: "absolute", top: 0 }}>문자내용</div>
              </td>
              <td style={{ paddingLeft: 42 }}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    padding: 14,
                    fontSize: 18,
                    resize: "none",
                    borderColor: "#C4CAD4",
                    height: 217,
                    width: 343,
                    borderRadius: 2,
                  }}
                />
              </td>
            </tr>
          </table>
        </div>
      </DialogContent>
      <Button
        variant="contained"
        style={{ marginLeft: 170, width: 227, height: 52, marginTop: 25, marginBottom: 25 }}
        color="primary"
        onClick={submit}
      >
        {process ? <CircularProgress color="white" size={16} /> : "문자 보내기"}
      </Button>
      <DialogActions></DialogActions>
    </Dialog>
  );
};

export default SeekerListJobSuggestionModal;
