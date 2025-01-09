import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { get, filter, size } from 'lodash'
import { RadialChart } from 'react-vis'
import moment from 'moment'
import LoadingSpinner from '../Components/LoadingSpinner'
import { getTodayResumes, getYesterdayResumes } from '../api/dashboard'
const perPage = 10

class DashBoard extends Component {
  @observable hiredCount = 0
  @observable absentCount = 0
  @observable canceledByAdminCount = 0
  @observable canceledByEmployerCount = 0
  @observable isLoadingToday = false

  @observable hiredYesterdayCount = 0
  @observable absentYesterdayCount = 0
  @observable canceledByAdminYesterdayCount = 0
  @observable canceledByEmployerYesterdayCount = 0
  @observable isLoadingYesterday = false

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.getResumes()
  }

  getResumes = async () => {
    this.getTodayResumes()
    this.getYesterdayResumes()
  }

  getYesterdayResumes = async () => {
    this.isLoadingYesterday = true
    const result = await getYesterdayResumes()
    if (result.status === 'OK') {
      this.isLoadingYesterday = false

      this.hiredYesterdayCount = size(
        filter(
          result.data,
          (resume) =>
            resume.status === 'HIRED' || typeof resume.status === 'undefined'
        )
      )
      this.absentYesterdayCount = size(
        filter(
          result.data,
          (resume) =>
            resume.status === 'REPORT_ABSENT_ADMIN' ||
            resume.status === 'REPORT_ABSENT_EMPLOYER'
        )
      )
      this.canceledByAdminYesterdayCount = size(
        filter(result.data, ['status', 'HIRE_CANCEL_ADMIN'])
      )
      this.canceledByEmployerYesterdayCount = size(
        filter(result.data, ['status', 'HIRE_CANCEL_EMPLOYER'])
      )
    }
  }

  getTodayResumes = async () => {
    this.isLoadingToday = true

    const result = await getTodayResumes()
    if (result.status === 'OK') {
      this.isLoadingToday = false

      this.hiredCount = size(
        filter(
          result.data,
          (resume) =>
            resume.status === 'HIRED' || typeof resume.status === 'undefined'
        )
      )
      this.absentCount = size(
        filter(
          result.data,
          (resume) =>
            resume.status === 'REPORT_ABSENT_ADMIN' ||
            resume.status === 'REPORT_ABSENT_EMPLOYER'
        )
      )
      this.canceledByAdminCount = size(
        filter(result.data, ['status', 'HIRE_CANCEL_ADMIN'])
      )
      this.canceledByEmployerCount = size(
        filter(result.data, ['status', 'HIRE_CANCEL_EMPLOYER'])
      )
    }
  }

  render() {
    return (
      <div
        id="dashboard-page"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          fontSize: 24,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            fontSize: '0.6em',
            // alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RadialChart
            data={[
              {
                angle: this.canceledByEmployerYesterdayCount,
                label: this.canceledByEmployerYesterdayCount
                  ? `채취 ${this.canceledByEmployerYesterdayCount}`
                  : '',
              },
              {
                angle: this.canceledByAdminYesterdayCount,
                label: this.canceledByAdminYesterdayCount
                  ? `출취 ${this.canceledByAdminYesterdayCount}`
                  : '',
              },
              {
                angle: this.absentYesterdayCount,
                label: this.absentYesterdayCount
                  ? `무결 ${this.absentYesterdayCount}`
                  : '',
                color: 'red',
              },
              {
                angle: this.hiredYesterdayCount,
                label: this.hiredYesterdayCount
                  ? `채용 ${this.hiredYesterdayCount}`
                  : '',
              },
            ]}
            showLabels={true}
            width={300}
            height={300}
          />
          <div style={{ marginLeft: 30 }}>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>어제의 쑨</div>
            {this.isLoadingYesterday ? (
              <div>불러오는중</div>
            ) : (
              <div>
                <div>채용: {this.hiredYesterdayCount}</div>
                <div>채취: {this.canceledByEmployerYesterdayCount}</div>
                <div>출취: {this.canceledByAdminYesterdayCount}</div>
                <div>무결: {this.absentYesterdayCount}</div>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            marginTop: 40,
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'row',
            // alignItems: 'center',
          }}
        >
          <RadialChart
            data={[
              {
                angle: this.canceledByEmployerCount,
                label: this.canceledByEmployerCount
                  ? `채취 ${this.canceledByEmployerCount}`
                  : '',
              },
              {
                angle: this.canceledByAdminCount,
                label: this.canceledByAdminCount
                  ? `출취 ${this.canceledByAdminCount}`
                  : '',
              },
              {
                angle: this.absentCount,
                label: this.absentCount ? `무결 ${this.absentCount}` : '',
                color: 'red',
              },
              {
                angle: this.hiredCount,
                label: this.hiredCount ? `채용 ${this.hiredCount}` : '',
              },
            ]}
            showLabels={true}
            width={300}
            height={300}
          />
          <div style={{ marginLeft: 30 }}>
            <div
              style={{
                fontSize: '1.7em',
                fontWeight: 'bold',
              }}
            >
              오늘의 쑨
            </div>
            {this.isLoadingToday ? (
              <div>불러오는중</div>
            ) : (
              <div>
                <div>채용: {this.hiredCount}</div>
                <div>채취: {this.canceledByEmployerCount}</div>
                <div>출취: {this.canceledByAdminCount}</div>
                <div>무결: {this.absentCount}</div>
              </div>
            )}
          </div>
        </div>
        {/* <LoadingSpinner isLoading={true} /> */}
      </div>
    )
  }
}

export default inject('MonsterMainStore')(observer(DashBoard))
