import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import moment from "moment";
import {
  Button,
  TextField,
  Paper,
  CircularProgress,

} from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";
import { isEmpty } from "lodash";


import { User } from "../../model/User";
import SeekerListJobSuggestionModal from "../SeekerListJobSuggestionModal";
import { getUsers } from "../../api/users";
import {
  getUserCountByCreatedAt,
  seekeruserByName,
  seekerUserByPhonenumber,
  seekerUserByUid,
} from "../../api/seeker";

import SearchingBox from "./elements/SearchBox";
import TableHeader from "./elements/TableHeader";
import TableItem from "./elements/TableItem";
import TransferUserType from "../../Components/TransferUserType";
import LoadingSpinner from "../../Components/LoadingSpinner";

const useStyles = makeStyles({
  table: {
    minWidth: 1700,
  },
});


const SeekerList = () => {
  const classes = useStyles();

  const [currentPage, setCurrentPage] = useState(1);
  const [seekers, setSeekers] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [targetUser, setTargetUser] = useState({});
  const [openJobSuggestionModal, setOpenJobSuggestionModal] = useState(false);
  const [movingData, setMovingData] = useState(false);

  const [sourceUid, setSourceUid] = useState();
  const [destinationUid, setDestinationUid] = useState();

  const [selectedDate, setSelectedDate] = useState(moment().startOf("day").toDate());
  const [newSeekersCount, setNewSeekersCount] = useState();
  const [loadingSeekersCount, setLoadingSeekersCount] = useState(false);

  const [init, setInit] = useState(false)

  const handleDateChange = (date) => {
    const beginTime = date.startOf("day").toDate();

    setSelectedDate(beginTime);
  };

  // 날짜별 가입한 알바님 숫자
  const handleGetUserCountByCreatedAt = async (selectedDate) => {
    setLoadingSeekersCount(true);

    const result = await getUserCountByCreatedAt({
      startDateStr: moment(selectedDate.toISOString()).format('YYYY-MM-DD'),
      endDateStr: moment(selectedDate.toISOString()).format('YYYY-MM-DD')
    });

    if (result?.status === "OK") {
      setNewSeekersCount(result.data);
      setLoadingSeekersCount(false);

    }
    setLoadingSeekersCount(false);

  };

  // 일단 주석
  // useEffect(() => {
  //   handleGetUserCountByCreatedAt(selectedDate)
  // }, [selectedDate]);

  const [changeStatus, setChangeStatus] = useState(false)
  const [searchingTerm, setSearchingTerm] = useState("id");
  const [searchingValue, setSearchingValue] = useState();
  const searchingForUser = async () => {
    setInit(false)
    setLoadingPage(true);
    switch (searchingTerm) {
      case "id":
        const uidResult = await seekerUserByUid({ uid: searchingValue?.trim() });
        setLoadingPage(false);
        if (uidResult.status === "OK") {
          setSeekers(uidResult.data);
        } else {
          alert("검색 결과가 없습니다.");
        }
        break;

      case "name":
        const nameResult = await seekeruserByName({ username: searchingValue?.trim() });
        setLoadingPage(false);
        if (nameResult.status === "OK") {
          setSeekers(nameResult.data);
        } else {
          alert("검색 결과가 없습니다.");
        }

        break;

      case "phone":
        const phoneResult = await seekerUserByPhonenumber({
          phoneNumber: searchingValue?.trim(),
        });
        setLoadingPage(false);
        if (phoneResult.status === "OK") {
          setSeekers(phoneResult.data);
        } else {
          alert("검색 결과가 없습니다.");
        }

        break;
      default:
        setLoadingPage(false);
    }
  };
  useEffect(() => {
    if (init) {
      searchingForUser()
    }
  }, [changeStatus])

  useEffect(() => {

    if (init) {
      loadSeekers();
    } else {
      setInit(true)
      setLoadingPage(false)
    }
  }, [currentPage]);

  const copyReviewsAndResumes = () => {
    if (isEmpty(sourceUid) || isEmpty(destinationUid)) {
      alert("uid is empty");
      return;
    }
    setMovingData(true);

  };

  const loadSeekers = async () => {
    setLoadingPage(true);

    /**
     * AWS API 연동
     */
    const result = await getUsers({
      type: "user", page: currentPage
    });

    if (result?.status === "OK") {
      setSeekers(result.data);
    }
    setLoadingPage(false);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <LoadingSpinner isLoading={loadingPage} />
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <SearchingBox
          searchingTerm={searchingTerm}
          setSearchingTerm={setSearchingTerm}
          searchingValue={searchingValue}
          setSearchingValue={setSearchingValue}
          setData={setSeekers}
          loadingPage={loadingPage}
          resetData={loadSeekers}
          setLoadingPage={setLoadingPage}
          searchingForUser={searchingForUser}
        />
        {/* <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="YYYY/MM/DD"
          margin="normal"
          id="date-picker-inline"
          label="Select date"
          value={selectedDate}
          onChange={handleDateChange}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
          style={{ margin: "0 32px", marginTop: -4 }}
        />

        <p>{loadingSeekersCount ? <CircularProgress size={16} /> : "오늘 가입한 알바 수: " + newSeekersCount}</p> */}
        {/* 리뷰 경력 이동 */}

        {/* <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 32,
          }}
        >
          <TextField placeholder="source uid" value={sourceUid} onChange={(e) => setSourceUid(e.target.value)} />
          <span style={{ margin: "0 8px" }}>-></span>
          <TextField
            placeholder="destination uid"
            value={destinationUid}
            onChange={(e) => setDestinationUid(e.target.value)}
          />

          <Button variant="contained" color="primary" onClick={copyReviewsAndResumes} disabled={movingData}>
            {movingData ? <CircularProgress size={16} /> : <span>리뷰 경력 이동</span>}
          </Button>
        </div> */}
        <div style={{ marginLeft: 20 }}>
          <TransferUserType to={"store"} />
        </div>
      </div>

      <SeekerListJobSuggestionModal
        open={openJobSuggestionModal}
        targetUser={targetUser}
        onClose={() => setOpenJobSuggestionModal(false)}
      />

      {
        !init ?
          seekers.length > 0 ?
            <>
              <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                  <TableHeader />
                  <TableBody>
                    {seekers
                      .map((row) => (
                        <TableItem
                          onClickSuggestionBtn={(user) => {
                            setTargetUser(user);
                            setOpenJobSuggestionModal(true);
                          }}
                          key={row.id}
                          seeker={new User(row)}
                          setChangeStatus={setChangeStatus}
                          changeStatus={changeStatus}
                        />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 30,
                  marginBottom: 30,
                }}
              >
                <Pagination
                  count={10}
                  color="primary"
                  onChange={(e, page) => setCurrentPage(page)}
                  page={currentPage}
                  disabled={loadingPage}
                />
              </div>
            </>
            : (
              <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: 30, color: '#959DAD', marginTop: '20%' }}>
                  알바님 정보를 찾을 수 없습니다.
                </div>
              </div>
            )
          :
          <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: 30, color: '#959DAD', marginTop: '20%' }}>
              검색 후 알바님 정보를 확인할 수 있습니다.
            </div>
          </div>
      }
    </div >
  );
};

export default SeekerList;
