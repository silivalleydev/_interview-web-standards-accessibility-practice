import React, { Component } from "react";
import { observable, toJS } from "mobx";
import { observer, inject } from "mobx-react";
import { filter, isEmpty, get, last, sumBy } from "lodash";
import moment from "moment";
import InputText from "../Components/InputText";
import { Box, CircularProgress, Modal } from "@material-ui/core";
import { createNotice, getAllNoticeCollection, updateNotice } from "../api/manageNotice";
import LoadingSpinner from "../Components/LoadingSpinner";

class ManageNotice extends Component {
  @observable noticeType = "active";
  @observable allNotice = [];
  @observable isShowWriteNoticeArea = "";
  @observable noticeObj = {
    actionUrl: "url",
    active: false,
    buttonTxt: "나는버튼",
    expiredAt: "2032-12-31",
    icon: "system",
    read: false,
    target: "all",
    title: "",
    content: "",
    type: "notice",
  };

  @observable pushData = {
    type: "all",
    title: "",
    body: "",
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    }
  }

  componentDidMount() {
    this.getAllNotice();
  }

  getAllNotice = async () => {
    this.setState({ loading: true })
    this.props.MonsterMainStore.changeLoading(true);

    const result = await getAllNoticeCollection();
    this.setState({ loading: false })
    if (result.status === "OK") {
      this.allNotice = result.data;
      this.props.MonsterMainStore.changeLoading(false);
      return;
    } else {
      this.props.MonsterMainStore.changeLoading(false);
    }
  };

  get getNoticeByType() {
    if (this.noticeType === "active") {
      return filter(this.allNotice, (notice) => notice.active === true);
    } else {
      return filter(this.allNotice, (notice) => notice.active === false || moment() > moment(notice.expiredAt));
    }
  }

  updateActiveNotice = async (noticeId, active) => {
    const areYouSure = confirm(`즉시 ${active ? "" : "비"}활성화 합니다??`);
    if (!areYouSure) {
      return;
    }

    this.props.MonsterMainStore.changeLoading(true);
    const result = await updateNotice({
      uid: noticeId,
      active,
    });

    if (result.status === "OK") {
      this.props.MonsterMainStore.changeLoading(false);
      setTimeout(() => this.getAllNotice(), 500);
      return;
    } else {
      this.props.MonsterMainStore.changeLoading(false);
    }
  };

  sendPushes = () => {
    // return Meteor.call("sendPushes", this.pushData, (error, result) => {
    //   if (result) {
    //     console.log("result----", result);
    //     this.props.MonsterMainStore.changeLoading(false);
    //     this.isShowWriteNoticeArea = "";
    //     return;
    //   } else {
    //     this.props.MonsterMainStore.changeLoading(false);
    //   }
    // });
  };

  handleCreateNotice = async () => {

    if (!this.noticeObj.title) {
      return alert("제목이 업슴슴");
    }
    const areYouSure = confirm(`
제목: ${this.noticeObj.title}
제목: ${this.noticeObj.content}
만료: ${moment(this.noticeObj.expiredAt).format("YYYY-MM-DD")}
url: ${this.noticeObj.actionUrl}
타겟: ${this.noticeObj.target}
`);
    if (!areYouSure) {
      return;
    }

    this.props.MonsterMainStore.changeLoading(true);
    const result = await createNotice({
      title: this.noticeObj.title,
      actionUrl: this.noticeObj.actionUrl,
      content: this.noticeObj.content,
      expiredAt: moment(this.noticeObj.expiredAt).toDate().toISOString(),
      target: this.noticeObj.target,
      subType: "string",
      type: "notice",
      read: false,
      active: true,
      buttonTxt: "나는버튼",
      icon: "system",
    });

    if (result.status === "OK") {
      this.allNotice = result.data;
      this.props.MonsterMainStore.changeLoading(false);
      setTimeout(() => this.getAllNotice(), 500);
      this.isShowWriteNoticeArea = "";
      return;
    } else {
      this.props.MonsterMainStore.changeLoading(false);
    }
  };

  render() {
    return (
      <>
        <LoadingSpinner isLoading={this.state.loading} />
        <div id="manage-notice-page">
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
            }}
          >
            <div
              onClick={() => (this.isShowWriteNoticeArea = "new")}
              style={{
                color: "#574EE0",
                fontWeight: "bold",
                fontSize: 20,
                cursor: "pointer",
                padding: 32,
              }}
            >
              공지사항 쓰기
            </div>

            <div
              onClick={() => (this.isShowWriteNoticeArea = "push")}
              style={{
                color: "#574EE0",
                fontWeight: "bold",
                fontSize: 20,
                cursor: "pointer",
                padding: 32,
              }}
            >
              push 쓰기
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
            }}
          >
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: this.noticeType === "active" ? "#574EE0" : "#333",
                cursor: "pointer",
              }}
              onClick={async () => {
                await this.getAllNotice();
                this.noticeType = "active";
              }}
            >
              <span
                style={{
                  paddingBottom: 4,
                  borderBottom: "1px solid #574EE0",
                  borderBottomWidth: this.noticeType === "active" ? 1 : 0,
                }}
              >
                진행중인 공지 보기
              </span>
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: this.noticeType === "deActive" ? "#574EE0" : "#333",
                cursor: "pointer",
              }}
              onClick={async () => {
                await this.getAllNotice();
                this.noticeType = "deActive";
              }}
            >
              <span
                style={{
                  paddingBottom: 4,
                  borderBottom: "1px solid #574EE0",
                  borderBottomWidth: this.noticeType === "deActive" ? 1 : 0,
                }}
              >
                내려간 공지 보기
              </span>
            </div>
          </div>

          <Modal
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            open={this.isShowWriteNoticeArea !== ""}
            contentLabel="Example Modal"
            className="monster-modal-container"
            onClose={() => (this.isShowWriteNoticeArea = "")}
          >
            <Box sx={boxStyle}>
              <div className="monster-modal-inner">
                <div className="modal-header">
                  <div className="modal-title">
                    {this.isShowWriteNoticeArea === "new" ? "공지사항 작성" : "공지사항 수정"}
                  </div>
                </div>
                <div className="modal-body flex-column">
                  <div className="modal-bodytxt flex-row flex1">
                    <div
                      className="manage-notice-modal flex1"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div className="flex-column flex1">
                        <div>제목</div>
                        <InputText
                          placeholder={this.noticeObj.title}
                          onChangeCb={(txt) => (this.noticeObj.title = txt)}
                        />
                      </div>
                      <div className="flex-column flex1">
                        <div>내용</div>
                        <textarea
                          rows={5}
                          placeholder={this.noticeObj.content}
                          onChange={(e) => (this.noticeObj.content = e.target.value)}
                        />
                      </div>

                      <div className="flex-column flex1">
                        <div>이동될 url</div>
                        <InputText
                          placeholder={this.noticeObj.actionUrl}
                          onChangeCb={(txt) => (this.noticeObj.actionUrl = txt)}
                        />
                      </div>
                      <div className="flex-column flex1">
                        <div>자동 종료날자 (설정 안하면 자동입력)</div>
                        <InputText
                          value={this.noticeObj.expiredAt}
                          placeholder={this.noticeObj.expiredAt}
                          onChangeCb={(txt) => (this.noticeObj.expiredAt = txt)}
                        />
                      </div>
                      <div className="flex-column flex1">
                        <div>아이콘</div>
                        <select
                          className="form-control"
                          value={this.noticeObj.icon}
                          onChange={(e) => (this.noticeObj.icon = e.target.value)}
                        >
                          <option value="system">system</option>
                        </select>
                      </div>
                      <div className="flex-column flex1">
                        <div>누구에게</div>
                        <select
                          className="form-control"
                          value={this.noticeObj.target}
                          onChange={(e) => (this.noticeObj.target = e.target.value)}
                        >
                          <option value="all">모두</option>
                          <option value="employer">사장님만</option>
                          <option value="seeker">알바님만</option>
                        </select>
                      </div>

                      {/*<div className="flex-column flex1">
                                        <div>종류(기본 notice)</div>
                                        <select
                                            className="form-control"
                                            value={this.noticeObj.type}
                                            onChange={(e) => this.noticeObj.type = e.target.value}
                                        >
                                            <option value='notice'>notice</option>
                                        </select>
                                    </div>*/}
                      <div className="flex-column flex1">
                        <div>활성화 (당분간은 false 추후 안쫄리면 true를 기본으로 예정)</div>
                        <select
                          className="form-control"
                          value={this.noticeObj.active}
                          onChange={(e) => (this.noticeObj.active = e.target.value)}
                        >
                          <option value={false}>비활성화</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={this.handleCreateNotice}
                    className="btn btn-primary"
                    style={{
                      marginTop: 24,
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    작성하기
                  </button>
                </div>
              </div>
            </Box>
          </Modal>

          <Modal
            open={this.isShowWriteNoticeArea === "push"}
            className="monster-modal-container"
            onClose={() => (this.isShowWriteNoticeArea = "")}
          >
            <div className="monster-modal-inner">
              <div className="modal-header">
                <div className="modal-title">push 작성</div>
              </div>
              <div className="modal-body flex-column">
                <div className="modal-bodytxt flex-row flex1">
                  <div
                    className="manage-notice-modal flex1"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="flex-column flex1">
                      <div>제목</div>
                      <InputText placeholder={this.pushData.title} onChangeCb={(txt) => (this.pushData.title = txt)} />
                    </div>

                    <div className="flex-column flex1">
                      <div>내용</div>
                      <InputText placeholder={this.pushData.body} onChangeCb={(txt) => (this.pushData.body = txt)} />
                    </div>
                    <div className="flex-column flex1">
                      <div>누구에게</div>
                      <select
                        className="form-control"
                        value={this.pushData.type}
                        onChange={(e) => (this.pushData.type = e.target.value)}
                      >
                        <option value="all">모두</option>
                        <option value="store">사장님만</option>
                        <option value="user">알바님만</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={this.sendPushes}
                  className="btn btn-primary"
                  style={{
                    marginTop: 24,
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: "bold",
                    flex: 1,
                  }}
                  disabled={this.props.MonsterMainStore.isLoading}
                >
                  {this.props.MonsterMainStore.isLoading ? <CircularProgress size={32} /> : "작성하기!!!!"}
                </button>
              </div>
            </div>
          </Modal>

          {this.getNoticeByType.map((notice) => (
            <div
              key={notice._id}
              style={{
                // marginTop: 18,
                borderBottom: "1px solid #E9E9E9",
                padding: "14px 0",
              }}
            >
              <div>
                <span
                  style={{ color: "#574EE0" }}
                  onClick={this.updateActiveNotice.bind(this, notice.uid, !notice.active)}
                >
                  {notice.active ? "비활성화하기" : "공지 올리기"}
                </span>
              </div>
              <div>제목: {notice.title}</div>
              내용:
              {notice.content && (
                <div
                  style={{
                    whiteSpace: "pre-line",
                    border: "1px solid black",
                  }}
                >
                  {" "}
                  {notice.content}
                </div>
              )}
              <div>작성일: {moment(notice.createdAt).format("YYYY-MM-DD")}</div>
              {/*<div>type: {notice.type}</div>*/}
              <div>대상: {notice.target === "all" ? "모두" : notice.target === "employer" ? "사장님" : "알바님"}</div>
              <div>url: {notice.actionUrl}</div>
              {notice.expiredAt && <div>자동만료날짜: {moment(notice.expiredAt).format("YYYY-MM-DD")}</div>}
            </div>
          ))}
          {/* <LoadingSpinner /> */}
        </div>
      </>
    );
  }
}

export default inject("MonsterMainStore")(observer(ManageNotice));
const boxStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  boxShadow: 24,
  p: 4,
  backgroundColor: "#ffffff",
};
