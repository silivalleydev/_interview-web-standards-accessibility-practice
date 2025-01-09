import {observable} from 'mobx'
import moment from 'moment-timezone'

export default class UserVerificationRequest {
  @observable request

  constructor(request) {
    this.request = request
  }

  get original() {
    return this.request
  }

  get registrationDate() {
    return moment(this.request.updatedAt).format('YYYY-MM-DD HH:mm:ss')
  }

  get username() {
    return this.request.username
  }

  get phoneNumber() {
    return this.request.phoneNumber
  }

  get uid() {
    return this.request.id
  }

  get idPhotoUrls() {
    return [
      this.request.idCardPhotos?.frontSidePhotoUrl,
      this.request.idCardPhotos?.backSidePhotoUrl,
    ]
  }
}
