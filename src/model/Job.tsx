import React from "react";
import { observable, toJS } from "mobx";
import {
  keys,
  map,
  get,
  join,
  isEmpty,
  includes,
  values,
  indexOf,
  split,
  compact,
  size,
  reverse,
  isArray,
  isObject,
  uniq,
  last,
  find,
  lastIndexOf,
} from "lodash";
import moment, { Moment } from "moment-timezone";
moment.tz("Asia/Seoul");
moment.locale("ko");

import { PaymentDetail } from "./Types";
import { Button } from "@material-ui/core";
import ReportButton from "../Screens/Reservation/ReportButton";
import { getDateTimeToDateString } from "../utils/soonUtill";
import { processRemainingRefund } from "../api/reservationItem";

function getTime(timestamp): Moment {
  //seconds is from firebase queries in front, _seconds got from server
  return timestamp && moment(timestamp);
}
export class Job {
  @observable job;
  dataVersion: number;

  constructor(job) {
    this.job = job;
    this.dataVersion = job.dataVersion;
  }

  get algoliaObjectId() {
    return this.job.algoliaObjectId;
  }

  get adminNote() {
    return this.job.adminNote;
  }
  get sameJobId() {
    return this.job.sameJobId;
  }
  get applyData() {
    return this.job.applyData;
  }
  get cardData() {
    return this.job.cardData;
  }
  get isCopied() {
    return this.job.isCopied;
  }
  get userData() {
    return this.job.userData;
  }

  get original() {
    return this.job;
  }

  get id() {
    return this.job.uid;
  }
  get tid() {
    return this.job.tid;
  }
  get applySeekers() {
    return this.job.applySeekers || [];
  }

  get salary() {
    return +this.job.salary;
  }

  get applyCount() {
    return this.job.applyCount || 0;
  }


  get employerId() {
    return this.job.employerUid;
  }
  get enterpriseCode() {
    return this.job.enterpriseCode
  }


  get transferToSeekerDate() {
    return this.job?.transferToSeekerDate ? moment(this.job?.transferToSeekerDate).format("YYYY-MM-DD HH:mm:ss") : "";
  }

  get seekerAssignmentFinishedAt() {
    return this.job.seekerAssignmentFinishedAt ? moment(this.job.seekerAssignmentFinishedAt).format("YYYY.MM.DD HH:mm") : "";


  }

  get employerName() {
    return this.job.store?.username;
  }

  get employerPhoneNumber() {
    return this.job.store.phoneNumber;
  }

  get hiredSeekers() {
    return this.job.hiredSeeker;
  }

  get isHiredSeeker() {
    return includes(values(this.job.hiredSeeker), "HIRED");
  }

  get isRefunded() {
    return this.paymentDetail.refundRate > 0;
  }

  get isCustomerDirectPaymentNBonusSoonExist(): boolean {
    return (
      (this.job.enterpriseCode || '').endsWith('02') === true &&
      this.job.bonusSoon &&
      this.job.bonusSoon.length > 0
    )
  }

  get hiredSeekerId(): string {

    if (this.job.hiredSeekerId) {
      return this.job.hiredSeekerId
    }

    if (
      !this.payment &&
      (this.job.enterpriseCode || '').endsWith('02') === false
    ) {
      return null
    }

    const hiredIndex = indexOf(values(this.job.hiredSeeker), "HIRED");
    const reportedIndex = indexOf(values(this.job.hiredSeeker), "REPORT_ETC_EMPLOYER");
    const hireCanceledIndex = lastIndexOf(values(this.job.hiredSeeker), "HIRE_CANCEL_EMPLOYER");
    const absentIndex = indexOf(values(this.job.hiredSeeker), "REPORT_ABSENT_EMPLOYER");

    if (hiredIndex >= 0) {
      return keys(this.job.hiredSeeker)[hiredIndex];
    }

    if (this.paymentDetail.refundRate === 100 && this.payment?.toEmployer === this.paymentDetail?.amountToPay) {
      //100% refund (auto or manual)
      return null;
    }

    if (reportedIndex >= 0) {
      return keys(this.job.hiredSeeker)[reportedIndex];
    }

    if (hireCanceledIndex >= 0 && (this.payment.toEmployer > 0 || this.payment.toSeeker > 0)) {
      return keys(this.job.hiredSeeker)[hireCanceledIndex];
    }
    if (hireCanceledIndex >= 0 && !this.payment.toEmployer && !this.payment.toSeeker && this.paymentDetail.refundRate === 70) {
      return keys(this.job.hiredSeeker)[hireCanceledIndex];
    }

    if (absentIndex >= 0 && (this.payment.toEmployer > 0 || this.payment.toSeeker > 0)) {
      return keys(this.job.hiredSeeker)[absentIndex];
    }

    return null;
  }

  get jobSubKinds() {
    const data = toJS(this.job.jobKindExtra);
    if (isEmpty(data)) {
      return "";
    }

    if (isObject(data[0])) {
      const colors = {
        "경험 필수": "red",
        "초보 가능": "#5740e0",
        초급: "#5740e0",
        중금: "#ff7a00",
        고급: "red",
      };

      return (
        <div>
          {map(data, ({ skill, level }) => (
            <div key={skill}>
              {skill} <span style={{ color: get(colors, `${level}`) }}>{level}</span>
            </div>
          ))}
        </div>
      );
    }

    return join(data, "-").replace(",", " ");
  }

  get jobStatus() {
    return this.job.jobStatus;
  }

  get hiringStatus() {
    return this.job.hiringStatus;
  }

  get jobKind() {
    return this.job.jobKind;
  }

  get reportReason() {
    return this.job.reportReason;
  }

  get workPeriod(): string {
    let workPeriod = "";

    switch (this.job.workPeriod) {
      case 0:
        workPeriod = "하루";
        break;

      case 50:
        workPeriod = "이틀";
        break;

      case 100:
        workPeriod = "less than a month";
        break;

      case 150:
        workPeriod = "less than 2 months";
        break;

      case 200:
        workPeriod = "less than 3 months";
        break;
    }

    return workPeriod;
  }

  get jobOnGoingStatus(): JSX.Element | string {
    if (this.hiringStatus === "REGISTER_SOONY") {
      if (this.jobStatus === "SEARCHING") {
        if (size(this.bonusSoon) > 0) {
          return <div style={{ fontWeight: "bold", color: "#FF4242" }}>뽀너쑨 모집중</div>;
        }

        if (!this.markAsVerifiedRegistration) {
          return <div style={{ fontWeight: "bold", color: "#3A81D4" }}>알바신청</div>;
        }

        if (isEmpty(this.job.hiredSeeker)) {
          if (size(this.job.assignmentExtendHis) === 1) {
            return <div style={{ fontWeight: "bold", color: "orange" }}>모집중</div>;
          }

          return <div style={{ fontWeight: "bold", color: "red" }}>연장 모집중</div>;
        }
      }

      if (values(this.job.hiredSeeker).includes("HIRED")) {
        return 'REPORT_BTN'
      }

      if (values(this.job.hiredSeeker).includes("REPORT_ABSENT_ADMIN")) {
        return <div style={{ fontWeight: "bold", color: "red" }}>신고(결근)</div>;
      }
    }

    if (this.hiringStatus === "HIRE_CHANGE_EMPLOYER") {
      if (!this.isStartTimePassed) {
        return <div style={{ fontWeight: "bold", color: "red" }}>근무자 교체</div>;
      }

      if (values(this.job.hiredSeeker).includes("HIRED")) {
        return (
          <>
            <div style={{ fontWeight: "bold", color: "orange" }}>근무중</div>
            <ReportButton job={this.job} />
          </>
        );
      } else {
        return <div style={{ fontWeight: "bold", color: "orange" }}>배정취소</div>;
      }
    }

    if (this.hiringStatus === "REGISTER_CANCEL_SOONY") {
      return (
        <div style={{ fontWeight: "bold" }}>예약취소</div>
      );
    }

    if (this.hiringStatus === "REGISTER_STOP_ADMIN") {
      return (
        <div style={{ fontWeight: 'bold' }}>모집중지</div>
      )
    }

    if (
      this.hiringStatus === "HIRE_CANCEL_EMPLOYER" ||
      (this.hiringStatus === "PAYMENT_SOONY" && this.paymentDetail.refundRate === 70)
    ) {
      const text = this.paymentDetail.refundRate === 70 ? "배정취소 (30%공제)" : "배정취소";
      return 'REFUND_100_BTN';
    }

    if (this.hiringStatus === "REPORT_ABSENT_EMPLOYER") {
      return <div style={{ fontWeight: "bold", color: "red" }}>신고(결근)</div>;
    }

    if (this.hiringStatus === "REPORT_ETC_EMPLOYER") {
      return (
        <div>
          <div style={{ fontWeight: "bold", color: "red" }}>신고(기타)</div>
          <div>{this.job.reportReason}</div>
        </div>
      );
    }

    if (this.jobStatus === "STOP") {
      return <div style={{ fontWeight: "bold" }}>모집중지</div>;
    }
    return <div />;
  }

  get jobMemo() {
    return compact(split(this.job.jobAdvancedOption?.memo, "\r\n"));
  }
  get earlyFinishWorkingTime() {
    return this.job?.earlyFinishWorkingTime?.text
      ? this.job?.earlyFinishWorkingTime?.text
      : this.job?.earlyFinishWorkingTime;
  }

  get preferedAge() {
    const oldVersion = this.job.jobAdvancedOption;
    if (oldVersion) {
      return join(oldVersion.preferAgeRanges, " ");
    } else {
      return this.job?.ageRequirements?.isIgnoreAge ? (
        "상관없음"
      ) : (
        <div>
          {join(this.job?.ageRequirements?.preferAgeRanges, "")
            ? join(this.job?.ageRequirements?.preferAgeRanges, "")
            : this.job?.ageRequirements?.preferAgeRanges?.startAge && this.job?.ageRequirements?.preferAgeRanges?.endAge
              ? `${this.job?.ageRequirements?.preferAgeRanges?.startAge}세 ~ ${this.job?.ageRequirements?.preferAgeRanges?.endAge}세`
              : " "}{" "}
          <span
            style={{
              color: this.job?.ageRequirements?.otherAgeRangesAllow ? "#5740e0" : "red",
            }}
          >
            {this.job?.ageRequirements?.otherAgeRangesAllow ? "필수아님" : "필수"}
          </span>
        </div>
      );
    }
  }

  get preferedAgeString() {
    const oldVersion = this.job.jobAdvancedOption;
    if (oldVersion) {
      return join(oldVersion.preferAgeRanges, " ");
    } else {
      return this.job?.ageRequirements?.isIgnoreAge
        ? "상관없음"
        : join(this.job?.ageRequirements?.preferAgeRanges, " ");
    }
  }
  get reservationCanceledAt() {
    return (
      this.job.reservationCanceledAt &&
      getTime(this.job.reservationCanceledAt)
        ?.tz('Asia/Seoul')
        ?.format('YYYY.MM.DD HH:mm')
        ?.toString()
    )
  }

  get preferedGender() {
    const oldVersion = this.job.jobAdvancedOption;
    if (oldVersion) {
      return oldVersion.gender;
    } else {
      return this.job?.genderRequirements?.isIgnoreGender ? (
        "상관없음"
      ) : (
        <div>
          {this.job?.genderRequirements?.preferGender}{" "}
          <span
            style={{
              color: this.job?.genderRequirements?.otherGenderAllow ? "#5740e0" : "red",
            }}
          >
            {this.job?.genderRequirements?.otherGenderAllow ? "필수아님" : "필수"}
          </span>
        </div>
      );
    }
  }

  get preferedGenderString() {
    const oldVersion = this.job.jobAdvancedOption;
    if (oldVersion) {
      return oldVersion.gender;
    } else {
      return this.job?.genderRequirements?.isIgnoreGender ? "상관없음" : this.job?.genderRequirements?.preferGender;
    }
  }

  get preferedDetail() {
    const oldVersion = this.job.jobAdvancedOption;
    if (oldVersion) {
      return oldVersion.preferDetail;
    } else {
      const colors = {
        PREFERED: "#5740e0",
        REQUIRED: "red",
      };

      const statuses = {
        PREFERED: "필수아님",
        REQUIRED: "필수",
      };

      return (
        <div>
          {this.job?.extraRequirements?.idCard !== "NONE" && <div>•신분증 필요</div>}
          {this.job?.extraRequirements?.healthInsurance !== "NONE" && (
            <div>
              •보건증 필요{" "}
              <span
                style={{
                  color: colors[`${this.job?.extraRequirements?.healthInsurance}`],
                }}
              >
                {statuses[`${this.job?.extraRequirements?.healthInsurance}`]}
              </span>
            </div>
          )}
          {this.job?.extraRequirements?.basicEducated !== "NONE" && (
            <div>
              •기초안전보건교육 이수증 필요{" "}
              <span
                style={{
                  color: colors[`${this.job?.extraRequirements?.basicEducated}`],
                }}
              >
                {statuses[`${this.job?.extraRequirements?.basicEducated}`]}
              </span>
            </div>
          )}
          {this.job?.extraRequirements?.assistant !== "NONE" && <div>•초보 가능</div>}
          {this.job?.extraRequirements?.alumni !== "NONE" && (
            <div>
              •동일 업종 경력 필요{" "}
              <span
                style={{
                  color: colors[`${this.job?.extraRequirements?.alumni}`],
                }}
              >
                {statuses[`${this.job?.extraRequirements?.alumni}`]}
              </span>
            </div>
          )}
          {this.job?.extraRequirements?.noForeigner !== "NONE" && <div>•외국인 가능 (의사소통 가능자)</div>}
        </div>
      );
    }
  }

  get moreInfoAndRequirements() {
    if (!this.job.moreInfo) return;

    const {
      additionalExplain,
      appearanceConcern,
      appearanceNote,
      freeParking,
      mealSupported,
      movingLocationAndTime = {},
      movingToOtherPlace,
      workingtimeExtend = {},
      pickup = {},
    } = this.job.moreInfo;

    const { text, value } = workingtimeExtend;
    const { pickupSupported, pickupAddress, pickupTime } = pickup;

    const workingAddress = movingLocationAndTime?.workingAddress;
    const workStartTime = movingLocationAndTime?.workStartTime;
    const workEndTime = movingLocationAndTime?.workEndTime;
    const dropAddress = movingLocationAndTime?.dropAddress;
    const dropTime = movingLocationAndTime?.dropTime;

    return (
      <div>
        {mealSupported && <div>식사 제공</div>}
        {value > 0 && (
          <div style={{ marginTop: 8 }}>
            연장 근무 가능성 있음 : <div>{text}</div>
          </div>
        )}
        {appearanceConcern && (
          <div style={{ marginTop: 8 }}>
            <div>{appearanceNote}</div>
          </div>
        )}

        {freeParking && <div style={{ marginTop: 8 }}>근무지 무료 주차 있음</div>}

        {pickupSupported && (
          <div style={{ marginTop: 8 }}>
            픽업 제공
            <div style={{ marginLeft: 8 }}>
              <div>{pickupAddress}</div>
              <div>{pickupTime}</div>
            </div>
          </div>
        )}

        {movingToOtherPlace && (
          <div style={{ marginTop: 8 }}>
            <div>집합 후 근무지로 이동</div>
            <div style={{ marginLeft: 8 }}>
              <div>1) 집합장소에서 출발</div>
              <div>{movingLocationAndTime.pickupAddress}</div>
              <div>{movingLocationAndTime.pickupTime}</div>
              <div>2) 근무지</div>
              <div>{workingAddress}</div>
              <div>
                출근 : {workStartTime}, 퇴근 {workEndTime}
              </div>
              <div>3) 집합장소로 도착</div>
              <div>{dropAddress}</div>
              <div>{dropTime}</div>
            </div>
          </div>
        )}

        {!isEmpty(additionalExplain) && (
          <div>{additionalExplain}</div>
        )}
      </div>
    );
  }

  get operationMemo() {
    return this.job.operationMemo;
  }

  get seekerChangingReason() {
    return map(this.job.seekerChangingReason, (reason) => <div>{reason}</div>);
  }

  get payDay() {
    return this.job.payDay && getTime(this.job.payDay).tz("Asia/Seoul").format("YYYY.MM.DD").toString();
  }

  get durationDate() {
    const { days } = get(this.job, "paymentDetail", {});

    const start = getTime(this.job.startDate).tz("Asia/Seoul").format("MM.DD(dd)").toString();
    const end = getTime(this.job.endDate).tz("Asia/Seoul").format("MM.DD(dd)").toString();

    if (days === 1) {
      return start;
    }

    return start + " ~ " + end;
  }

  get startDatetime() {
    return this.job.startDate && getTime(this.job.startDate).tz("Asia/Seoul").format("YYYY.MM.DD HH:mm").toString();
  }

  get startDate(): string {
    return this.job.startDate && getTime(this.job.startDate).tz("Asia/Seoul").format("YYYY.MM.DD").toString();
  }

  get startTime(): string {
    return this.job.startDate && getTime(this.job.startDate).tz("Asia/Seoul").format("HH:mm").toString();
  }

  get endDatetime() {
    return this.job.endDate && getTime(this.job.endDate).tz("Asia/Seoul").format("YYYY.MM.DD HH:mm").toString();
  }

  get endDate(): string {
    return this.job.endDate && getTime(this.job.endDate).tz("Asia/Seoul").format("YYYY.MM.DD").toString();
  }

  get endTime(): string {
    return this.job.endDate && getTime(this.job.endDate).tz("Asia/Seoul").format("HH:mm").toString();
  }

  get endTimeInText(): string {
    return this.job.jobEndTimeInText;
  }

  get isEndTimePassed() {
    return moment().tz("Asia/Seoul").isAfter(getTime(this.job.endDate));
  }

  get isStartTimePassed() {
    return this.job.startDate && moment().tz("Asia/Seoul").isAfter(getTime(this.job.startDate));
  }

  get diffTime() {
    const startTime = moment(this.job.startDate);
    let endTime = moment(this.job.endDate);

    if (this.job?.jobEndTimeInText) {
      const hourNmin = this.job?.jobEndTimeInText
        ?.replace('새벽 ', '')
        ?.replace('아침 ', '')
        .split(':');
      endTime = endTime
        .set('hour', parseInt(hourNmin?.[0], 10))
        .set('minute', parseInt(hourNmin?.[1], 10));
    }
    const endHour =
      endTime.get('hour') + (endTime.get('minute') === 30 ? 0.5 : 0);

    const startHour =
      startTime.get('hour') + (startTime.get('minute') === 30 ? 0.5 : 0);

    const diff = endHour - startHour;

    let diffTime = diff;
    if (diff < 0) {
      diffTime = diff + 24;
    }

    return diffTime;
  }

  get reservationTimeBeforeStart() {
    return this.job.startDate && getTime(this.job.startDate).diff(getTime(this.job.createdAt), "hours");
  }

  get createdAt() {
    return moment(this.job.createdAt).format("YYYY.MM.DD HH:mm") || "";
  }

  get updatedAt() {
    return getTime(this.job.updatedAt)?.tz("Asia/Seoul")?.format("YYYY.MM.DD HH:mm")?.toString();
  }
  get stopReservationAt() {
    return (
      this.job.stopReservationAt &&
      getTime(this.job.stopReservationAt)
        .tz('Asia/Seoul')
        .format('YYYY.MM.DD HH:mm')
        .toString()
    )
  }
  get seekerAssigningTime() {
    return this.job.seekerAssigningTime
      ? getTime(this.job.seekerAssigningTime).tz("Asia/Seoul").format("YYYY.MM.DD HH:mm").toString()
      : "";
  }

  get seekerAssigningTimeHistory(): string[] {
    return reverse([...(this.job.seekerAssigningTimeHistory || [])]);
  }

  get jobAvailableTime() {
    return this.job.jobAvailableTime
      ? getTime(this.job.jobAvailableTime).tz("Asia/Seoul").format("YYYY.MM.DD HH:mm").toString()
      : "";
  }

  get seekerAssigningTimes() {
    return map(this.job.assignmentExtendHis, (history) =>
      getTime(history.seekerAssigningTime).format("YYYY.MM.DD HH:mm").toString()
    );
  }

  get jobAvailableTimes() {
    return map(this.job.assignmentExtendHis, (history) =>
      getTime(history.jobAvailableTime).format("YYYY.MM.DD HH:mm").toString()
    );
  }

  get storeName() {
    return this.job.store?.name || this.job.storeName;
  }

  get storeAddress() {
    return this.job.store?.locations?.[0]?.text;
  }

  get isDailyLaborReport() {
    return this.job.dailyLaborReport;
  }

  get restTime(): number {
    return this.job?.restTime
      ? typeof this.job?.restTime === "object"
        ? this.job?.restTime?.value
        : JSON.stringify(this.job?.restTime)
      : 0;
  }

  get storeBizKind() {
    return get(this.job, "store.bizKind", "") ? get(this.job, "store.bizKind", "") + "-" + get(this.job, "store.bizSubKind", "") :
      get(this.job, "bizKind", "") + "-" + get(this.job, "bizSubKind", "")
      ;
  }

  get paymentDetail(): PaymentDetail {
    return get(this.job, "paymentDetail", {});
  }

  get manualRefund(): string {
    if (!this.job.payment) return "";

    const { toEmployer, refundReason } = this.job.payment;
    return refundReason ? (toEmployer || "") + "  " + (refundReason || "") : "";
  }

  get paidAmount(): number {
    const { paidAmount } = this.lastPaymentRecord;
    return paidAmount || get(this.job, "paymentDetail.amountToPay");
  }

  get seekerSalary(): number {
    const { paidAmount } = this.lastPaymentRecord;

    if (paidAmount > 0) return paidAmount - this.matchingFee;

    const { salary, refundRate } = this.job.paymentDetail;

    return refundRate ? Math.floor((salary * (100 - refundRate)) / 100) : salary;
  }

  get matchingFee(): number {
    const { amountToPay, salary } = get(this.job, "paymentDetail", {});

    return amountToPay - salary;
  }

  get paidSalary(): number {
    return this.paidAmount - this.matchingFee;
  }

  get hourSalary(): number {
    return this.job.salary;
  }

  get suggestionSalary() {
    return this.lastPaymentRecord.salarySuggestion;
  }

  get lastPaymentRecord() {
    return last(this.job.paymentRecords) || {};
  }

  get firstPaymentRecord() {
    const paymentDate = find(
      this.job?.paymentRecords,
      (record) => record.paymentStatus === "PAYMENT_MATCHED"
    )?.createdTime;

    return paymentDate ? moment(paymentDate).format("YYYY-MM-DD") : "";
  }

  get firstPaymentAmount() {
    return get(this.job.paymentRecords, "0.paidAmount");
  }

  get additionalPayOrRefund() {
    return compact(map(this.job.paymentRecords, (record) => record.paymentDifference));
  }

  get payment(): object {
    return get(this.job, "payment", {});
  }

  get workingHours(): number {
    const { days, hoursPerDay, restTime } = this.job.paymentDetail;

    return (hoursPerDay - restTime) * days;
  }

  get dailyWorkingHours(): number {
    const { hoursPerDay, restTime } = this.job.paymentDetail;

    return hoursPerDay - restTime;
  }

  get paymentStatus(): string {
    return this.job.paymentStatus;
  }

  get paymentStatusHtml(): JSX.Element {
    switch (this.job.paymentStatus) {
      case "PAYMENT_MATCHED":
      case "PAYMENT_APPROVED":
      case "PAYMENT_COMPLETED":
        return <div style={{ color: "green" }}>결제완료</div>;

      case "PAYMENT_MATCHED_ERROR":
        return <div style={{ color: "red" }}>결제오류</div>;

      case "PAYMENT_REPORT":
      case "PAYMENT_CANCEL_WITHIN_18_COMPLETED":
      case "PAYMENT_CANCEL_OUT_18_COMPLETED":
        return <div style={{ color: "red" }}>환불</div>;

      case "PAYMENT_CANCEL_WITHIN_18":
      case "PAYMENT_CANCEL_OUT_18":
        return <div style={{ color: "red" }}>취소</div>;

      case "PAYMENT_CANCEL_WITHIN_18_ERROR":
      case "PAYMENT_CANCEL_OUT_18_ERROR":
        return <div style={{ color: "red" }}>환불오류</div>;

      default:
        return this.job.paymentStatus;
    }
  }

  get markAsVerifiedRegistration() {
    return this.job.markAsVerifiedRegistration;
  }

  get markAsHiddenRegistration() {
    return this.job.markAsHiddenRegistration;
  }

  get jobStopOnSchedule() {
    return (
      this.job.jobStopOnSchedule &&
      moment(this.job.jobStopOnSchedule).tz("Asia/Seoul").format("배정취소 YYYY.MM.DD HH:mm").toString()
    );
  }

  get paymentProcessedDate() {
    return (
      this.job.paymentProcessedAt &&
      getTime(this.job.paymentProcessedAt).add(9, 'hour').tz("Asia/Seoul").format("YYYY.MM.DD HH:mm").toString()
    );
  }

  get refundProcessedDate() {
    return (
      this.job.refundProcessedAt &&
      getTime(this.job.refundProcessedAt).tz("Asia/Seoul").format("YYYY.MM.DD HH:mm").toString()
    );
  }

  get paymentAcceptedDate(): string {

    return this.job.paymentAcceptedDate
      ? getTime(this.job.paymentAcceptedDate).tz("Asia/Seoul").format("YYYY.MM.DD HH:mm").toString()
      : ''
  }

  get paymentCompletedDate() {
    return (
      this.job.paymentCompletedDate &&
      getTime(this.job.paymentCompletedDate).add(9, 'hour').tz("Asia/Seoul").format("YYYY.MM.DD HH:mm").toString()
    );
  }

  get acceptNewbie() {
    return this.job.acceptNewbie;
  }

  get bonusSoon(): number | number[] {
    return isArray(this.job.bonusSoon)
      ? uniq(map(this.job.bonusSoon || [], (bonus) => +split(bonus, "-")[0]))
      : +this.job.bonusSoon;
  }
  get toSeekerBonusSoon() {
    return this.payment?.toSeekerBonusSoon || 0
  }

  get bonusSoonReason() {
    return this.original.bonusSoonForSeeker && (this.job.bonusSoonReason || "지원자X");
  }

  get bonusSoonCreatedTime() {
    return isArray(this.job.bonusSoon)
      ? map(this.job.bonusSoonCreatedTime, getTime)
      : getTime(this.job.bonusSoonCreatedTime);
  }

  get cancelReason() {
    return (
      this.job.cancelReason && (
        <>
          {(this.job.cancelReason.reasons || [])
            .filter((reason) => reason !== '기타')
            .map((reason) => (
              <div>{reason}</div>
            ))}
          <div>{this.job.cancelReason.reasonDetail && `기타(${this.job.cancelReason.reasonDetail || ''})`}</div>
        </>
      )
    );
  }

  get cancelTime() {
    return (
      this.job.cancelReason &&
      this.job.cancelReason.createdAt &&
      getTime(this.job.cancelReason.createdAt).tz("Asia/Seoul").format("YYYY.MM.DD HH:mm").toString() || (!!this.job.refundProcessedAt && this.job.hiringStatus?.includes('CANCEL')) && this.job.refundProcessedAt
    );
  }

  get isSuccesfulMatch() {
    return includes(values(this.job.hiredSeeker), "HIRED");
  }

  get isCanceledJob() {
    return includes(this.job.hiringStatus, "CANCEL");
  }

  get numberOfChangingSeekerRequest() {
    return size(this.job.seekerChangingReason);
  }

  get isPaymentError() {
    return includes(this.paymentStatus, "ERROR");
  }
}
