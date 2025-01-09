import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { observable } from "mobx";
import { observer, inject } from "mobx-react";

import LoadMoreBtn from "./LoadMoreBtn";
import IsNewItem from "../Components/IsNewItem";

import { get, last, compact, uniq } from "lodash";

import moment from "moment";
import { Button } from "@material-ui/core";
import { getReviewsCollection } from "../api/reviews";

const perPage = 10;

class ReviewInfo extends Component {
  @observable reviews = {
    data: [],
    page: 0,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getFirebaseData();
  }

  getFirebaseData = async () => {
    const lastCreatedAt = get(last(this.reviews.data), "createdAt", undefined);
    const currentReviewData = this.reviews.data;
    this.props.MonsterMainStore.changeLoading(true);

    const result = await getReviewsCollection({ startAt: lastCreatedAt });
    if (result.status === "OK") {
      const newData = this.reviews;
      newData.data = currentReviewData.concat(result);
      newData.page = this.reviews.page + 1;
      this.reviews = newData;
    } else {
      console.log("getReviewsCollection error");
      // this.catchError(error);
    }
    this.props.MonsterMainStore.changeLoading(false);
  };

  render() {
    return (
      <div id="reviews-page" style={{}}>
        {this.reviews.data.map((review, i) => (
          <div
            key={i}
            style={{
              padding: 12,
              borderBottom: "1px solid #eee",
              color: "#333",
            }}
          >
            <div style={{ padding: 2, fontSize: 16, fontWeight: "bold" }}>{review.comment}</div>
            <div style={{ padding: 2 }}>
              생성 날짜: <IsNewItem createdAt={review.createdAt} />{" "}
              {moment(review.createdAt).format("YYYY-MM-DD hh:mm")}
            </div>
            <div style={{ padding: 2 }}>평점: {review.rate}</div>
            <div style={{ padding: 2 }}>
              jobId: <Link to={`/jobs?jobId=${review.jobId}`}>{review.jobId}</Link>
            </div>
            <div style={{ padding: 2 }}>
              seekerUid: <Link to={`/userinfo?userinfo=${review.seekerUid}`}>{review.seekerUid}</Link>
            </div>
          </div>
        ))}
        {/* {this.reviews.data.length > 0 && (
          <LoadMoreBtn loadMore={this.getFirebaseData} type="reviews" />
        )} */}
      </div>
    );
  }
}

export default inject("MonsterMainStore")(observer(ReviewInfo));
