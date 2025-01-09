import React, { useState, useEffect, useContext } from "react";
import { map, isEmpty, get } from "lodash";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


import moment from "moment-timezone";

import { useDrag, DragPreviewImage } from "react-dnd";

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
} from "@material-ui/core";

import TableRow from "@material-ui/core/TableRow";
import Popover from "@material-ui/core/Popover";
import TableCell from "@material-ui/core/TableCell";

import { User } from "../../model/User";
import SeekerContext from "./SeekerContext";
import SeekerDialog from "./SeekerDialog";
import { getPrivateImageBo, getUsers, updateKoreanSkills, updateUserAdminMemo, updateUserAdminMemoSpring } from "../../api/users";
import {
  assignJobSeeker,
  reAssignJobSeeker,
} from "../../api/jobs";
import {
  getUserNonMaskingBo,
} from "../../api/appliedSeeker";

const ReservationContext = React.createContext({
  job: null,
  setJob: () => { },
});

const LongtermAppliedSeekerList = ({ job, seekers, setJob, loadJob, reloadApplyData }) => {

  const [inProcessing, setInProcessing] = useState(false);

  return (
    <ReservationContext.Provider
      value={{
        job,
        setJob,
      }}
    >
      {map(seekers, (seeker) => (
        <SeekerItem
          job={job}
          loadJob={loadJob}
          reloadApplyData={reloadApplyData}
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
  const reloadApplyData = data.reloadApplyData;

  const { inProcessing, setInProcessing } = data;

  const { job, setJob } = useContext(ReservationContext);

  const { id, jobKind, employerId } = job;
  const [seekerDetailInfo, setSeekerDetailInfo] = useState<User>({});
  const [openReviews, setOpenReviews] = useState(false);
  const [jobKindReviewRating, setJobKindReviewRating] = useState();

  const [selectedReviews, setSelectedReviews] = useState();
  const [koreanSkillEditAnchorEl, setKoreanSkillEditAnchorEl] = useState(null);

  const [seekerNoteFromAdmin, setSeekerNoteFromAdmin] = useState();
  const [adminMemo, setAdminMemo] = useState(seeker.adminMemo);
  const [koreanSkills, setKoreanSkills] = useState();
  const [tempKoreanSkills, setTempKoreanSkills] = useState();

  const [snapShotSeeker, setSnapshotSeeker] = useState();

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

  // useEffect(() => {
  //   getUserId();

  //   setSelectedReviews(seeker?.data?.reviews);
  // }, [seeker]);

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
  // useEffect(() => {
  //   getUserById(seeker?.data?.seekerUid, (result) => {
  //     const ret = result;
  //     if (ret) {
  //       getIdCardPhotos(ret)
  //       setSeekerDetailInfo(new User(ret));
  //       setKoreanSkills(ret?.koreanSkills);
  //       setTempKoreanSkills(ret?.koreanSkills);
  //     }
  //   });

  //   setSelectedReviews(seeker.reviews);
  // }, [seeker]);

  useEffect(() => {
    if (!jobKindReviewRating && !isEmpty(seekerDetailInfo)) {
      setJobKindReviewRating(seekerDetailInfo.reviewRatingByJobkind(jobKind));
      setAdminMemo(seekerDetailInfo.adminMemo);
    }
  }, [seekerDetailInfo]);


  const seekerReAppy = async () => {
    setInProcessing(true);
    const result = await reAssignJobSeeker({ jobId: job.id, seekerId: seeker.data.seekerUid, isReApply: true });

    if (result?.status === "OK") {
      setInProcessing(false);
      data.loadJob()
      alert("재지원 되었습니다.");
    } else {
      alert("error");
    }
  };
  const requstAssignJobSeeker = async (type, seekerUid, jobId, seekerNoteFromAdmin, callback) => {
    let message = "";
    try {
      const hireSeeker = assignJobSeeker;
      const ret = await hireSeeker({
        type,
        seekerUid,
        jobId,
        seekerNoteFromAdmin,
      });
      if (ret?.status === "OK") {
        message = "hired";
      }
    } catch (ex) {
      console.log(ex);
    }
    await callback(message);
  };
  const hireSeeker = async () => {
    setInProcessing(true);

    try {
      await requstAssignJobSeeker("HIRED", seeker.data.seekerUid, id, seekerNoteFromAdmin, (result) => {
        if (result) {
          setInProcessing(false);
          alert("hired");
          data.loadJob();
        } else {
          alert("error");
          setInProcessing(false);

        }
      });
    } catch (ex) {
      console.log(err);
      alert("error");
      setInProcessing(false);

    }
  };

  const addAdminMemoToSeeker = async () => {
    setInProcessing(true);

    const result = await updateUserAdminMemoSpring({
      userUid: seeker?.seekerUid,
      adminMemo,
      memo: adminMemo,
    });

    if (result.status === "OK") {
      setInProcessing(false);
      alert("저장되었습니다.");
      await reloadApplyData()
    } else {
      setInProcessing(false);

      alert("다시 시도해주세요");
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

  const [seekerName, setSeekerName] = useState(data?.seekerName);
  const [seekerPhoneNumber, setSeekerPhoneNumber] = useState(data?.seekerName);

  //지원한 알바 정보 가져오기
  const handleGetAppliedSeeker = async () => {
    const result = await getUserNonMaskingBo({ uid: seeker?.seekerUid })

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
      <Grow in={true}>
        <TableRow key={seekerDetailInfo.id} style={{ width: "100%" }}>
          <DragPreviewImage
            connect={preview}
            src={seeker?.seekerPhotoUrl || userImage}
            style={{ width: 20, height: 20 }}
          />
          {/* 지원자 이미지 & 지원시간 Cell */}
          <TableCell style={{ width: 230 }}>
            {/* 지원자 이미지 */}
            <img
              style={{ width: 100, height: 100 }}
              src={seeker?.seekerPhotoUrl || userImage}
            />

            {/* 지원 시간 */}
            <div style={{ marginTop: 5 }}>
              <div>지원시간</div>
              {seeker.createdAt ? moment(seeker.createdAt).format("YYYY-MM-DD HH:mm:ss") : ""}
            </div>
          </TableCell>

          {/* 지원자 신상 정보, 한국어 활용 능력 수정, 재지원 Cell */}
          <TableCell style={{ width: 200 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* 지원자 1점 리뷰 존재 여부 */}
              <div style={{ color: "red" }}>{seekerDetailInfo.oneStarReviewCount > 0 && "리뷰 1점 있음"}</div>

              {/* 지원자 이름 버튼 및 마스킹 정보 확인 모달 */}
              <SeekerName
                usernamePopId={usernamePopId}
                handleClick={handleClick}
                seekerDetailInfo={seekerDetailInfo}
                seeker={seeker}
                anchorEl={anchorEl}
                handleClose={handleClose}
                seekerName={seekerName}
                seekerPhoneNumber={seekerPhoneNumber}
                open={open}
              />

              {/* 지원자 성별, 나이, 취사병 경력 등 디테일 정보 */}
              <SeekerDetailInformation
                seeker={seeker}
                seekerDetailInfo={seekerDetailInfo}
              />

              {/* 지원자 한국어 활용 능력 표시 및 수정 버튼 */}
              {!isEmpty(koreanSkills) && (
                <SetupKoreanSkills
                  koreanSkills={koreanSkills}
                  setKoreanSkills={setKoreanSkills}
                  setKoreanSkillEditAnchorEl={setKoreanSkillEditAnchorEl}
                  koreanSkillEditAnchorEl={koreanSkillEditAnchorEl}
                  setTempKoreanSkills={setTempKoreanSkills}
                  seekerDetailInfo={seekerDetailInfo}
                  tempKoreanSkills={tempKoreanSkills}
                  updateSeekerKoreanSkills={updateSeekerKoreanSkills}
                  inProcessing={inProcessing}
                />
              )}

              {/* 지원자 재지원 버튼 */}
              {snapShotSeeker && snapShotSeeker.hiringStatus === "HIRE_CANCEL_SOONY" && (
                <ReApplyBtn
                  seekerReAppy={seekerReAppy}
                  inProcessing={inProcessing}
                />
              )}
            </div>
          </TableCell>

          {/* 지원자 경력, 동일점포 근무이력, 리뷰 횟수, 리뷰 점수 정보 Cell */}
          <TableCell style={{ width: 230 }}>
            {/* 지원자 경력 */}
            경력 {seeker.totalResumeCount}회 - {`"${jobKind}": ${seeker.jobKindResumeCount}`}
            <br />

            {/* 지원자 동일점포 근무이력 */}
            동일점포 근무이력{" "}
            {`갯수 ${seeker.sameStoreResumeCount}`}

            {/* 지원자 리뷰 횟수 */}
            <div>
              {jobKind}리뷰 - {seeker.jobKindReviewCount}회
            </div>

            {/* 지원자 리뷰 점수 */}
            {jobKindReviewRating && !isEmpty(seekerDetailInfo) && (
              <>
                <div>
                  {jobKind} 전문성 {jobKindReviewRating.prof}점
                </div>
                <div>성실성 {seekerDetailInfo.reviewAttitudeAvg}점</div>
              </>
            )}
          </TableCell>

          {/* 지원자 uid, 소개, 스킬, 자격정 정보 Cell */}
          <TableCell style={{ width: 340 }}>
            {/* 지원자 uid */}
            <div style={{ cursor: 'pointer' }} onClick={() => handleCopyClick(seeker?.seekerUid)}>
              uid: {seeker?.seekerUid}
              <ContentCopyIcon color='success' fontSize='small' />
            </div>

            {/* 지원자 소개 */}
            <div>소개: {seeker?.seekerIntroduction}</div>

            {/* 지원자 스킬 */}
            <SeekerSkills seekerDetailInfo={seeker} />

            {/* 지원자 자격증 */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "bold", color: "#0011ff" }}>자격증</span>
              <span style={{ color: "#0011ff" }}>{seeker?.certificates?.reduce((prev, current) => {
                let result = prev || ''
                if (result.length === 0) {
                  result += current.name
                } else {
                  result += ', ' + current.name
                }
                return result
              }, '')}</span>
              <div></div>
            </div>
          </TableCell>

          {/* 어드민 메모 Input Cell */}
          <TableCell style={{ width: 230 }} ref={drag}>
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

          {/* 리뷰/이력 상세보기 버튼 Cell */}
          <TableCell>
            <ReviewNResumeInfoPopupBtn
              setOpenReviews={setOpenReviews}
              openReviews={openReviews}
              selectedReviews={selectedReviews}
              setSelectedReviews={setSelectedReviews}
              seekerDetailInfo={seekerDetailInfo}
              id={id}
              seeker={seeker}
              hireSeeker={hireSeeker}
              inProcessing={inProcessing}
            />
          </TableCell>
        </TableRow>
      </Grow>


    </>
  );
};

export default LongtermAppliedSeekerList;

const SetupKoreanSkills = ({
  koreanSkills,
  setKoreanSkills,
  setKoreanSkillEditAnchorEl,
  koreanSkillEditAnchorEl,
  setTempKoreanSkills,
  seekerDetailInfo,
  tempKoreanSkills,
  updateSeekerKoreanSkills,
  inProcessing
}) => {
  return (
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
  )
}

const SeekerName = ({
  usernamePopId,
  handleClick,
  seekerDetailInfo,
  seeker,
  anchorEl,
  handleClose,
  seekerName,
  seekerPhoneNumber,
  open
}) => {
  return (
    <div>
      <Button aria-describedby={usernamePopId} onClick={handleClick} style={{ right: 10 }}>
        {seeker.seekerName}
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
  )
}

const ReApplyBtn = ({
  seekerReAppy,
  inProcessing
}) => {
  return (
    <div>
      <div style={{ color: "red" }}>신청취소</div>
      <Button variant="outlined" color="secondary" onClick={seekerReAppy} disabled={inProcessing}>
        {inProcessing ? <CircularProgress size={12} /> : "재지원"}
      </Button>
    </div>
  )
}

const SeekerDetailInformation = ({
  seeker,
  seekerDetailInfo
}) => {
  return (
    <>
      <div>
        {seeker?.seekerGender === "M" ? "남" : "여"} -{" "}
        {seeker?.seekerAge}세
      </div>
      <div style={{ height: 5 }}></div>
      <div>{seeker?.seekerPhoneNumber}</div>
      <div style={{ color: "#0011ff" }}>{seekerDetailInfo.armyKitchenPolice}</div>

    </>
  )
}

const SeekerSkills = ({
  seekerDetailInfo
}) => {
  return (
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
        {get(seekerDetailInfo.skills, "사무보조", "") && Object.keys(get(seekerDetailInfo.skills, "사무보조", "")).reduce((prev, current) => {
          const obj = get(seekerDetailInfo.skills, "사무보조", "") || {}

          let result = prev || ''
          if (obj[current]) {
            result += obj[current].map(o => (o.skill + (o.level ? ' - ' + o.level : ''))).join(', ')
          }
          return result
        }, '')}
      </span>
      <span>
        <b>서빙/주방/매장관리: </b>
        {get(seekerDetailInfo.skills, "서빙/주방/매장관리", "") && Object.keys(get(seekerDetailInfo.skills, "서빙/주방/매장관리", "")).reduce((prev, current) => {
          const obj = get(seekerDetailInfo.skills, "서빙/주방/매장관리", "") || {}

          let result = prev || ''
          if (obj[current]) {
            result += obj[current].map(o => (o.skill + (o.level ? ' - ' + o.level : ''))).join(', ')
          }
          return result
        }, '')}
      </span>
      <span>
        <b>단순노무/행사판촉: </b>
        {get(seekerDetailInfo.skills, "단순노무/행사판촉", "") && Object.keys(get(seekerDetailInfo.skills, "단순노무/행사판촉", "")).reduce((prev, current) => {
          const obj = get(seekerDetailInfo.skills, "단순노무/행사판촉", "") || {}

          let result = prev || ''
          if (obj[current]) {
            result += obj[current].map(o => (o.skill + (o.level ? ' - ' + o.level : ''))).join(', ')
          }
          return result
        }, '')}
      </span>
    </div>
  )
}

const ReviewNResumeInfoPopupBtn = ({
  setOpenReviews,
  openReviews,
  selectedReviews,
  setSelectedReviews,
  seekerDetailInfo,
  id,
  seeker,
  hireSeeker,
  inProcessing
}) => {
  return (
    <>
      <Button variant="outlined" onClick={() => setOpenReviews(true)}>
        상세보기
      </Button>
      {/* 상세보기 팝업 */}
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
            seeker={{
              ...seeker,
              id: seeker.seekerUid
            }}
            jobId={id}
            isHired={!isEmpty(seeker.hireCareActions)}
            hireSeeker={hireSeeker}
            processing={inProcessing}
          />
        </SeekerContext.Provider>
      )}
    </>
  )
}