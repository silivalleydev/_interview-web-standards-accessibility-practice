import React, { useState, useEffect } from "react";

import firebase from "firebase/app";
import { size, get, forEach, isArray, isEmpty, throttle, split, replace, compact, map } from "lodash";

import moment from "moment-timezone";
moment.tz("Asia/Seoul");
moment.locale("ko");

import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Button, Checkbox, Snackbar, CircularProgress, Popover, MenuItem, InputLabel, Select, TextField, Typography } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Refresh from "@material-ui/icons/Refresh";
import Pagination from "@material-ui/lab/Pagination";
import Paper from "@material-ui/core/Paper";
import MuiAlert from "@material-ui/lab/Alert";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DateRangePicker, SingleDatePicker } from "react-dates";
import { Box, FormControl, Grid, LinearProgress, Modal } from '@mui/material'

import { Job } from "../model/Job";
import { User } from "../model/User";
import { AppliedSeeker } from "../model/AppliedSeeker";
import utils from "../utils/utils";
import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import UploadButton from "../Components/UploadButton";
import { getApplyList, getJobs, salaryTransfer } from "../api/jobs";
import { getUsers } from "../api/users";
import { compareUserWithAccountHolder } from "../api/seeker";
import { getSeeker } from "../api/appliedSeeker";
import { clearReservationFromPayment, getEmployersBizInfo, getScheduledDepositDetails, getScheduledDepositDetailsDownload, updatePayDay } from "../api/transaction";
import { useHistory } from "react-router-dom";
import dayjs from 'dayjs';
import LoadingSpinner from "../Components/LoadingSpinner";


const useStyles = makeStyles({
  table: {
    minWidth: 2600,
  },
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const PaymentItem = inject("PaymentStore")(
  observer(
    ({
      index,
      job,
      sumCalculate,
      payments,
      selected,
      processPayment,
      PaymentStore,
      isAccessAllowTransfer,
      isAccessAllowClear,
      lastPayment = {},
      setIsProcessing,
      transferSuccessList = [],
      lastIndex,
      transferList,
      setTransferList,
      setPayments
    }) => {
      const [seeker, setSeeker] = useState<User>();
      const [hiredSeeker, setHiredSeeker] = useState<AppliedSeeker>();
      const [jobData, setJobData] = useState<Job>();
      const [cardInfo, setCardInfo] = useState();
      const [moneyToSeeker, setMoneyToSeeker] = useState<number>(0);
      const [paymentAlert, setPaymentAlert] = useState(false);
      const [paymentCompleted, setPaymentCompleted] = useState(false);
      const [loading, setLoading] = useState(false)
      const [focus, setFocus] = useState(false)
      const [isCardInfoLoadEnd, setIsCardInfoLoadEnd] = useState(false)
      const [downloadReason, setDownloadReason] = useState('')
      const [clear, setClear] = useState(false)
      const history = useHistory();

      const [checked, setChecked] = useState(selected);
      useEffect(() => {
        job && setJobData(job);
      }, [job.id]);

      useEffect(() => {
        if (jobData?.jobUid) {

        }
      }, [jobData])

      useEffect(() => {
        // if (!isCardInfoLoadEnd) {
        //   setIsProcessing(true)
        // } else {
        //   setIsProcessing(false)
        // }
      }, [isCardInfoLoadEnd, jobData, seeker, moneyToSeeker])

      useEffect(() => {

        if (selected || checked) {
          setChecked(true);
          const isJobExist = transferList.filter(job => job.jobId === jobData?.jobUid).length === 0;
          if (isJobExist) {
            setTransferList([...transferList, {
              jobId: jobData?.jobUid,
              seekerUid: jobData?.hiredSeekerUid,
              cardInfo: {
                cardHolder: jobData?.accountOwner,
                cardName: jobData?.bankName,
                cardNumber: jobData?.accountNumber,
              },
              amount: jobData?.depositAmount,
            }])
          }
        } else {
          setChecked(false);
          setTransferList(transferList.filter(job => job.jobId !== jobData?.jobUid))
        }
      }, [selected, jobData, checked]);

      useEffect(() => {
        if (jobData) {
          setPaymentCompleted(jobData.paymentStatus === "PAYMENT_COMPLETED");
          loadSeeker();
        }
      }, [jobData, seeker?.id]);

      useEffect(() => {
        if (jobData?.depositAmount > 0) {

          sumCalculate(checked ? +jobData?.depositAmount : -jobData?.depositAmount);
        }
      }, [checked, jobData?.depositAmount]);

      useEffect(() => {
        if (paymentCompleted) {
          PaymentStore.setSelectedPayment(index, false);
        } else {
          jobData && PaymentStore.setSelectedPayment(index, checked);
        }
      }, [checked, paymentCompleted]);

      useEffect(() => {
        if (processPayment && !paymentCompleted && checked && jobData && jobData?.hiredSeekerUid) {
          markPaymentCompletedForSeeker();
        }
      }, [processPayment]);

      useEffect(() => {
        if (jobData && hiredSeeker) {
          const toSeeker = get(jobData, "payment.toSeeker", 0);
          let moneyToSeekerVal = 0
          if (toSeeker > 0) {
            moneyToSeekerVal = (jobData.isCustomerDirectPaymentNBonusSoonExist === true
              ? jobData?.hiringStatus === 'REPORT_ETC_EMPLOYER'
                ? jobData?.toSeekerBonusSoon
                : getBonusSoon()
              : toSeeker)

            setMoneyToSeeker(moneyToSeekerVal)
          } else if (!["REPORT_ETC_EMPLOYER", "REPORT_ABSENT_EMPLOYER"].includes(jobData?.hiringStatus)) {
            //in case of 급여 (신고), do not show if the admin has not inputted the value
            moneyToSeekerVal = (jobData.isCustomerDirectPaymentNBonusSoonExist === true
              ? jobData?.hiringStatus === 'REPORT_ETC_EMPLOYER'
                ? jobData?.toSeekerBonusSoon
                : getBonusSoon()
              : jobData.seekerSalary +
              (jobData.paymentDetail.refundRate > 0 ? 0 : getBonusSoon()))
            setMoneyToSeeker(moneyToSeekerVal)
          }
        }
      }, [jobData, hiredSeeker]);

      useEffect(() => {

        seeker?.id && loadCardInfo(seeker?.id);
      }, [seeker?.id]);

      const handleCloseAlert = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }

        setPaymentAlert(false);
      };
      const getLoadSeekerCardInfoFunc = async (uid) => {

        const result = jobData.cardData || {};


        let cardData = {}
        // if (result.status === "OK") {
        if (result.uid) {
          // setCardInfo(result.data);
          // cardData = result.data;
          setCardInfo(result);
          cardData = result;
          if (jobData && hiredSeeker) {
            if (jobData?.hiringStatus === "REPORT_ETC_EMPLOYER") {
              const toSeeker = get(jobData, "payment.toSeeker", 0);
              if (toSeeker === 0) {
                return;
              }
            }
          }
        }
        // }
        if (jobData) {
          const result = await getHiredSeeker();

          PaymentStore.exportData.push({
            applyData: result,
            jobId: jobData.id,
            enterpriseCode: jobData.enterpriseCode,
            paymentAcceptedDate: jobData.paymentAcceptedDate,
            cardInfo: cardData,
            moneyToSeeker:
              jobData.isCustomerDirectPaymentNBonusSoonExist === true
                ? jobData?.hiringStatus === 'REPORT_ETC_EMPLOYER'
                  ? jobData.toSeekerBonusSoon
                  : getBonusSoon()
                : get(jobData, 'payment.toSeeker') >= 0
                  ? get(jobData, 'payment.toSeeker')
                  : jobData.seekerSalary +
                  (jobData.paymentDetail.refundRate > 0 ? 0 : getBonusSoon()),
          });
        }
        setIsCardInfoLoadEnd(true)
      };

      const loadCardInfo = (uid: string) => {
        getLoadSeekerCardInfoFunc(uid);
      };

      const getBonusSoon = () => {
        if (hiredSeeker && jobData) {
          if (typeof hiredSeeker.bonusSoon === 'number') {
            return hiredSeeker.bonusSoon;
          }


          const appliedTime = hiredSeeker.appliedTime;
          const bonusSoon = jobData.bonusSoon;
          const bonusSoonCreatedTime = jobData.bonusSoonCreatedTime;
          if (!isEmpty(bonusSoon)) {
            if (isArray(bonusSoon)) {
              const length = size(bonusSoonCreatedTime);

              for (let i = length - 1; i >= 0; i--) {
                if (appliedTime.isAfter(bonusSoonCreatedTime[i])) {
                  return +bonusSoon[i];
                }
              }

              return 0;
            } else {
              if (appliedTime.isBefore(bonusSoonCreatedTime)) {
                return 0;
              }
              return +bonusSoon;
            }
          }
        }

        return 0;
      };
      const getUserId = async () => {
        const getUserInfo = firebase.functions().httpsCallable("getUserInfo");
        const result = await getUserInfo({
          uid: jobData.hiredSeekerId,
        });
        const ret = result.data;
        ret.id = jobData.hiredSeekerId;
        ret && setSeeker(new User(ret));
      };
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
      const loadSeeker = () => {
        if (jobData && jobData.id && jobData.hiredSeekerId) {
          // getUserById(jobData.hiredSeekerId, (ret) => {
          //   ret && setSeeker(new User(ret));
          // });
          if (jobData.userData) {
            setSeeker(new User(jobData.userData));

          }
        } else {
          if (jobData && jobData.id && !jobData.hiredSeekerId) {
            setIsProcessing(false)
            setIsCardInfoLoadEnd(true)
          }
        }
      };
      const [seekerName, setSeekerName] = useState("");
      const [seekerCardHolder, setSeekerCardHolder] = useState("");
      const [isMatched, setIsMatched] = useState(true);

      useEffect(() => {
        if (seeker?.id) {
          handleGetAppliedSeeker();
        }
      }, [seeker?.id]);

      //지원한 알바 예금주 이름 비교
      const handleGetAppliedSeeker = async () => {
        const result = await compareUserWithAccountHolder({ userUid: jobData?.hiredSeekerUid });


        if (result.status === "OK") {
          setSeekerName(result.data.username);
          setSeekerCardHolder(result.data.accountHolderName);
          setIsMatched(result.data.isMatched);
        }
      };

      const [anchorEl, setAnchorEl] = useState(null);

      const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        handleGetAppliedSeeker();
      };

      const handleClose = () => {
        setAnchorEl(null);
      };

      const open = Boolean(anchorEl);
      const usernamePopId = open ? "simple-popover" : undefined;

      const getJobAppliedSeeker = async (jobId: string, seekerId: string, callback) => {
        const result = await getApplyList({
          uniqApplyId: `${seekerId}-${jobId}`,
        });

        if (result?.status === "OK" && result?.data?.length > 0) {
          await callback(result.data[0]);
          return result.data[0];
        } else {
          await callback(false);
          return false;
        }
      };
      const getHiredSeeker = () => {
        if (jobData && jobData.id && seeker?.id) {
          // return getJobAppliedSeeker(jobData.id, seeker?.id, (ret) => {

          //   ret && setHiredSeeker(new AppliedSeeker(ret));
          //   return new AppliedSeeker(ret)
          // });
          if (jobData.applyData) {
            setHiredSeeker(new AppliedSeeker(jobData.applyData));
            return new AppliedSeeker(jobData.applyData)
          }
        }
      };
      const markPaymentCompletedForSeekerAction = async (jobId, seekerId, cardInfo, amount, callback) => {
        const result = await salaryTransfer({
          jobId,
          seekerUid: seekerId,
          cardInfo,
          amount,
        });

        if (result?.status === "OK") {
          await callback(true);
          return true;
        } else {
          await callback(false);
          return false;
        }
      };
      const loadOneJob = async (uid, callback) => {
        const result = await getJobs({ uid });
        let data;
        if (result?.data && result?.data.length > 0) {
          data = result.data[0];
        }
        await callback(data);
      };
      const markPaymentCompletedForSeeker = () => {
        setPaymentCompleted(false);
        setLoading(true)

        markPaymentCompletedForSeekerAction(jobData?.jobUid, jobData?.hiredSeekerUid, {
          cardHolder: jobData?.accountOwner,
          cardName: jobData?.bankName,
          cardNumber: jobData?.accountNumber,
        }, jobData?.depositAmount, (ret) => {
          setLoading(false)

          setPaymentCompleted(true);
        });
      };

      const removeThisPaymentItem = async () => {
        const responce = confirm(`해당 내역을 삭제하시겠습니까? jobid:${jobData?.jobUid}`);
        if (responce) {
          const result = await clearReservationFromPayment({ jobId: jobData?.jobUid });
          if (result.status === "OK") {
            alert("삭제되었습니다.");
            setPayments([]);
            setTimeout(() => {
              setPayments([...payments.filter(payment => payment.jobUid != jobData?.jobUid)])
            }, 300)
          } else {
            alert("다시 시도해주세요");
          }
        }
      };

      const paymentType = () => {
        if (jobData?.hiringStatus === "REPORT_ETC_EMPLOYER") {
          return '신고(기타)'
        }

        switch (jobData?.paymentStatus) {
          case "PAYMENT_MATCHED":
          case "PAYMENT_MATCHED_ERROR":
          case "PAYMENT_APPROVED":
          case "PAYMENT_COMPLETED":
            return "급여";

          case "PAYMENT_CANCEL_WITHIN_18":
          case "PAYMENT_CANCEL_WITHIN_18_COMPLETED":
          case "PAYMENT_CANCEL_WITHIN_18_ERROR":
            return "배정취소";

          case "PAYMENT_REPORT":
          case "PAYMENT_REPORT_ERROR":
          case "PAYMENT_REPORT_COMPLETED":
            return "급여 (신고)";
        }
      };

      const [value, setValue] = React.useState();
      const [isLoding, setIsLoading] = React.useState(false);

      useEffect(() => {
        setValue(moment(jobData?.payDay))
      }, [jobData?.payDay])

      const handlePayday = async (newValue) => {
        if (jobData?.payDay !== newValue?.format('YYYY.MM.DD')) {
          if (confirm(`입금 예정일을 변경하시겠습니까?
${value.format('YYYY-MM-DD')} -> ${newValue.format('YYYY-MM-DD')}`)) {
            setIsLoading(true)
            setClear(true)
            const result = await updatePayDay({
              jobId: jobData?.jobUid,
              changeDate: newValue?.format('YYYY-MM-DD')
            })
            if (result?.status === 'OK') {
              setIsLoading(false)
              setValue(newValue)
              alert('변경되었습니다.')
              return
            } else {
              setIsLoading(false)
              setValue(dayjs(jobData?.payDay.replace('.', '-')?.replace('.', '-')))
              alert('실패했습니다.')
            }
            setIsLoading(false)
          } else {
            setTimeout(() => {
              setValue(dayjs(jobData?.payDay.replace('.', '-')?.replace('.', '-') + 'T00:00:00.000Z'))
            }, 500)


          }
          return

        }

      }

      if (clear === true) {
        return <></>
      }

      return (
        <TableRow >
          <TableCell>
            <Checkbox
              checked={transferList.filter(job => job.jobId === jobData?.jobUid).length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  const isJobExist = transferList.filter(job => job.jobId === jobData?.jobUid).length > 0;
                  if (isJobExist === false) {
                    setTransferList([...transferList, {
                      jobId: jobData?.jobUid,
                      seekerUid: jobData?.hiredSeekerUid,
                      cardInfo: {
                        cardHolder: jobData?.accountOwner,
                        cardName: jobData?.bankName,
                        cardNumber: jobData?.accountNumber,
                      },
                      amount: jobData?.depositAmount,
                      bonusSoon: jobData?.bonusSoon || 0
                    }])
                  }
                } else {
                  setTransferList(transferList.filter(job => job.jobId !== jobData?.jobUid))
                }
              }} />
          </TableCell>
          <TableCell className="TableCellWithDatePicker">


            <SingleDatePicker

              date={value} // 선택된 날짜를 전달
              // onDateChange={date => setValue(date)} // 날짜 선택 시 상태 업데이트
              onDateChange={(newValue) => handlePayday(newValue)}// 날짜 선택 시 상태 업데이트
              focused={focus}
              onFocusChange={({ focused }) => { setFocus(focused) }}
              id="your_unique_id" // 각 컴포넌트에 고유한 ID가 필요합니다.
              numberOfMonths={1} // 한 번에 표시할 월의 수
              isOutsideRange={() => false} // 모든 날짜 선택 가능
              displayFormat="YYYY-MM-DD" // 날짜 표시 형식
            />
          </TableCell>
          <TableCell>
            {get(jobData, "bankName") === "새마을금고연합회" ? "새마을금고" : get(jobData, "bankName")}
          </TableCell>
          <TableCell>{jobData?.accountNumber ? jobData?.accountNumber : ''}</TableCell>
          <TableCell>{jobData?.accountOwner ? jobData?.accountOwner : ''}</TableCell>
          <TableCell>{jobData?.seekerName ? jobData?.seekerName : ''}</TableCell>
          <TableCell>
            {/* 이름, 전화번호 팝업 */}
            {(jobData?.isSamePerson || !jobData?.accountNumber) ? undefined : (
              <div>
                <Button aria-describedby={usernamePopId} onClick={handleClick} style={{ right: 10 }}>
                  동일인X
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
                    <div style={{ fontSize: 16 }}>{`예금주 : ${seekerCardHolder}`}</div>
                    <div style={{ height: 10 }}></div>
                    <div style={{ fontSize: 16 }}>{`이름 : ${seekerName}`}</div>
                  </div>
                </Popover>
              </div>
            )}
          </TableCell>
          <TableCell>{jobData?.depositAmount && utils?.numberWithCommas(jobData?.depositAmount)}</TableCell>
          <TableCell>
            <Button
              variant="outlined"
              color={checked ? "primary" : "default"}
              disabled={!isAccessAllowTransfer || paymentCompleted || transferSuccessList.filter(job => job.jobId === jobData?.jobUid).length > 0}
              onClick={throttle(markPaymentCompletedForSeeker, 2000, {
                trailing: false,
              })}
            >
              {loading ? (
                <CircularProgress />
              ) : (paymentCompleted || paymentCompleted || transferSuccessList.filter(job => job.jobId === jobData?.jobUid).length > 0) ? (
                jobData?.depositAmount
              ) : (
                '급여이체'
              )}
            </Button>
            <Snackbar open={paymentAlert} autoHideDuration={2000} onClose={handleCloseAlert}>
              <Alert severity="success" onClose={handleCloseAlert}>
                Done
              </Alert>
            </Snackbar>
          </TableCell>
          <TableCell>{jobData?.depositClassification}</TableCell>
          <TableCell>
            {jobData?.bonusSoon}
          </TableCell>
          <TableCell>
            {jobData?.paymentAcceptedDate}
          </TableCell>
          <TableCell>{jobData?.hiredSeekerUid}</TableCell>
          <TableCell>
            {(jobData?.enterpriseCode || '').endsWith('02') === true
              ? jobData?.enterpriseCode
              : ''}
          </TableCell>
          <TableCell>

            {jobData?.jobUid ?
              <>
                <span style={{ cursor: 'pointer', marginRight: '4px' }} onClick={() => window.open('/reservation?jobId=' + jobData.jobUid, '_blank')}><OpenInNewIcon color='success' /></span>
                <span >
                  {jobData.jobUid
                  }</span>
              </>
              :
              ''}
          </TableCell>
          <TableCell>{jobData?.storeName ? jobData.storeName : ''}</TableCell>
          <TableCell>
            {jobData?.workStartDate}
          </TableCell>
          <TableCell>
            <Button variant="outlined" color="secondary" disabled={!isAccessAllowClear} onClick={removeThisPaymentItem}>
              지우기
            </Button>
          </TableCell>
        </TableRow>
      );
    }
  )
);

const Transaction = ({ PaymentStore }) => {
  const classes = useStyles();

  const [payments, setPayments] = useState([]);
  const [transferList, setTransferList] = useState([]);
  const [transferSuccessList, setTransferSuccessList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(true);
  const [paymentCheck, setPaymentCheck] = useState(false);
  const [paymentCount, setPaymentCount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false)

  const [startDateRange, setStartDateRange] = useState();
  const [endDateRange, setEndDateRange] = useState();
  const [dateRangeFocusInput, setDateRangeFocusInput] = useState();

  const [showPagination, setShowPagination] = useState(true);

  const [amount, setAmount] = useState(0);
  const [pageCount, setPageCount] = useState(20);

  const [processPayment, setProcessPayment] = useState(false);
  const [isAccessAllowTransfer, setAccessAllowTransfer] = useState<boolean>(true);
  const [isAccessAllowClear, setAccessAllowClear] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState('')
  const [downloadReason, setDownloadReason] = useState('')

  const [isOpenSaleryModal, setIsOpenSaleryModal] = useState(false)

  const [transferSalarymsg, setTransferSalarymsg] = useState('')
  const SLICE = 10;


  const doAllTransfer = (jobs = []) => {
    setTransferSalarymsg('급여이체가 진행중입니다.')

    if (jobs.length === 0) {
      setTransferSalarymsg('급여이체가 완료되었습니다.')
      setTransferSuccessList([])
      startDateRange &&
        endDateRange &&
        handleLoadPaymentHistoryByDate(
          moment(startDateRange).format("YYYY-MM-DD"),
          moment(endDateRange).format("YYYY-MM-DD"),
          1,
          1500
        );
      setIsOpenSaleryModal(false)

      return;
    }

    const targets = jobs.slice(0, SLICE).map(data => (salaryTransfer(data)));
    // const targets = jobs.slice(0, SLICE);

    const nextTargets = jobs.slice(SLICE, jobs.length);
    Promise.all(targets)
      .then(res => {
        setTransferSuccessList((prev) => [...prev, ...targets]);
        setTimeout(() => {
          doAllTransfer(nextTargets);
        }, 800)
      })
      .catch(err => {
        setTransferSalarymsg('일부 요청이 실패했습니다.')
      })

  }
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false)
    setInputPassword('')
  }

  const handleDownloadExcel = async () => {



    const result = await getScheduledDepositDetailsDownload({

      payDayFromStr: moment(startDateRange).format("YYYY-MM-DD"),
      payDayToStr: moment(endDateRange).format("YYYY-MM-DD"),
      password: inputPassword,
      downloadReason: downloadReason
    })

    const href = URL.createObjectURL(result);

    // create "a" HTML element with href to file & click
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', 'download.xlsx'); //or any other extension
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);


  };

  const [isFirst, setIsFirst] = useState(true)


  useEffect(() => {

    if (!!isFirst === false) {
      handleLoadPaymentHistoryByDate(startDateRange && moment(startDateRange).format("YYYY-MM-DD"),
        endDateRange && moment(endDateRange).format("YYYY-MM-DD"), currentPage, 1500);
      setProcessPayment(false);
    } else {
      setLoadingPage(false)
    }
  }, [currentPage]);

  useEffect(() => {
    !PaymentStore.ifAnyPaymentGotChecked && setProcessPayment(false);
  }, [PaymentStore.ifAnyPaymentGotChecked]);

  useEffect(() => {
    PaymentStore.exportData.length = 0;
  }, [payments]);

  const loadPaymentHistory = () => {
    setStartDateRange(null)
    setEndDateRange(null)
    setCurrentPage(1)
    handleLoadPaymentHistoryByDate();
  };

  const handlerEmployerUids = async (text) => {
    setLoadingPage(true);
    setIsProcessing(false)
    const uids = compact(split(text, "\r\n"));

    const reg = new RegExp(",", "g");

    const result = await getEmployersBizInfo({ uids: uids });
    setIsProcessing(false)
    if (result.status === "OK") {
      let csvContent = "data:text/csv;charset=utf-8,";
      const header = "userUid, bizNumber, companyName, ceoName, companyAddress, bizCateogory, bizKind, taxEmail\r\n";
      csvContent += header;
      const resultData = result?.dataList?.data || []
      forEach(resultData, (data) => {
        const { uid, bizNumber, employerId, userUid, companyName, ceoName, companyAddress, bizCategory, bizKind, taxEmail } = data;
        let row =
          userUid +
          "," +
          bizNumber +
          "," +
          replace(companyName, reg, "-") +
          "," +
          ceoName +
          "," +
          replace(companyAddress, reg, "-") +
          "," +
          replace(bizCategory, reg, "-") +
          "," +
          replace(bizKind, reg, "-") +
          "," +
          taxEmail +
          "\r\n";
        csvContent += row;
      });

      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "my_data.csv");
      document.body.appendChild(link); // Required for FF

      link.click();
    }
    setLoadingPage(false);
  };

  const handleLoadPaymentHistoryByDate = async (startDate, endDate, initPage, pageSize) => {

    setLoadingPage(true);
    setPaymentCount(0);
    setAmount(0);
    setPaymentCheck(false);
    setIsProcessing(true)
    setPayments([]);

    const result = await getScheduledDepositDetails({ payDayStartStr: startDate, payDayEndStr: endDate, page: initPage || currentPage, pageSize: pageSize || 20 });
    setIsProcessing(false)
    if (result.status === "OK") {
      const totalPageCount = result?.dataList?.totalPageCount || 20
      setTimeout(() => {
        setIsProcessing(false)
      }, 500)
      setPageCount(totalPageCount)
      setPayments(result.dataList?.data);
      console.log('result.dataList?.data', result.dataList?.data)
      setLoadingPage(false);
    }
  };

  const sumCalculate = (value) => {

    if (amount + value < 0) return;

    setPaymentCount((paymentCount) => paymentCount + (value > 0 ? 1 : -1));
    setAmount((amount) => amount + value);
  };

  return (
    <div>
      <LoadingSpinner isLoading={isProcessing} />
      <div style={{ display: "flex", flexDirection: "row", marginBottom: 12 }}>
        <Modal
          open={isOpenSaleryModal}
          onClose={() => { }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <CircularProgressWithLabel value={transferList.length > 0 ? Math.round((transferSuccessList.length / transferList.length) * 100) : 0} />

            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'gray', marginTop: '10px' }}>
              {transferSalarymsg}
            </div>
          </Box>
        </Modal>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <DateRangePicker
            startDate={startDateRange} // momentPropTypes.momentObj or null,
            startDateId="start_date" // PropTypes.string.isRequired,
            endDate={endDateRange} // momentPropTypes.momentObj or null,
            endDateId="end_date" // PropTypes.string.isRequired,
            onDatesChange={({ startDate, endDate }) => {
              setStartDateRange(startDate);
              setEndDateRange(endDate);
            }} // PropTypes.func.isRequired,
            focusedInput={dateRangeFocusInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
            onFocusChange={setDateRangeFocusInput} // PropTypes.func.isRequired,
            isOutsideRange={() => false}
            minimumNights={0}
          />
          <Button
            style={{ marginLeft: 12 }}
            color={loadingPage ? 'inherit' : 'primary'}
            variant="contained"
            disabled={loadingPage}
            onClick={() => {
              setShowPagination(false);
              setIsFirst(false)
              setCurrentPage(1)
              setTransferList([])
              setTransferSuccessList([])
              startDateRange &&
                endDateRange &&
                handleLoadPaymentHistoryByDate(
                  moment(startDateRange).format("YYYY-MM-DD"),
                  moment(endDateRange).format("YYYY-MM-DD"),
                  1,
                  1500
                );

            }}
          >
            검색
          </Button>
          {!showPagination && (
            <>
              <Button style={{ marginLeft: '4px', marginRight: '4px', width: '65px', height: '36px', background: '#046E39', color: 'White', fontSize: '16px', fontWeight: '500px' }} onClick={handleOpen}>
                엑셀
              </Button>
              <ExcelModal
                open={open}
                handleClose={handleClose}
                inputPassword={inputPassword}
                setInputPassword={setInputPassword}
                handleDownloadExcel={handleDownloadExcel}
                downloadReason={downloadReason}
                setDownloadReason={setDownloadReason}
              />
            </>
          )}
          {/* 초기호ㅣ */}
          {/* <Button disabled={loadingPage} style={{ marginLeft: '4px', marginRight: '4px', width: '65px', height: '36px', background: 'red', color: 'White', fontSize: '16px', fontWeight: '500px' }} onClick={loadPaymentHistory}>
 초기화
 </Button> */}
          {!loadingPage && <UploadButton onTextReturn={handlerEmployerUids} />}

        </div>
      </div>
      {
        !!isFirst === false &&
        <div>
          <TableContainer style={{ overflowX: 'unset' }} component={Paper}>
            {transferList.length > 0 && (
              <div style={{ display: "flex", gap: 25, flexDirection: 'row', width: '100%', backgroundColor: 'beige', padding: 12 }}>
                <div style={{ color: '#333333', fontWeight: 600, fontSize: 16 }}>총 급여: {utils.numberWithCommas(transferList.reduce((prev, curr) => prev + curr.amount, 0))}원</div>
                <div style={{ color: "#333333", fontWeight: 600, fontSize: 16 }}>총 건수: {transferList.length}</div>
                <div style={{ color: "#333333", fontWeight: 600, fontSize: 16 }}>총 보너쑨 금액: {utils.numberWithCommas(transferList.reduce((prev, curr) => prev + (curr?.bonusSoon || 0), 0))}원</div>
              </div>
            )}
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Checkbox checked={paymentCheck} onChange={(e) => {
                      setPaymentCheck(e.target.checked)
                      if (e.target.checked) {
                        setTransferList(payments.map((jobData = {}) => ({
                          jobId: jobData?.jobUid,
                          seekerUid: jobData?.hiredSeekerUid,
                          cardInfo: {
                            cardHolder: jobData?.accountOwner,
                            cardName: jobData?.bankName,
                            cardNumber: jobData?.accountNumber,
                          },
                          amount: jobData?.depositAmount,
                          bonusSoon: jobData?.bonusSoon || 0

                        })))
                      } else {
                        setTransferList([])
                      }
                    }} />
                  </TableCell>
                  <TableCell>입금예정일</TableCell>
                  <TableCell>은행명</TableCell>
                  <TableCell>계좌번호</TableCell>
                  <TableCell>예금주</TableCell>
                  <TableCell>이름</TableCell>
                  <TableCell>동일인여부</TableCell>
                  <TableCell>입금액</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      disabled={!PaymentStore.ifAnyPaymentGotChecked}
                      onClick={() => {
                        setIsOpenSaleryModal(true)
                        doAllTransfer(transferList);
                      }}
                    >
                      급여이체
                    </Button>
                  </TableCell>
                  <TableCell>입금구분</TableCell>
                  <TableCell>보너쑨</TableCell>
                  <TableCell>입금승인일</TableCell>
                  <TableCell>uid</TableCell>
                  <TableCell>코드</TableCell>
                  <TableCell>jobId</TableCell>
                  <TableCell>점포명</TableCell>
                  <TableCell>근무일</TableCell>
                </TableRow>
              </TableHead>
              {isProcessing && <CircularProgress />}
              <TableBody>
                {payments.map((row, index) => (
                  <PaymentItem
                    setPayments={setPayments}
                    payments={payments}
                    transferSuccessList={transferSuccessList}
                    transferList={transferList}
                    setTransferList={setTransferList}
                    index={index}
                    key={row.id}
                    job={row}
                    selected={paymentCheck}
                    processPayment={processPayment}
                    sumCalculate={sumCalculate}
                    isAccessAllowTransfer={isAccessAllowTransfer}
                    isAccessAllowClear={isAccessAllowClear}
                    lastPayment={payments?.[payments.length - 1]}
                    lastIndex={payments.length - 1}
                    setIsProcessing={setIsProcessing}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      }
    </div >
  );
};



const ExcelModal = ({
  open,
  handleClose,
  inputPassword,
  setInputPassword,
  downloadReason,
  setDownloadReason,
  handleDownloadExcel,

}) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={mdoalStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>비밀번호 확인</div>
          <div style={{ marginBottom: '20px' }}>개인정보가 담긴 파일을 다운로드하려면 비밀번호와 사유 확인이 필요합니다.</div>
          <div style={{ marginBottom: '20px' }}>업무 목적 종료시 다운로드 받은 문서는 지체없이 삭제하시기 바라며 업무상 필요에 의해 문서를 기기에 저장할 때는 반드시 암호를 다시 걸어 주시기 바랍니다.</div>


          <TextField
            style={{ maxHeight: '36px' }}
            size="small"
            required
            type="password"
            label="비밀번호"
            InputLabelProps={{
              shrink: true,
            }}
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            id="filled-start-adornment"
            variant='outlined'
            fullWidth
          />
          <div style={{ marginBottom: '10px' }} />
          <FormControl sx={{ m: 1, minWidth: 80 }} size='small' fullWidth>
            <InputLabel id="demo-simple-select-autowidth-label">사유</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-select-small"
              label="사유"
              required
              fullWidth
              style={{
                // width: '130px',
                maxHeight: '36px',
                minHeight: '36px',
                height: '36px',
                marginRight: '4px'
              }}
              value={downloadReason}
              variant='outlined'
              onChange={(e) => setDownloadReason(e.target.value)}
            >
              <MenuItem value={'거래내역 검수'}>거래내역 검수</MenuItem>
              <MenuItem value={'사업자 회원 검수'}>사업자 회원 검수</MenuItem>
              <MenuItem value={'세금계산서 발행'}>세금계산서 발행</MenuItem>
              <MenuItem value={'급여이체'}>급여이체</MenuItem>
              <MenuItem value={'기타'}>기타</MenuItem>
            </Select>
          </FormControl>

          <div style={{ marginBottom: '10px' }} />

          <Button disabled={!inputPassword || !downloadReason} style={{ height: '36px', background: (!inputPassword || !downloadReason) ? "#d9d9d9" : '#574EDF', color: 'White', fontSize: '16px', fontWeight: '500px' }} onClick={() => handleDownloadExcel()}>
            엑셀 다운로드
          </Button>
        </div>
      </Box>
    </Modal>

  )
}


const mdoalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default inject("PaymentStore")(observer(Transaction));

function CircularProgressWithLabel(
  props
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress size={50} color='primary' variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontWeight: '500px', fontSize: '15px', color: 'InfoText' }}>
          {`${Math.round(props.value)}%`}
        </div>
      </Box>
    </Box>
  );
}
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '24px;'

};