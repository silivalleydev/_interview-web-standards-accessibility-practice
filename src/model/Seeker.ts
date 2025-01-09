import {observable} from 'mobx'
import moment from 'moment'
import {size, flatten, values, reduce, map, keys, filter} from 'lodash'

export class Seeker {
  @observable seeker

  constructor(seeker) {
    this.seeker = seeker
  }

  get id() {
    return this.seeker.id
  }
  get age() {
    return this.seeker.age
  }

  get registrationDate() {
    return moment(this.seeker.createdAt).format('YYYY-MM-DD')
  }

  get name() {
    return this.seeker.username
  }

  get penaltyReason() {}

  // get age() {
  //   return moment().diff(moment(this.seeker.birthDate), 'years')
  // }

  get gender() {
    return this.seeker.gender === 'M' ? '남' : '여'
  }

  get phoneNumber() {
    return this.seeker.phoneNumber
  }

  get selfIntro() {
    return this.seeker.seekerIntroduction
  }

  get skills() {
    const skills = flatten(
      map(values(this.seeker.skills), (skills) => values(skills))
    )

    return flatten(map(skills, (skill) => keys(skill)))
  }

  get skillCount() {
    return size(this.skills)
  }

  get resumes() {
    return filter(this.seeker.resumes, (resume) => resume.active !== false)
  }

  get reviews() {
    return this.seeker.reviews
  }

  get reviewRate() {
    let servingCount = 0
    let kitchenCount = 0

    if (this.reviewCount == 0) return {}

    const rate = reduce(
      this.reviews,
      (sum, review) => {
        sum.att += review.attitudeRate || review.rate

        if (review.jobKind === '서빙') {
          sum.serving += review.professionalRate || review.rate
          servingCount++
        }

        if (review.jobKind === '주방') {
          sum.kitchen += review.professionalRate || review.rate
          kitchenCount++
        }

        return sum
      },
      {att: 0, serving: 0, kitchen: 0}
    )

    return {
      att: (rate.att / this.reviewCount).toFixed(1),
      serving: servingCount ? (rate.serving / servingCount).toFixed(1) : 0,
      kitchen: kitchenCount ? (rate.kitchen / kitchenCount).toFixed(1) : 0,
    }
  }

  get resumeCount() {
    return size(this.resumes)
  }

  get reviewCount() {
    return size(this.seeker.reviews)
  }

  get photo() {
    return this.seeker.photo.photoURL
  }
}
