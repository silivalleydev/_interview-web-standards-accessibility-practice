import React, { useState, useEffect } from "react";
import {
  size,
  filter,
  isNumber,
  map,
  find,
  forEach,
  remove,
  isEmpty,
  indexOf,
  findIndex,
  range,
  keys,
  values,
  findLastIndex,
  includes,
  isArray,
  split,
  throttle,
  toInteger,
  get,
  result,
} from "lodash";
import { IconButton, InputBase, Divider, CircularProgress } from "@material-ui/core";

import Paper from "@material-ui/core/Paper";
import Refresh from "@material-ui/icons/Refresh";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import SearchIcon from "@material-ui/icons/Search";
import {
  loadReservationsByEmployerId,
  loadReservationsByEmployerName,
  loadReservationsByEmployerPhone,
  loadReservationsByJobId,
  loadReservationsByStoreName,
} from "../../api/reservationFilter";
import { getLongtermJobs } from "../../api/longtermJob";

const LongtermSearchingBox = ({ setData, resetData, currentPage, setCurrentPage }) => {
  const [searchingTerm, setSearchingTerm] = useState("jobId");
  const [searchingValue, setSearchingValue] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPage > 1 && !isEmpty(searchingValue)) {
      searchingForUser();
    }
  }, [currentPage]);
  const getLongtermJobInfo = async (data = {}) => {

    const req = {
      page: currentPage - 1,
      pageSize: 30
    }

    Object.keys(data).forEach(key => {
      if (data[key]) {
        req[key] = data[key]
      }
    })

    const result = await getLongtermJobs(req)

    if (result?.status === 'OK') {
      let list = result?.dataList?.data || []
      list = map(list, (data) => ({ id: data.uid, ...data }))
      setLoading(false);
      setData(list)
    }
  }
  const searchingForUser = async (page) => {
    setLoading(true);

    switch (searchingTerm) {
      case "jobId":
        await getLongtermJobInfo({
          longTermJobUid: searchingValue?.trim()
        })
        break;
      case "uid":
        await getLongtermJobInfo({
          employerUid: searchingValue?.trim()
        })
        break;
      default:
        setLoading(false);
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
    <Paper style={{ display: "flex", flexDirection: "row", alignItems: "center", width: 400 }}>
      <Select value={searchingTerm} onChange={searchTypeSelectionChange}>
        <MenuItem value="jobId">job id</MenuItem>
        <MenuItem value="uid">employer id</MenuItem>
      </Select>

      <InputBase
        style={{ flex: 1, paddingLeft: 12 }}
        onChange={(e) => setSearchingValue(e.target.value)}
        value={searchingValue}
        onKeyPress={searchingBoxKeyEventHandle}
      />
      <IconButton onClick={() => {
        setCurrentPage(1)
        setTimeout(() => {
          searchingForUser(1)
        }, 400)
      }} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : <SearchIcon />}
      </IconButton>
      <Divider orientation="vertical" style={{ height: 24 }} />
      <IconButton
        onClick={() => {
          setSearchingValue("");
          resetData();
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : <Refresh />}
      </IconButton>
    </Paper>
  );
};

export default LongtermSearchingBox;
