import {observable} from 'mobx'
import {isEmpty} from 'lodash'
import moment from 'moment-timezone'

export class Review {
  @observable review

  constructor(review) {
    this.review = review
  }

  get source() {
    return this.review.source
  }
  get seekerUid() {
    return this.review.seekerUid
  }
  get uid() {
    return this.review.uid
  }

  get comment() {
    return this.review.comment
  }

  get storeName() {
    return this.review.storeName
  }

  get startDatetime() {
    return (
      this.review.startDate &&
      moment(this.review.startDate)
        .tz('Asia/Seoul')
        .format('YYYY.MM.DD')
        .toString()
    )
  }

  get workPeriod() {
    let workPeriod = null

    switch (this.review.workPeriod) {
      case 0:
        workPeriod = '하루'
        break

      case 50:
        workPeriod = '이틀'
        break

      case 100:
        workPeriod = 'less than a month'
        break

      case 150:
        workPeriod = 'less than 2 months'
        break

      case 200:
        workPeriod = 'less than 3 months'
        break
    }

    return workPeriod
  }

  get fromSoon() {
    return !isEmpty(this.review.jobId)
  }

  get attitudeRate() {
    return this.review.attitudeRate || this.review.rate
  }

  get professionalRate() {
    return this.review.professionalRate || this.review.rate
  }
}
