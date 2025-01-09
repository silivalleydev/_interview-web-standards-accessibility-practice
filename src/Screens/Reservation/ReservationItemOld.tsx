import {
  compact,
  countBy,
  filter,
  find,
  findIndex,
  findLastIndex,
  includes,
  indexOf,
  isArray,
  isEmpty,
  isNumber,
  keys,
  map,
  range,
  size,
  sortBy,
  throttle,
  toInteger,
  values
} from "lodash";
import React, { useEffect, useState } from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import moment from "moment-timezone";
moment.tz("Asia/Seoul");
moment.locale("ko");

import firebase from "firebase/app";
import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  ClickAwayListener,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grow,
  IconButton,
  Link,
  TextField,
} from "@material-ui/core";

import Popover from "@material-ui/core/Popover";
import Popper from "@material-ui/core/Popper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import CreateIcon from "@material-ui/icons/Create";

import TableCell from "@material-ui/core/TableCell";

import { AppliedSeeker } from "../../model/AppliedSeeker";
import { Employer } from "../../model/Employer";
import { Job } from "../../model/Job";

import styled from "styled-components";
import FocusableButton from "../../Components/FocusableButton";
import ReportButton from "../../Screens/Reservation/ReportButton";
import {
  cancelHiredSeeker,
  changeSalaryBonusSoon,
  changeSeekerFromAbsentToReportOnlyStatusReq,
  changeSeekerStatusToReportReq,
  createBonusSoon,
  getApplyList,
  getJobs,
  getReviewBo,
  manualProcessPayment,
  reAssignJobSeeker,
  stopReservation,
  updateAdminNoteJob,
  updateMarkAsHiddenRegistration,
  updateOperationMemoJob,
  updateSeekerAssigningTime,
} from "../../api/jobs";
import { getReportByJobId, getSameJobsById, processRemainingRefund } from "../../api/reservationItem";
import { getUsers, updateUserAdminMemo } from "../../api/users";
import utils from "../../utils/utils";
import AppliedSeekerList from "./AppliedSeekerList";
import BonusSoonDialog from "./BonusSoonDialog";
import JobRegistrationDialog from "./JobRegistrationDialog";
import Refund from "./Refund";
import RegistrationRefund from "./RegistrationRefund";

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

const HorizontalDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

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

const ReservationItemOld = ({
  data,
  doNotShowHiddenJobByAdmin,
  ReservationStore,
  isOpenAllApplyList,
  isAccessAllowManualPayment,
}) => {
  const MemoTitles = ["근무지설명", "구체적인 업무설명", "필수복장 및 준비물", "추가 요청사항"];

  const [open, setOpen] = useState(false);
  const [isSameSeekerModalVisible, setIsSameSeekerModalVisible] = useState(false);
  const [sameSeekerAnchorEl, setSameSeekerAnchorEl] = useState(null);
  const [sameJobs, setSameJobs] = useState<Job[]>([]);
  const [seekers, setSeekers] = useState<AppliedSeeker[]>([]);

  const [reservationOperationMemo, setOperationMemo] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [openBonusSoon, setOpenBonusSoon] = useState(false);
  const [filteredSeekers, setFilteredSeekers] = useState<AppliedSeeker[]>([]);
  const [, setSeekerReportDetail] = useState("");
  const [jobReview, setJobReview] = useState({});
  const [adminJobStopReason, setAdminJobStopReason] = useState("");
  const [adminNoteForEmployer, setAdminNoteForEmployer] = useState("");
  const [selectedBonusSoon, setSelectedBonusSoon] = useState(0);

  const [isHideReservation, setHideReservation] = useState(false);

  const [isSendPushes, setSendPushes] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [manualPaymentAnchorEl, setManualPaymentAnchorEl] = useState(null);
  const [manualAmountToProcess, setManualAmountToProcess] = useState();

  const [seekerAssigningTimeAnchorEl, setSeekerAssigningTimeAnchorEl] = useState(null);
  const [seekerAssigningTime, setSeekerAssigningTime] = useState();

  const [employerNameAnchorEl, setEmployerNameAnchorEl] = useState();
  const [jobEmployer, setJobEmployer] = useState();
  const [adminJobNote, setAdminJobNote] = useState();

  const [job, setJob] = useState<Job>();

  const [confirmDialog, setConfirmDialog] = useState();

  const [showingSeekersButtonId, setShowingSeekersButtonId] = useState("");
  const [showJobRegistrationDialog, setShowJobRegistrationDialog] = useState(false);

  const styles = useStyle();
  const showSeekers = (_bonusSoon: number) => {
    setSelectedBonusSoon(_bonusSoon);
  };

  useEffect(() => {
    if (data.operationMemo) {
      setOperationMemo(data.operationMemo)
    } else {
      setOperationMemo('')
    }
  }, [data.operationMemo])
  const applyingSeekers = ({ bonusSoon = 0, bonusSoonIndex = 0 }): AppliedSeeker[] => {
    if (!job) return [];

    if (job.dataVersion) {
      return filter(seekers, (seeker) => seeker.bonusSoon === bonusSoon);
    }

    //old version
    if (bonusSoonIndex > 0) {
      const bonusSoonCreatedTime = job.bonusSoonCreatedTime[bonusSoonIndex - 1];

      if (bonusSoonCreatedTime) {
        if (job.bonusSoon.length > bonusSoonIndex) {
          const notOverThisTime = job.bonusSoonCreatedTime[bonusSoonIndex];

          return filter(
            seekers,
            (seeker) =>
              seeker.appliedTime.isAfter(bonusSoonCreatedTime) &&
              seeker.appliedTime.isBefore(notOverThisTime)
          );
        }
        return filter(seekers, (seeker) => seeker.appliedTime.isAfter(bonusSoonCreatedTime));
      }

      return [];
    }

    if (isArray(job.bonusSoon) && size(job.bonusSoon) > 0) {
      const bonusSoonCreatedTime = job.bonusSoonCreatedTime[0];
      return filter(seekers, (seeker) => seeker.appliedTime.isBefore(bonusSoonCreatedTime));
    } else {
      return seekers;
    }
  };

  useEffect(() => {
    if (isOpenAllApplyList) {
      showSeekers(0);
      setShowingSeekersButtonId("normal");
    }
  }, [isOpenAllApplyList]);
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

  const handleSameJobsById = async () => {
    const result = await getSameJobsById({ sameJobId: job?.sameJobId })

    if (result.status === "OK") {
      setSameJobs(
        map(result.data, (data) => {
          return new Job({ id: data.uid, ...data });
        })
      )
    } else {
      setSameJobs([])
    }
  }


  useEffect(() => {
    if (isSameSeekerModalVisible) {

      handleSameJobsById()
    }
  }, [isSameSeekerModalVisible]);

  const loadOneJob = async (uid, callback) => {
    const result = await getJobs({ uid });
    let data;
    if (result?.data && result?.data.length > 0) {
      data = result.data[0];
    }
    await callback(data);
  };
  async function myFunction() {
    loadOneJob(data.uid, (ret) => {
      if (ret) {
        setJob(new Job({ id: ret.uid, ...ret }));
      }
    });

  }
  useEffect(() => {
    if (data && data.uid) {
      setJob(new Job({ id: data.uid, ...data }));

      // 1초마다 myFunction()을 호출하는 인터벌 등록
      const intervalId = setInterval(myFunction, 60000);

      return () => clearInterval(intervalId);
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
  // useEffect(() => {
  //   if (data) {
  //     // loadReservationAppliedSeekers(data.uid, (ret) => {
  //     //   setSeekers(map(ret, (seeker) => new AppliedSeeker(seeker)));
  //     // });

  //     // async function myFunction() {
  //     //   loadReservationAppliedSeekers(data.uid, (ret) => {
  //     //     setSeekers(map(ret, (seeker) => new AppliedSeeker(seeker)));
  //     //   });

  //     // }

  //     // 1초마다 myFunction()을 호출하는 인터벌 등록
  //     // const intervalId = setInterval(myFunction, 120000);

  //     // return () => clearInterval(intervalId);

  //   }
  // }, [data]);
  // const getReview = async () => {
  //   if (!job) return;

  //   const result = await getReviewBo({
  //     jobId: job.id,
  //   });

  //   if (result.status === "OK") {
  //     setJobReview(result.data?.[0]);
  //   }
  // };
  const loadAppliedSeeekers = () => {
    if (!job) return;

    // setProcessing(true);
    // loadReservationAppliedSeekers(job.id, (appliedSeekers) => {
    //   if (size(appliedSeekers)) {
    //     setSeekers(map(appliedSeekers, (seeker) => new AppliedSeeker(seeker)));
    //   }
    //   setProcessing(false);
    // });
  };
  useEffect(() => {
    if (job) {
      // loadAppliedSeeekers();
      // getReview();
      setAdminJobNote(job.adminNote);
      setSeekerAssigningTime(job.seekerAssigningTime);
    }
  }, [job]);

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

    const result = await updateOperationMemoJob({
      uid: job.id,
      operationMemo: reservationOperationMemo,
    });

    if (result.status === "OK") {
      setProcessing(false);
      alert("저장하였습니다.");
      reloadJobInfo();
    } else {
      setProcessing(false);
      alert("저장에 실패했습니다.:server error ");
    }
  };

  const createBonusSoonAction = async (jobId, reason, newJobData, callback) => {
    try {
      const result = await createBonusSoon({ jobId, reason, newJobData });

      if (result?.status === "OK") {
        await callback(true);
        return true;
      } else {
        await callback(false);
        return false;
      }
    } catch (error) {
      await callback(false);
      console.log(error);
      return false;
    }
  };

  const bonusSoon = async (bonus: string, bonusReason: string, ids: string[]) => {
    if (!job) return;

    setProcessing(true);

    if (!isNumber(+bonus) || +bonus <= 0) {
      alert("check an input number");
      return;
    }

    try {
      createBonusSoonAction(
        job.id,
        bonusReason,
        {
          bonusSoon: bonus,
          isBonusSoon: "true", //for algolia index
        },
        (ret) => {
          if (ret) {
            alert("succeed");
            setProcessing(false);
            reloadJobInfo();
          } else {
            alert(ret);
            setProcessing(false);
          }
        }
      );

      return true;
    } catch (err) {
      alert(JSON.stringify(err));
      setProcessing(false);

      return null;
    }
  };

  const stopReservationAction = async (jobId, employerUid, usedCash, reason, hiredSeekerId, callback) => {
    try {
      const result = await stopReservation({
        jobId,
        employerUid,
        usedCash,
        reason,
        hiredSeekerId,
      });

      if (result?.status === "OK") {
        await callback(true);
        return true;
      } else {
        return false;
      }
    } catch (ex) {
      return false;
    }
    await callback(false);
  };
  const handleStopReservation = () => {
    if (!job || processing) return;
    setProcessing(true);

    stopReservationAction(
      job.id,
      job.employerId,
      job.paymentDetail.usedCash,
      adminJobStopReason,
      job.hiredSeekerId,
      (ret) => {
        setProcessing(false);

        if (ret) {

          alert("모집중지");
          reloadJobInfo();
          loadOneJob(job.id, (ret) => {
            if (ret) {
              ret && setJob(new Job(ret));
            }
          });
        } else {
          alert("error");
        }
      }
    );
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

  const hiringCareReplyVerificationList = (seeker: AppliedSeeker): JSX.Element[] | null => {
    if (!job) return null;

    //https://stackoverflow.com/questions/4310953/invalid-date-in-safari
    const hoursBeforeStart = moment(job.startDatetime, "YYYY-MM-DD HH:mm").diff(moment(), "hours", true);

    const seekerAppliedTimeBeforeStart = moment(job.startDatetime, "YYYY-MM-DD HH:mm").diff(
      moment(seeker.hireCareActions?.[0]?.updatedAt),
      "hours"
    );

    const result = [];

    const before24 = findIndex(seeker.hireCareActions, ["action", "BEFORE_24_HOUR_ANSWER_OK_SEEKER"]);
    const before22 = findIndex(seeker.hireCareActions, ["action", "BEFORE_22_HOUR_ANSWER_OK_SEEKER"]);
    if (before24 > -1 || before22 > -1) {
      result.push(
        <div style={{ fontWeight: "bold", color: "green", marginBottom: 5 }}>
          24케어 응답
          <div>
            {moment(seeker.hireCareActions[before24 > -1 ? before24 : before22].updatedAt).format("YYYY-MM-DD HH:mm")}
          </div>
        </div>
      );
    } else if (hoursBeforeStart <= 21 && seekerAppliedTimeBeforeStart >= 24) {
      result.push(<div style={{ fontWeight: "bold", color: "red", marginBottom: 5 }}>24케어 미응답</div>);
    }

    const before4 = findIndex(seeker.hireCareActions, ["action", "BEFORE_4_HOUR_ANSWER_OK_SEEKER"]);

    const before3 = findIndex(seeker.hireCareActions, ["action", "BEFORE_3_HOUR_ANSWER_OK_SEEKER"]);

    if (before4 > -1 || before3 > -1) {
      result.push(
        <div style={{ fontWeight: "bold", color: "green" }}>
          4케어 응답
          <div>
            {moment(seeker.hireCareActions[before4 > -1 ? before4 : before3].updatedAt).format("YYYY-MM-DD HH:mm")}
          </div>
        </div>
      );
    } else if (
      hoursBeforeStart <= 3.5 &&
      findIndex(seeker.hireCareActions, ["action", "BEFORE_4_HOUR_ASK_SOONY"]) > -1
    ) {
      result.push(<div style={{ fontWeight: "bold", color: "red" }}>4케어 미응답</div>);
    }

    return result;
  };

  const hiringCareReplyVerification = (seeker: AppliedSeeker): JSX.Element | null => {
    if (!job) return null;

    //https://stackoverflow.com/questions/4310953/invalid-date-in-safari
    const hoursBeforeStart = moment(job.startDatetime, "YYYY-MM-DD HH:mm").diff(moment(), "hours", true);

    const seekerAppliedTimeBeforeStart = moment(job.startDatetime, "YYYY-MM-DD HH:mm").diff(
      moment(seeker.hireCareActions?.[0]?.updatedAt),
      "hours"
    );

    let index = -1;

    if (hoursBeforeStart < 24 && hoursBeforeStart > 4) {
      index = findIndex(seeker.hireCareActions, ["action", "BEFORE_24_HOUR_ANSWER_OK_SEEKER"]);
      if (index >= 0) {
        return (
          <div style={{ fontWeight: "bold", color: "green" }}>
            24케어 응답
            <div>{moment(seeker.hireCareActions[index].updatedAt).format("YYYY-MM-DD HH:mm")}</div>
          </div>
        );
      }

      index = findIndex(seeker.hireCareActions, ["action", "BEFORE_22_HOUR_ANSWER_OK_SEEKER"]);
      if (index >= 0) {
        return (
          <div style={{ fontWeight: "bold", color: "green" }}>
            24케어 응답
            <div>{moment(seeker.hireCareActions[index].updatedAt).format("YYYY-MM-DD HH:mm")}</div>
          </div>
        );
      }

      if (hoursBeforeStart <= 21 && seekerAppliedTimeBeforeStart >= 24) {
        return <div style={{ fontWeight: "bold", color: "red" }}>24케어 미응답</div>;
      }
    }

    index = findIndex(seeker.hireCareActions, ["action", "BEFORE_22_HOUR_ASK_SOONY"]);
    if (hoursBeforeStart > 21 && index >= 0) {
      return (
        <div>
          24케어2차발송
          <div>{moment(seeker.hireCareActions[index].updatedAt).format("YYYY-MM-DD HH:mm")}</div>
        </div>
      );
    }

    if (hoursBeforeStart > 21 && seekerAppliedTimeBeforeStart >= 24) {
      index = findIndex(seeker.hireCareActions, ["action", "BEFORE_24_HOUR_ASK_SOONY"]);

      if (index >= 0) {
        return (
          <div>
            24케어1차발송
            <div>{moment(seeker.hireCareActions[index].updatedAt).format("YYYY-MM-DD HH:mm")}</div>
          </div>
        );
      }
    }

    if (hoursBeforeStart <= 4) {
      index = findIndex(seeker.hireCareActions, ["action", "BEFORE_4_HOUR_ANSWER_OK_SEEKER"]);
      if (index >= 0) {
        return (
          <div style={{ fontWeight: "bold", color: "green" }}>
            4케어 응답
            <div>{moment(seeker.hireCareActions[index].updatedAt).format("YYYY-MM-DD HH:mm")}</div>
          </div>
        );
      }

      index = findIndex(seeker.hireCareActions, ["action", "BEFORE_3_HOUR_ANSWER_OK_SEEKER"]);
      if (index >= 0) {
        return (
          <div style={{ fontWeight: "bold", color: "green" }}>
            4케어 응답
            <div>{moment(seeker.hireCareActions[index].updatedAt).format("YYYY-MM-DD HH:mm")}</div>
          </div>
        );
      }

      // index = findIndex(seeker.hireCareActions, ['action', 'BEFORE_3_HOUR_ASK_SOONY']);
      // if(index >= 0){
      //     return <div style={{fontWeight: 'bold', color: 'red'}}>4케어 미응답</div>;
      // }

      index = findIndex(seeker.hireCareActions, ["action", "BEFORE_4_HOUR_ASK_SOONY"]);
      if (hoursBeforeStart <= 3.5 && index >= 0) {
        return <div style={{ fontWeight: "bold", color: "red" }}>4케어 미응답</div>;
      }

      if (hoursBeforeStart <= 4 && index >= 0) {
        return (
          <div>
            4케어1차발송 <div>{moment(seeker.hireCareActions[index].updatedAt).format("YYYY-MM-DD HH:mm")}</div>
          </div>
        );
      }
    }

    return null;
  };

  const gotStatusWithoutHiringCare = (): JSX.Element | null => {
    if (!job) return null;

    if (!job.payment && job.paymentStatus !== "PAYMENT_MATCHED") {
      //employer deleted a card before registering for a job, and registered after => payment got succeeded
      return <div style={{ fontWeight: "bold", color: "red" }}>결제카드 미등록</div>;
    }

    if (job.paymentStatus === "PAYMENT_MATCHED_ERROR") {
      return <div style={{ fontWeight: "bold", color: "orange" }}>결제오류</div>;
    }

    if (job.paymentStatus === "PAYMENT_MATCHED_COMPLETED") {
      return <div style={{ fontWeight: "bold", color: "orange" }}>{job.manualRefund}</div>;
    }

    const hoursBeforeStart = moment(job.startDatetime).diff(moment(), "hours", true);
    if (hoursBeforeStart < 0) {
      return <div style={{ fontWeight: "bold", color: "orange" }}>근무중</div>;
    }

    return <div style={{ fontWeight: "bold" }}>배정완료</div>;
  };

  const afterHiringStatus = (job: Job, bonusSoonMoney: string, showButtons = true): JSX.Element | null => {
    if (job.paymentStatus === "PAYMENT_MATCHED_COMPLETED") {
      return <div style={{ fontWeight: "bold", color: "orange" }}>{job.manualRefund}</div>;
    }

    if (includes(values(job.hiredSeekers), "HIRED")) {
      if (job.isEndTimePassed) {
        let ret = "";
        let time = "";

        switch (job.hiringStatus) {
          case "PAYMENT_SOONY":
            ret = "입금승인완료";
            time = job.paymentAcceptedDate;
            break;
          case "HIRE_CHANGE_EMPLOYER":
          case "REGISTER_SOONY":
            ret = "입금승인대기";
            const afterEndTime2DayMomentStr = moment(job.original.endDate).add(2, "day").format("YYYY.MM.DD HH:mm:ss");

            const isThisMomentIsAfterEndTime2Days = moment().isAfter(moment(job.original.endDate).add(2, "day"));

            if (isThisMomentIsAfterEndTime2Days === true) {
              ret = "입금승인완료";
              time = afterEndTime2DayMomentStr;
            }
            break;
        }

        switch (job.paymentStatus) {
          case "PAYMENT_COMPLETED":
            time = job.paymentCompletedDate;

            ret = "급여이체완료";
            break;

          case "PAYMENT_MATCHED_ERROR":
            time = job.paymentProcessedDate;

            ret = "결제오류";
            break;
        }

        return (
          <div style={{ fontWeight: "bold" }}>
            {ret === "급여이체완료" && (
              <>
                <div>입금승인완료</div>
                <div>{job.paymentAcceptedDate}</div>
              </>
            )}
            <div>{ret}</div>
            <div>{time}</div>
            {ret === "입금승인대기" && !showButtons && <ReportButton job={job} />}
          </div>
        );
      }

      if (moment().isAfter(job.startDatetime)) {
        return <div style={{ fontWeight: "bold" }}>근무중</div>;
      }
    }

    if (!isEmpty(job.hiredSeekers) && includes(job.hiringStatus, "CANCEL")) {
      return <div style={{ fontWeight: "bold" }}>배정취소</div>;
    }

    const absentIndex = indexOf(values(job.hiredSeekers), "REPORT_ABSENT_EMPLOYER");
    if (absentIndex >= 0) {
      return (
        <div>
          <div style={{ fontWeight: "bold", color: "red" }}>신고(결근)</div>
          {showButtons && (
            <RegistrationRefund
              job={job}
              jobId={job.id}
              employerId={job.employerId}
              seekerId={keys(job.hiredSeekers)[absentIndex]}
              lastPayment={job.lastPaymentRecord}
              paymentDetail={job.paymentDetail}
              paymentStatus={job.paymentStatus}
              bonusSoon={bonusSoonMoney}
              payment={job.payment}
              isDailyLaborReport={job.isDailyLaborReport}
              reloadJobInfo={reloadJobInfo}
            />
          )}
        </div>
      );
    }

    const otherIndex = indexOf(values(job.hiredSeekers), "REPORT_ETC_EMPLOYER");
    if (otherIndex >= 0) {
      return (
        <>
          <Button
            variant="text"
            onClick={async () => {
              setProcessing(true);
              const result = await getReportByJobId({ jobId: [job.id] });
              if (result.status === "OK") {
                setSeekerReportDetail(result.data.detailReasons);
              }
            }}
            disabled={processing}
            style={{ color: "red", fontWeight: "bold" }}
          >
            {processing ? <CircularProgress size={16} /> : "신고(기타)"}
          </Button>
          <div>{job.reportReason}</div>
          {showButtons && (
            <RegistrationRefund
              job={job}
              jobId={job.id}
              employerId={job.employerId}
              seekerId={keys(job.hiredSeekers)[otherIndex]}
              paymentDetail={job.paymentDetail}
              lastPayment={job.lastPaymentRecord}
              paymentStatus={job.paymentStatus}
              bonusSoon={bonusSoonMoney}
              payment={job.payment}
              isDailyLaborReport={job.isDailyLaborReport}
              reloadJobInfo={reloadJobInfo}
            />
          )}
        </>
      );
    }


    const adminAbsentIndex = indexOf(values(job.hiredSeekers), "REPORT_ABSENT_ADMIN");
    return adminAbsentIndex >= 0 ? <div style={{ fontWeight: "bold", color: "red" }}>무단결근 처리</div> : null;
  };
  const cancelHiredSeekerAction = async (jobId, seekerId, reportAbsence, callback) => {
    try {
      const result = await cancelHiredSeeker({
        jobId,
        seekerId,
        reportAbsence,
      });

      if (result?.status === "OK") {
        await callback(true);
        return true;
      } else {
        await callback(false);
        return false;
      }
    } catch (error) {
      await callback(false);
      console.log(error);
      return false;
    }
  };
  const cancelSeekerMatching = async (
    jobId: string,
    seekerId: string,
    reportAbsence: string,
    isSendPushes: boolean
  ) => {


    setProcessing(true);
    cancelHiredSeekerAction(jobId, seekerId, reportAbsence, (ret) => {
      setProcessing(false);
      reloadJobInfo();
      alert(ret ? "done" : "error");
    });
  };

  const sendPushesForJob = async (jobId: string) => {
    setProcessing(true);

    const sendPushesForJob = firebase.functions().httpsCallable("sendPushesForJob");

    setProcessing(false);

    alert("sent");

    const response = await sendPushesForJob({ jobId });
  };
  const restoreHiredSeekerAfterReportAction = async (
    jobId: string,
    seekerId: string,
    accessToken: string,
    callback
  ) => {
    const result = await reAssignJobSeeker({ jobId, seekerId });

    if (result?.status === "OK") {
      await callback(true);
      return true;
    } else {
      await callback(false);
      return false;
    }
  };
  const restoreHiredSeekerAfterReport = async (jobId: string, seekerId: string) => {
    setProcessing(true);
    loadOneJob(jobId, (result) => {
      if (result) {
        if (result?.hiredSeeker) {
          let alreadyHired = false;
          Object.keys(result?.hiredSeeker).forEach((seekerUid) => {
            if (result?.hiredSeeker?.[seekerUid] === "HIRED") {
              alreadyHired = true;
            }
          });
          if (alreadyHired) {
            alert("이미 다른 근무자가 채용되었습니다.");
            setProcessing(false);
            return;
          }
        }
        restoreHiredSeekerAfterReportAction(jobId, seekerId, null, (response) => {
          reloadJobInfo();

          setProcessing(false);

          alert(response ? "done" : "error");
        });
      }
    });
  };

  const removeSeekerPenalty = async (jobId: string, seekerId: string) => {
    setProcessing(true);
    loadOneJob(jobId, async (result) => {
      if (result) {
        if (result?.hiredSeeker) {
          let alreadyHired = false;
          Object.keys(result?.hiredSeeker).forEach((seekerUid) => {
            if (result?.hiredSeeker?.[seekerUid] === "HIRED") {
              alreadyHired = true;
            }
          });
          if (alreadyHired) {
            alert("이미 다른 근무자가 채용되었습니다.");
            setProcessing(false);
            return;
          }
        }
        const removeSeekerPenalty = firebase.functions().httpsCallable("removeSeekerPenalty");

        const response = await removeSeekerPenalty({ jobId, seekerId });
        setProcessing(false);

        alert(response ? "done" : "error");
      }
    });
  };
  const hireAppliedSeekerAgainAfterReject = async (jobId, seekerId, accessToken, callback) => {
    const result = await reAssignJobSeeker({ jobId, seekerId });

    if (result?.status === "OK") {
      await callback(true);
      return true;
    } else {
      await callback(false);
      return false;
    }
  };
  const reAllocateHiredSeeker = async (jobId: string, seekerId: string) => {
    setProcessing(true);
    loadOneJob(jobId, (result) => {
      if (result) {
        if (result?.hiredSeeker) {
          let alreadyHired = false;
          Object.keys(result?.hiredSeeker).forEach((seekerUid) => {
            if (result?.hiredSeeker?.[seekerUid] === "HIRED") {
              alreadyHired = true;
            }
          });
          if (alreadyHired) {
            alert("이미 다른 근무자가 채용되었습니다.");
            setProcessing(false);
            return;
          }
        }

        hireAppliedSeekerAgainAfterReject(jobId, seekerId, null, (ret) => {
          setProcessing(false);
          reloadJobInfo();
          alert(ret ? "done" : "error");
        });
      }
    });
  };

  const changeSeekerStatusToReport = async (jobId: string, seekerId: string) => {
    setProcessing(true);

    const result = await changeSeekerStatusToReportReq({
      jobId,
      seekerId,
    });

    if (result.status === "OK") {
      reloadJobInfo();
      alert("done");
    } else {
      alert("error");
    }
    setProcessing(false);
  };

  const changeSeekerFromAbsentToReportOnlyStatus = async (jobId: string, seekerId: string) => {
    setProcessing(true);
    alert(jobId + seekerId);
    const result = await changeSeekerFromAbsentToReportOnlyStatusReq({
      jobId,
      seekerId,
    });

    if (result.status === "OK") {
      alert("done");
      reloadJobInfo();
    } else {
      alert("error");
    }
    setProcessing(false);
  };

  const hideRowAfterStopingJob = () => {
    window.scrollTo({ left: 0, behavior: "smooth" });
    setHideReservation(true);
  };

  // 상황종료 버튼

  const markAsHiddenRegistration = async (jobId: string) => {
    setProcessing(true);

    const result = await updateMarkAsHiddenRegistration({
      uid: jobId,
      markAsHiddenRegistration: true,
    });

    if (result.status === "OK") {
      alert("상황종료되었습니다.");
      reloadJobInfo();
      setProcessing(false);
    } else {
      setProcessing(false);
      alert("실패했습니다.");
    }
  };
  const handleChangeSalaryBonusSoon = async ({ seekerId, bonusSoon }: { seekerId: string; bonusSoon: number }) => {
    setProcessing(true);

    const result = await changeSalaryBonusSoon({
      jobId: job.id,
      seekerId: seekerId,
      bonusSoon: +bonusSoon,
    });

    setProcessing(false);
  };

  // 배정매니저 한마디 저장
  const saveAdminJobNote = async () => {
    if (!job) return;
    setProcessing(true);

    const result = await updateAdminNoteJob({
      uid: job.id,
      adminNote: adminJobNote,
    });

    if (result.status === "OK") {
      setProcessing(false);
      reloadJobInfo();
      alert("저장되었습니다.");
    } else {
      alert("실패했습니다.");
      setProcessing(false);
    }
  };
  useEffect(() => {
    if (job) {
      const seekers = applyingSeekers(
        job.dataVersion ? { bonusSoon: selectedBonusSoon } : { bonusSoonIndex: selectedBonusSoon }
      );
      setFilteredSeekers(seekers);
    }
  }, [seekers, job])

  const doManualProcessPayment = async (jobId, hiredSeekerId, amount, accessToken, callback) => {
    try {
      const paymentRet = await manualProcessPayment({
        jobId,
        hiredSeekerId,
        amount,
        accessToken,
      });

      if (paymentRet?.status === "OK") {
        await callback(true);
        return true;
      } else {
        await callback(false);
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };
  const manualProcessPaymentAction = async () => {
    if (!job) return;

    const amount = toInteger(manualAmountToProcess) || job.paidAmount;
    if (confirm(`Charge ${job.employerName} employer for ${amount}`)) {
      try {
        setProcessing(true);
        doManualProcessPayment(job.id, job.hiredSeekerId, amount, accessToken, (ret) => {
          if (ret === true) {

            reloadJobInfo();
            setProcessing(false);
            setManualPaymentAnchorEl(null);

            alert(ret);
          } else {
            alert(ret);
            setProcessing(false);
          }
        });
      } catch (ex) {
        setProcessing(false);
        console.log("manualProcessPayment", ex);
      }
    }
  };

  const changeSeekerAssigningTime = async () => {
    if (!job) return;

    try {
      setProcessing(true);

      const time = moment(seekerAssigningTime);
      if (time.isValid()) {
        const result = await updateSeekerAssigningTime({
          jobId: job.id,
          newTime: time.toDate(),
          oldTime: job.seekerAssigningTime,
          seekerAssigningTimeInSeconds: job.original.seekerAssigningTime,
        });


        if (result?.status === "OK") {
          setProcessing(false);
          reloadJobInfo();
          alert("변경했습니다.");
          setSeekerAssigningTimeAnchorEl(null);
        } else {
          setProcessing(false);
          reloadJobInfo();
          alert("변경 실패했습니다. 다시 시도해주세요");
        }

        // const updateSeekerAssigningTime = firebase
        //   .functions()
        //   .httpsCallable('updateSeekerAssigningTime')
        // console.log(
        //   job.id,
        //   job.algoliaObjectId,
        //   time.toDate(),
        //   job.seekerAssigningTime
        // )
        // const ret = await updateSeekerAssigningTime({
        //   jobId: job.id,
        //   algoliaObjectId: job.algoliaObjectId,
        //   newTime: time.toDate(),
        //   oldTime: job.seekerAssigningTime,
        //   seekerAssigningTimeInSeconds: job.original.seekerAssigningTime,
        // })

      } else {
        alert("time is not valid");
      }
    } catch (ex) {
    }
  };
  const getBonusSoon = (hiredSeeker: AppliedSeeker) => {
    if (!job) return;

    if (hiredSeeker.bonusSoon > 0) {
      return hiredSeeker.bonusSoon;
    }

    //old version
    const index = findLastIndex(job.bonusSoonCreatedTime, (time) => hiredSeeker.appliedTime > time);
    return index >= 0 ? job.bonusSoon[index] : hiredSeeker.bonusSoonSuggestion;
  };

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
    getEmployerById(job.employerId, (ret) => {
      ret && setJobEmployer(new Employer(ret));
      setProcessing(false);
    });
  };

  useEffect(() => {

  }, [])

  const goingToWorkSeekers = filter(seekers, (seeker) => (size(seeker.hireCareActions) > 1 || seeker?.hireCareActions?.map(h => h?.action)?.includes('HIRE_CHECK_ANSWER_OK_SEEKER')));
  const goingToWorkSeeker = find(goingToWorkSeekers, (seeker) => {
    return includes(
      [
        "HIRE_CHECK_ANSWER_OK_SEEKER",
        "GO_WORKING_ANSWER_OK_SEEKER",
        "PAYMENT_SOONY",
        "PAYMENT_COMPLETED",
        "REPORT_ABSENT_EMPLOYER",
        "REPORT_ETC_EMPLOYER",
        "REPORT_JOB",
        "REVIEWED_ASK_SOONY",
      ],
      seeker.hiringStatus
    );
  });
  const goingToMatchSeekers = filter(seekers, (seeker) => size(seeker.hireCareActions) > 0);

  const bonusSoonMoney = goingToWorkSeeker ? getBonusSoon(goingToWorkSeeker) : 0;

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


  // const isHidden = doNotShowHiddenJobByAdmin && job.markAsHiddenRegistration;
  const isHidden = doNotShowHiddenJobByAdmin;
  return (
    !isHideReservation && (
      <DndProvider backend={HTML5Backend}>
        <Grow in={!isHidden} onExited={hideRowAfterStopingJob}>
          <>
            <TableRow>
              <TableCell component="th" scope="row">
                {job.createdAt}

                {job.markAsHiddenRegistration && <div>상황종료</div>}
              </TableCell>

              <TableCell>
                <HorizontalDiv>
                  {job.seekerAssigningTime}
                  <IconButton onClick={(e) => setSeekerAssigningTimeAnchorEl(e.currentTarget)}>
                    <CreateIcon />
                  </IconButton>
                  <Popover
                    open={!!seekerAssigningTimeAnchorEl}
                    anchorEl={seekerAssigningTimeAnchorEl}
                    onClose={() => setSeekerAssigningTimeAnchorEl(null)}
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
                        }}
                      >
                        <Typography>배정예정시간</Typography>
                        <TextField
                          value={seekerAssigningTime}
                          onChange={(e) => setSeekerAssigningTime(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outlined"
                        onClick={throttle(changeSeekerAssigningTime, 2000, {
                          trailing: false,
                        })}
                      >
                        {processing ? <CircularProgress size={16} /> : "변경"}
                      </Button>
                    </div>
                  </Popover>
                </HorizontalDiv>
                {map(job.seekerAssigningTimeHistory, (time) => (
                  <div style={{ color: "#666" }}>{time}</div>
                ))}
              </TableCell>
              <TableCell style={{ maxWidth: 250 }}>
                {goingToWorkSeeker
                  ? job.isEndTimePassed
                    ? afterHiringStatus(job, bonusSoonMoney, false)
                    : job.isStartTimePassed
                      ? job.jobOnGoingStatus === 'REPORT_BTN' ? (
                        <>
                          <div style={{ fontWeight: "bold", color: "orange" }}>근무중</div>
                          <ReportButton job={job} reloadJobInfo={reloadJobInfo} />
                        </>) : job.jobOnGoingStatus === 'REPORT_BTN' ? (
                          <>
                            <div style={{ fontWeight: "bold", color: "orange" }}>근무중</div>
                            <ReportButton job={job} reloadJobInfo={reloadJobInfo} />
                          </>) : job.jobOnGoingStatus === 'REFUND_100_BTN' ?
                        <div>
                          {job.paymentDetail.refundRate === 70 &&
                            (job.paymentDetail.isAllRefund ? (
                              <Button variant="contained" disabled style={{ marginBottom: 5 }}>
                                100% 환불 완료
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                style={{ marginBottom: 5 }}
                                onClick={async () => {
                                  const result = await processRemainingRefund(job.id);
                                  if (result.status === "OK") {
                                    await reloadJobInfo()
                                    alert('100% 환불 완료되었습니다.')
                                  } else {
                                    alert('환불 오류')
                                  }
                                }}
                              >
                                100% 환불
                              </Button>
                            ))}
                          <div style={{ fontWeight: "bold" }}>{job.paymentDetail.refundRate === 70 ? "배정취소 (30%공제)" : "배정취소"}</div>
                          <div>{job.cancelTime}</div>
                          {job.paymentDetail.refundRate === 70 &&
                            <div>{job.payDay ? `급여이체일: ${job.payDay}` : ''}</div>
                          }
                        </div>
                        : job.jobOnGoingStatus
                      : hiringCareReplyVerification(goingToWorkSeeker) || gotStatusWithoutHiringCare()
                  : job.jobOnGoingStatus === 'REPORT_BTN' ? (
                    <>
                      <div style={{ fontWeight: "bold", color: "orange" }}>근무중</div>
                      <ReportButton job={job} reloadJobInfo={reloadJobInfo} />
                    </>) : job.jobOnGoingStatus === 'REFUND_100_BTN' ?
                    <div>
                      {job.paymentDetail.refundRate === 70 &&
                        (job.paymentDetail.isAllRefund ? (
                          <Button variant="contained" disabled style={{ marginBottom: 5 }}>
                            100% 환불 완료
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            style={{ marginBottom: 5 }}
                            onClick={async () => {
                              const result = await processRemainingRefund(job.id);
                              if (result.status === "OK") {
                                await reloadJobInfo()
                                alert('100% 환불 완료되었습니다.')
                              } else {
                                alert('환불 오류')
                              }
                            }}
                          >
                            100% 환불
                          </Button>
                        ))}
                      <div style={{ fontWeight: "bold" }}>{job.paymentDetail.refundRate === 70 ? "배정취소 (30%공제)" : "배정취소"}</div>
                      <div>{job.cancelTime}</div>
                      {job.paymentDetail.refundRate === 70 &&
                        <div>{job.payDay ? `급여이체일: ${job.payDay}` : ''}</div>
                      }
                    </div>
                    :
                    job.jobOnGoingStatus || job.paymentStatusHtml}
                {job.seekerChangingReason}
                {job.cancelReason}
                {job.paymentCompletedDate &&
                  (job.hiringStatus === "REPORT_ETC_EMPLOYER" ||
                    job.hiringStatus === "REPORT_ABSENT_EMPLOYER" ||
                    job.hiringStatus === "REPORT_ABSENT_ADMIN" ||
                    (job.hiringStatus === "HIRE_CANCEL_EMPLOYER" && job.paymentDetail.refundRate === 70)) && (
                    <>
                      <div>{"급여이체완료"}</div>
                      <div>{job.paymentCompletedDate}</div>
                    </>
                  )}
              </TableCell>
              <TableCell>
                <div style={{ color: 'red' }}>
                  {job?.enterpriseCode}
                </div>
                <Link component="button" variant="body1" onClick={loadEmployer}>
                  {job.employerName || '이름등록필요'}
                </Link>

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
              </TableCell>
              <TableCell style={{ minWidth: 150 }}>
                {job.storeName}
                <br />({job.storeBizKind})
              </TableCell>
              <TableCell style={{ minWidth: 150 }}>
                {job.jobKind}
                <br />
                {`${job.startDate} ~ ${job.workPeriod}`}
                <br />
                {job.startTime} ~ {job.endTimeInText || (job.endTime === "00:00" ? "24:00" : job.endTime)}
              </TableCell>
              <TableCell style={{ minWidth: 150 }}>
                {job.sameJobId && (
                  <div
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      color: "blue",
                    }}
                    onClick={(e) => {
                      setIsSameSeekerModalVisible(true);
                      setSameSeekerAnchorEl(e.currentTarget);
                    }}
                  >
                    동일알바
                  </div>
                )}
                <div>
                  <Popover
                    open={isSameSeekerModalVisible}
                    anchorEl={sameSeekerAnchorEl}
                    onClose={() => setIsSameSeekerModalVisible(null)}
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
                        }}
                      >
                        <Typography>동일알바 요청 리스트</Typography>
                        <table>
                          <tr>
                            <th>
                              <div
                                style={{
                                  border: "1px solid black",
                                  padding: 10,
                                }}
                              >
                                근무일
                              </div>
                            </th>
                            <th>
                              <div
                                style={{
                                  border: "1px solid black",
                                  padding: 10,
                                }}
                              >
                                jobId
                              </div>
                            </th>
                            <th>
                              <div
                                style={{
                                  border: "1px solid black",
                                  padding: 10,
                                }}
                              >
                                고용된알바Uid
                              </div>
                            </th>
                          </tr>
                          {map(sortBy(sameJobs, "startDate"), (sjob) => (
                            <tr>
                              <td>
                                <div
                                  style={{
                                    border: "1px solid black",
                                    padding: 10,
                                  }}
                                >
                                  {sjob.startDate}
                                </div>
                              </td>
                              <td>
                                <div
                                  style={{
                                    border: "1px solid black",
                                    padding: 10,
                                  }}
                                >
                                  {sjob.id}
                                </div>
                              </td>
                              <td>
                                {sjob.hiringStatus === "REGISTER_CANCEL_SOONY" ||
                                  sjob.hiringStatus === "REGISTER_STOP_ADMIN" ? (
                                  <div
                                    style={{
                                      border: "1px solid black",
                                      padding: 10,
                                    }}
                                  >
                                    모집종료
                                  </div>
                                ) : (
                                  sjob.hiredSeekerId && (
                                    <div
                                      style={{
                                        border: "1px solid black",
                                        padding: 10,
                                      }}
                                    >
                                      {sjob.hiredSeekerId}
                                    </div>
                                  )
                                )}
                              </td>
                            </tr>
                          ))}
                        </table>
                      </div>
                    </div>
                  </Popover>
                </div>
              </TableCell>

              <TableCell style={{ minWidth: 150 }}>
                {
                  //job was stopped by admin OR payment finished without error
                  job.jobStatus === "STOP" &&
                  (job.hiringStatus === "REGISTER_STOP_ADMIN" || job.paymentStatus !== "PAYMENT_MATCHED_ERROR") && (
                    <div>
                      <Button variant="outlined" disabled style={{ marginBottom: 8 }}>
                        모집중지
                      </Button>
                    </div>
                  )
                }

                <Refund jobId={job.id} paymentDetail={job.paymentDetail} reloadJobInfo={reloadJobInfo} />


                {
                  <div>
                    <Typography>{job.manualRefund}</Typography>
                  </div>
                }

                {((job.hiringStatus !== "REGISTER_STOP_ADMIN" && job.paymentStatus === "PAYMENT_MATCHED_ERROR") ||
                  job.isRefunded ||
                  isAccessAllowManualPayment) && (
                    <div style={{ marginTop: 8 }}>
                      <Button
                        color="secondary"
                        variant="contained"
                        disabled={processing}
                        onClick={(e) => setManualPaymentAnchorEl(e.currentTarget)}
                        style={{ marginBottom: 8, fontWeight: "bold" }}
                      >
                        수동결제
                      </Button>
                      <Popover
                        open={!!manualPaymentAnchorEl}
                        anchorEl={manualPaymentAnchorEl}
                        onClose={() => setManualPaymentAnchorEl(null)}
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
                            }}
                          >
                            <Typography>Amount to process</Typography>
                            <TextField
                              value={manualAmountToProcess}
                              onChange={(e) => setManualAmountToProcess(e.target.value)}
                              rowsMax={2}
                            />
                          </div>
                          <Button
                            variant="outlined"
                            onClick={throttle(manualProcessPaymentAction, 2000, {
                              trailing: false,
                            })}
                          >
                            {processing ? <CircularProgress size={16} /> : "수동결제"}
                          </Button>
                        </div>
                      </Popover>
                    </div>
                  )}

                {
                  //while job is on OR has a payment error but not force stopped by an admin
                  (job.jobStatus !== "STOP" ||
                    (job.hiringStatus !== "REGISTER_STOP_ADMIN" && job.paymentStatus === "PAYMENT_MATCHED_ERROR")) && (
                    <div style={{ marginTop: 8 }}>
                      <Button
                        variant="outlined"
                        disabled={processing}
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                      >
                        모집중지
                      </Button>
                      <Popover
                        open={!!anchorEl}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
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
                            }}
                          >
                            <Typography>Note</Typography>
                            <TextField
                              value={adminJobStopReason}
                              onChange={(e) => setAdminJobStopReason(e.target.value)}
                              rowsMax={2}
                            />
                          </div>
                          <Button variant="outlined" onClick={handleStopReservation}>
                            {processing ? <CircularProgress size={16} /> : "모집중지"}
                          </Button>
                        </div>
                      </Popover>
                    </div>
                  )
                }
                <div style={{ marginTop: 8 }}>
                  <Button
                    variant="outlined"
                    disabled={processing}
                    onClick={throttle(() => sendPushesForJob(job.id), 20000, {
                      trailing: false,
                    })}
                  >
                    Send push
                  </Button>
                </div>

                {
                  // job.hiringStatus === 'REPORT_ABSENT_EMPLOYER' &&
                  <div style={{ marginTop: 8 }}>
                    <Button variant="outlined" color="primary" onClick={() => setShowJobRegistrationDialog(true)}>
                      공고복사
                    </Button>
                  </div>
                }
              </TableCell>

              <TableCell>
                <TextField
                  rowsMax={5}
                  multiline={true}
                  variant="outlined"
                  value={reservationOperationMemo}
                  onChange={(e) => setOperationMemo(e.target.value)}
                />
                <br />
                <br />
                <Button variant="outlined" onClick={saveOperationMemo}>
                  저장
                </Button>
              </TableCell>

              <TableCell>
                <DropButton
                  variant="outlined"
                  disabled={job.applyCount === 0}
                  onClick={() => {
                    if (showingSeekersButtonId === "normal") {
                      setOpen(false);
                      setShowingSeekersButtonId("");
                    } else {
                      showSeekers(0);
                      setShowingSeekersButtonId("normal");
                    }


                  }}
                  text={`${job.applyCount} 명`}
                />
                <br />
                <FocusableButton
                  variant="outlined"
                  disabled={processing}
                  onClick={() => setOpenBonusSoon(true)}
                  style={{ wordBreak: "keep-all" }}
                >
                  {processing ? <CircularProgress size={16} /> : "뽀너~쑨"}
                </FocusableButton>
              </TableCell>

              <TableCell
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderBottomWidth: 0,
                  justifyContent: "center",
                  height: "100%",
                  minWidth: 300,
                }}
              >
                {true ? (
                  map(range(1, size(job.bonusSoon) + 1), (index) => (
                    <DropButton
                      variant="outlined"
                      // disabled={size(applyingSeekers(index)) === 0}
                      onClick={() => {
                        if (showingSeekersButtonId === `bonus${job.bonusSoon[index - 1]}${index}`) {
                          setOpen(false);
                          setShowingSeekersButtonId("");
                        } else {
                          showSeekers(job.dataVersion ? job.bonusSoon[index - 1] : index);
                          setShowingSeekersButtonId(`bonus${job.bonusSoon[index - 1]}${index}`);
                        }
                      }}
                      dropEvent={({ seekerId, jobId }) =>
                        handleChangeSalaryBonusSoon({
                          seekerId,
                          bonusSoon: job.bonusSoon[index - 1],
                        })
                      }
                      style={{ marginBottom: 8, wordBreak: "keep-all" }}
                      text={`${utils.numberWithCommas(job.bonusSoon[index - 1])}원 | ${job.bonusSoonCreatedTime[index - 1] &&
                        job.bonusSoonCreatedTime[index - 1]!.format("MM-DD HH:mm").toString()
                        } | ${size(
                          applyingSeekers({
                            bonusSoon: job.bonusSoon[index - 1],
                            bonusSoonIndex: index,
                          })
                        )}명`}
                    />
                  ))
                ) : (
                  //old version
                  <FocusableButton
                    variant="outlined"
                    disabled={size(applyingSeekers({})) === 0}
                    onClick={() => {
                      if (showingSeekersButtonId === `bonus${job.bonusSoon}${0}`) {
                        setOpen(false);
                        setShowingSeekersButtonId("");
                      } else {
                        showSeekers(0);
                        setShowingSeekersButtonId(`bonus${job.bonusSoon}${0}`);
                      }
                    }}
                    style={{ marginBottom: 8, wordBreak: "keep-all" }}
                  >
                    {`${utils.numberWithCommas(job.bonusSoon)}원 | ${job
                      .bonusSoonCreatedTime!.format("MM-DD HH:mm")
                      .toString()} | ${size(applyingSeekers({}))}명`}
                  </FocusableButton>
                )}
              </TableCell>

              <TableCell>
                {map(goingToMatchSeekers, (goingToMatchSeeker) => (
                  <div key={goingToMatchSeeker.data.seekerUid + goingToMatchSeeker.hiringStatus}>
                    <div>
                      {goingToMatchSeeker.name}
                      <span style={{ fontWeight: 'bold', color: 'red' }}>{goingToMatchSeeker.assignType === "WNT" ? "(자동배정)" : ""}</span>
                    </div>
                    <div>
                      {moment.utc(goingToMatchSeeker.hireCareActions?.[0]?.updatedAt).local().format("YYYY-MM-DD HH:mm")}
                    </div>

                    <div>{goingToMatchSeeker.hiringStatus !== 'HIRED_OTHER' ? goingToMatchSeeker.hiringStatus : job?.hiredSeekers?.[goingToMatchSeeker?.data?.seekerUid] || goingToMatchSeeker.hiringStatus || ''}</div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                    >
                      {includes(goingToMatchSeeker.hiringStatus, "CANCEL") && (
                        <Button variant="outlined" disabled style={{ marginRight: 8 }}>
                          배정취소
                        </Button>
                      )}

                      {includes(goingToMatchSeeker.hiringStatus, "ABSENT") && (
                        <>
                          <Button variant="outlined" disabled>
                            무단결근처리
                          </Button>
                          <Button
                            style={{ marginLeft: 8 }}
                            variant="outlined"
                            disabled={processing}
                            onClick={() => {
                              setConfirmDialog({
                                text: `재배정 ???`,
                                action: () => {
                                  setConfirmDialog(null);
                                  reAllocateHiredSeeker(job.id, goingToMatchSeeker.data.seekerUid);
                                },
                              });
                            }}
                          >
                            {processing ? <CircularProgress size={16} /> : "재배정"}
                          </Button>
                          {goingToMatchSeeker.hiringStatus === "REPORT_ABSENT_ADMIN" && (
                            <Button
                              style={{ marginLeft: 8 }}
                              variant="outlined"
                              disabled={processing}
                              onClick={() => {
                                setConfirmDialog({
                                  text: `penalty 해제 ???`,
                                  action: () => {
                                    setConfirmDialog(null);
                                    removeSeekerPenalty(job.id, goingToMatchSeeker?.data?.seekerUid);
                                  },
                                });
                              }}
                            >
                              {processing ? <CircularProgress size={16} /> : "penalty 해제"}
                            </Button>
                          )}
                        </>
                      )}

                      {!includes(goingToMatchSeeker.hiringStatus, "ABSENT") &&
                        !includes(goingToMatchSeeker.hiringStatus, "CANCEL") && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginRight: 8,
                            }}
                          >
                            <Button
                              variant="outlined"
                              color="secondary"
                              disabled={processing || goingToMatchSeeker.hiringStatus === 'HIRED_OTHER'}
                              onClick={() => {
                                setConfirmDialog({
                                  text: `배정취소 ${isSendPushes ? "+ pushes" : " without sending push"} ???`,
                                  action: () => {

                                    setConfirmDialog(null);
                                    cancelSeekerMatching(
                                      job.id,
                                      goingToMatchSeeker?.data?.seekerUid || goingToMatchSeeker?.data?.seekerUid,
                                      false,
                                      isSendPushes
                                    );
                                  },
                                });
                              }}
                            >
                              배정취소
                            </Button>
                            {goingToMatchSeeker.hiringStatus !== 'HIRED_OTHER' && <FormControlLabel
                              control={
                                <Checkbox checked={isSendPushes} onChange={(e) => setSendPushes(e.target.checked)} />
                              }
                              label="Send push"
                            />}
                          </div>
                        )}
                      {!includes(goingToMatchSeeker.hiringStatus, "ABSENT") && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          disabled={processing}
                          onClick={() => {
                            setConfirmDialog({
                              text: "무단결근처리 ???",
                              action: () => {
                                setConfirmDialog(null);
                                cancelSeekerMatching(job.id, goingToMatchSeeker?.data?.seekerUid, true, isSendPushes);
                              },
                            });
                          }}
                        >
                          무단결근처리
                        </Button>
                      )}
                    </div>

                    {["HIRE_CANCEL_ADMIN"].includes(goingToMatchSeeker.hiringStatus) && !job.isStartTimePassed && (
                      <Button
                        style={{ marginTop: 8 }}
                        variant="outlined"
                        color="secondary"
                        disabled={processing}
                        onClick={() => {
                          setConfirmDialog({
                            text: `재배정 ${goingToMatchSeeker.name} ???`,
                            action: () => {
                              setConfirmDialog(null);
                              reAllocateHiredSeeker(job.id, goingToMatchSeeker.data.seekerUid);
                            },
                          });
                        }}
                      >
                        재배정
                      </Button>
                    )}
                    {/* 사장님이 결근처리해서 알바가 패널티된경우 */}
                    {"REPORT_ABSENT_EMPLOYER" === goingToMatchSeeker.hiringStatus && (
                      <Button
                        style={{ marginTop: 8 }}
                        variant="outlined"
                        disabled={processing}
                        onClick={() => {
                          setConfirmDialog({
                            text: `${goingToMatchSeeker.name} '신고(기타)' 로 바꿈 ???`,
                            action: () => {
                              setConfirmDialog(null);
                              changeSeekerFromAbsentToReportOnlyStatus(job.id, goingToMatchSeeker?.data?.seekerUid);
                            },
                          });
                        }}
                      >
                        '신고(기타)' 로 바꿈
                      </Button>
                    )}
                    {/* 결제이후 */}
                    {"PAYMENT_SOONY" === goingToMatchSeeker.hiringStatus && (
                      <Button
                        style={{ marginTop: 8 }}
                        variant="outlined"
                        disabled={processing}
                        onClick={() => {
                          setConfirmDialog({
                            text: `${goingToMatchSeeker.name} '신고(기타)' 로 바꿈 ???`,
                            action: () => {
                              setConfirmDialog(null);
                              changeSeekerStatusToReport(job.id, goingToMatchSeeker?.data?.seekerUid);
                            },
                          });
                        }}
                      >
                        '신고(기타)' 로 바꿈
                      </Button>
                    )}
                  </div>
                ))}
              </TableCell>
              <TableCell>
                {map(
                  goingToWorkSeekers,
                  (goingToWorkSeeker) =>
                    goingToWorkSeeker.hiringStatus && (
                      <div key={goingToWorkSeeker.seekerId + goingToWorkSeeker.hiringStatus}>
                        <div>{goingToWorkSeeker.name}</div>
                        <div>
                          {moment
                            .utc(goingToWorkSeeker.hireCareActions?.[1]?.updatedAt)
                            .local()
                            .format("YYYY-MM-DD HH:mm")}
                        </div>
                        {goingToWorkSeeker.hiringStatus.includes("CANCEL") && (
                          <Button variant="outlined" disabled>
                            배정취소
                          </Button>
                        )}

                        {goingToWorkSeeker.hiringStatus.includes("ABSENT") && (
                          <Button variant="outlined" disabled>
                            무단결근처리
                          </Button>
                        )}

                        {!goingToWorkSeeker.hiringStatus.includes("CANCEL") &&
                          !goingToWorkSeeker.hiringStatus.includes("ABSENT") && (
                            <Button
                              variant="outlined"
                              color="secondary"
                              disabled={goingToWorkSeeker.hiringStatus === 'HIRED_OTHER'}
                              onClick={() => {
                                setConfirmDialog({
                                  text: "배정취소 ???",
                                  action: () => {
                                    setConfirmDialog(null);
                                    cancelSeekerMatching(job.id, goingToWorkSeeker?.data?.seekerUid, false, isSendPushes);

                                  },
                                });
                              }}
                            >
                              배정취소
                            </Button>
                          )}
                        {!goingToWorkSeeker.hiringStatus.includes("ABSENT") && (
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              setConfirmDialog({
                                text: "무단결근처리 ???",
                                action: () => {
                                  setConfirmDialog(null);
                                  cancelSeekerMatching(job.id, goingToWorkSeeker.seekerId, true, isSendPushes);
                                },
                              });
                            }}
                          >
                            무단결근처리
                          </Button>
                        )}
                      </div>
                    )
                )}
              </TableCell>

              <TableCell style={{ maxWidth: 150 }}>
                {(job?.enterpriseCode || '').endsWith('02') === true ? (
                  <Typography style={{ color: 'green' }}>
                    결제 불필요
                  </Typography>
                ) : (
                  <Typography>
                    {job.paymentStatusHtml || ''}
                    {[
                      'PAYMENT_REPORT',
                      'PAYMENT_CANCEL_WITHIN_18_COMPLETED',
                      'PAYMENT_CANCEL_OUT_18_COMPLETED'
                    ].includes(job.paymentStatus) ? job.cancelTime : job.paymentProcessedDate || ''}
                  </Typography>
                )}
                <Typography style={{ color: "red" }}>{job.jobStopOnSchedule}</Typography>
              </TableCell>

              <TableCell>
                {goingToWorkSeeker && size(goingToWorkSeeker.hireCareActions) > 0 && (
                  <>
                    <div>{goingToWorkSeeker.name}</div>
                    {hiringCareReplyVerificationList(goingToWorkSeeker)}
                  </>
                )}
              </TableCell>

              <TableCell>
                {goingToWorkSeeker && (size(goingToWorkSeeker.hireCareActions) > 1 || goingToWorkSeeker?.hireCareActions?.map(h => h?.action)?.includes('HIRE_CHECK_ANSWER_OK_SEEKER')) && (
                  <>
                    <div>{goingToWorkSeeker.name}</div>
                    {afterHiringStatus(job, bonusSoonMoney)}
                  </>
                )}
              </TableCell>

              <TableCell>{jobReview?.attitudeRate || ''}</TableCell>
              <TableCell>{jobReview?.professionalRate || ''}</TableCell>
              <TableCell>{jobReview?.comment || ''}</TableCell>

              {/* <TableCell>{job.firstPaymentAmount}</TableCell> */}
              <TableCell>{!!job.paymentStatus && <div>{utils.numberWithCommas(job.paidAmount)}</div>}</TableCell>
              <TableCell>{!!job.paymentStatus && <div>{utils.numberWithCommas(job.matchingFee)}</div>}</TableCell>
              <TableCell>{job.paymentDetail.usedCash}</TableCell>
              <TableCell>{!!job.paymentStatus && <div>{utils.numberWithCommas(job.paidSalary)}</div>}</TableCell>
              {/* <TableCell>
                  {map(job.additionalPayOrRefund, (payment) => (
                    <div>{payment}</div>
                  ))}
                </TableCell> */}
              <TableCell>{bonusSoonMoney}</TableCell>
              <TableCell>{job.hourSalary}</TableCell>
              {/* <TableCell>{job.suggestionSalary}</TableCell> */}

              <TableCell>
                <Button
                  style={{ wordBreak: "keep-all" }}
                  variant="outlined"
                  disabled={job.markAsHiddenRegistration || processing}
                  onClick={() => {
                    setConfirmDialog({
                      text: `상황종료 ${job.id}???`,
                      action: () => {
                        setConfirmDialog();
                        markAsHiddenRegistration(job.id);
                      },
                    });
                  }}
                >
                  {processing ? <CircularProgress size={16} /> : "상황종료"}
                </Button>
              </TableCell>

              <TableCell>{job.storeAddress}</TableCell>
              <TableCell>{job.storeName}</TableCell>
              <TableCell>{job.storeBizKind}</TableCell>
              <TableCell>
                {job.id}
                <div style={{ cursor: 'pointer' }} onClick={() => handleCopyClick(job.id)}>
                  <ContentCopyIcon color='success' fontSize='small' />
                </div>
              </TableCell>
              <TableCell style={{ minWidth: 100 }}>{job.jobKind}</TableCell>
              <TableCell style={{ maxWidth: 300 }}>{job.jobSubKinds}</TableCell>
              <TableCell>{job.startDate}</TableCell>
              <TableCell>{job.reservationTimeBeforeStart}</TableCell>
              <TableCell>{job.paymentDetail.days}</TableCell>
              <TableCell>{`${job.startTime}~${job.endTimeInText || (job.endTime === "00:00" ? "24:00" : job.endTime)
                }`}</TableCell>
              <TableCell>{job.restTime}</TableCell>
              <TableCell>{job.diffTime - job.restTime}</TableCell>
              <TableCell>{job.isDailyLaborReport ? "O" : "X"}</TableCell>
              <TableCell>
                {job.earlyFinishWorkingTime
                  ? job?.earlyFinishWorkingTime?.includes?.("시간") || job.earlyFinishWorkingTime === "없음"
                    ? job.earlyFinishWorkingTime
                    : `${job.earlyFinishWorkingTime}시간`
                  : "없음"}
              </TableCell>

              <TableCell>{job.preferedAge}</TableCell>
              <TableCell>{job.preferedGender}</TableCell>
              <TableCell style={{ maxWidth: 400 }}>{job.preferedDetail}</TableCell>
              <TableCell style={{ maxWidth: 400 }}>
                <ul>
                  {map(job.jobMemo, (memo, index) => (
                    <li key={MemoTitles[index]}>
                      {MemoTitles[index]} <div style={{ fontWeight: "bold", color: "blue" }}>{memo}</div>
                    </li>
                  ))}
                </ul>
                {job.moreInfoAndRequirements}
              </TableCell>
              <TableCell>
                <TextField
                  rowsMax={5}
                  multiline={true}
                  variant="outlined"
                  value={adminJobNote}
                  onChange={(e) => setAdminJobNote(e.target.value)}
                  disabled={processing}
                  style={{ minWidth: 200, fontSize: 14 }}
                />
                <br />
                <br />
                <Button variant="outlined" onClick={saveAdminJobNote}>
                  {processing ? <CircularProgress size={24} /> : "저장"}
                </Button>
              </TableCell>
            </TableRow>

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
                          {open && <AppliedSeekerList
                            loadJob={() => {
                              reloadJobInfo();
                            }}
                            key={job.id}
                            seekers={filteredSeekers}
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

            <BonusSoonDialog open={openBonusSoon} onClose={() => setOpenBonusSoon(false)} onSubmit={bonusSoon} />

            {confirmDialog && (
              <Dialog open={Boolean(confirmDialog)} onClose={() => setConfirmDialog()}>
                <DialogContent>{confirmDialog.text}</DialogContent>
                <DialogActions>
                  <Button onClick={() => setConfirmDialog()}>Cancel</Button>
                  <Button onClick={confirmDialog.action}>OK</Button>
                </DialogActions>
              </Dialog>
            )}
            {showJobRegistrationDialog && (
              <JobRegistrationDialog job={job} onClose={() => setShowJobRegistrationDialog(false)} />
            )}
          </>
        </Grow>
      </DndProvider>
    )
  );
};

export default inject("ReservationStore")(observer(ReservationItemOld));
