import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { Job } from "../model/Job";
import { getJobById } from "../api/jobs";

const SeekerResumeTableRow = ({ item }) => {
  if (!item) return null;

  const [job, setJob] = useState({});



  useEffect(() => {
    setJob(new Job(item));

  }, []);

  return (
    <TableRow>
      <TableCell>
        {item.isVerified && <div style={{ fontWeight: "bold", color: "#5E4EE0" }}>SOON</div>}
        <div>{item.storeName}</div>
        {item.isVerified ? <div>{job.storeBizKind}</div> : <div>{item.storeKind}</div>}
      </TableCell>
      <TableCell style={{ maxWidth: 300 }}>
        <div>{isEmpty(job) ? item.jobKind : job.jobKind}</div>
        {item.isVerified ? <div>{job && job.jobSubKinds}</div> : <div>{item.storeJobDetail}</div>}
      </TableCell>
      <TableCell>{item.startedTime}</TableCell>
      <TableCell>{isEmpty(job) ? (item.isDoingHere ? "재직중" : item.endTime) : job.workPeriod}</TableCell>

    </TableRow>
  );
};

export default SeekerResumeTableRow;
