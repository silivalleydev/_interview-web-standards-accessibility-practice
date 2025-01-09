import React, { Component } from "react";
import { observable } from "mobx";
import { observer, inject } from "mobx-react";
import moment from "moment";
import { get, sum, filter, size, orderBy, flattenDeep, compact, result } from "lodash";
import UserInfoComponent from "./UserInfoComponent";
import LoadMoreBtn from "./LoadMoreBtn";
import { Button } from "@material-ui/core";
import Papa from "papaparse";
import {
  addProUser,
  getAppliesCount,
  getProAlba,
  getUserAuth,
  getUserByIds,
  goPenaltyThisUser,
  putResumes,
  removeProUser,
  updateSeekerIntroduction,
} from "../api/users";
import { updateSeekerManualScore } from "../api/userInfo";

class UserInfo extends Component {
  @observable userInfo = [];
  @observable userUidText = "";
  @observable activeKey = [];
  @observable resumesFormPlaceHolder = {
    startedTime: "2019.05",
    endTime: "",
    jobKind: "주방",
    storeName: "크몽스토어",
  };

  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    if (this.getQueryString.userinfo) {
      this.userUidText = this.getQueryString.userinfo;
      this.getFirebaseData();
    }
  };

  openCollapse = (user, e) => {

    if (typeof e === "undefined" && typeof user.appliesCount !== "undefined" && typeof user.uid !== "undefined") {
      return;
    }

    this.getAppliesCount(user.uid);
  };

  getAppliesCount = async (uid) => {
    if (!uid) {
      return;
    }
    this.props.MonsterMainStore.changeLoading(false);

    const result = await getAppliesCount({ seekerUid: uid });
    this.props.MonsterMainStore.changeLoading();
    if (result.status === "OK") {
      this.userInfo = this.userInfo.map((user) => {
        if (user.uid === uid) {
          user.appliesCount = result;
        }
        return user;
      });
    }
  };

  getFirebaseData = async (uid = this.userUidText) => {
    if (!uid || this.props.MonsterMainStore.isLoading === true) {
      return;
    }

    this.props.MonsterMainStore.changeLoading(true);

    const result = await getUserAuth({ authInfo: uid });

    if (result.status === "OK") {
      result.resumes = result.data.resumes === null ? [] : result.data.resumes;
      this.userInfo = [result.data];
      this.userInfo = this.orderByHiredCount();
      this.getAppliesCount(result.data.uid);
      window.history.pushState({}, "Monster", window.location.pathname + `?userinfo=${uid}`);
      this.props.MonsterMainStore.changeLoading(false);
    } else {
      this.props.MonsterMainStore.changeLoading(false);
      alert("없습니다.");
    }
  };

  get getQueryString() {
    return decodeURI(window.location.search)
      .replace("?", "")
      .split("&")
      .map((param) => param.split("="))
      .reduce((values, [key, value]) => {
        values[key] = value;
        return values;
      }, {});
  }

  get sumScoreInfo() {
    const scoreInfo = {
      photo: 30,
      introduction: 10,
      resumes: 20,
      reviewAvg: 50,
      hiredRatio: 50,
    };
    return sum(Object.values(scoreInfo));
  }

  changeIntroduction = async (user) => {
    const introduction = prompt("바꿀인삿말이 적어주세요", "");
    let seekerUid = user.uid;
    if (introduction) {
      if (!seekerUid) {
        this.props.MonsterMainStore.changeLoading(true);

        const getUserAuthresult = await getUserAuth({ authInfo: user.phoneNumber });
        let seeker = {};
        if (getUserAuthresult.status === "OK") {
          this.props.MonsterMainStore.changeLoading();
          seeker = getUserAuthresult.data;
        }

        seekerUid = seeker.uid;
      }
      const formData = {
        seekerIntroduction: introduction,
        seekerUid,
      };
      this.props.MonsterMainStore.changeLoading(true);
      const result = await updateSeekerIntroduction({
        uid: seekerUid,
        seekerIntroduction: introduction,
      });
      if (result.status === "OK") {
        this.props.MonsterMainStore.changeLoading();
        this.getFirebaseData();
      }
    }
  };

  confirmAlert = (uid) => {
    const startedTime = prompt("언제부터~ (예: 2019.05) 꼭 .(쩜)을 붙혀주세요!!!", "");
    if (!startedTime) {
      return;
    }
    const endTime = prompt("언제까지~ (예: 2019.06) 꼭 .(쩜)을 붙혀주세요!!!", "");
    if (!endTime) {
      return;
    }
    const jobKind = prompt("직종 (예: 주방, 매장관리 등등)", "");
    if (!jobKind) {
      return;
    }
    const storeName = prompt("가게이름 (예: gs25석촌점)", "");
    if (startedTime && endTime && jobKind && storeName) {
      this.putResumeForm({
        startedTime,
        endTime,
        jobKind,
        storeName,
        seekerUid: uid,
      });
    }
  };

  putResumeForm = async (formData) => {
    this.props.MonsterMainStore.changeLoading(true);

    const result = await putResumes(formData);

    if (result.status === "OK") {
      this.props.MonsterMainStore.changeLoading();
      this.getFirebaseData();
    }
  };

  onChangeCollapse = (activeKey) => {
    const newKey = this.activeKey;
    if (this.activeKey.includes(activeKey) && this.activeKey.indexOf(activeKey) > -1) {
      newKey.splice(this.activeKey.indexOf(activeKey), 1);
    } else {
      newKey.push(activeKey);
    }
    this.activeKey = newKey;
  };

  getCountHiredOnSoon = (resumes = []) => {
    return size(filter(resumes, (resume) => resume.isVerified));
  };

  orderByHiredCount = (userInfo = this.userInfo) => {
    const newUserInfo = userInfo.map((user) => {
      user.hiredCount = this.getCountHiredOnSoon(user.resumes);
      return user;
    });
    return orderBy(newUserInfo, ["hiredCount"], ["desc"]);
  };

  goPenalty = async (user) => {
    const currentPenaltyStatus = get(user, "penalty", false);
    // let penaltyDate = undefined
    let penaltyReason = "";
    if (currentPenaltyStatus === false) {
      //   penaltyDate = prompt('얼마나 먹일까요?', 'YYYYMMDD로 설정해주세요')
      //   if (!penaltyDate) {
      //     return
      //   }
      penaltyReason = prompt("이유를 적어주세요", "납득할수 있을정도로.. (힘들겠지만)");
      if (!penaltyReason) {
        return;
      }
    }
    // const penaltyObj = {
    //   penalty: !currentPenaltyStatus,
    //   penaltyDate: moment(penaltyDate).toDate(),
    //   penaltyReason,
    // }
    const reallyGoPenalty = confirm(currentPenaltyStatus ? "패널티를 풀겠습니다?" : "패널티를 부여하겠습니다?");
    if (reallyGoPenalty) {
      this.props.MonsterMainStore.changeLoading(true);
      const result = await goPenaltyThisUser({
        uid: user.uid,
        penalty: !currentPenaltyStatus,
        penaltyReason: penaltyReason,
      });
      if (result.status === "OK") {
        this.props.MonsterMainStore.changeLoading();
        this.getFirebaseData();
      }
    }
  };

  onChangeProLevel = async (user) => {
    this.props.MonsterMainStore.changeLoading(true);

    if (user.grade === "PRO") {
      const removeProResult = await removeProUser({ uid: user.uid });
      this.props.MonsterMainStore.changeLoading();
      if (removeProResult.status === "OK") {
        alert("프로 알바로 등록되었습니다.");
        user.grade = user.grade === "PRO" ? "" : "PRO";
      } else {
        alert("다시 시도해주세요");
      }
    } else {
      const addProResult = await addProUser({ uid: user.uid });
      this.props.MonsterMainStore.changeLoading();
      if (addProResult.status === "OK") {
        alert("프로 알바로 등록 해제되었습니다.");
        user.grade = user.grade === "PRO" ? "" : "PRO";
      } else {
        alert("다시 시도해주세요");
      }
    }
  };

  downloadCsvFile = (content) => {
    var finalVal = "id,phone number, name\n";
    for (var i = 0; i < content.length; i++) {
      var value = content[i];

      for (var j = 0; j < value.length; j++) {
        var innerValue = value[j] === null ? "" : value[j].toString();
        var result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
        if (j > 0) finalVal += ",";
        finalVal += result;
      }

      finalVal += "\n";
    }

    var hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(finalVal);
    hiddenElement.target = "_blank";
    hiddenElement.download = "people.csv";
    hiddenElement.click();
  };

  render() {
    return (
      <div id="userinfo-page" style={{}}>
        <div>
          <div style={{ fontSize: 30, fontWeight: "bold" }}>유저들</div>
          <div style={{ fontSize: 17, fontWeight: 500, color: "#5B616C" }}>쑨 앱 사용자 정보 조회</div>
        </div>
        <div style={{ height: 20 }}></div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <input
            placeholder="uid 또는 핸드폰번호로 검색 가능합니다."
            style={{
              marginTop: 1,
              padding: 4,
              fontSize: 16,
              width: "50%",
            }}
            type="text"
            className="form-control"
            value={this.userUidText || ""}
            onChange={(event) => {
              this.userUidText = event.target.value;
            }}
            onKeyDown={(e) => e.key === "Enter" && this.getFirebaseData()}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.getFirebaseData()}
            style={{ marginLeft: "20px", minWidth: "100px" }}
          >
            검색
          </Button>
        </div>

        <div
          style={{
            padding: 12,
            borderBottom: "1px solid #eee",
          }}
        >
          {this.userInfo.map((user, index) => (
            <UserInfoComponent
              key={`${user.displayName || user.username}-${index}`}
              user={user}
              index={index}
              changeIntroduction={this.changeIntroduction}
              sumScoreInfo={this.sumScoreInfo}
              changeScoreManual={this.changeScoreManual}
              goPenalty={this.goPenalty}
              confirmAlert={this.confirmAlert}
              onChangeProLevel={() => this.onChangeProLevel(user)}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default inject("MonsterMainStore")(observer(UserInfo));
