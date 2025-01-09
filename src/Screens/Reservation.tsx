import { forEach, isEmpty, join, map, split, throttle } from "lodash";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { DateRangePicker } from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";

import moment from "moment-timezone";
moment.tz("Asia/Seoul");
moment.locale("ko");

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


import { Button, CircularProgress } from "@material-ui/core";

import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Pagination from "@material-ui/lab/Pagination";

import TableCell from "@material-ui/core/TableCell";
import { Job } from "../model/Job";
import ReservationItem from "./Reservation/ReservationItem";
import SearchingBox from "./Reservation/SearchingBox";
import { getFinishedJobs, getJobs } from "../api/jobs";
import {
  loadJobsForBonusoonApi,
  loadJobsForCreatedAt,
  loadJobsForSearchingapi,
  loadJobsForStartDate,
  loadReservationsOrderByStartDateApi,
} from "../api/reservationFilter";
import { loadReservationsByDateEnterpriseCodeList } from "../api/enterprise";
import LoadingSpinner from "../Components/LoadingSpinner";


const useStyles = makeStyles({
  table: {

  },
});

const ReservationList = ({ reservations, doNotShowHiddenJobByAdmin, isAccessAllowManualPayment, isOpenAllApplyList }) =>
  map(reservations, (row, idx) => (
    <ReservationItem
      isOpenAllApplyList={isOpenAllApplyList}
      key={`ReservationItem-${idx}`}
      data={row}
      doNotShowHiddenJobByAdmin={doNotShowHiddenJobByAdmin}
      isAccessAllowManualPayment={isAccessAllowManualPayment}
    />
  ));


const Reservation = () => {
  const searchParams = new URLSearchParams(location.search)
  const enterpriseCreatedAtStart = searchParams.get('createdAtStart')
  const enterprisereatedAtEnd = searchParams.get('createdAtEnd')
  const targetCode = searchParams.get('targetCode')
  const directJobId = searchParams.get('jobId')

  const ITEMS_PER_PAGE = 20;

  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const tableRef = useRef(null);

  const [isSearching, setSearching] = useState(false);
  const [isResetInput, setIsResetInput] = useState(false);

  const [reservations, setReservations] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(100);

  const [loadingPage, setLoadingPage] = useState(false);
  const [createdAtLoadingPage, setCreatedAtLoadingPage] = useState(false);
  const [startDateLoadingPage, setStartDateLoadingPage] = useState(false);
  const [jobFilter, setJobFilter] = useState(false);

  const [orderByStartDate, setOrderByStartDate] = useState(false);

  const [isRecentSeekerSwitch, setIsRecentSeekerSwitch] = useState(false);
  const [isBonusoonSwitch, setIsBonusoonSwitch] = useState(false);


  const [init, setInit] = useState(false);
  const [initSearch, setInitSearch] = useState(false);
  const [createDateRange, setCreateDateRange] = useState(false);
  const [startDateRange, setStartDateRange] = useState();
  const [endDateRange, setEndDateRange] = useState();
  const [createdAtStart, setCreatedAtStart] = useState();
  const [createdAtEnd, setCreatedAtEnd] = useState();
  const [startDateStart, setStartDateStart] = useState();
  const [startDateEnd, setStartDateEnd] = useState();
  const [dateRangeFocusInput, setDateRangeFocusInput] = useState();
  const [createdAtRangeFocusInput, setCreatedAtRangeFocusInput] = useState();
  const [startDateRangeFocusInput, setStartDateRangeFocusInput] = useState();
  const [isOpenAllApplyList, setIsOpenAllApplyList] = useState(false);

  const reset = (resetFns = []) => {
    resetFns.forEach((fn) => fn(false));
  };


  useEffect(() => {
    if (directJobId) {
      setInit(true)
      setInitSearch(true);

      setTimeout(() => {
        getJobs({
          uid: directJobId
        }).then((result = {}) => {

          if (result.status === "OK") {
            setReservations([...result.data]);
            setLoadingPage(false);
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          }
        })
          .catch(err => { console.log('getJobs err', err) })
      }, 100)

    }
  }, [directJobId])



  const [isAccessAllowManualPayment, setAccessAllowManualPayment] = useState<boolean>(false);

  //종료된 공고 필터 버튼
  const handleClick = () => {
    setInitSearch(true)
    setSearching(false)
    setIsResetInput(true);
    const newJobFilterState = !jobFilter;
    setJobFilter(newJobFilterState);

    if (newJobFilterState) {
      reset([
        setOrderByStartDate, //시작일순
        setCreatedAtStart, //공고등록일
        setCreatedAtEnd, //공고등록일
        setIsRecentSeekerSwitch, //최근 지원자 순
        setIsBonusoonSwitch, //뽀너쑨
        setStartDateStart, //출근일
        setStartDateEnd, //출근일
        setCreateDateRange
      ]);
    } else {
      setJobFilter(false)
      setReservations([])
    }
  };

  //시작일순 필터 버튼
  const handleOrderByStartDate = () => {
    setCurrentPage(1);
    setSearching(false)
    setInitSearch(true)
    setIsResetInput(true);
    const newOrderFilterState = !orderByStartDate;
    setOrderByStartDate(newOrderFilterState);

    if (newOrderFilterState) {
      reset([
        setCreatedAtStart,
        setCreatedAtEnd,
        setIsRecentSeekerSwitch,
        setIsBonusoonSwitch,
        setStartDateStart,
        setStartDateEnd,
        setJobFilter,
        setCreateDateRange
      ]);
    } else {
      setOrderByStartDate(false);
      setReservations([]);
    }
  };


  // 최근지원자순 필터 버튼
  const handleRecentSeekerClick = () => {
    setCurrentPage(1);
    setSearching(false)
    setInitSearch(true)
    setIsResetInput(true);
    const newRecentFilterState = !isRecentSeekerSwitch;
    setIsRecentSeekerSwitch(newRecentFilterState);

    if (newRecentFilterState) {
      reset([
        setCreatedAtStart,
        setCreatedAtEnd,
        setOrderByStartDate,
        setIsBonusoonSwitch,
        setStartDateStart,
        setStartDateEnd,
        setJobFilter,
        setCreateDateRange
      ]);
    } else {
      setIsRecentSeekerSwitch(false);
      setReservations([]);
    }
  };



  // 뽀너순 필터 버튼
  const handleBonusoonSwitchClick = () => {
    setCurrentPage(1);
    setSearching(false)
    setInitSearch(true)
    setIsResetInput(true);
    const newBonusoonFilterState = !isBonusoonSwitch;
    setIsBonusoonSwitch(newBonusoonFilterState);

    if (newBonusoonFilterState) {
      reset([
        setIsRecentSeekerSwitch,
        setCreatedAtStart,
        setCreatedAtEnd,
        setOrderByStartDate,
        setStartDateStart,
        setStartDateEnd,
        setJobFilter,
        setCreateDateRange

      ]);
    } else {
      setIsBonusoonSwitch(false);
      setReservations([])
    }
  };


  // 최신순 필터

  const handleCreateSwitchClick = () => {
    setCurrentPage(1);
    setSearching(false)
    setInitSearch(true)
    setIsResetInput(true);
    const newCreateFilterState = !createDateRange;
    setCreateDateRange(newCreateFilterState);

    if (newCreateFilterState) {
      reset([
        setIsRecentSeekerSwitch,
        setCreatedAtStart,
        setCreatedAtEnd,
        setOrderByStartDate,
        setStartDateStart,
        setStartDateEnd,
        setJobFilter,
        setIsBonusoonSwitch,


      ]);
    } else {
      setCreateDateRange(false)
      setReservations([])
    }
  }



  useEffect(() => {
    const id = localStorage.getItem("@id");
    if (id === 'soo' || id === 'hugo' || id === 'eden') {
      setAccessAllowManualPayment(true)
    }
  }, []);
  const loadReservationsByDateEnterpriseCode = async () => {

    const result = await loadReservationsByDateEnterpriseCodeList({
      page: currentPage,
      createdAtStartStr: moment(createdAtStart).format('YYYY-MM-DD'),
      createdAtEndStr: moment(createdAtEnd).format('YYYY-MM-DD'),
      enterpriseCode: targetCode,

    })

    if (result.status === 'OK') {
      setReservations([...result.data])
      setCreatedAtLoadingPage(false)
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
    return
  }

  useEffect(() => {
    if (targetCode) {
      loadReservationsByDateEnterpriseCode({
        createdAtStart: enterpriseCreatedAtStart,
        createdAtEnd: enterprisereatedAtEnd,
        enterpriseCode: targetCode,
      })
    }
  }, [targetCode, currentPage])


  //필터 함수
  const loadFunc = async () => {
    if (isSearching || targetCode || directJobId) {
      return
    }
    setReservations([]);
    setPages(10000);

    if (query.has("isFromTransaction")) {
      query.delete("isFromTransaction");

      try {
      } catch (e) {
        setReservations([]);
      }
    }
    //공고등록일
    else if (createdAtEnd || createdAtEnd) {
      handleLoadJobsForCreatedAt();
    }
    //시작일
    else if (startDateStart || startDateEnd) {
      handleLoadJobsForStartDate();
    }
    //종료된 공고
    else if (!!jobFilter === true) {
      loadReservations(currentPage);
    }

    //최근지원자
    else if (!!isRecentSeekerSwitch === true) {
      loadJobsForSearching()
    }
    //보너쑨
    else if (!!isBonusoonSwitch === true) {
      loadJobsForBonusoon()
    }
    else {
      loadReservationsNotHiddenByAdmin(orderByStartDate);
    }
  };
  useEffect(() => {


    if (init) {
      if (jobFilter || orderByStartDate || isBonusoonSwitch || isRecentSeekerSwitch || createDateRange) {
        loadFunc();
      }
    } else {
      setInit(true)
    }
  }, [
    jobFilter,
    currentPage,
    orderByStartDate,
    isSearching,
    isRecentSeekerSwitch,
    isBonusoonSwitch,
    createDateRange,
    query,
    targetCode,
  ]);


  //공고 등록일
  const handleLoadJobsForCreatedAt = async () => {
    setLoadingPage(true)
    setCreatedAtLoadingPage(true);
    reset([
      setOrderByStartDate,
      setIsRecentSeekerSwitch,
      setIsBonusoonSwitch,
      setStartDateStart,
      setStartDateEnd,

    ]);

    const result = await loadJobsForCreatedAt({
      createdAtStartStr: moment(createdAtStart).format("YYYY-MM-DD"),
      createdAtEndStr: moment(createdAtEnd).format("YYYY-MM-DD"),
    });
    setLoadingPage(false)
    if (result.status === "OK") {
      setReservations([...result.data]);
      setCreatedAtLoadingPage(false);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
    setCreatedAtLoadingPage(false);
  };

  //출근일
  const handleLoadJobsForStartDate = async () => {
    setStartDateLoadingPage(true);
    setLoadingPage(true)

    const result = await loadJobsForStartDate({
      startDateStr: moment(startDateStart).format("YYYY-MM-DD"),
      endDateStr: moment(startDateEnd).format("YYYY-MM-DD"),
      page: currentPage,
    });
    setLoadingPage(false)
    if (result.status === "OK") {
      setReservations([...result.data]);
      setStartDateLoadingPage(false);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }

  };
  //종료된 공고까지 보기
  const loadReservations = async (currentPage: number) => {
    setLoadingPage(true);

    const result = await getJobs({
      page: currentPage,
    });
    if (result.status === "OK") {
      setReservations([...result.data]);
      setLoadingPage(false);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };



  // 보너쑨 필터
  const loadJobsForBonusoon = async () => {


    setLoadingPage(true);
    const result = await loadJobsForBonusoonApi({
      page: currentPage,
    });
    if (result.status === "OK") {
      setReservations([...result.data]);
      setLoadingPage(false);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };



  // 시작일순 필터
  const loadReservationsOrderByStartDate = async () => {
    setLoadingPage(true);


    const result = await loadReservationsOrderByStartDateApi({
      page: currentPage,
    });
    if (result.status === "OK") {
      setReservations([...result.data]);
      setLoadingPage(false);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };




  // 최근 지원자순 필터
  const loadJobsForSearching = async () => {


    setLoadingPage(true);
    const result = await loadJobsForSearchingapi({
      page: currentPage,
    });
    if (result.status === "OK") {
      setReservations([...result.data]);
      setLoadingPage(false);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }

  };


  //기본검색
  const loadReservationsNotHiddenByAdminAction = async (page = 1, noOfItemPerPage = 30, callback) => {
    let data = [];
    try {
      const offset = (page - 1) * noOfItemPerPage;

      if (offset < 0) return null;
      const result = await getJobs({
        page,
        // markAsHiddenRegistration: null,
      });
      const jobs = result.data;

      data = map(jobs, (data) => ({ id: data.uid, ...data })).sort((a, b) => b.createdAt - a.createdAt);
    } catch (ex) {
    }

    await callback(data);
  };

  const loadReservationsNotHiddenByAdmin = async (orderByStartDate: boolean) => {
    setLoadingPage(true);
    if (orderByStartDate) {
      setLoadingPage(true);
      /**
       * 당일 검색 시점 기준 이후 공고만 검색(근무 시작 시간에 가까운 공고) -> 뽀너쑨해서라도 빨리 구인해야하는 공고들
       */
      const result = await loadReservationsOrderByStartDate({
        page: currentPage,
      });
      if (result?.status === "OK") {
        setReservations([...result.data]);
        setLoadingPage(false);
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    } else {
      loadReservationsNotHiddenByAdminAction(currentPage, ITEMS_PER_PAGE, (ret) => {
        setReservations([...ret]);
        setLoadingPage(false);
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      });
    }
  };
  const loadData = throttle(
    () =>
      startDateRange &&
      endDateRange &&
      loadFinishedJobs(
        startDateRange.clone().toISOString(),
        endDateRange.clone().toISOString()
      ),
    5000,
    { trailing: false }
  );

  const loadFinishedJobs = async (startDateRange: Date, endDateRange: Date) => {

    const strDate = moment(startDateRange).format('YYYY-MM-DD')
    const endDate = moment(endDateRange).format('YYYY-MM-DD')
    setLoadingPage(true);

    try {
      const ret = await getFinishedJobs({ startDateStr: strDate, endDateStr: endDate });

      if (ret?.status === 'OK') {
        let csvContent = "data:text/csv;charset=utf-8,";
        const header =
          '공고등록시간,예약~근무시작,jobid,예금주,점포명,업종,사장님 이름,연령(만),최근3회 평균시급,전화번호,사장님 UID,코드명,재이용,주소,업무,상세업무,근무시작일,근무기간,근무요일,during time,무급 휴게시간,총근무시간,일용근로자 신고,선호나이,선호성별,지원자수,교체횟수,배정알바 이름,배정알바 UID,결제일,최초결제금액,총결제금액,매칭비,급여,additional pay / refund,뽀너쑨 비용,시급,역제안 시급,할인캐시,수수료율,뽀너쑨사유,배정취소,무단결근,결제취소일,취소금액,입금승인일,입금승인액,전문성,성실성,코멘트,실지급일자\r\n'
        csvContent += header;

        forEach(ret.data, (data) => {
          if (isEmpty(data)) return;
          data = typeof data === "string" ? JSON.parse(data) : data;
          const job = new Job(data);

          const { matchingFee, usedCash, salary, amountToPay, refundRate = 0 } = job.paymentDetail;

          let row =
            (job.createdAt || ' ') +
            "," +
            (job.reservationTimeBeforeStart || ' ') +
            "," +
            (job.id || ' ') +
            "," +
            (data.cardHolder || " ") +
            "," +
            (job.storeName || ' ') +
            "," +
            (job.storeBizKind.replace(/,/g, "-") || ' ') +
            "," +
            (job.employerName || ' ') +
            "," +
            (job.original.employerAge || ' ') +
            "," +
            ' ' +
            "," +
            (job.employerPhoneNumber || ' ') +
            "," +
            (job.employerId || ' ') +
            ',' +
            (job.enterpriseCode || ' ') +
            ',' +
            ' ' +
            ',' +
            (split(job.storeAddress, ",")?.[0] || ' ') +
            "," +
            (job.jobKind || ' ') +
            "," +
            (map(job.original.jobKindExtra, (kind) => kind.skill || kind)
              .join("-")
              .replace(/,/g, " ") || ' ') +
            "," +
            (job.startDate?.split(" ")?.[0] || ' ') +
            "," +
            (job.workPeriod === "하루" ? 1 : 2) +
            "," +
            "," +
            (job.startTime || ' ') +
            "~" +
            (job.endTime || ' ') +
            "," +
            (job.restTime || ' ') +
            "," +
            (job.dailyWorkingHours || ' ') +
            "," +
            (job.isDailyLaborReport ? "O" : "X") +
            "," +
            (job.preferedAgeString || ' ') +
            "," +
            (job.preferedGenderString || "") +
            "," +
            (data.applyNumber || ' ') +
            "," +
            // + (job.isCanceledJob ? 'O' : 'X') + ','
            // + (job.isSuccesfulMatch ? 'O' : 'X') + ','
            // + (job.isPaymentError ? 'O' : 'X') + ','
            (job.numberOfChangingSeekerRequest || ' ') +
            "," +
            (data.hiredSeekerName || ' ') +
            "," +
            (data.hiredSeekerId || ' ') +
            "," +
            // (job.lastPaymentRecord || ' ').split(' ')[0] +
            // (JSON.stringify(job.firstPaymentRecord) || (job.lastPaymentRecord || "").split(" ")[0] || ' ') +
            (job.paymentProcessedDate || ' ') +
            "," +
            (job.firstPaymentAmount || "") +
            "," +
            (job.paidAmount || ' ') +
            "," +
            (job.matchingFee || ' ') +
            "," +
            (job.paidSalary || ' ') +
            "," +
            (join(job.additionalPayOrRefund, " ; ") || ' ') +
            "," +
            (data.bonusSoonForSeeker || ' ') +
            "," +
            (job.hourSalary || ' ') +
            "," +
            (job.suggestionSalary || " ") +
            "," +
            (usedCash || ' ') +
            "," +
            ((matchingFee * 100)?.toFixed(1) || ' ') +
            // / (job.suggestionSalary || job.hourSalary) +
            "%," +
            (job.bonusSoonReason || " ") +
            "," +
            (job.hiringStatus === "HIRE_CANCEL_EMPLOYER" ? "O" : " ") +
            "," +
            (job.hiringStatus.includes("ABSENT") ? "O" : " ") +
            "," +
            (refundRate == 100 ? job.refundProcessedDate?.split(" ")[0] : " ") +
            "," +
            (refundRate == 100 ? amountToPay : " ") +
            "," +
            (job.paymentAcceptedDate ? job.paymentAcceptedDate.split(" ")[0] : " ") +
            "," +
            "," +
            (data.hiredSeekerId && data.professionalRate && !data?.hiredSeeker?.[data.hiredSeekerId]?.includes("REPORT")
              ? data.professionalRate
              : " ") +
            "," +
            (data.hiredSeekerId && data.attitudeRate && !data?.hiredSeeker?.[data.hiredSeekerId]?.includes("REPORT")
              ? data.attitudeRate
              : " ") +
            "," +
            (data.hiredSeekerId && data.comment && !data?.hiredSeeker?.[data.hiredSeekerId]?.includes("REPORT")
              ? data.comment
              : " "
            ).replace(/,/g, " ") +
            "," +
            (job.paymentCompletedDate ? job.paymentCompletedDate.split(" ")[0] : " ") +
            "," +
            "\r\n";
          csvContent += row;
        });


        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_data.csv");
        document.body.appendChild(link); // Required for FF

        link.click();
      }
    } catch (ex) {
    }

    setLoadingPage(false);
  };

  const classes = useStyles();
  useEffect(() => {
    if (isOpenAllApplyList) {
      setIsOpenAllApplyList(false);
    }
  }, [isOpenAllApplyList]);

  return (
    <>
      <LoadingSpinner isLoading={loadingPage} />
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 20,
          }}
        >

          {/* 검색창 */}
          <div>
            <SearchingBox
              isResetInput={isResetInput}
              setIsResetInput={setIsResetInput}
              setLoadingPage={setLoadingPage}
              setData={(data) => {
                setReservations([])
                setTimeout(() => {
                  setReservations(data);
                }, 100)
                setSearching(true);
                setInitSearch(true)
                reset([
                  setCreatedAtStart,
                  setCreatedAtEnd,
                  setOrderByStartDate,
                  setIsBonusoonSwitch,
                  setStartDateStart,
                  setStartDateEnd,
                  setJobFilter,
                  setCreateDateRange,
                  setIsRecentSeekerSwitch
                ]);
              }}
              resetData={() => {
                setCurrentPage(1);
                setJobFilter(false);
                setSearching(false);
                loadReservationsNotHiddenByAdmin(orderByStartDate);
              }}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setInit={setInit}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginLeft: 20 }} >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                zIndex: 1000,
              }}
            >
              <DateRangePicker
                small
                startDate={startDateStart} // momentPropTypes.momentObj or null,
                startDateId="start_date" // PropTypes.string.isRequired,
                endDate={startDateEnd} // momentPropTypes.momentObj or null,
                endDateId="end_date" // PropTypes.string.isRequired,
                onDatesChange={({ startDate, endDate }) => {
                  setStartDateStart(startDate);
                  setStartDateEnd(endDate);
                }}
                focusedInput={startDateRangeFocusInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                onFocusChange={setStartDateRangeFocusInput} // PropTypes.func.isRequired,
                isOutsideRange={() => false}
                minimumNights={0}
              />
              <Button
                style={{ marginLeft: 4, backgroundColor: '#D8DCE5', fontWeight: 600, color: '#353C49' }}
                size={"small"}
                disabled={startDateLoadingPage}
                onClick={() => {
                  setCurrentPage((currentPage) => (currentPage = 1));
                  handleLoadJobsForStartDate();
                  reset([
                    setCreatedAtStart,
                    setCreatedAtEnd,
                    setOrderByStartDate,
                    setIsBonusoonSwitch,
                    setStartDateStart,
                    setStartDateEnd,
                    setJobFilter,
                    setCreateDateRange,
                    setIsRecentSeekerSwitch
                  ]);
                  setInitSearch(true)
                }}
              >
                {startDateLoadingPage ? <CircularProgress size={12} /> : "출근일"}
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                zIndex: 1000,
              }}
            >
              <DateRangePicker
                small
                startDate={createdAtStart} // momentPropTypes.momentObj or null,
                startDateId="start_date" // PropTypes.string.isRequired,
                endDate={createdAtEnd} // momentPropTypes.momentObj or null,
                endDateId="end_date" // PropTypes.string.isRequired,
                onDatesChange={({ startDate, endDate }) => {
                  setCreatedAtStart(startDate);
                  setCreatedAtEnd(endDate);
                }}
                focusedInput={createdAtRangeFocusInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                onFocusChange={setCreatedAtRangeFocusInput} // PropTypes.func.isRequired,
                isOutsideRange={() => false}
                minimumNights={0}
              />
              <Button
                style={{ marginLeft: 4, backgroundColor: '#D8DCE5', fontWeight: 600, color: '#353C49' }}
                size={"small"}
                disabled={createdAtLoadingPage}
                onClick={() => {
                  setCurrentPage((currentPage) => (currentPage = 1));
                  handleLoadJobsForCreatedAt();
                  reset([
                    setCreatedAtStart,
                    setCreatedAtEnd,
                    setOrderByStartDate,
                    setIsBonusoonSwitch,
                    setStartDateStart,
                    setStartDateEnd,
                    setJobFilter,
                    setCreateDateRange,
                    setIsRecentSeekerSwitch
                  ]);
                  setInitSearch(true)
                }}
              >
                {createdAtLoadingPage ? <CircularProgress size={12} /> : "공고등록일"}
              </Button>
            </div>





            {/* <Grid xs={2} item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isRecentSeekerSwitch}
                      onChange={(e) => {
                        setCurrentPage(1);
                        setIsRecentSeekerSwitch(e.target.checked);
                        if (e.target.checked) {
                          reset([
                            setCreatedAtStart,
                            setCreatedAtEnd,
                            setOrderByStartDate,
                            setCreatedAtEnd,
                            setIsBonusoonSwitch,
                            setStartDateStart,
                            setStartDateEnd,
                          ])
                        }
                      }}
                      color="primary"
                      inputProps={{ "aria-label": "primary checkbox" }}
                    />
                  }
                  label="최근지원자순"
                  labelPlacement="start"
                  style={{ margin: 0, marginLeft: 4 }}
                />
              </Grid> */}




            {/* <Grid xs={3} item>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    zIndex: 1000,
                  }}
                >
                  <DateRangePicker
                    small
                    startDate={startDateStart} // momentPropTypes.momentObj or null,
                    startDateId="start_date" // PropTypes.string.isRequired,
                    endDate={startDateEnd} // momentPropTypes.momentObj or null,
                    endDateId="end_date" // PropTypes.string.isRequired,
                    onDatesChange={({ startDate, endDate }) => {
                      setStartDateStart(startDate);
                      setStartDateEnd(endDate);
                    }}
                    focusedInput={startDateRangeFocusInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                    onFocusChange={setStartDateRangeFocusInput} // PropTypes.func.isRequired,
                    isOutsideRange={() => false}
                    minimumNights={0}
                  />
                  <Button
                    style={{ marginLeft: 4 }}
                    size={"small"}
                    color="primary"
                    variant="contained"
                    disabled={startDateLoadingPage}
                    onClick={() => {
                      setCurrentPage((currentPage) => (currentPage = 1));
                      handleLoadJobsForStartDate();
                    }}
                  >
                    {startDateLoadingPage ? <CircularProgress size={12} /> : "출근일"}
                  </Button>
                </div>
              </Grid> */}
            {/* <Grid xs={3} item>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    zIndex: 1000,
                  }}
                >
                  <DateRangePicker
                    small
                    startDate={createdAtStart} // momentPropTypes.momentObj or null,
                    startDateId="start_date" // PropTypes.string.isRequired,
                    endDate={createdAtEnd} // momentPropTypes.momentObj or null,
                    endDateId="end_date" // PropTypes.string.isRequired,
                    onDatesChange={({ startDate, endDate }) => {
                      setCreatedAtStart(startDate);
                      setCreatedAtEnd(endDate);
                    }}
                    focusedInput={createdAtRangeFocusInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                    onFocusChange={setCreatedAtRangeFocusInput} // PropTypes.func.isRequired,
                    isOutsideRange={() => false}
                    minimumNights={0}
                  />
                  <Button
                    style={{ marginLeft: 4 }}
                    size={"small"}
                    color="primary"
                    variant="contained"
                    disabled={createdAtLoadingPage}
                    onClick={() => {
                      setCurrentPage((currentPage) => (currentPage = 1));
                      handleLoadJobsForCreatedAt();
                    }}
                  >
                    {createdAtLoadingPage ? <CircularProgress size={12} /> : "공고등록일"}
                  </Button>
                </div>
              </Grid> */}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: 4, marginBottom: 10 }} className="filter-buttons">
          <div >
            <Button
              style={{
                border: '1px solid #171A1F',
                borderRadius: 4,
                padding: '6px 16px',
                minWidth: 100,
                textTransform: 'none',
                color: '#171A1F',
                marginRight: 10
              }}
              size={"small"}
              endIcon={<KeyboardArrowDownIcon />}
              variant='outlined'
              onClick={() => {
                if (isOpenAllApplyList) {
                  setIsOpenAllApplyList(false);
                  setTimeout(() => {
                    setIsOpenAllApplyList(true);
                  }, 100);
                } else {
                  setIsOpenAllApplyList(true);
                }
              }}
            >
              {isOpenAllApplyList ? <CircularProgress size={12} /> : "지원자 펼치기"}
            </Button>
          </div>
          {/* 최신순 */}
          <div>
            <Button
              onClick={handleCreateSwitchClick}
              style={{
                backgroundColor: createDateRange ? '#574EDF' : 'transparent',
                border: createDateRange ? 'none' : '1px solid #ccc',
                color: createDateRange ? '#fff' : '#ccc',
                borderRadius: 20,
                padding: '6px 16px',
                minWidth: 100,
                textTransform: 'none',
              }}
            >
              최신순
            </Button>
          </div>
          {/* 시작일순 */}
          <div>
            <Button
              onClick={handleOrderByStartDate}
              style={{
                backgroundColor: orderByStartDate ? '#574EDF' : 'transparent',
                border: orderByStartDate ? 'none' : '1px solid #ccc',
                color: orderByStartDate ? '#fff' : '#ccc',
                borderRadius: 20,
                padding: '6px 16px',
                minWidth: 100,
                textTransform: 'none',
              }}
            >
              시작일순
            </Button>
          </div>
          {/* 최근 지원자순 */}
          <div>
            <Button
              onClick={handleRecentSeekerClick}
              style={{
                backgroundColor: isRecentSeekerSwitch ? '#574EDF' : 'transparent',
                border: isRecentSeekerSwitch ? 'none' : '1px solid #ccc',
                color: isRecentSeekerSwitch ? '#fff' : '#ccc',
                borderRadius: 20,
                padding: '6px 16px',
                minWidth: 100,
                textTransform: 'none',
              }}
            >
              최근 지원자 순
            </Button>
          </div>
          {/*뽀너순 */}
          <div>
            <Button
              onClick={handleBonusoonSwitchClick}
              style={{
                backgroundColor: isBonusoonSwitch ? '#574EDF' : 'transparent',
                border: isBonusoonSwitch ? 'none' : '1px solid #ccc',
                color: isBonusoonSwitch ? '#fff' : '#ccc',
                borderRadius: 20,
                padding: '6px 16px',
                minWidth: 100,
                textTransform: 'none',
              }}
            >
              뽀너순 공고
            </Button>
          </div>



          {/* 종료된 공고 */}
          <div>
            <Button
              onClick={handleClick}
              style={{
                backgroundColor: jobFilter ? '#574EDF' : 'transparent',
                border: jobFilter ? 'none' : '1px solid #ccc',
                color: jobFilter ? '#fff' : '#ccc',
                borderRadius: 20,
                padding: '6px 16px',
                minWidth: 100,
                textTransform: 'none',
              }}
            >
              종료된 공고까지
            </Button>
          </div>







        </div>


        {
          initSearch ?
            reservations.length > 0 ?
              <div>
                <TableContainer className={classes.table} component={Paper}>
                  <Table ref={tableRef} stickyHeader aria-label="job table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" style={{ minWidth: 300, padding: '1px' }}>
                          jobUid
                        </TableCell>
                        <TableCell align="center" style={{ minWidth: 150 }}>진행상태</TableCell>
                        <TableCell align="center" style={{ minWidth: 220 }}>진행 히스토리</TableCell>
                        <TableCell align="center" style={{ minWidth: 200 }}>사장님/점포정보</TableCell>
                        <TableCell align="center" style={{ minWidth: 130 }}>공고정보</TableCell>
                        <TableCell align="center" style={{ minWidth: 130 }}>공고확인</TableCell>
                        <TableCell align="center" style={{ minWidth: 400 }}>운영팀메모</TableCell>
                        <TableCell align="center" style={{ minWidth: 150 }}>지원자</TableCell>
                        <TableCell align="center" style={{ minWidth: 150 }} >배정예정알바</TableCell>
                        <TableCell align="center" style={{ minWidth: 150 }}>배정확정알바</TableCell>
                        <TableCell align="center" style={{ minWidth: 130 }}>결제내역</TableCell>
                        <TableCell align="center" style={{ minWidth: 150 }}>근무전 상태</TableCell>
                        <TableCell align="center" style={{ minWidth: 150 }}>근무후 상태</TableCell>
                        {/* <TableCell style={{ minWidth: 130 }}>리뷰</TableCell> */}
                        {/* <TableCell style={{ minWidth: 130 }}>상황종료</TableCell> */}
                        {/* <TableCell style={{ minWidth: 130 }}>추가요청사항</TableCell> */}

                        <TableCell align="center" style={{ minWidth: 200 }}>운영매니저 한마디</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <ReservationList
                        isOpenAllApplyList={isOpenAllApplyList}
                        reservations={reservations}
                        doNotShowHiddenJobByAdmin={!jobFilter}
                        isAccessAllowManualPayment={isAccessAllowManualPayment}
                      />
                    </TableBody>
                  </Table>
                </TableContainer>

                <div style={{ display: "flex", marginTop: 30, marginBottom: 30 }}>
                  <Pagination
                    count={pages}
                    color="primary"
                    onChange={(e, page) => setCurrentPage(page)}
                    page={currentPage}
                    disabled={loadingPage}
                    siblingCount={5}
                  />
                </div>
              </div>
              :
              <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: 30, color: '#959DAD', marginTop: '20%' }}>
                  결과를 찾을 수 없습니다.
                </div>
              </div>
            : <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: 30, color: '#959DAD', marginTop: '20%' }}>
                검색 후 정보를 확인할 수 있습니다.
              </div>
            </div>



        }


      </div>

      {loadingPage ?
        <div style={{ width: '100vw', textAlign: 'center' }}>
          <CircularProgress />

        </div>
        : undefined

      }
    </>
  );
};

export default Reservation;
