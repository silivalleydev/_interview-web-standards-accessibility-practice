import React, { useState, useEffect } from "react";

import moment from "moment";

import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Refresh from "@material-ui/icons/Refresh";
import Pagination from "@material-ui/lab/Pagination";
import Paper from "@material-ui/core/Paper";

import { Job } from "../model/Job";
import { User } from "../model/User";
import { getScheduledDepositDetails } from "../api/jobs";
import { getUserById } from "../api/users";

const useStyles = makeStyles({
  table: {
    minWidth: 2500,
  },
});

const PaymentItem = ({ payment }) => {
  const [job, setJob] = useState({});
  const [employer, setEmployer] = useState({});

  useEffect(() => {
    loadJob();
  }, [payment.jobId]);

  useEffect(() => {
    job.employerId && loadEmployer();
  }, [job.employerId]);

  const loadEmployer = async () => {
    const resultUser = await getUserById(job.employerId);
    if (resultUser) {
      setEmployer(new User(resultUser));
    }
  };

  const loadJob = () => {
    getJobById(payment.jobId)
      .then((result) => {
        if (result) {
          setJob(new Job(result));
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <TableRow>
      <TableCell>{moment(job.endDate).add(7, "days").format("YYYY-MM-DD")}</TableCell>
      <TableCell>{job.employerName}</TableCell>
      <TableCell>{job.employerId}</TableCell>
      <TableCell>{employer.phoneNumber}</TableCell>
      <TableCell>{employer.age}</TableCell>
      <TableCell>{employer.gender}</TableCell>
      <TableCell>{job.id}</TableCell>
      <TableCell>{job.storeName}</TableCell>
      <TableCell>{job.startDate}</TableCell>
    </TableRow>
  );
};

const Payment = () => {
  const classes = useStyles();

  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    loadPaymentHistory();
  }, [currentPage]);
  const loadPaymentHistoryAction = async (page, callback) => {
    const result = await getScheduledDepositDetails({
      page,
    });

    let list = [];
    if (result?.status === "OK") {

      list = map(result.data, (data) => ({ id: data.uid, ...data }));
    }
    await callback(list);
  };
  const loadPaymentHistory = () => {
    setLoadingPage(true);
    loadPaymentHistoryAction(currentPage, (ret) => {

      ret && setTransactions(ret);
      setLoadingPage(false);
    });
  };

  return (
    <div>
      <div>
        <IconButton onClick={loadPaymentHistory} disabled={loadingPage}>
          <Refresh />
        </IconButton>
      </div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>입금예정일</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>uid</TableCell>
              <TableCell>전화번호</TableCell>
              <TableCell>나이</TableCell>
              <TableCell>성별</TableCell>
              <TableCell>jobId</TableCell>
              <TableCell>점포명</TableCell>
              <TableCell>근무일</TableCell>
              <TableCell>입금승인일</TableCell>
              <TableCell>입금구분</TableCell>
              <TableCell>입금액</TableCell>
              <TableCell>계좌번호</TableCell>
              <TableCell>급여이체</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((row) => (
              <PaymentItem key={row.id} payment={row} />
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
    </div>
  );
};

export default Payment;
