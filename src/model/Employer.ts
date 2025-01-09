import {observable} from 'mobx'
import moment from 'moment'
import {reduce, values} from 'lodash'

export class Employer {
  @observable employer

  constructor(employer) {
    this.employer = employer
  }

  get id(): string {
    return this.employer.uid
  }

  get ci() {
    return this.employer?.ci !== 'unknown' ? this.employer?.ci :'';
  }
  get device() {
    return this.employer?.device !== 'unknown' ? this.employer?.device :'';
  }
  get appVersion() {
    return this.employer?.appVersion !== 'unknown' ? this.employer?.appVersion :'';
  }

  get name(): string {
    return this.employer.username
  }

  get phoneNumber(): string {
    return this.employer.phoneNumber
  }

  get enterpriseCode(): string {
    return this.employer.enterpriseCode
  }


  get age(): number {
    return moment().diff(moment(this.employer.birthDate), 'years')
  }

  get creditcard(): string {
    if (this.employer.payment) {
      const {cardName, cardNumber} = this.employer.payment
      return cardName ? cardName + '/' + cardNumber : ''
    }
    return ''
  }

  get registrationDate(): string {
    return moment(this.employer.createdAt).format('YYYY-MM-DD')
  }

  get membershipWithdrawalDate(): string {
    return this.employer.leftAt
      ? moment(this.employer.leftAt).format('YYYY-MM-DD')
      : ''
  }

  get penalty() {
    
    return this.employer?.penalty
  }
  get penaltyDate() {
    
    return this.employer?.penaltyDate ?moment(this.employer?.penaltyDate).format("YYYY-MM-DD") :  ''
  }

  get hiringStatus(): string {
    return JSON.stringify(this.employer?.hiringStatus)
  }

  get reservationCount() {
    return reduce(
      values(this.employer?.hiringStatus),
      (sum, value) => (sum += value),
      0
    )
  }

  get reservationCancelCount() {
    return this.employer?.hiringStatus?.REGISTER_CANCEL_SOONY || ''
  }

  get hiredSeekersCount() {
    /**
     * AWS 전환 TODO: 사장님당 고용된 알바수 가져오기
     */
    return 0
    // (this.employer?.hiringStatus?.PAYMENT_SOONY || 0) +
    // (this.employer?.hiringStatus?.REPORT_ETC_EMPLOYER || 0) +
    // (this.employer?.hiringStatus?.REPORT_ABSENT_EMPLOYER || 0)
  }

  get hiringCancelCount() {
    return this.employer?.hiringStatus?.HIRE_CANCEL_EMPLOYER || ''
  }

  get reportStatus() {
    return `기타(${
      this.employer?.hiringStatus?.REPORT_ETC_EMPLOYER || 0
    }), 결근(${this.employer?.hiringStatus?.REPORT_ABSENT_EMPLOYER || 0})`
  }

  get adminMemo() {
    return this.employer.adminMemo
  }
  get leftAt() {
    return this.employer.leftAt
  }
}
