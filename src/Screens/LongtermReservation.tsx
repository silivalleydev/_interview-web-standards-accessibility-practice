import { map } from "lodash";
import React, { useEffect, useState } from "react";

import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";

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
import SearchingBox from "./Reservation/SearchingBox";
import { getJobs } from "../api/jobs";

import LongtermReservationItem from "./Reservation/LongtermReservationItem";
import { getLongtermJobs } from "../api/longtermJob";
import LongtermSearchingBox from "./Reservation/LongtermSearchingBox";


const useStyles = makeStyles({
  table: {
    minWidth: 1200,
    maxHeight: "calc(100vh - 100px)",
  },
});

const LongtermReservation = () => {
  const ITEMS_PER_PAGE = 20;

  const [reservations, setReservations] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages,] = useState(100);
  const [loadingPage, setLoadingPage] = useState(false);
  const [isOpenAllApplyList, setIsOpenAllApplyList] = useState(false);
  const [isVisibleList, setIsVisibleList] = useState(false);
  const [longtermJobs, setLongtermJobs] = useState([])



  useEffect(() => {
    if (isVisibleList) {
      // loadReservationsNotHiddenByAdmin(false);
      getLongtermJobInfo();
    }
  }, [
    currentPage,
    isVisibleList,
  ]);

  const getLongtermJobInfo = async () => {
    const result = await getLongtermJobs({
      page: currentPage - 1,
      pageSize: 30
    })

    if (result?.status === 'OK') {


      let list = result?.dataList?.data || []
      list = map(list, (data) => ({ id: data.uid, ...data }))
      setReservations(list)
    }
  }

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

    loadReservationsNotHiddenByAdminAction(currentPage, ITEMS_PER_PAGE, (ret) => {
      setReservations([...ret]);
      setLoadingPage(false);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });

  };


  const classes = useStyles();

  return (
    <>
      {!!isVisibleList === true ? (
        <div>
          {/* ================= 검색 Section =================== */}
          <SearchSection
            setReservations={setReservations}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            getLongtermJobInfo={getLongtermJobInfo}
          />

          {/* ================= 테이블 Section =================== */}
          <TableContainer className={classes.table} component={Paper}>
            <Table stickyHeader aria-label="job table">
              {/* Table Header */}
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: 150 }}>공고등록시간</TableCell>
                  <TableCell style={{ width: 120 }}>진행상황</TableCell>
                  <TableCell style={{ width: 270 }}>점포정보</TableCell>
                  <TableCell style={{ width: 200 }}>공고정보</TableCell>
                  <TableCell style={{ width: 240 }}>운영팀메모</TableCell>
                  <TableCell>지원자</TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {map(reservations, (row, idx) => (
                  <LongtermReservationItem
                    getLongtermJobInfo={getLongtermJobInfo}
                    key={`ReservationItem-${idx}`}
                    data={row}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ================= 페이지네이션 Section =================== */}
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
      ) : (
        <div style={{ marginLeft: 15, marginTop: 20 }}>
          <Button
            style={{ backgroundColor: "#574EDF", color: "#ffffff", fontSize: 18 }}
            onClick={() => setIsVisibleList(true)}
            variant="contained"
          >
            장기알바모든공고
          </Button>
        </div>
      )}
      {loadingPage ?
        <div style={{ width: '100vw', textAlign: 'center' }}>
          <CircularProgress />
        </div>
        : undefined

      }
    </>
  );
};

export default LongtermReservation;


const SearchSection = ({
  setReservations,
  setCurrentPage,
  currentPage,
  getLongtermJobInfo,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <div>
        <LongtermSearchingBox
          setData={(data) => {
            setReservations([])
            setTimeout(() => {
              setReservations(data);
            }, 100)

          }}
          resetData={() => {
            setCurrentPage(1);
            getLongtermJobInfo(false);
          }}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  )
}