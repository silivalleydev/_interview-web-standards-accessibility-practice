import React, { useState, useEffect } from "react";
import {
  isEmpty,
} from "lodash";
import { IconButton, InputBase, Divider, CircularProgress, InputAdornment } from "@material-ui/core";
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import Paper from "@material-ui/core/Paper";
import Refresh from "@material-ui/icons/Refresh";

import MenuItem from "@material-ui/core/MenuItem";
import SearchIcon from "@material-ui/icons/Search";
import {
  loadReservationsByEmployerId,
  loadReservationsByEmployerName,
  loadReservationsByEmployerPhone,
  loadReservationsByJobId,
  loadReservationsByStoreName,
} from "../../api/reservationFilter";

const SearchingBox = ({ setData, resetData, currentPage, setCurrentPage, setInit, isResetInput, setIsResetInput, setLoadingPage }) => {
  const [searchingTerm, setSearchingTerm] = useState("uid");
  const [searchingValue, setSearchingValue] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isResetInput) {
      setSearchingValue('');
      setIsResetInput(false);
    }
  }, [isResetInput])

  useEffect(() => {

    setInit(true)

    if (currentPage > 1 && !isEmpty(searchingValue)) {
      searchingForUser();
    }
  }, [currentPage]);

  const searchingForUser = async (page) => {

    setLoading(true);
    setLoadingPage(true)
    switch (searchingTerm) {
      case "uid":
        const employerIdResult = await loadReservationsByEmployerId({
          employerUid: searchingValue?.trim(),
          page: page || currentPage,
        });

        if (employerIdResult.status === "OK") {
          setData(employerIdResult.data);
          setLoading(false);
          setLoadingPage(false)
        }
        setLoading(false);
        setLoadingPage(false)

        break;

      case "jobId":
        const JobIdResult = await loadReservationsByJobId({
          uid: searchingValue?.trim(),
          page: page || currentPage,
        });

        if (JobIdResult.status === "OK") {
          setData(JobIdResult.data);
          setLoading(false);
          setLoadingPage(false)
        }
        setLoading(false);
        setLoadingPage(false)

        break;

      case "name":
        const employerNameResult = await loadReservationsByEmployerName({
          username: searchingValue?.trim(),
          page: page || currentPage,
        });

        if (employerNameResult.status === "OK") {
          setData(employerNameResult.data);
          setLoading(false);
          setLoadingPage(false)
        }
        setLoading(false);
        setLoadingPage(false)

        break;

      case "phone":
        const storePhoneResult = await loadReservationsByEmployerPhone({
          phoneNumber: searchingValue?.trim(),
          page: page || currentPage,
        });

        if (storePhoneResult.status === "OK") {
          setData(storePhoneResult.data);
          setLoading(false);
          setLoadingPage(false)
        }
        setLoading(false);
        setLoadingPage(false)

        break;

      case "store":
        const storeNameResult = await loadReservationsByStoreName({
          storeName: searchingValue?.trim(),
          page: page || currentPage,
        });

        if (storeNameResult.status === "OK") {
          setData(storeNameResult.data);
          setLoading(false);
          setLoadingPage(false)
        }
        setLoading(false);
        setLoadingPage(false)
        break;

      default:
        setLoading(false);
        setLoadingPage(false)
    }
  };

  const searchingBoxKeyEventHandle = (e) => {
    if (e.key === "Enter") {
      setCurrentPage(1)
      setTimeout(() => {
        searchingForUser(1)
      }, 400)
    }
  };

  const searchTypeSelectionChange = (e) => {
    setSearchingTerm(e.target.value);
    setSearchingValue("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Select
        size="small"
        value={searchingTerm}
        onChange={searchTypeSelectionChange}
      >
        <MenuItem value="uid">사장님 UID</MenuItem>
        <MenuItem value="jobId">공고 UID</MenuItem>
        <MenuItem value="name">사장님 이름</MenuItem>
        <MenuItem value="phone">전화번호</MenuItem>
        <MenuItem value="store">점포명</MenuItem>
      </Select>

      <TextField
        size="small"
        style={{ flex: 1, paddingLeft: 4, width: '450px' }}
        onChange={(e) => setSearchingValue(e.target.value)}
        value={searchingValue}
        onKeyPress={searchingBoxKeyEventHandle}
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              {
                loading ?
                  <CircularProgress />
                  :
                  <div style={{ cursor: 'pointer' }} onClick={() => {
                    setCurrentPage(1)
                    setTimeout(() => {
                      searchingForUser(1)
                    }, 400)
                  }}>
                    <SearchIcon />
                  </div>
              }
            </InputAdornment>
          ),
        }}
      />
      {/* 초기회 일단 가림 */}
      {/* <IconButton
        onClick={() => {
          setSearchingValue("");
          resetData();
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : <Refresh />}
      </IconButton> */}
    </div>
  );
};

export default SearchingBox;
