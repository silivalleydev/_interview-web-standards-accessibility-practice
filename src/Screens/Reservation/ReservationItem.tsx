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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import Tooltip from '@mui/material/Tooltip';


import moment from "moment-timezone";
moment.tz("Asia/Seoul");
moment.locale("ko");

import firebase from "firebase/app";
import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  maxHeight: 800,
  bgcolor: 'background.paper',
  borderRadius: 10,
  boxShadow: 24,
  p: 3,
  overflowY: 'auto'
};

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
  Divider,
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
import { shareToSlack } from '../../api/slack';
import SendToSlackButton from "../../Components/SendToSlackButton";
import { blob } from "stream/consumers";

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

const ReservationItem = ({
  data,
  doNotShowHiddenJobByAdmin,
  ReservationStore,
  isOpenAllApplyList,
  isAccessAllowManualPayment,
}) => {
  const MemoTitles = ["근무지설명", "구체적인 업무설명", "필수복장 및 준비물", "추가 요청사항"];

  const [open, setOpen] = useState(false);
  const [openJbInfo, setOpenJbInfo] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

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

  const [slackChannelCode, setslackChannelCode] = useState('SOON-DEV-TEST')
  const [targetCode, settargetCode] = useState('ALL')
  const [seekerUid, setseekerUid] = useState('')
  const [tossOid, settossOid] = useState('')
  const [tossTid, settossTid] = useState('')

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
      return <div style={{ fontWeight: "bold", color: "red", fontSize: "14px" }}>결제카드 미등록</div>;
    }
    if (job.cancelTime) {
      return <div style={{ fontWeight: "bold", color: "orange", fontSize: "14px" }}>배정취소</div>;
    }


    if (job.paymentStatus === "PAYMENT_MATCHED_ERROR") {
      return <div style={{ fontWeight: "bold", color: "orange", fontSize: "14px" }}>결제오류</div>;
    }

    if (job.paymentStatus === "PAYMENT_MATCHED_COMPLETED") {
      return <div style={{ fontWeight: "bold", color: "orange", fontSize: "14px" }}>{job.manualRefund}</div>;
    }

    const hoursBeforeStart = moment(job.startDatetime).diff(moment(), "hours", true);
    if (hoursBeforeStart < 0) {
      return <div style={{ fontWeight: "bold", color: "orange", fontSize: "14px" }}>근무 중</div>;
    }

    return <div style={{ fontSize: "14px", fontWeight: "bold" }}>배정완료</div>;
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
            // ret = "입금승인완료";
            // time = job.paymentAcceptedDate;
            if (job.paymentStatus === 'PAYMENT_COMPLETED') {
              return <div style={{ fontWeight: 'bold' }}>급여이체완료</div>
            }

            return <div style={{ fontWeight: 'bold' }}>입금승인완료</div>

          case "HIRE_CHANGE_EMPLOYER":
          case "REGISTER_SOONY":
            ret = "입금승인대기";
            const afterEndTime2DayMomentStr = moment(job.original.endDate).add(2, "day").format("YYYY.MM.DD HH:mm:ss");

            const isThisMomentIsAfterEndTime2Days = moment().isAfter(moment(job.original.endDate).add(2, "day"));

            if (isThisMomentIsAfterEndTime2Days === true) {
              ret = "자동승인";
              time = afterEndTime2DayMomentStr;
            }
            break;
        }

        switch (job.paymentStatus) {
          case "PAYMENT_COMPLETED":
            // ret = "급여이체완료";
            // time = job.paymentCompletedDate;
            return <div>급여이체완료</div>

          case "PAYMENT_MATCHED_ERROR":
            ret = "결제오류";
            time = job.paymentProcessedDate;
            break;
        }

        return (
          <div style={{ fontWeight: "bold", fontSize: 14 }}>
            {/* {ret === "급여이체완료" && (
              <>
                <div style={{ fontWeight: "bold", fontSize: 14 }}>입금승인완료</div>
                <div style={{ fontWeight: "bold", fontSize: 12 }}>{job.paymentAcceptedDate}</div>
              </>
            )} */}
            <div style={{ fontSize: 14 }}>{ret}</div>
            <div style={{ fontSize: 14 }}>{time}</div>
            {ret === "입금승인대기" && !showButtons && <ReportButton job={job} />}
          </div>
        );
      }

      if (moment().isAfter(job.startDatetime)) {
        return <div style={{ fontWeight: "bold", fontSize: 14 }}>근무 중</div>;
      }
    }

    if (!isEmpty(job.hiredSeekers) && includes(job.hiringStatus, "CANCEL")) {
      return <div style={{ fontWeight: "bold", fontSize: 14 }}>배정취소</div>;
    }

    const absentIndex = indexOf(values(job.hiredSeekers), "REPORT_ABSENT_EMPLOYER");
    if (absentIndex >= 0) {
      return (
        <div>
          <div style={{ fontWeight: "bold", color: "red", fontSize: 14 }}>신고(결근)</div>
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
    return adminAbsentIndex >= 0 ? <div style={{ fontWeight: "bold", color: "red" }}>무단결근</div> : null;
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

  const doManualProcessPayment = async (jobId, hiredSeekerId, amount) => {
    try {
      const paymentRet = await manualProcessPayment({
        jobId,
        hiredSeekerId,
        amount,
      });

      if (paymentRet?.status === "OK") {
        reloadJobInfo();
        setProcessing(false);
        setManualPaymentAnchorEl(null);
        alert('수동결제 처리되었습니다.')

        return true;
      } else {
        setProcessing(false);
        alert(paymentRet.message)
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
        doManualProcessPayment(job.id, job.hiredSeekerId, amount);
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
      setCopySuccess(true)
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const infoRowStyles = {
    row: {
      display: 'flex', flexDirection: 'row', marginBottom: '3px', justifyContent: 'flex-start', alignItems: 'center', position: 'relative'
    },
    label: {
      color: '#959dad', fontWeight: "bold", fontSize: 14, marginRight: 20
    },
    subLabelWrapper: {
      backgroundColor: "#D2E7FF", display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: "3px 5px", borderRadius: '6px'
    },
    subLabelText: {
      color: "#3692FF", fontWeight: 'bold', fontSize: "12px"
    },
    value: { fontSize: 13, fontWeight: "bold" },
  };

  const InfoRow: React.FC<{ label: string; value: string, subLabel?: string }> = ({ label, value, subLabel }) => (
    <>

      <div style={infoRowStyles.row}>

        <div style={infoRowStyles.label
        } > {label}</ div>
        {
          value ?
            <div style={infoRowStyles.value}>{value || "NO DATA"}</div>
            :
            <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"NO DATA"}</div>
        }
      </div>
      {
        subLabel &&
        <div style={infoRowStyles.subLabelWrapper}>
          <div style={infoRowStyles.subLabelText}>
            {"30%공제"}
          </div>
        </div>
      }
    </>

  );




  // const isHidden = doNotShowHiddenJobByAdmin && job.markAsHiddenRegistration;
  const isHidden = doNotShowHiddenJobByAdmin;
  return (
    !isHideReservation && (
      <DndProvider backend={HTML5Backend}>
        <Grow in={!isHidden} onExited={hideRowAfterStopingJob}>
          <>
            <TableRow>
              <TableCell align="center">
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 4 }}>


                  {
                    job?.enterpriseCode &&
                    <div style={{ backgroundColor: '#FF4242', borderRadius: 4, padding: '4px 8px' }}>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }} >
                        고객사 공고
                      </div>
                    </div>

                  }
                  {
                    job?.isCopied &&
                    <div style={{ backgroundColor: '#3ED131', borderRadius: 4, padding: '4px 8px' }}>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }} >
                        복사된 공고
                      </div>
                    </div>

                  }
                </div>
                <div style={{ fontSize: 14, cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleCopyClick(job.id)}>
                  {job.id}
                </div>
                {copySuccess &&
                  <div style={{ position: 'absolute', left: 300, zIndex: 100 }}>
                    <Alert style={{}} icon={<CheckIcon fontSize="inherit" />} severity="success">
                      {'복사 완료'}
                    </Alert>
                  </div>
                }
                <div style={{ height: 10 }}></div>
                <SendToSlackButton
                  jobId={job.id}
                  // seekerUid={goingToWorkSeekers.filter(s => !s?.hiringStatus?.includes('CANCEL')).length > 0 && goingToWorkSeekers.filter(s => !s?.hiringStatus?.includes('CANCEL'))?.[0]?.data?.seekerUid}
                  seekerUid={goingToWorkSeekers.sort((a, b) =>
                    moment(b?.hireCareActions?.filter(f => f?.action === 'HIRE_CHECK_ANSWER_OK_SEEKER')?.[0]?.updatedAt) - moment(a?.hireCareActions?.filter(f => f?.action === 'HIRE_CHECK_ANSWER_OK_SEEKER')?.[0]?.updatedAt)
                  )?.[0]?.data?.seekerUid}
                  tossOid={tossOid}
                  tossTid={job?.tid}
                  employerUid={job.employerId}
                  contractId={goingToWorkSeekers.filter(s => !s?.hiringStatus?.includes('CANCEL')).sort((a, b) =>
                    moment(b?.hireCareActions?.filter(f => f?.action === 'HIRE_CHECK_ANSWER_OK_SEEKER')?.[0]?.updatedAt) - moment(a?.hireCareActions?.filter(f => f?.action === 'HIRE_CHECK_ANSWER_OK_SEEKER')?.[0]?.updatedAt)
                  )?.[0]?.contractId
                  }
                />
              </TableCell>
              <TableCell align="center">
                {goingToWorkSeeker
                  ? job.isEndTimePassed
                    ? afterHiringStatus(job, bonusSoonMoney, false)
                    : job.isStartTimePassed
                      ? job.jobOnGoingStatus === 'REPORT_BTN' ? (
                        <>
                          <div style={{ fontWeight: "bold", color: "orange", fontSize: 14 }}>근무 중</div>
                          <ReportButton job={job} reloadJobInfo={reloadJobInfo} />
                        </>) : job.jobOnGoingStatus === 'REPORT_BTN' ? (
                          <>
                            <div style={{ fontWeight: "bold", color: "orange", fontSize: 14 }}>근무 중</div>
                            <ReportButton job={job} reloadJobInfo={reloadJobInfo} />
                          </>) : job.jobOnGoingStatus === 'REFUND_100_BTN' ?
                        <div>
                          {job.paymentDetail.refundRate === 70 &&
                            (job.paymentDetail.isAllRefund ? (
                              <div style={{ marginBottom: 5, color: '#D8DCE5', fontSize: 14 }}>
                                100% 환불 완료
                              </div>
                            ) : (
                              <Button
                                variant="contained"
                                size="small"
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


                        </div>
                        : job.jobOnGoingStatus
                      : hiringCareReplyVerification(goingToWorkSeeker) || gotStatusWithoutHiringCare()
                  : job.jobOnGoingStatus === 'REPORT_BTN' ? (
                    <>
                      <div style={{ fontWeight: "bold", color: "orange", fontSize: 14 }}>근무중</div>
                      <ReportButton job={job} reloadJobInfo={reloadJobInfo} />
                    </>) : job.jobOnGoingStatus === 'REFUND_100_BTN' ?
                    <div>
                      {job.paymentDetail.refundRate === 70 &&
                        (job.paymentDetail.isAllRefund ? (
                          <div style={{ fontSize: 14, color: '#D8DCE5' }}>
                            100% 환불 완료
                          </div>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
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
                    </div>
                    :
                    job.jobOnGoingStatus || job.paymentStatusHtml}

                {
                  job?.hiringStatus === 'HIRE_CANCEL_EMPLOYER' && <div style={{ fontWeight: "bold" }}>배정취소</div>
                }

                {
                  job.cancelReason &&
                  <div style={{ fontSize: 14, textAlign: 'left' }}>
                    {job.cancelReason}
                  </div>
                }
                {
                  job.seekerChangingReason &&
                  <div style={{ fontSize: 14, textAlign: 'left' }}>
                    {job?.seekerChangingReason}
                  </div>
                }
              </TableCell>
              <TableCell align="center">
                {/* <InfoRow label="배정완료" value={goingToWorkSeekers.filter(s => !s?.hiringStatus?.includes('CANCEL'))?.[0]?.hireCareActions?.filter(f => f.action === 'HIRE_CHECK_ANSWER_OK_SEEKER')?.[0]?.updatedAt || ''} /> */}
                <InfoRow label="공고예약" value={job?.createdAt || ''} />
                <InfoRow label="결제완료" value={job?.paymentProcessedDate || ''} />
                <InfoRow label="입금예정" value={job?.payDay || ''} />
                <InfoRow label="승인완료" value={job?.paymentAcceptedDate || ''} />
                <InfoRow label="이체완료" value={job.paymentCompletedDate || ''} />
                <InfoRow
                  label="예약취소"
                  value={job.hiringStatus === "REGISTER_CANCEL_SOONY" ? (job.reservationCanceledAt || job.updatedAt) : ''}
                />
                <InfoRow
                  label={job.paymentDetail.refundRate === 70 ? "배정취소" : "배정취소"}
                  subLabel={job.paymentDetail.refundRate === 70}
                  value={job.cancelTime || ''}
                />
                <InfoRow
                  label="모집중지"
                  value={job?.hiringStatus === 'REGISTER_STOP_ADMIN' ? (job.stopReservationAt || job.updatedAt) : ''}
                />

              </TableCell>

              <TableCell align="center">
                {/* 사장이름 정보 */}
                <div>
                  <div style={{ color: 'red' }}>
                    {job?.enterpriseCode}
                  </div>
                  <Link component="button" variant="body1" onClick={loadEmployer}>
                    {job.employerId || '이름등록필요'}
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
                                    maxRows={5}
                                    classes={{
                                      root: styles.input,
                                    }}
                                  />
                                  <Button
                                    style={{
                                      marginTop: 10,
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
                </div>


                {job.storeName}
                {/* <br />
                {job.storeBizKind} */}

              </TableCell>
              {/* 공고정보 */}
              <TableCell align='left' >
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
                <div style={{ fontWeight: '500', fontSize: 14 }}>
                  {job.jobKind}
                </div>
                <div style={{ fontWeight: '500', fontSize: 14 }}>
                  {`${job.startDate}`}
                </div>
                <div style={{ fontWeight: '500', fontSize: 14 }}>
                  {job.startTime} ~ {job.endTimeInText || (job.endTime === "00:00" ? "24:00" : job.endTime)}
                </div>
                <div style={{ height: 3 }} />
                <Button
                  size='small'
                  variant='outlined'
                  style={{ borderWidth: 1, borderColor: '#574EDF', color: '#574EDF', width: '100%' }}
                  onClick={() => setOpenJbInfo(true)}
                >상세 보기
                </Button>
                {/* 공고 정보 모달 */}
                <Modal
                  open={openJbInfo}
                  onClose={() => setOpenJbInfo(false)}
                >
                  <Box sx={style}>
                    <div style={{ color: '#171A1F', fontWeight: 'bold', fontSize: '22px' }}>
                      {job.storeName}
                      <span style={{ color: '#959DAD', fontSize: '16px', marginLeft: 4 }}>
                        {job.storeBizKind}
                      </span>
                    </div>
                    <Tooltip title={`공고 등록 시간`}>
                      <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '3px', color: '#959DAD', width: '140px' }}>
                        {job.createdAt}
                        {/* {job.markAsHiddenRegistration && <div>상황종료</div>} */}
                      </div>
                    </Tooltip>

                    <div style={{ height: 30 }} />
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 50 }}>
                      {/* 공고 정보 */}
                      <div style={{ width: '100%' }}>
                        <div style={{ color: '#171A1F', fontWeight: 'bold', fontSize: '18px', marginBottom: 20 }}>공고 정보</div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            업무
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {job.jobKind}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            업무 상세
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {job.jobSubKinds}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: job.seekerAssigningTimeHistory.length > 0 ? 4 : 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            배정 예정 시간
                          </div>
                          <IconButton style={{ padding: 0 }} onClick={(e) => setSeekerAssigningTimeAnchorEl(e.currentTarget)}>
                            <div
                              style={{
                                fontSize: 16,
                                cursor: 'pointer',
                                color: '#3A81D4',
                                fontWeight: 'bold'
                              }}>
                              {job.seekerAssigningTime}
                            </div>
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
                        </div>
                        {job.seekerAssigningTimeHistory.length > 0 &&

                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }} >
                            <div style={{ width: '150px' }} />
                            <div>
                              {map(job.seekerAssigningTimeHistory, (time) => (
                                <div style={{ color: "#666", fontSize: 16 }}>{time}</div>
                              ))}

                            </div>

                          </div>
                        }



                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            근무 날짜
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {job.startDate}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            근무 장소
                          </div>
                          <div style={{ color: '#353942', fontSize: 16, width: '250px' }}>
                            {job.storeAddress}
                          </div>
                        </div>
                        {/* 준비물 */}
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            일용직 근로자 신고
                          </div>
                          <div style={{ color: '#353942', fontSize: 16, justifyContent: 'space-between' }}>
                            {job.isDailyLaborReport ? "O" : "X"}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            나이
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {job.preferedAge}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            성별
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {job.preferedGender}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            필요 정보
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {job.preferedDetail}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            추가 정보
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {/* 추가 요청 */}
                            {map(job.jobMemo, (memo, index) => (
                              <div >
                                {MemoTitles[index]} <div style={{ fontWeight: "bold", color: "blue" }}>{memo}</div>
                              </div>
                            ))}

                            <div style={{ color: '#353942', fontSize: 16, width: '250px' }}>
                              {job.moreInfoAndRequirements}
                            </div>
                          </div>
                        </div>




                      </div>
                      <div style={{ width: '100%' }}>
                        <div style={{ color: '#171A1F', fontWeight: 'bold', fontSize: '18px', marginBottom: 20 }}>시간</div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            근무 시간
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {job.startTime} ~ {job.endTimeInText || (job.endTime === "00:00" ? "24:00" : job.endTime)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            무급 휴게시간
                          </div>
                          <div style={{ color: '#353942', fontSize: 16, justifyContent: 'space-between' }}>
                            {job.restTime}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            하루 총 근무시간
                          </div>
                          <div style={{ color: '#353942', fontSize: 16, justifyContent: 'space-between' }}>
                            {job.diffTime - job.restTime}시간
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            조기 퇴근 가능성
                          </div>
                          <div style={{ color: '#353942', fontSize: 16, justifyContent: 'space-between' }}>
                            {job.earlyFinishWorkingTime
                              ? job?.earlyFinishWorkingTime?.includes?.("시간") || job.earlyFinishWorkingTime === "없음"
                                ? job.earlyFinishWorkingTime
                                : `${job.earlyFinishWorkingTime}시간`
                              : "없음"
                            }
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            예약 ~ 근무시간
                          </div>
                          <div style={{ color: '#353942', fontSize: 16, justifyContent: 'space-between' }}>
                            {job.reservationTimeBeforeStart}
                          </div>
                        </div>

                        <div style={{ color: '#171A1F', fontWeight: 'bold', fontSize: '18px', marginBottom: 20 }}>결제 금액</div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            시급
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {job.hourSalary}원
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>

                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            급여
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {<div>{utils.numberWithCommas(job.paidSalary)}원</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>

                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            매칭비
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {<div>{utils.numberWithCommas(job?.matchingFee)}원</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>

                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            수수료율
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {<div>{job?.paymentDetail?.matchingFee}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>

                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            할인캐시
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {job.paymentDetail.usedCash}캐시
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>

                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            보너쑨
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {bonusSoonMoney}원
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, }}>
                          <div style={{ color: '#959DAD', fontSize: 16, width: '150px' }}>
                            총결제
                          </div>
                          <div style={{ color: '#353942', fontSize: 16 }}>
                            {<div>{utils.numberWithCommas(job.paidAmount)}원</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Box>
                </Modal>

              </TableCell>

              <TableCell align="center" >
                {
                  //job was stopped by admin OR payment finished without error
                  job.jobStatus === "STOP" &&
                  (job.hiringStatus === "REGISTER_STOP_ADMIN" || job.paymentStatus !== "PAYMENT_MATCHED_ERROR") && (
                    <Button
                      size="small"
                      style={{ width: '100%', marginBottom: 5 }}
                      variant="outlined"
                      disabled
                    >
                      모집중지
                    </Button>
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
                    <div>
                      <Button
                        size="small"
                        style={{ width: '100%', marginBottom: 5, background: '#574EDF' }}
                        color="secondary"
                        variant="contained"
                        disabled={processing}
                        onClick={(e) => setManualPaymentAnchorEl(e.currentTarget)}
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
                            size="small"
                            style={{ width: '100%', marginBottom: 5 }}
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
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        style={{ width: '100%', marginBottom: 5, borderColor: '#574EDF', color: '#574EDF' }}
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
                          <Button
                            size="small"
                            style={{ width: '100%', marginBottom: 5 }}
                            variant="outlined"
                            onClick={handleStopReservation}>
                            {processing ? <CircularProgress size={16} /> : "모집중지"}
                          </Button>
                        </div>
                      </Popover>
                    </>

                  )
                }

                {
                  // job.hiringStatus === 'REPORT_ABSENT_EMPLOYER' &&
                  <Button
                    size="small"
                    style={{ width: '100%', borderColor: '#574EDF' }}
                    variant="outlined" color="primary" onClick={() => setShowJobRegistrationDialog(true)}>
                    공고복사
                  </Button>
                }
              </TableCell>


              <TableCell>
                <TextField
                  maxRows={5}
                  fullWidth
                  minRows={5}
                  multiline={true}
                  variant="outlined"
                  value={reservationOperationMemo}
                  onChange={(e) => setOperationMemo(e.target.value)}
                />
                <Button size="small" style={{ width: '100%', marginTop: 10, borderWidth: 1, borderColor: '#D8DCE5' }} variant="outlined"
                  onClick={saveOperationMemo}
                >
                  저장
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button
                  style={{ minWidth: 100 }}
                  size="small"
                  variant="outlined"
                  endIcon={<KeyboardArrowDownIcon />}
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
                >
                  {`${job.applyCount} 명`}
                </Button>
                <div style={{ height: 5 }}></div>

                <Button
                  size='small'
                  variant='outlined'
                  disabled={processing}
                  onClick={() => setOpenBonusSoon(true)}
                  style={{ minWidth: 100 }}
                >
                  {processing ? <CircularProgress size={16} /> : "보너쑨 생성"}
                </Button>
                <div style={{ height: 5 }}></div>

                {
                  map(range(1, size(job.bonusSoon) + 1), (index) => (
                    <Tooltip title={job.bonusSoonCreatedTime[index - 1] &&
                      job.bonusSoonCreatedTime[index - 1]!.format("M/D HH:mm").toString()}>

                      <DropButton
                        // disabled={size(applyingSeekers(index)) === 0}
                        variant='outlined'
                        size='small'
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
                        text={
                          <>
                            <div style={{ fontWeight: '14px', color: '#8E95A3' }}>
                              {`${utils.numberWithCommas(job.bonusSoon[index - 1])}원, ${size(
                                applyingSeekers({
                                  bonusSoon: job.bonusSoon[index - 1],
                                  bonusSoonIndex: index,
                                })
                              )}명`}
                            </div>
                          </>
                        }
                      />
                    </Tooltip>

                  ))
                }
              </TableCell>




              {/* 배정예정알바 */}
              <TableCell>
                {map(goingToMatchSeekers, (goingToMatchSeeker) => (
                  <div key={goingToMatchSeeker.data.seekerUid + goingToMatchSeeker.hiringStatus}
                    style={{ marginBottom: 10 }}
                  >
                    <Tooltip title={
                      goingToMatchSeeker.hiringStatus !== 'HIRED_OTHER' ?
                        goingToMatchSeeker.hiringStatus :
                        job?.hiredSeekers?.[goingToMatchSeeker?.data?.seekerUid] || goingToMatchSeeker.hiringStatus || ''
                    }>
                      <div>

                        <div style={{ fontSize: 14 }}>
                          {goingToMatchSeeker.name}
                          <span style={{ marginLeft: 2, fontWeight: 'bold', color: 'red', fontSize: 12 }}>{goingToMatchSeeker.assignType === "WNT" ? "(자동배정)" : ""}</span>
                        </div>


                        <div style={{ fontSize: 14, fontSize: 12, fontWeight: 'bold', marginBottom: 3 }}>
                          {goingToMatchSeeker.hireCareActions?.[0]?.updatedAt ?
                            moment.utc(goingToMatchSeeker.hireCareActions?.[0]?.updatedAt).local().format("YYYY-MM-DD HH:mm")
                            :
                            ''}
                        </div>


                        <div>
                        </div>
                      </div>
                    </Tooltip>

                    {includes(goingToMatchSeeker.hiringStatus, "CANCEL") && (
                      <div style={{ color: '#9A9BA7', fontWeight: 'bold', fontSize: 13 }}>
                        배정 취소
                      </div>
                    )}

                    {includes(goingToMatchSeeker.hiringStatus, "ABSENT") && (
                      <div style={{ color: '#9A9BA7', fontWeight: 'bold', fontSize: 13 }}>
                        무단 결근 알바
                      </div>
                    )}

                    {includes(goingToMatchSeeker.hiringStatus, "ABSENT") && (
                      <Button
                        style={{ width: '100%', marginBottom: 3 }}
                        variant="outlined"
                        size="small"
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
                    )}
                    {/* {includes(goingToMatchSeeker.hiringStatus, "ABSENT") &&  goingToMatchSeeker.hiringStatus === "REPORT_ABSENT_ADMIN" && (
                          <Button
                            style={{ width: '100%' }}
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
                        )} */}
                    {/* {goingToMatchSeeker.hiringStatus !== 'HIRED_OTHER' && <FormControlLabel
                              control={
                                <Checkbox checked={isSendPushes} onChange={(e) => setSendPushes(e.target.checked)} />
                              }
                              label="Send push"
                            />} */}

                    {!includes(goingToMatchSeeker.hiringStatus, "ABSENT") &&
                      !includes(goingToMatchSeeker.hiringStatus, "CANCEL") && (

                        <Button
                          variant="outlined"
                          size="small"
                          style={{ width: '100%', marginBottom: 3 }}
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
                          배정 취소
                        </Button>

                      )}
                    {!includes(goingToMatchSeeker.hiringStatus, "ABSENT") && (
                      <Button
                        variant="outlined"
                        style={{ width: '100%', marginBottom: 3 }}
                        size="small"
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
                        무단결근
                      </Button>

                    )}

                    {["HIRE_CANCEL_ADMIN"].includes(goingToMatchSeeker.hiringStatus) && !job.isStartTimePassed && (
                      <Button
                        style={{ width: '100%', marginBottom: 3 }}
                        size="small"
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
                        style={{ width: '100%', marginBottom: 3 }}
                        size="small"
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
                        신고(기타)
                      </Button>
                    )}
                    {/* 결제이후 */}
                    {"PAYMENT_SOONY" === goingToMatchSeeker.hiringStatus && (
                      <Button
                        size="small"
                        style={{ width: '100%', marginBottom: 3 }}
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
                        신고(기타)
                      </Button>
                    )}
                  </div>
                ))}
              </TableCell>
              {/* 배정확정알바 */}
              <TableCell>
                {map(
                  goingToWorkSeekers,
                  (goingToWorkSeeker) =>
                    goingToWorkSeeker.hiringStatus && (
                      <div
                        key={goingToWorkSeeker.seekerId + goingToWorkSeeker.hiringStatus}
                        style={{ marginBottom: 10 }}
                      >

                        <div >

                          <div style={{ fontSize: '14px' }}>{goingToWorkSeeker?.name}</div>

                          {
                            goingToWorkSeeker?.contractId ?
                              <div style={{ paddingTop: 3, paddingBottom: 3, textAlign: 'center', paddingLeft: 5, paddingRight: 5, borderRadius: 6, backgroundColor: '#F4F7FA', width: '110px' }}>
                                <div
                                  variant="outlined"
                                  onClick={() => window.open(`https://app.modusign.co.kr/documents/${goingToWorkSeeker?.contractId}`, '_blank')}
                                  style={{ color: '#5742df', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                                  size="small"
                                >
                                  근무이행 동의서
                                </div>
                              </div>
                              : undefined
                          }

                        </div>

                        <div style={{ fontSize: 14, fontSize: 12, fontWeight: 'bold', marginBottom: 3 }}>
                          {
                            goingToWorkSeeker.hireCareActions?.[1]?.updatedAt ?
                              moment
                                .utc(goingToWorkSeeker.hireCareActions?.[1]?.updatedAt)
                                .local()
                                .format("YYYY-MM-DD HH:mm")
                              : ''}
                        </div>
                        {goingToWorkSeeker.hiringStatus.includes("CANCEL") && (
                          <div style={{ color: '#9A9BA7', fontWeight: 'bold', fontSize: 13 }}>
                            배정취소
                          </div>
                        )}

                        {goingToWorkSeeker.hiringStatus.includes("ABSENT") && (
                          <div style={{ color: '#9A9BA7', fontWeight: 'bold', fontSize: 13 }}>
                            무단결근
                          </div>
                        )}

                        {!goingToWorkSeeker.hiringStatus.includes("CANCEL") &&
                          !goingToWorkSeeker.hiringStatus.includes("ABSENT") && (
                            <Button
                              variant="outlined"
                              color="secondary"
                              size="small"
                              style={{ width: '100%', marginBottom: 3 }}
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
                            size="small"
                            style={{ width: '100%', marginBottom: 3 }}
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
                            무단결근
                          </Button>
                        )}
                      </div>
                    )
                )}
              </TableCell>

              <TableCell>
                {
                  job?.tid ?
                    <Tooltip title={`${job?.tid}`}>

                      <div style={{ paddingTop: 3, textAlign: 'center', paddingBottom: 3, paddingLeft: 5, paddingRight: 5, borderRadius: 6, backgroundColor: '#E3FFE4', width: '110px' }}>
                        <div
                          onClick={() => window.open(`https://dashboard.tosspayments.com/receipt/sales-slip?transactionId=${job?.tid}`, '_blank')}
                          style={{ color: '#57B95B', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                        >
                          토스 매출전표
                        </div>
                      </div>
                    </Tooltip>
                    : undefined
                }
                {(job?.enterpriseCode || '').endsWith('02') === true ? (
                  <div style={{ color: 'green', fontWeight: 'bold', fontSize: 14 }}>
                    결제 불필요
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 14, color: 'green' }}>
                      {job.paymentStatusHtml || ''}
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: 12 }}>

                      {[
                        'PAYMENT_REPORT',
                        'PAYMENT_CANCEL_WITHIN_18_COMPLETED',
                        'PAYMENT_CANCEL_OUT_18_COMPLETED'
                      ].includes(job.paymentStatus) ? job.cancelTime : job.paymentProcessedDate || ''}
                    </div>
                  </div>
                )}
                <div
                  style={{ color: 'red', fontWeight: 'bold', fontSize: 14 }}>
                  {job.jobStopOnSchedule}
                </div>
              </TableCell>

              <TableCell align="center">
                {goingToWorkSeeker && size(goingToWorkSeeker.hireCareActions) > 0 && (
                  <>
                    <div style={{ fontWeight: 'bold', fontSize: 14 }}>
                      {goingToWorkSeeker.name}
                    </div>
                    {hiringCareReplyVerificationList(goingToWorkSeeker)}
                  </>
                )}
              </TableCell>

              <TableCell align="center">
                {goingToWorkSeeker && (size(goingToWorkSeeker.hireCareActions) > 1 || goingToWorkSeeker?.hireCareActions?.map(h => h?.action)?.includes('HIRE_CHECK_ANSWER_OK_SEEKER')) && (
                  <>
                    <div style={{ fontWeight: 'bold', fontSize: 14 }}>
                      {goingToWorkSeeker.name}
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {afterHiringStatus(job, bonusSoonMoney)}
                    </div>
                  </>
                )}
              </TableCell>
              {/* 
              <TableCell align="">
                <div>
                  {jobReview?.attitudeRate}
                </div>
                <div>
                  {jobReview?.professionalRate}
                </div>
                <div>
                  {jobReview?.comment}
                </div>
              </TableCell> */}

              {/* <TableCell align="">
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
              </TableCell> */}


              <TableCell align="center">
                <TextField
                  maxRows={5}
                  minRows={5}
                  multiline={true}
                  variant="outlined"
                  value={adminJobNote}
                  onChange={(e) => setAdminJobNote(e.target.value)}
                  disabled={processing}
                  style={{ minWidth: 200, fontSize: 14 }}
                />

                <Button
                  size="small"
                  style={{ width: '100%', marginTop: 10, borderWidth: 1, borderColor: '#D8DCE5' }}
                  variant="outlined" onClick={saveAdminJobNote}>
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
        </Grow >
      </DndProvider >
    )
  );
};

export default inject("ReservationStore")(observer(ReservationItem));
