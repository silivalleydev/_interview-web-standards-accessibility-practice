import {
  compact,
  countBy,
  filter,
  findLastIndex,
  isArray,
  isEmpty,
  map,
  size,
} from "lodash";
import React, { useEffect, useState } from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  Collapse,
  Grow,
  Link,
  TextField,
} from "@material-ui/core";

import Popper from "@material-ui/core/Popper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";

import TableCell from "@material-ui/core/TableCell";

import { AppliedSeeker } from "../../model/AppliedSeeker";
import { Employer } from "../../model/Employer";
import { Job } from "../../model/Job";

import styled from "styled-components";
import FocusableButton from "../../Components/FocusableButton";
import {
  getApplyList,
  getJobs,
  updateOperationMemoJob,
} from "../../api/jobs";

import { getUsers, updateUserAdminMemo } from "../../api/users";
import LongtermAppliedSeekerList from "./LongtermAppliedSeekerList";
import { getLongtermApplyList, getReportList, stopLongtermJob, updateLongtermJobOperationMemo } from "../../api/longtermJob";
import { getStore } from "../../api/store";
import { formatDaysOfWeek, formatNumberWithComma } from "../../utils/soonUtill";

const DropButton = ({ text, dropEvent, ...props }) => {
  const [{ isOver }, drop] = useDrop({
    accept: "SEEKER",
    drop: dropEvent,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <FocusableButton ref={drop} variant="outlined" {...props} style={{ backgroundColor: isOver ? "red" : "white" }}>
      {text}
    </FocusableButton>
  );
};
const transferHour = (str = '') => {
  if (str) {
    const splited = str.split(':');
    let hour = splited?.[0] || ''
    const min = splited?.[1] || ''

    if (hour.length > 0) {
      let numHour = 0
      numHour = parseInt(hour)
      if (numHour > 24) {
        numHour -= 24
        hour = '오전 ' + numHour
      }
    }
    return `${hour}:${min}`

  } else return ''

}

const useStyle = () => ({
  textField: {
    width: "90%",
    marginLeft: "auto",
    marginRight: "auto",
    paddingBottom: 0,
    marginTop: 0,
    fontWeight: 500,
  },
  input: {
    padding: 4,
    height: 150,
  },
});

const LongtermReservationItem = ({
  data,
  doNotShowHiddenJobByAdmin,
  ReservationStore,
  getLongtermJobInfo
}) => {

  const [open, setOpen] = useState(false);
  const [seekers, setSeekers] = useState<AppliedSeeker[]>([]);

  const [reservationOperationMemo, setOperationMemo] = useState<string>(data?.operationMemo);
  const [processing, setProcessing] = useState(false);
  const [filteredSeekers, setFilteredSeekers] = useState<AppliedSeeker[]>([]);
  const [applySeekers, setApplySeeker] = useState([])
  const [reportList, setReportList] = useState([])
  const [adminNoteForEmployer, setAdminNoteForEmployer] = useState("");
  const [selectedBonusSoon, setSelectedBonusSoon] = useState(0);

  const [isHideReservation, setHideReservation] = useState(false);


  const [employerNameAnchorEl, setEmployerNameAnchorEl] = useState();
  const [storeAnchorEl, setstoreAnchorEl] = useState();
  const [reportAnchorEl, setReportAnchorEl] = useState();
  const [jobEmployer, setJobEmployer] = useState();
  const [storeInfo, setStoreInfo] = useState({});

  const [job, setJob] = useState<Job>();


  const [showingSeekersButtonId, setShowingSeekersButtonId] = useState("");

  const showSeekers = (_bonusSoon: number) => {
    setSelectedBonusSoon(_bonusSoon);
  };

  const applyingSeekers = ({ bonusSoon = 0, bonusSoonIndex = 0 }): AppliedSeeker[] => {
    if (!job) return [];

    if (job.dataVersion) {
      return filter(seekers, (seeker) => seeker.bonusSoon === bonusSoon);
    }

  };
  const handleStopReservation = async () => {
    const result = await stopLongtermJob({
      longTermJobUid: job?.id,
      stopReason: 'ADM'
    })

    if (result?.status === 'OK') {
      alert('모집중지되었습니다.')
      await getLongtermJobInfo()
    } else {
      alert(JSON.stringify(result?.apiError))
    }
  }
  const handleReportList = async () => {
    const result = await getReportList({
      longTermJobUid: job?.id
    })

    if (result?.status === 'OK') {
      const list = result?.dataList?.data || []
      setReportList(list)
    } else {
      alert(JSON.stringify(result?.apiError))
    }
  }

  useEffect(() => {
    if (job) {
      setSeekers(map(job.applySeekers, (seeker) => new AppliedSeeker(seeker)));

    }
  }, [job])

  useEffect(() => {
    if (!processing && job) {
      const seekers = applyingSeekers(
        job.dataVersion ? { bonusSoon: selectedBonusSoon } : { bonusSoonIndex: selectedBonusSoon }
      );
      setFilteredSeekers(seekers);
    }
  }, [processing, job]);

  useEffect(() => {
    if (!isEmpty(showingSeekersButtonId) && job) {
      setOpen(true);
      ReservationStore.setSelectedJob(job);

      const seekers = applyingSeekers(
        job.dataVersion ? { bonusSoon: selectedBonusSoon } : { bonusSoonIndex: selectedBonusSoon }
      );
      setFilteredSeekers(seekers);
    }
  }, [job, showingSeekersButtonId]);




  // const loadOneJob = async (uid, callback) => {
  //   const result = await getJobs({ uid });
  //   let data;
  //   if (result?.data && result?.data.length > 0) {
  //     data = result.data[0];
  //   }
  //   await callback(data);
  // };
  // async function myFunction() {
  //   loadOneJob(data.uid, (ret) => {
  //     if (ret) {
  //       setJob(new Job({ id: ret.uid, ...ret }));
  //     }
  //   });

  // }
  useEffect(() => {
    if (data && data.uid) {
      setJob(data);

      // 1초마다 myFunction()을 호출하는 인터벌 등록
      // const intervalId = setInterval(myFunction, 60000);

      // return () => clearInterval(intervalId);
    }
  }, [data]);
  const loadReservationAppliedSeekers = async (jobId, callback) => {
    const result = await getApplyList({
      jobId,
    });
    let data = [];
    if (result?.data) {
      data = result.data;
    }
    await callback(data);
  };

  useEffect(() => {
    if (jobEmployer) {
      setAdminNoteForEmployer(jobEmployer?.adminMemo);
    }
  }, [jobEmployer]);

  const addMemoForEmployer = async () => {
    if (!job) return;
    setProcessing(true);
    const result = await updateUserAdminMemo({
      uid: job.employerId,
      adminMemo: adminNoteForEmployer,
    });

    if (result.status === "OK") {
      alert("done");
    } else {
      alert("error");
    }
    setProcessing(false);
  };
  // 공고 운영팀메모 저장
  const saveOperationMemo = async () => {
    if (!job) return;
    setProcessing(true);

    const result = await updateLongtermJobOperationMemo({
      longTermJobUid: job.id,
      operationMemo: reservationOperationMemo,
    });

    if (result?.status === "OK") {
      setProcessing(false);
      alert("저장하였습니다.");
      await getLongtermJobInfo()
    } else {
      setProcessing(false);
      alert(JSON.stringify(result?.apiError));
    }
  };

  const reloadJobInfo = () => {
    loadOneJob(data.uid, (ret) => {
      if (ret) {
        ret && setJob(new Job({ id: ret.uid, ...ret }));
      }
    });

    loadReservationAppliedSeekers(data.uid, (ret) => {
      setSeekers(map(ret, (seeker) => new AppliedSeeker(seeker)));
    });
  };

  const hideRowAfterStopingJob = () => {
    window.scrollTo({ left: 0, behavior: "smooth" });
    setHideReservation(true);
  };

  useEffect(() => {
    if (job) {
      const seekers = applyingSeekers(
        job.dataVersion ? { bonusSoon: selectedBonusSoon } : { bonusSoonIndex: selectedBonusSoon }
      );
      setFilteredSeekers(seekers);
    }
  }, [seekers, job])

  const getEmployerById = async (id, callback) => {
    const userResult = await getUsers({
      uid: id,
    });

    if (userResult?.status === "OK") {
      const userData = userResult.data[0];

      const jobsResult = await getJobs({
        employerUid: id,
      });
      if (jobsResult?.status === "OK") {
        const hiringStatus = countBy(compact(map(jobsResult.data, (data) => data.hiringStatus)));
        await callback({ id, ...userData, hiringStatus });
        return { id, ...userData, hiringStatus };
      }
    }

    await callback(null);
    return null;
  };

  const loadEmployer = (e) => {
    if (!job) return;

    setProcessing(true);

    setEmployerNameAnchorEl(employerNameAnchorEl ? null : e.currentTarget);
    getEmployerById(job.employerUid, (ret) => {
      ret && setJobEmployer(new Employer(ret));
      setProcessing(false);
    });
  };


  if (!job) {
    return null;
  }
  const handleCopyClick = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };


  const isHidden = doNotShowHiddenJobByAdmin;
  return (
    !isHideReservation && (
      <DndProvider backend={HTML5Backend}>
        <Grow in={!isHidden} onExited={hideRowAfterStopingJob}>
          <>
            <TableRow>
              {/* 공고등록시간 Cell */}
              <TableCell component="th" scope="row">
                {`${job?.createdAt?.split('T')?.[0]} ${job?.createdAt?.split('T')?.[1]?.split('.')?.[0]}`}
              </TableCell>

              {/* 진행상황 Cell */}
              <TableCell style={{ maxWidth: 250, textAlign: 'center' }}>
                {/* 신고버튼 */}
                <ReportBtn
                  setReportAnchorEl={setReportAnchorEl}
                  reportAnchorEl={reportAnchorEl}
                  handleReportList={handleReportList}
                  reportList={reportList}
                  job={job}
                />
                <div style={{ height: 10 }}></div>
                {/* 진행상황 상태 */}
                <Status jobStatus={job.jobStatus} />
                <div style={{ height: 10 }}></div>
                {/* 모집중지 버튼 */}
                <StopJobBtn jobStatus={job.jobStatus} handleStopReservation={handleStopReservation} />
              </TableCell>

              {/* 점포정보 Cell */}
              <TableCell style={{ minWidth: 150 }}>
                {/* 사장님 정보 링크 버튼 */}
                <EmployerNameLink
                  job={job}
                  loadEmployer={loadEmployer}
                  employerNameAnchorEl={employerNameAnchorEl}
                  setEmployerNameAnchorEl={setEmployerNameAnchorEl}
                  jobEmployer={jobEmployer}
                  processing={processing}
                  adminNoteForEmployer={adminNoteForEmployer}
                  setAdminNoteForEmployer={setAdminNoteForEmployer}
                  addMemoForEmployer={addMemoForEmployer}
                />
                <br />

                {/* 점포정보 */}
                <div>
                  <Button variant="outlined" onClick={async (e) => {
                    try {

                      setStoreInfo({})
                      setstoreAnchorEl(storeAnchorEl ? null : e.currentTarget);
                      const result = await getStore({
                        uid: job?.storeUid
                      })
                      if (result?.status === 'OK') {
                        setStoreInfo(result.data)
                      }

                    } catch (error) {

                    }

                  }} style={{ marginBottom: 8 }}>
                    {`${job?.storeName}(${job?.bizKind}/${job?.bizSubKind})`}
                  </Button>
                  {Boolean(storeAnchorEl) && (
                    <ClickAwayListener onClickAway={() => setstoreAnchorEl(null)}>
                      <Popper open={Boolean(storeAnchorEl)} anchorEl={storeAnchorEl}>
                        <div
                          style={{
                            border: "1px solid",
                            backgroundColor: "#eee",
                            padding: 12,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {processing ? (
                            <CircularProgress />
                          ) : (
                            <>

                              <div>
                                <div>- storeUid : {storeInfo?.uid}</div>

                                <div>- 상점이름 : {storeInfo?.name}</div>

                                <div>- 상점주소 : {storeInfo?.location?.address}</div>

                                <div>- 업종 : {`${storeInfo?.bizKind} / ${storeInfo?.bizSubKind}`}</div>
                              </div>
                            </>
                          )}
                        </div>
                      </Popper>
                    </ClickAwayListener>
                  )}
                </div>
              </TableCell>

              {/* 공고정보 Cell */}
              <TableCell style={{ minWidth: 380 }}>
                <JobInfo
                  job={job}
                  handleCopyClick={handleCopyClick}
                />
              </TableCell>

              {/* 운영팀메모 Cell */}
              <TableCell>
                <TextField
                  rowsMax={5}
                  multiline={true}
                  variant="outlined"
                  value={reservationOperationMemo}
                  onChange={(e) => setOperationMemo(e.target.value)}
                />
                <br />
                <Button variant="outlined" onClick={saveOperationMemo}>
                  저장
                </Button>
              </TableCell>

              {/* 지원자 Cell */}
              <TableCell>
                <DropButton
                  variant="outlined"
                  disabled={job.applyCount === 0}
                  onClick={async () => {
                    if (showingSeekersButtonId === "normal") {
                      setOpen(false);
                      setShowingSeekersButtonId("");
                    } else {
                      const result = await getLongtermApplyList({
                        longTermJobUid: job.id,
                        page: 0,
                        pageSize: 100
                      })

                      if (result?.status === 'OK') {
                        const list = result?.dataList?.data
                        setApplySeeker(list)
                      }

                      showSeekers(0);
                      setShowingSeekersButtonId("normal");
                    }
                  }}
                  text={`${job.applyCount} 명`}
                />
                <br />
              </TableCell>
            </TableRow>

            {/* 지원자 리스트 컨테이너 Section */}
            <Grow in={open}>
              <TableRow
                key={job.id}
                style={{
                  backgroundColor: "#eee",
                  width: "100%",
                }}
              >
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                  <Collapse in={open} timeout="auto">
                    <Box margin={1}>
                      <Table aria-label="purchases">
                        <TableBody>
                          {open && <LongtermAppliedSeekerList
                            loadJob={() => {
                              reloadJobInfo();
                            }}
                            reloadApplyData={async () => {
                              const result = await getLongtermApplyList({
                                longTermJobUid: job.id,
                                page: 0,
                                pageSize: 100
                              })

                              if (result?.status === 'OK') {
                                const list = result?.dataList?.data
                                setApplySeeker(list)
                              }
                            }}
                            key={job.id}
                            seekers={applySeekers}
                            job={job}
                            setJob={setJob}
                          />}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Grow>


          </>
        </Grow>
      </DndProvider>
    )
  );
};

export default inject("ReservationStore")(observer(LongtermReservationItem));

// 신고버튼
const ReportBtn = ({
  setReportAnchorEl,
  reportAnchorEl,
  job,
  handleReportList,
  reportList
}) => {
  return (
    <div>
      <Button color='secondary' variant="outlined" onClick={async (e) => {
        setReportAnchorEl(reportAnchorEl ? null : e.currentTarget)
        await handleReportList()
      }}>
        {`신고 ${job.reportCount}`}
      </Button>
      {Boolean(reportAnchorEl) && (
        <ClickAwayListener onClickAway={() => setReportAnchorEl(false)}>
          <Popper open={Boolean(reportAnchorEl)} anchorEl={reportAnchorEl}>
            <div
              style={{
                border: "1px solid",
                backgroundColor: "#eee",
                padding: 12,
                display: "flex",
                flexDirection: "column",
              }}
            >

              <>
                {reportList.map((report, idx) =>
                  <div style={{ borderTop: '1px solid black', width: 400, padding: 5 }}>
                    {`${idx + 1}`}
                    <div>{`- 신고일 ${report?.createdAt}`} </div>

                    <div>{`- 신고사유 ${report?.reportReason}`} </div>

                    <div>{`- 신고자 UID ${report?.seekerUid}`} </div>
                  </div>
                )}
              </>
            </div>
          </Popper>
        </ClickAwayListener>
      )}
    </div>
  )
}

// 진행상황 상태
const Status = ({
  jobStatus = ''
}) => {
  return (
    <>
      <div style={{ fontWeight: "bold", color: jobStatus === '모집중지' ? 'darkgray' : "blue" }}>{jobStatus}</div>
    </>
  )
}

// 모집중지 버튼
const StopJobBtn = ({
  jobStatus,
  handleStopReservation
}) => {
  return (
    <Button disabled={jobStatus === '모집중지'} onClick={handleStopReservation} variant="outlined" style={{ marginBottom: 8 }}>
      모집중지
    </Button>
  )
}

// 사장님 정보 링크 버튼
const EmployerNameLink = ({
  job,
  loadEmployer,
  employerNameAnchorEl,
  setEmployerNameAnchorEl,
  jobEmployer,
  processing,
  adminNoteForEmployer,
  setAdminNoteForEmployer,
  addMemoForEmployer
}) => {
  const styles = useStyle();

  return (
    <>
      <Button variant="outlined" onClick={loadEmployer} style={{ marginBottom: 8 }}>
        {job?.employerName || ''}
      </Button>
      {Boolean(employerNameAnchorEl) && (
        <ClickAwayListener onClickAway={() => setEmployerNameAnchorEl(null)}>
          <Popper open={Boolean(employerNameAnchorEl)} anchorEl={employerNameAnchorEl}>
            <div
              style={{
                border: "1px solid",
                backgroundColor: "#eee",
                padding: 12,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {processing ? (
                <CircularProgress />
              ) : (
                <>

                  <div>
                    <div>- 이름 : {jobEmployer?.name}</div>

                    <div>- 전화번호 : {jobEmployer?.phoneNumber}</div>

                    <div>- boss UID : {jobEmployer?.id}</div>

                    <div>- 가입일 : {jobEmployer?.registrationDate}</div>

                    <div>- 나이 : {jobEmployer?.age}</div>

                    <div>- 신청횟수 : {jobEmployer?.reservationCount} (피벗 이후부터)</div>

                    <div>- 배정알바수 : {jobEmployer?.hiredSeekersCount} (피벗 이후부터)</div>

                    <div>- 예약취소 : {jobEmployer?.reservationCancelCount} (피벗 이후부터)</div>

                    <div>- 배정취소 : {jobEmployer?.hiringCancelCount} (피벗 이후부터)</div>

                    <div>- 신고 : {jobEmployer?.reportStatus} (피벗 이후부터)</div>
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
                        value={adminNoteForEmployer}
                        onChange={(e) => setAdminNoteForEmployer(e.target.value)}
                        multiline={true}
                        rows={5}
                        classes={{
                          root: styles.input,
                        }}
                      />
                      <Button
                        style={{
                          marginTop: 12,
                          alignSelf: "flex-end",
                        }}
                        variant="outlined"
                        color="default"
                        onClick={addMemoForEmployer}
                        disabled={processing}
                      >
                        {processing ? <CircularProgress size={12} /> : "저장"}
                      </Button>
                    </div>
                  </div>

                </>
              )}
            </div>
          </Popper>
        </ClickAwayListener>
      )}
    </>
  )
}

const JobInfo = ({
  job,
  handleCopyClick
}) => {
  return (
    <>
      {job.id}
      <div style={{ cursor: 'pointer', display: 'inline-block', marginLeft: 5 }} onClick={() => handleCopyClick(job.id)}>
        <ContentCopyIcon color='success' fontSize='small' />
      </div>
      <br />
      {job.jobKind}
      <br />
      {`${job.startTime} ~ ${transferHour(job.endTime)}`}
      <br />
      {`${(formatDaysOfWeek(job?.workDay || []))}`}
      <br />
      {`${(job.salaryType === 1 ? '시급 ' : '월급 ') + formatNumberWithComma(`${job.salary}`)}원`}
    </>
  )
}