import React, { useState, useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

import { Review } from "../model/Review";
import { Job } from "../model/Job";
import { getJobById } from "../api/jobs";
import { Button } from "@mui/material";
import { deleteReview } from "../api/seeker";

const SeekerReviewTableRow = ({ item, selected, onSelectedReview, onUnSelectedReview, handleGetNewReview, isVisibleDelete }) => {
  const [review, setReview] = useState({});
  const [job, setJob] = useState();
  const [checked, setChecked] = useState(selected);

  const handleDeleteReview = async (reviewUid, seekerUid) => {
    const result = await deleteReview({
      seekerUid: seekerUid,
      reviewUid: reviewUid
    })
    if (result.status === 'OK') {
      alert('삭제 되었습니다.')
      handleGetNewReview()

    } else {
      alert(result.status)
    }

  }

  useEffect(() => {
    if (!onSelectedReview || !onUnSelectedReview) return;

    if (checked) {
      onSelectedReview(item);
    } else {
      onUnSelectedReview(item.jobId);
    }
  }, [checked]);

  useEffect(() => {
    setReview(new Review(item));
    setJob(new Job(item));

  }, [item]);

  return (
    <TableRow>
      {onSelectedReview && onUnSelectedReview && (
        <TableCell>
          <Checkbox color="primary" checked={checked} onChange={() => setChecked(!checked)} />
        </TableCell>
      )}
      <TableCell>
        {
          isVisibleDelete ?
            <Button onClick={
              () => {

                if (confirm('해당 리뷰를 삭제하기겠습니까?')) {
                  handleDeleteReview(review?.uid, review?.seekerUid)
                }

              }} variant='outlined'>
              삭제
            </Button> : undefined
        }

      </TableCell>

      <TableCell>{review.source}</TableCell>
      <TableCell>
        <div>성실성</div>
        {review.attitudeRate}
      </TableCell>
      <TableCell>
        <div>전문성</div>
        {review.professionalRate}
      </TableCell>
      <TableCell style={{ maxWidth: 200 }}>{review.comment}</TableCell>
      <TableCell style={{ maxWidth: 200 }}>
        {review.fromSoon && <div style={{ fontWeight: "bold", color: "#5E4EE0" }}>SOON</div>}
        <div>{job ? job.storeName : review.storeName}</div>
        {review.fromSoon && <div>{job && job.storeBizKind}</div>}
      </TableCell>
      <TableCell style={{ maxWidth: 200 }}>
        <div>{job ? job.jobKind : review.jobKind}</div>
        {review.fromSoon && <div>{job && job.jobSubKinds}</div>}
      </TableCell>
      <TableCell>
        {job ? job.startDatetime : review.startDatetime} - {job ? job.workPeriod : review.workPeriod}
      </TableCell>
      <TableCell>{review.notShowToSeeker ? "INVISIBLE" : "VISIBLE"}</TableCell>
    </TableRow >
  );
};

export default SeekerReviewTableRow;
