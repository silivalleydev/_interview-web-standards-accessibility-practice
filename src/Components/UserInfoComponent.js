import React, { Component, useState } from "react";
import { observer } from "mobx-react";
import moment from "moment";
import { get } from "lodash";
import "rc-collapse/assets/index.css";
import Collapse, { Panel } from "rc-collapse";
import { Button, Modal, Box } from "@material-ui/core";
import { getPrivateImageBo } from "../api/users";

const UserInfoComponent = ({
  user,
  index,
  isRequestGrade,
  changeIntroduction = () => { },
  sumScoreInfo = () => { },
  changeScoreManual = () => { },
  goPenalty = () => { },
  confirmAlert = () => { },
  onChangeProLevel,
  children,
}) => {
  const headerText = `${user.displayName || user.username} -----지원:${get(user, "appliesCount", 0)} -----채용:${user.hiredCount || 0
    } -----평점:${user.avgReviewRate || ""} ${isRequestGrade === true && user.requestGradeDate
      ? `-----프로 신청일:${moment(user.requestGradeDate).format("MM월 DD일")}`
      : ""
    }`;
  const [open, setOpen] = useState(false);
  const [idImage, setIdImage] = useState("");
  const handleOpen = async () => {
    getIdCardPhotos();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const getIdCardPhotos = () => {
    if (user.photoURL || user.photo?.originalPhotoURL) {
      getPrivateImageBo(user.photoURL || user.photo?.originalPhotoURL)
        .then((result) => {
          if (result.status === "OK") {
            setIdImage(result.data);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <Collapse accordion={true}>
      <Panel
        header={
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignContent: "center",
            }}
          >
            <p style={{ marginBottom: 0, margin: "auto 0" }}>{headerText}</p>
            <Button
              variant="outlined"
              color="primary"
              onClick={(e) => {
                onChangeProLevel();
                e.stopPropagation();
              }}
            >
              {user.grade === "PRO" ? "프로알바 해제하기" : "프로알바로 추가하기"}
            </Button>
          </div>
        }
      >
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid #eee",
          }}
        >
          {children}
          <div style={{ padding: 2 }}>
            가입날짜: {user.createdAt && moment(user.createdAt).format("YYYY.MM.DD hh:mm")}
          </div>
          {user.leftAt !== null && typeof user.leftAt !== "undefined" && (
            <div style={{ padding: 2 }}>탈퇴날짜: {user.leftAt && moment(user.leftAt).format("YYYY.MM.DD hh:mm")}</div>
          )}
          <div style={{ padding: 2 }}>
            나이:{" "}
            {!user.birthDate ? "" : parseInt(moment().format("YYYY")) - parseInt(moment(user.birthDate).format("YYYY"))}
          </div>
          <div style={{ padding: 2 }}>성별: {!user.gender ? "" : user.gender === "M" ? "남자" : "여자"}</div>
          <div style={{ padding: 2 }}>타입: {user.type === "store" ? "사장님" : "알바"}</div>
          <div style={{ padding: 2 }}>이름: {user.displayName || user.username}</div>
          <div style={{ padding: 2 }}>핸드폰번호: {user.phoneNumber}</div>
          <div style={{ padding: 2 }}>
            프로필 사진:
            {user.photoURL || user.photo?.originalPhotoURL ? (
              // <a target="_blank" href={user.photoURL || user.photo?.originalPhotoURL}>

              // </a>
              <>
                <Button variant="contained" color="primary" onClick={handleOpen}>
                  보러 가기
                </Button>
                <Modal
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={style}>
                    <img style={{ width: "100%", height: "100%" }} src={idImage}></img>
                  </Box>
                </Modal>
              </>
            ) : (
              "사진 등록 안됨"
            )}
          </div>
          <div style={{ padding: 2 }}>uid: {user.uid}</div>
        </div>
      </Panel>
    </Collapse>
  );
};
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  boxShadow: 24,
  p: 4,
};

UserInfoComponent.defaultProps = {};

UserInfoComponent.propTypes = {};

export default observer(UserInfoComponent);
