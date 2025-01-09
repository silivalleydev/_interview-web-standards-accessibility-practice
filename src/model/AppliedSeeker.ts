import moment, {Moment} from 'moment'
import {last, get} from 'lodash'

export class AppliedSeeker {
  id: string
  salarySuggestion: number
  bonusSoon: number
  createdAt: string

  constructor(private data: any) {
    this.id = data.id
    this.salarySuggestion = data.salarySuggestion
    this.bonusSoon = data.bonusSoon || 0
    this.createdAt = data.createdAtFormat
  }

  get original() {
    return this.data
  }

  get name() {
    return get(this.data, 'seeker.username')
  }

  get gender() {
    return this.data.seeker.gender === 'M' ? '남' : '여'
  }

  get age() {
    return this.data.seeker.age
  }
  get priorityType() {
    return this.data.priorityType
  }

  get photo() {
    return get(this.data, 'seeker.photoUrl')
  }
  get seekerId() {
    return get(this.data, 'seeker.uid')
  }

  get phoneNumber() {
    return this.data.seeker.phoneNumber.replace('+82', '0')
  }

  get adminSMSSent() {
    return this.data.adminSMSSent
  }
  get contractId() {
    return this.data.contractId
  }

  get hiringStatus() {
    return this.data.hiringStatus || last(this.data.hiredCareActions)?.action
  }

  get hiringCareReply() {
    return last(this.data.hiredCareActions)
  }

  get hireCareActions() {
    return this.data.hiredCareActions
  }

  get appliedTime(): Moment {
    return moment(this.data.createdAt)
  }

  get seekerNoteFromAdmin() {
    return this.data.seekerNoteFromAdmin
  }

  get bonusSoonSuggestion(): number {
    return this.data.bonusSoonSuggestion
  }

  get reviews() {
    return this.data.reviews || []
  }
  get assignType() {
    return this.data.assignType || false
  }

  get resumes() {
    return this.data.resumes || []
  }

  get skills() {
    return this.data.skills || []
  }
}
