import React, { useState, useEffect } from "react";
import moment from "moment-timezone";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import {
  CircularProgress,

} from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";
import Paper from "@material-ui/core/Paper";
import { map } from "lodash";

import { KeyboardDatePicker } from "@material-ui/pickers";
import { Employer } from "../../model/Employer";
import { getUsers } from "../../api/users";
import {
  getUserCountByCreatedAt,
  storeuserByName,
  storeUserByPhonenumber,
  storeUserByUid,
} from "../../api/employers";
import TableItem from "./elements/TableItem";
import TableHeader from "./elements/TableHeader";
import SearchingBox from "./elements/SearchBox";
import TransferUserType from "../../Components/TransferUserType";
import LoadingSpinner from "../../Components/LoadingSpinner";



const EmployerList = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [employers, setEmployers] = useState([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().startOf("day").toDate());
  const [newEmployersCount, setNewEmployersCount] = useState();
  const [loadingEmployersCount, setLoadingEmployersCount] = useState(true);
  const [init, setInit] = useState(false)


  //날짜 변경
  const handleDateChange = (date) => {
    const beginTime = date.startOf("day").toDate();
    setSelectedDate(beginTime);
  };

  // 날짜별 가입한 사장님 숫자
  const handleGetUserCountByCreatedAt = async (selectedDate) => {
    setLoadingEmployersCount(true);

    const result = await getUserCountByCreatedAt({
      startDateStr: moment(selectedDate.toISOString()).format('YYYY-MM-DD'),
      endDateStr: moment(selectedDate.toISOString()).format('YYYY-MM-DD')
    });

    if (result?.status === "OK") {
      setNewEmployersCount(result.data);
      setLoadingEmployersCount(false);

    }
    setLoadingEmployersCount(false);

  };


  //일단 주석
  // useEffect(() => {
  //   handleGetUserCountByCreatedAt(selectedDate);
  // }, [selectedDate]);

  useEffect(() => {

    if (init) {
      loadEmployers();
    } else {
      setInit(true)
      setLoading(false)
    }
  }, [currentPage]);

  const loadEmployers = async () => {
    setLoadingPage(true);
    /**
     * AWS API 연동
     */
    const result = await getUsers({ type: "store", page: currentPage });

    if (result.status === "OK") {
      const employers = result.data || [];
      /**
       * loadEmployers에서 hiringStatus는 왜가져왔을까?
       */
      setEmployers(
        result.data.map((employer) => ({
          id: employer.uid || employer.docId,
          ...employer,
          hiringStatus: {},
        }))
      );

      setLoadingPage(false);
      window.scrollTo(0, 0);
    }
  };

  const [changeStatus, setChangeStatus] = useState(false)
  const [searchingTerm, setSearchingTerm] = useState("id");
  const [searchingValue, setSearchingValue] = useState();
  const [isLoading, setLoading] = useState();
  const searchingForUser = async () => {
    setInit(false)
    setLoading(true);
    switch (searchingTerm) {
      case "id":
        const uidResult = await storeUserByUid({ uid: searchingValue?.trim() });
        setLoading(false);
        if (uidResult.status === "OK") {
          setEmployers(
            uidResult.data.map((employer) => ({
              id: employer.uid || employer.docId,
              ...employer,
              hiringStatus: {},
            }))
          );
        } else {
          alert("검색 결과가 없습니다.");
        }

        break;

      case "name":
        const userNameResult = await storeuserByName({ username: searchingValue?.trim() });
        setLoading(false);
        if (userNameResult.status === "OK") {
          setEmployers(
            userNameResult.data.map((employer) => ({
              id: employer.uid || employer.docId,
              ...employer,
              hiringStatus: {},
            }))
          );
        } else {
          alert("검색 결과가 없습니다.");
        }
        break;

      case "phone":
        const phoneNumberResult = await storeUserByPhonenumber({
          phoneNumber: searchingValue?.trim(),
        });
        setLoading(false);

        if (phoneNumberResult.status === "OK") {
          setEmployers(
            phoneNumberResult.data.map((employer) => ({
              id: employer.uid || employer.docId,
              ...employer,
              hiringStatus: {},
            }))
          );
        } else {
          alert("검색 결과가 없습니다.");
        }
        break;
      default:
        setLoading(false);
    }
  };

  useEffect(() => {

    if (init) {
      searchingForUser()
    }
  }, [changeStatus])

  return (
    <div style={{ height: '100vh' }}>
      <LoadingSpinner isLoading={isLoading} />
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <SearchingBox
          searchingForUser={searchingForUser}
          isLoading={isLoading}
          setLoading={setLoading}
          searchingValue={searchingValue}
          setSearchingValue={setSearchingValue}
          searchingTerm={searchingTerm}
          setSearchingTerm={setSearchingTerm}
          setData={setEmployers} resetData={loadEmployers} loadingPage={loadingPage} />
        {/* 
        <KeyboardDatePicker
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
        <div>
          {loadingEmployersCount ? (
            <CircularProgress size={16} />
          ) : (
            "오늘 가입한 사장님 수: " + newEmployersCount + "명"
          )}
        </div> */}

        <div style={{ marginLeft: 20 }}>
          <TransferUserType to={"user"} />
        </div>
      </div>

      {
        !init ?
          employers.length > 0 ? (
            <>
              <TableContainer component={Paper}>
                <Table style={{ minWidth: 1800 }} aria-label="simple table">
                  <TableHeader />
                  <TableBody>
                    {employers.map((row, idx) => (
                      <TableItem
                        setChangeStatus={setChangeStatus}
                        changeStatus={changeStatus}
                        key={`employer-${idx}`}
                        employer={new Employer(row)}
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
                  count={1000}
                  color="primary"
                  onChange={(e, page) => setCurrentPage(page)}
                  page={currentPage}
                  disabled={loadingPage}
                />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: 30, color: '#959DAD', marginTop: '20%' }}>
                사장님 정보를 찾을 수 없습니다.
              </div>
            </div>
          )
          :
          <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: 30, color: '#959DAD', marginTop: '20%' }}>
              검색 후 사장님 정보를 확인할 수 있습니다.
            </div>
          </div>
      }
    </div>
  );
};

export default EmployerList;
