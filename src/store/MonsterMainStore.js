import { observable, action, computed } from 'mobx'

class MonsterMainStore {
  @observable isLoading = false
  @observable currentUser = null
  @observable currentPage = ''
  /**
   * TODO: 추후 유저 데이터 세팅 필요
   */
  @observable userInfo = {
    accessibleMenuList: [],
  }

  @action changeLoading = (value = false) => (this.isLoading = value)
  @action setCurrentUser = (user, token) => {
    this.currentUser = user
  }
  @action setUserInfo = (userInfo = {}) => {
    this.userInfo = {
      ...this.userInfo,
      ...userInfo,
    }
  }
}

export default MonsterMainStore = new MonsterMainStore()
