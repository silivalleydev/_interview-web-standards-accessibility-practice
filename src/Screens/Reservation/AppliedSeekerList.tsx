import React, { useState, useEffect, useContext } from "react";
import { map, isEmpty, throttle, get, size, join } from "lodash";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


import moment from "moment-timezone";

import { useDrag, DragPreviewImage } from "react-dnd";

import firebase from "firebase/app";

import {
  Button,
  TextField,
  CircularProgress,
  Grow,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import Popover from "@material-ui/core/Popover";
import TableCell from "@material-ui/core/TableCell";

import { User } from "../../model/User";
import { Job } from "../../model/Job";
import SeekerContext from "./SeekerContext";
import SeekerDialog from "./SeekerDialog";
import NoBorderTableCell from "../../Components/NoBorderTableCell";
import { getPrivateImageBo, getUsers, updateKoreanSkills, updateUserAdminMemo } from "../../api/users";
import {
  assignJobSeeker,
  assignJobSeekerSpring,
  changeSalaryBonusSoon,
  reAssignJobSeeker,
  restoreApply,
  sendAdminMessageToSeeker,
  updateJobApply,
} from "../../api/jobs";
import {
  sendFailResultToSeeker,
  recoverSeekerHiringStatus,
  getApplidSeekerListBo,
  getUserNonMaskingBo,
} from "../../api/appliedSeeker";
moment.tz("Asia/Seoul");
moment.locale("ko");

const ReservationContext = React.createContext({
  job: null,
  setJob: () => { },
});

const AppliedSeekerList = ({ job, seekers, setJob, loadJob }) => {
  const {
    ageRequirements = {},
    genderRequirements = {},
    extraRequirements = {},
    moreInfo = {},
    jobStatus,
  } = job.original;
  const { idCard, alumni, assistant, basicEducated, healthInsurance, noForeigner } = extraRequirements;
  const [inProcessing, setInProcessing] = useState(false);

  const colors = {
    PREFERED: "#5740e0",
    REQUIRED: "red",
  };

  const statuses = {
    PREFERED: "필수아님",
    REQUIRED: "필수",
  };

  const { isIgnoreAge, otherAgeRangesAllow, preferAgeRanges, teenAgeAllowed } = ageRequirements;
  const { isIgnoreGender, otherGenderAllow, preferGender } = genderRequirements;
  const [pushSending, setPushSending] = useState(false);

  const sendPushToOtherAges = async () => {
    setPushSending(true);
    try {
      const sendPushToOtherAges = firebase.functions().httpsCallable("sendPushToOtherAges");
      await sendPushToOtherAges({ jobId: job.id });
    } catch (ex) {
      console.log("sendPushToOtherAges", ex);
    }
    setPushSending(false);
  };

  const sendPushToOtherGender = async () => {
    setPushSending(true);
    try {
      const sendPushToOtherAges = firebase.functions().httpsCallable("sendPushToOtherGender");
      await sendPushToOtherAges({ jobId: job.id });
    } catch (ex) {
      console.log("sendPushToOtherGender", ex);
    }
    setPushSending(false);
  };

  return (
    <ReservationContext.Provider
      value={{
        job,
        setJob,
      }}
    >
      {!isEmpty(ageRequirements) && (
        <TableRow>
          <TableCell>
            •성별
            {isIgnoreGender ? (
              "상관없음"
            ) : (
              <div>
                {preferGender}{" "}
                <span style={{ color: otherGenderAllow ? "#5740e0" : "red" }}>
                  {otherGenderAllow ? "필수아님" : "필수"}
                </span>
              </div>
            )}
            {!isIgnoreGender && !otherGenderAllow && jobStatus === "SEARCHING" && (
              <Button
                variant="outlined"
                onClick={throttle(sendPushToOtherGender, 2000, {
                  trailing: false,
                })}
                disabled={pushSending}
              >
                {pushSending ? <CircularProgress color="primary" size={20} /> : "다른 성별 push"}
              </Button>
            )}
          </TableCell>

          <TableCell>
            •나이
            {isIgnoreAge ? (
              "상관없음"
            ) : (
              <div>
                {preferAgeRanges
                  ? preferAgeRanges?.startAge && preferAgeRanges?.endAge
                    ? `${preferAgeRanges?.startAge}세 ~ ${preferAgeRanges?.endAge}세`
                    : join(preferAgeRanges)
                  : ""}{" "}
                <span style={{ color: otherAgeRangesAllow ? "#5740e0" : "red" }}>
                  {otherAgeRangesAllow ? "필수아님" : "필수"}
                </span>
              </div>
            )}
            {!isIgnoreAge && !otherAgeRangesAllow && jobStatus === "SEARCHING" && (
              <Button
                variant="outlined"
                onClick={throttle(sendPushToOtherAges, 2000, {
                  trailing: false,
                })}
                disabled={pushSending}
              >
                {pushSending ? <CircularProgress color="primary" size={20} /> : "다른 나이 push"}
              </Button>
            )}
          </TableCell>

          <TableCell>
            •신분증 필요
            <div>{idCard === "NONE" ? "X" : "O"}</div>
          </TableCell>

          <TableCell>
            •보건증 필요
            {healthInsurance === "NONE" ? (
              <div>X</div>
            ) : (
              <div>
                O <span style={{ color: colors[`${healthInsurance}`] }}>{statuses[`${healthInsurance}`]}</span>
              </div>
            )}
          </TableCell>

          {job.jobKind === "단순노무" && (
            <TableCell>
              •기초안전보건교육
              {basicEducated === "NONE" ? (
                <div>X</div>
              ) : (
                <div>
                  O <span style={{ color: colors[`${basicEducated}`] }}>{statuses[`${basicEducated}`]}</span>
                </div>
              )}
            </TableCell>
          )}

          <TableCell>
            •초보 가능
            <div>{assistant === "NONE" ? "O" : "X"}</div>
          </TableCell>

          <TableCell>
            •동일 업종 경력 필요
            {alumni === "NONE" ? (
              <div>X</div>
            ) : (
              <div>
                O <span style={{ color: colors[`${alumni}`] }}>{statuses[`${alumni}`]}</span>
              </div>
            )}
          </TableCell>

          <TableCell>
            •외국인 불가
            {noForeigner === "NONE" ? (
              <div>X</div>
            ) : (
              <div>
                O <span style={{ color: colors[`${noForeigner}`] }}>{statuses[`${noForeigner}`]}</span>
              </div>
            )}
          </TableCell>

          {!isEmpty(moreInfo.additionalExplain) && (
            <TableCell>
              •필요정보 <div>{moreInfo.additionalExplain}</div>
            </TableCell>
          )}
        </TableRow>
      )}
      {map(seekers, (seeker) => (
        <SeekerItem
          loadJob={loadJob}
          inProcessing={inProcessing}
          setInProcessing={setInProcessing}
          key={seeker?.data?.seekerUid + seeker.hiringStatus}
          seeker={seeker}
          loadingReview={open}
        />
      ))}
    </ReservationContext.Provider>
  );
};

const SeekerItem = (data) => {

  const seeker = data.seeker;

  const { inProcessing, setInProcessing } = data;

  const { job, setJob } = useContext(ReservationContext);

  const { id, jobKind, employerId } = job;
  const [seekerDetailInfo, setSeekerDetailInfo] = useState<User>({});
  const [openReviews, setOpenReviews] = useState(false);
  const [jobKindReviewRating, setJobKindReviewRating] = useState();
  const [messageToSeeker, setMessageToSeeker] = useState("알바매칭어플 쑨입니다.");
  const [messageToSeeker2, setMessageToSeeker2] = useState("알바매칭어플 쑨입니다.");

  const [onGoingJobs, setOnGoingJobs] = useState(null);

  const [selectedReviews, setSelectedReviews] = useState();
  const [smsAnchorEl, setSmsAnchorEl] = useState(null);
  const [smsAnchorEl2, setSmsAnchorEl2] = useState(null);
  const [assignAnchorEl, setAssignAnchorEl] = useState(null);
  const [koreanSkillEditAnchorEl, setKoreanSkillEditAnchorEl] = useState(null);

  const [seekerNoteFromAdmin, setSeekerNoteFromAdmin] = useState();
  const [adminMemo, setAdminMemo] = useState();
  const [koreanSkills, setKoreanSkills] = useState();
  const [tempKoreanSkills, setTempKoreanSkills] = useState();

  const [snapShotSeeker, setSnapshotSeeker] = useState();

  const [bonusSoonSuggestionEditable, setBonusSoonSuggestionEditable] = useState(false);
  const [bonusSoonSuggestion, setBonusSoonSuggestion] = useState();

  const [salarySuggestionEditable, setSalarySuggestionEditable] = useState(false);
  const [salarySuggestion, setSalarySuggestion] = useState();

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "SEEKER",
    item: { seekerId: seeker.seekerUid, jobId: id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));


  useEffect(() => {
    setSnapshotSeeker(seeker.data)
  }, [])



  const getUserId = async () => {
    const getUserInfo = getUsers;
    const result = await getUserInfo({
      uid: seeker?.data?.seekerUid,
    });
    const ret = result.data?.[0];

    if (ret.uid) {
      setSeekerDetailInfo(new User(ret));
      setKoreanSkills(ret?.koreanSkills);
      setTempKoreanSkills(ret?.koreanSkills);
    }
  };

  useEffect(() => {
    getUserId();

    setSelectedReviews(seeker?.data?.reviews);
  }, [seeker]);

  /**
   * origin
   */
  const getUserById = async (id, callback) => {
    const result = await getUsers({ uid: id });

    if (result?.status === "OK" && result?.data?.length > 0) {
      const userData = result.data[0];
      await callback({ id: userData.uid, ...userData });
      return { id: userData.uid, ...userData };
    } else {
      await callback({});
      return {};
    }
  };
  const [userImage, setUserImage] = useState('')
  const getIdCardPhotos = (user = {}) => {

    if (user.photo || user.photo?.objectKey) {
      getPrivateImageBo(user?.photo?.objectKey)
        .then((result) => {
          if (result.status === "OK") {
            setUserImage(result.data)
          }
        })
        .catch((err) => console.log(err));
    }
  };
  useEffect(() => {
    getUserById(seeker?.data?.seekerUid, (result) => {
      const ret = result;
      if (ret) {
        getIdCardPhotos(ret)
        setSeekerDetailInfo(new User(ret));
        setKoreanSkills(ret?.koreanSkills);
        setTempKoreanSkills(ret?.koreanSkills);
      }
    });

    setSelectedReviews(seeker.reviews);
    getOnGoingJobs(seeker?.data?.seekerUid);
  }, [seeker]);

  useEffect(() => {
    if (!jobKindReviewRating && !isEmpty(seekerDetailInfo)) {
      setJobKindReviewRating(seekerDetailInfo.reviewRatingByJobkind(jobKind));
      setAdminMemo(seekerDetailInfo.adminMemo);
    }
  }, [seekerDetailInfo]);

  const getOnGoingJobs = async (seekerUid) => {
    try {
      const result = await getApplidSeekerListBo({ seekerUid: seekerUid });
      if (result.status === "OK") {
        setOnGoingJobs(result.data);
      }
    } catch (ex) {
      console.log(ex);
    }
  };

  const seekerReAppy = async () => {
    setInProcessing(true);

    // const result = await reAssignJobSeeker({ jobId: job.id, seekerId: seeker.data.seekerUid, isReApply: true });
    const result = await restoreApply({ jobUid: job.id, seekerUid: seeker.data.seekerUid });

    if (result?.status === "OK") {
      setInProcessing(false);
      data.loadJob()
      alert("재지원 되었습니다.");
    } else {
      alert("error");
    }
  };
  const requstAssignJobSeeker = async (seekerUid, jobUid, seekerNoteFromAdmin, priorityType, callback) => {
    let message = "";
    try {
      const ret = await assignJobSeekerSpring({
        seekerUid,
        jobUid,
        seekerNoteFromAdmin,
        assignType: "ADM"
      });
      if (ret?.status === "OK") {
        message = "hired";
      } else {
        if (ret?.apiError?.message
        ) {
          alert(ret?.apiError?.message)
        } else {
          alert(ret?.status)

        }
      }
    } catch (ex) {
      console.log(ex);
    }
    await callback(message);
  };
  const hireSeeker = async () => {
    setInProcessing(true);
    try {
      await requstAssignJobSeeker(seeker.data.seekerUid, id, seekerNoteFromAdmin, seeker?.priorityType, (result) => {
        if (result) {
          setInProcessing(false);
          setAssignAnchorEl(null);

          alert("hired");
          data.loadJob();
        } else {
          setInProcessing(false);
          setAssignAnchorEl(null);
        }
      });
    } catch (ex) {
      console.log(err);
      alert("error");
      setInProcessing(false);
      setAssignAnchorEl(null);
    }
  };

  const addAdminMemoToSeeker = async () => {
    setInProcessing(true);

    const result = await updateUserAdminMemo({
      uid: seeker?.data?.seekerUid,
      adminMemo,
    });

    if (result.status === "OK") {
      setInProcessing(false);

      alert("저장되었습니다.");
    } else {
      setInProcessing(false);

      alert("다시 시도해주세요");
    }
  };

  useEffect(() => {
    if (smsAnchorEl2) {
      let dateStr;
      if (job?.startDate) {
        const splitStr = job?.startDate.split(".");
        dateStr = `${splitStr[0]}년 ${splitStr[1]}월 ${splitStr[2]}일`;
      }
      const REPARATIONS_SMS_TEMP = `안녕하세요 쑨 입니다,
${seeker?.data?.seeker?.username}님의 무단 결근 및 근무 취소로 당사에 발생한 손해에 대한 배상을 청구드립니다.
아래 입금기한내 배상하지 않을 시, 소액사건 심판법에 따라 소송을 진행합니다.
소송시, 기존 배상금액에 더해 발생한 소송비용 및 법정이율에 의한 이자가 추가로 청구됩니다.
또한 기한 내 미납 시 향후 배정에 영향을 미칠 수 있으며, 추후  앱 이용이 제한될 수 있음을 알려드립니다.
- 근무취소/무단결근 근무  :  ${job?.storeName} 점포 ${dateStr} ${job?.startTime + "~" + job?.endTime} ${job?.jobKind.replace('‧', '·')} 공고
- 배상액 : 0,000원
- 입금계좌 : 기업은행 064-132951-04-010 (예금주 : 주식회사 크몽)
- 입금기한 : ${moment().add(30, "d").format("YYYY년 MM월 DD일")}
${seeker?.data?.seeker?.username} 님 이름으로 배상액 입금 시 자동으로 납부 확인되며, 추가 문의는 채널톡 상담을 통해 가능합니다.
감사합니다.
`;
      setMessageToSeeker2(REPARATIONS_SMS_TEMP);
    }
  }, [smsAnchorEl2]);

  const sendMessageToSeeker = async (messageToSeeker: string) => {
    setInProcessing(true);

    setInProcessing(false);
    setSmsAnchorEl(null);
    setSmsAnchorEl2(null);

    const result = await sendAdminMessageToSeeker({
      jobId: id,
      seekerId: seeker?.data?.seekerUid,
      content: messageToSeeker,
      title: smsAnchorEl2 ? "[soon] 무단결근(근무취소) 손해배상 안내" : "",
    });

    if (result?.status === "OK") {
      alert("전송 완료");
    } else {
      alert("전송 실패");
    }
  };

  // 불합격 

  const handleSendFailResultToSeeker = async () => {
    setInProcessing(true);


    const result = await sendFailResultToSeeker({
      jobId: id,
      seekerId: seeker?.data?.seekerUid,
    });


    if (result.status === "OK") {
      setInProcessing(false);
      getUserId();
      data.loadJob();
      return alert("불합격 처리 되었습니다.");

    }
    setInProcessing(false);
  };

  const onClickRecoverSeekerHiringStatus = async () => {
    setInProcessing(true);

    //복구

    const result = await restoreApply({
      jobUid: id,
      seekerUid: seeker?.data?.seekerUid,
    });

    if (result.status === "OK") {
      setInProcessing(false);

      alert("복구되었습니다.");
      data.loadJob();
      getUserId();

    } else {
      setInProcessing(false);

      alert(`복구 오류: ${result.message}`);
    }
  };

  const updateSeekerKoreanSkills = async () => {
    setInProcessing(true);

    const result = await updateKoreanSkills({
      uid: seeker?.data?.seekerUid,
      koreanSkills: tempKoreanSkills,
    });

    if (result.status === "OK") {
      setInProcessing(false);
      setKoreanSkills(tempKoreanSkills);
      setKoreanSkillEditAnchorEl(null);
      data.loadJob();
      alert("success");
    }
  };

  const changeBonusSoon = async (bonusSoon: number) => {
    setInProcessing(true);

    if (+bonusSoon < 0) {
      alert("check the value");
      return;
    }

    const result = await changeSalaryBonusSoon({
      jobId: id,
      seekerId: seeker?.data?.seekerUid,
      bonusSoon: +bonusSoon,
    });

    if (result.status === "OK") {
      setInProcessing(false);
      alert("done");
    }

    setInProcessing(false);
  };

  const [seekerName, setSeekerName] = useState("");
  const [seekerPhoneNumber, setSeekerPhoneNumber] = useState("");

  //지원한 알바 정보 가져오기
  const handleGetAppliedSeeker = async () => {
    const result = await getUserNonMaskingBo({ uid: seeker?.data?.seekerUid })

    if (result.status === "OK") {
      setSeekerName(result.data.username);
      setSeekerPhoneNumber(result.data.phoneNumber);
    }
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    handleGetAppliedSeeker();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };



  const open = Boolean(anchorEl);
  const usernamePopId = open ? "simple-popover" : undefined;

  const handleCopyClick = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <>
      {map(onGoingJobs, (job) => {
        const parsedJob = new Job(job);
        return (
          <Grow in={!!parsedJob} key={job.id}>
            <TableRow>
              <NoBorderTableCell>{parsedJob.storeName}</NoBorderTableCell>
              <NoBorderTableCell>
                {parsedJob.startDate} ~ {parsedJob.workPeriod}
              </NoBorderTableCell>
              <NoBorderTableCell>
                {parsedJob.startTime} ~ {parsedJob.endTime}
              </NoBorderTableCell>
              <NoBorderTableCell>{parsedJob.jobKind}</NoBorderTableCell>
              <NoBorderTableCell>{parsedJob.storeAddress}</NoBorderTableCell>
            </TableRow>
          </Grow>
        );
      })}
      {false ? (
        <TableRow>
          <TableCell colSpan={7}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <Skeleton variant="circle" animation="wave" width={100} height={100} />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  marginLeft: 24,
                }}
              >
                <Skeleton animation="wave" width="100%" />
                <Skeleton animation="wave" width="100%" />
                <Skeleton animation="wave" width="100%" />
                <Skeleton animation="wave" width="100%" />
                <Skeleton animation="wave" width="100%" />
              </div>
            </div>
          </TableCell>
        </TableRow>
      ) : (
        <Grow in={true}>
          <TableRow key={seekerDetailInfo.id} style={{ width: "100%" }}>
            <DragPreviewImage
              connect={preview}
              src={seeker?.data?.seeker?.photo?.originalPhotoURL || userImage}
              style={{ width: 20, height: 20 }}
            />
            <TableCell>
              <img
                style={{ width: 100, height: 100 }}
                src={seeker?.data?.seeker?.photo?.originalPhotoURL || userImage}
              />
              <div style={{ marginTop: 5 }}>
                <div>지원시간</div>
                {seeker.data?.createdAt ? moment(seeker.data.createdAt).format("YYYY-MM-DD HH:mm:ss") : ""}
              </div>
              {/* {job.jobStatus == 'SEARCHING' && ( */}
              <FormControl style={{ width: "100%", marginTop: 16 }}>
                <InputLabel id="bonus_soon_change_label">Send to</InputLabel>
                <Select
                  labelId="bonus_soon_change_label"
                  // value={''}
                  onChange={(e) => changeBonusSoon(e.target.value)}
                  disabled={inProcessing}
                >
                  {/* <MenuItem value={0}>bonusSoon: 0</MenuItem> */}
                  {map(
                    job.bonusSoon,
                    (bonusSoon) =>
                      bonusSoon !== seeker.bonusSoon && <MenuItem value={bonusSoon}>bonusSoon: {bonusSoon}원</MenuItem>
                  )}
                </Select>
              </FormControl>
              {/* )} */}
            </TableCell>
            <TableCell>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ color: "red" }}>{seekerDetailInfo.oneStarReviewCount > 0 && "리뷰 1점 있음"}</div>
                {/* 이름, 전화번호 팝업 */}
                <div>
                  <Button aria-describedby={usernamePopId} onClick={handleClick} style={{ right: 10 }}>
                    {seekerDetailInfo.name || seeker?.data?.seeker?.username}
                  </Button>
                  <Popover
                    id={usernamePopId}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                  >
                    <div style={{ padding: 10 }}>
                      <div style={{ fontSize: 16 }}>{seekerName}</div>
                      <div style={{ height: 10 }}></div>
                      <div style={{ fontSize: 16 }}>{seekerPhoneNumber}</div>
                    </div>
                  </Popover>
                </div>
                <div>
                  {seeker?.data?.seeker?.gender === "M" ? "남" : "여"} -{" "}
                  {seekerDetailInfo.age || seeker?.data?.seeker?.age}세
                  {/* 여기 */}
                  ({seekerDetailInfo.birthDate || ''})

                </div>
                <div style={{ height: 5 }}></div>
                <div>{seeker?.data?.seeker?.phoneNumber}</div>

                <div style={{ color: "#0011ff" }}>{seekerDetailInfo.armyKitchenPolice}</div>

                {!isEmpty(koreanSkills) && (
                  <div>
                    <div style={{ color: "#0011ff" }}>{koreanSkills}</div>

                    <Button variant="outlined" onClick={(e) => setKoreanSkillEditAnchorEl(e.target)}>
                      수정
                    </Button>
                    <Popover
                      open={!!koreanSkillEditAnchorEl}
                      onClose={() => {
                        setKoreanSkillEditAnchorEl(null);
                        setKoreanSkills(seekerDetailInfo.koreanSkills);
                        setTempKoreanSkills(seekerDetailInfo.koreanSkills);
                      }}
                      anchorEl={koreanSkillEditAnchorEl}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          padding: 20,
                        }}
                      >
                        <FormControl>
                          <FormLabel id="seeker-korean-skills-editor">의사소통 능력</FormLabel>
                          <RadioGroup
                            aria-labelledby="seeker-korean-skills-editor"
                            defaultValue={tempKoreanSkills}
                            onChange={(e, value) => setTempKoreanSkills(value)}
                            name="radio-buttons-group"
                          >
                            <FormControlLabel value="전혀 문제 없어요" control={<Radio />} label="전혀 문제 없어요" />
                            <FormControlLabel
                              value="의사소통은 가능하나, 외국인 억양 있어요"
                              control={<Radio />}
                              label="의사소통은 가능하나, 외국인 억양 있어요"
                            />
                            <FormControlLabel
                              value="간단한 의사소통은 가능해요"
                              control={<Radio />}
                              label="간단한 의사소통은 가능해요"
                            />
                            <FormControlLabel
                              value="의사소통이 어려워요"
                              control={<Radio />}
                              label="의사소통이 어려워요"
                            />
                          </RadioGroup>
                        </FormControl>
                        <Button variant="contained" onClick={updateSeekerKoreanSkills} disabled={inProcessing}>
                          {inProcessing ? <CircularProgress size={12} /> : "저장"}
                        </Button>
                      </div>
                    </Popover>
                  </div>
                )}
                {/* <div>
                  {snapShotSeeker && snapShotSeeker.hiringStatus === "HIRE_CANCEL_SOONY" && (
                    <>
                      <div style={{ color: "red" }}>신청취소</div>
                      <Button variant="outlined" color="secondary" onClick={seekerReAppy} disabled={inProcessing}>
                        {inProcessing ? <CircularProgress size={12} /> : "재지원"}
                      </Button>
                    </>
                  )}
                </div> */}
              </div>
            </TableCell>
            <TableCell>
              <div style={{ color: 'red', fontWeight: 'bold' }}>
                {seeker?.priorityType === 'WNT' ? '우선배정 알바' : ''}
              </div>
              경력 {seekerDetailInfo.resumeCount}회 - {seekerDetailInfo.resumeCountByJobKinds}
              <br />
              동일점포 근무이력{" "}
              {!isEmpty(seekerDetailInfo) && JSON.stringify(seekerDetailInfo.reviewCountByEmployer(employerId))}
              <div>
                {jobKind}리뷰 - {jobKindReviewRating && jobKindReviewRating.count}회
              </div>
              {jobKindReviewRating && !isEmpty(seekerDetailInfo) && (
                <>
                  <div>
                    {jobKind} 전문성 {jobKindReviewRating.prof}점
                  </div>
                  <div>성실성 {seekerDetailInfo.reviewAttitudeAvg}점</div>
                </>
              )}
            </TableCell>

            <TableCell style={{ maxWidth: 300 }}>
              <div style={{ cursor: 'pointer' }} onClick={() => handleCopyClick(seeker?.data?.seekerUid)}>
                uid: {seeker?.data?.seekerUid} <ContentCopyIcon color='success' fontSize='small' />
              </div>

              <div>소개: {seekerDetailInfo.introduction}</div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 24,
                }}
              >
                <b>
                  스킬<span style={{ fontSize: 20 }}>&#128071;</span>
                </b>
                <span>
                  <b>사무보조 : </b>
                  {get(seekerDetailInfo.skills, "사무보조", "")}
                </span>
                <span>
                  <b>서빙/주방/매장관리: </b>
                  {get(seekerDetailInfo.skills, "서빙/주방/매장관리", "")}
                </span>
                <span>
                  <b>단순노무/행사판촉: </b>
                  {get(seekerDetailInfo.skills, "단순노무/행사판촉", "")}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "bold", color: "#0011ff" }}>자격증</span>
                <span style={{ color: "#0011ff" }}>{seekerDetailInfo.certificateToString}</span>
                <div></div>
              </div>
            </TableCell>

            <TableCell ref={drag}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 24,
                }}
              >
                <TextField
                  style={{ flex: 1 }}
                  variant="outlined"
                  value={adminMemo}
                  onChange={(e) => setAdminMemo(e.target.value)}
                  multiline={true}
                  rows={2}
                />
                <Button
                  style={{ marginTop: 24 }}
                  variant="outlined"
                  color="default"
                  onClick={addAdminMemoToSeeker}
                  disabled={inProcessing}
                >
                  {inProcessing ? <CircularProgress size={12} /> : "저장"}
                </Button>
              </div>
            </TableCell>

            <TableCell>
              <Button variant="outlined" onClick={() => setOpenReviews(true)}>
                상세보기
              </Button>
            </TableCell>

            <TableCell>
              <div>{seeker.adminSMSSent || (messageToSeeker !== "알바매칭어플 쑨입니다." ? messageToSeeker : "")}</div>
              <div style={{ marginBottom: 10 }}>
                <Button variant="outlined" color="default" onClick={(e) => setSmsAnchorEl2(e.currentTarget)}>
                  배상문자보내기
                </Button>
                <Popover
                  open={!!smsAnchorEl2}
                  anchorEl={smsAnchorEl2}
                  onClose={() => setSmsAnchorEl2(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <div
                    style={{
                      padding: 24,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography>배상문자보내기</Typography>
                      <TextField
                        style={{ width: 600 }}
                        value={messageToSeeker2}
                        onChange={(e) => setMessageToSeeker2(e.target.value)}
                        multiline
                      // rows={5}
                      />
                    </div>
                    <Button variant="outlined" onClick={() => sendMessageToSeeker(messageToSeeker2)}>
                      {inProcessing ? <CircularProgress size={16} /> : "문자보내기"}
                    </Button>
                  </div>
                </Popover>
              </div>
              <div style={{ marginBottom: 10 }}>
                <Button variant="outlined" color="default" onClick={(e) => setSmsAnchorEl(e.currentTarget)}>
                  문자보내기
                </Button>
                <Popover
                  open={!!smsAnchorEl}
                  anchorEl={smsAnchorEl}
                  onClose={() => setSmsAnchorEl(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <div
                    style={{
                      padding: 24,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography>문자</Typography>
                      <TextField
                        value={messageToSeeker}
                        onChange={(e) => setMessageToSeeker(e.target.value)}
                        multiline
                        rows={5}
                      />
                    </div>
                    <Button variant="outlined" onClick={() => sendMessageToSeeker(messageToSeeker)}>
                      {inProcessing ? <CircularProgress size={16} /> : "문자보내기"}
                    </Button>
                  </div>
                </Popover>
              </div>
              <br />
              <div></div>
              {!job.isHiredSeeker && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={(e) => setAssignAnchorEl(e.currentTarget)}
                    disabled={
                      inProcessing || !isEmpty(snapShotSeeker ? snapShotSeeker.hiringStatus : seeker.hiringStatus)
                    }
                  >
                    {inProcessing ? (
                      <CircularProgress size={16} />
                    ) : !isEmpty(snapShotSeeker ? snapShotSeeker.hiringStatus : seeker.hiringStatus) ? (
                      "배정완료"
                    ) : (
                      "배정하기"
                    )}
                  </Button>
                  <p>{seeker.seekerNoteFromAdmin}</p>
                </>
              )}
              <Popover
                anchorEl={assignAnchorEl}
                open={!!assignAnchorEl}
                onClose={() => setAssignAnchorEl(null)}
                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
              >
                <div style={{ padding: 24 }}>
                  <h3>알바 배정하기</h3>
                  <TextField
                    multiline={true}
                    rows={5}
                    placeholder="배정매니저 한마디 작성"
                    value={seekerNoteFromAdmin}
                    onChange={(e) => setSeekerNoteFromAdmin(e.target.value)}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 12,
                    }}
                  >
                    <Button variant="outlined" style={{ marginRight: 16 }} onClick={() => setAssignAnchorEl(null)}>
                      취소
                    </Button>

                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={throttle(hireSeeker, 2000, { trailing: false })}
                      disabled={inProcessing}
                    >
                      {inProcessing ? (
                        <CircularProgress size={16} />
                      ) : !isEmpty(snapShotSeeker ? snapShotSeeker.hiringStatus : seeker.hiringStatus) ? (
                        "배정완료"
                      ) : (
                        "배정하기"
                      )}
                    </Button>
                  </div>
                </div>
              </Popover>
              <div>{snapShotSeeker ? snapShotSeeker.hiringStatus : seeker.hiringStatus}</div>
              {snapShotSeeker && snapShotSeeker.hiringStatus === "HIRE_CANCEL_SOONY" && (
                <div style={{ color: "red" }}>신청취소</div>
              )}
            </TableCell>
            {!!snapShotSeeker && (
              <TableCell>






                {snapShotSeeker.hiringStatus === "HIRED_OTHER"
                  || snapShotSeeker.hiringStatus === "HIRE_CANCEL_ADMIN"
                  || snapShotSeeker.hiringStatus === "HIRE_CANCEL_EMPLOYER"
                  || snapShotSeeker.hiringStatus === "HIRE_CANCEL_SOONY"
                  || snapShotSeeker.hiringStatus === "REGISTER_CANCEL_SOONY"
                  ? (
                    <Button variant="outlined" onClick={onClickRecoverSeekerHiringStatus}>
                      {inProcessing ? <CircularProgress size={16} /> : "지원정보 초기화"}
                    </Button>
                  ) : (
                    <Button variant="outlined" onClick={handleSendFailResultToSeeker}>
                      {inProcessing ? <CircularProgress size={16} /> : "불합격"}
                    </Button>
                  )}
              </TableCell>
            )}
          </TableRow>
        </Grow>
      )}

      {openReviews && (
        <SeekerContext.Provider
          value={{
            selectedReviews,
            setSelectedReviews,
          }}
        >
          <SeekerDialog
            open={openReviews}
            close={() => setOpenReviews(false)}
            seeker={seekerDetailInfo}
            jobId={id}
            isHired={!isEmpty(seeker.hireCareActions)}
            hireSeeker={hireSeeker}
            processing={inProcessing}
          />
        </SeekerContext.Provider>
      )}
    </>
  );
};

export default AppliedSeekerList;
