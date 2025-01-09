import React, { useState, useEffect } from 'react'
import moment, { Moment } from 'moment'
import {
  map,
  isNil,
  isNumber,
  throttle,
  omit,
  split,
  range,
  flatten,
  indexOf,
  result,
} from 'lodash'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  Input,
  Select,
  MenuItem,
} from '@material-ui/core'

import { KeyboardDatePicker } from '@material-ui/pickers'

import styled from 'styled-components'
import { copyJob } from '../../api/jobs'

const Div = styled.div`
  margin-top: 16px;
`

const MainP = styled.p`
  font-size: 16px;
`

const NoMarginP = styled.p`
  margin-bottom: 0;
`

const EMPLOYER_START_HOURS_SELECTIONS = flatten(
  map(range(6, 24), (r) => [`0${r}:00`.slice(-5), `0${r}:30`.slice(-5)])
).slice(1, -1)
const EMPLOYER_END_HOUR_SELECTIONS = [
  ...flatten(
    map(range(6, 25), (r) => [
      `0${r}:00`.slice(-5),
      `0${r}:30`.slice(-5),
    ]).slice(1, -1)
  ),
  '새벽 00:00',
  '새벽 00:30',
  '새벽 01:00',
  '새벽 01:30',
  '새벽 02:00',
  '새벽 02:30',
  '새벽 03:00',
  '새벽 03:30',
  '새벽 04:00',
  '새벽 04:30',
  '새벽 05:00',
  '새벽 05:30',
  '새벽 06:00',
  '새벽 06:30',
  '아침 07:00',
  '아침 07:30',
  '아침 08:00',
  '아침 08:30',
  '아침 09:00',
  '아침 09:30',
  '아침 10:00',
]

const JobRegistrationDialog = ({ job, onClose }) => {
  if (!job) return null

  const [startDate, setStartDate] = useState(new Date(job.startDate))
  const [startTime, setStartTime] = useState(job.startTime)
  const [startDateTime, setStartDateTime] = useState<Moment>()

  const endTimeAfter = job?.endTimeInText || job?.endTime

  const [endDate, setEndDate] = useState()
  const [endTime, setEndTime] = useState(endTimeAfter?.split(':')?.[0] && parseInt(endTimeAfter?.split(':')?.[0]) < 7 ? `새벽 ${endTimeAfter}` : endTimeAfter)

  const [seekerAssigningTime, setSeekerAssigningTime] = useState(
    job.seekerAssigningTime
  )
  const [salary, setSalary] = useState(job.salary)
  const [processing, setProcessing] = useState(false)
  const [matchingFee, setMatchingFee] = useState(
    job.paymentDetail.matchingFee + ''
  )
  const [restTime, setRestTime] = useState<number>(job.restTime)
  const [workPeriod, setWorkPeriod] = useState(job.original.workPeriod)
  const [hoursPerDay, setHoursPerDay] = useState()


  useEffect(() => {
    if (!startDateTime) return

    const startTimeIndex = indexOf(EMPLOYER_START_HOURS_SELECTIONS, startTime)
    const endTimeIndex = indexOf(EMPLOYER_END_HOUR_SELECTIONS, endTime)

    let endDateTime = moment(
      moment(startDate).format('YYYY.MM.DD') + ' ' + endTime,
      'YYYY.MM.DD HH:mm'
    )

    if (
      EMPLOYER_END_HOUR_SELECTIONS?.[endTimeIndex]?.includes('새벽') ||
      EMPLOYER_END_HOUR_SELECTIONS?.[endTimeIndex]?.includes('아침')
    ) {
      endDateTime = endDateTime.add(1, 'd')
    }

    setEndDate(endDateTime.toDate())
    // if (startTimeIndex >= endTimeIndex) {
    //   // console.log(startTimeIndex, endTimeIndex);
    //   setHoursPerDay(0)
    //   return
    // }
    setHoursPerDay(Math.abs((endTimeIndex - startTimeIndex + 1) / 2))
  }, [startDateTime, endTime, workPeriod])

  useEffect(() => {
    const startDateTime = moment(
      moment(startDate).format('YYYY.MM.DD').toString() + ' ' + startTime,
      'YYYY.MM.DD HH:mm'
    )
    setStartDateTime(startDateTime)
  }, [startDate, startTime])

  const getRestTimeInText = (restTime: number) => {
    if (isNumber(restTime) && restTime >= 0) {
      const [hour, minute] = split(restTime.toFixed(1), '.')
      if (!['0', '5'].includes(minute)) {
        throw new Error(
          'check 무급휴게시간. only 0 and 5 are allowed after dot(.)'
        )
      }

      return hour + '시간' + (minute === '0' ? '' : ' 30분')
    }
    throw new Error('check 무급휴게시간. value is NaN')
  }

  const copyJobAction = async (
    jobId,
    seekerAssigningTime,
    startDateTime,
    endDate,
    salary,
    hoursPerDay,
    workPeriod,
    restTime,
    matchingFee,
    callback
  ) => {
    try {
      const result = await copyJob({
        jobId,
        seekerAssigningTime,
        startDateTime,
        endDate,
        salary,
        hoursPerDay,
        workPeriod,
        restTime,
        matchingFee,
      })

      if (result.status === 'OK') {
        await callback(result)
        return result
      } else {
        await callback(false)
      }
    } catch (ex) {
      console.log('copyJob', ex)
      await callback(false)
      return ex
    }
  }

  const submit = async () => {
    if (!isNumber(+salary) || +salary <= 0 || +salary < 10000) {
      alert('check a salary value')
      return
    }
    const startTimeIndex = indexOf(EMPLOYER_START_HOURS_SELECTIONS, startTime)
    const endTimeIndex = indexOf(EMPLOYER_END_HOUR_SELECTIONS, endTime)
    if (isNil(hoursPerDay) || hoursPerDay <= 0) {
      alert('check time again')
      return
    }

    setProcessing(true)

    copyJobAction(
      job.id,
      seekerAssigningTime,
      startDateTime?.toDate(),
      endDate,
      +salary,
      hoursPerDay,
      workPeriod,
      restTime,
      matchingFee,
      (ret) => {
        if (ret) {
          alert('finished adding a new job')
          setProcessing(false)
          onClose()
        } else {
          alert('smt wrong. try again later')
        }
      }
    )
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>알바신청</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ marginBottom: 0 }}>
          기본정보
        </DialogContentText>
        <Div>
          {/* <MainP>{job.durationDate}</MainP> */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM.DD(ddd)"
              margin="normal"
              id="date-picker-inline"
              label="From"
              value={startDate}
              onChange={setStartDate}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
              style={{ marginRight: 32 }}
            />
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={workPeriod}
              onChange={(e) => setWorkPeriod(e.target.value)}
              style={{ marginTop: 'auto', marginBottom: 8 }}
            >
              <MenuItem value={0}>하루</MenuItem>
              <MenuItem value={50}>이틀</MenuItem>
            </Select>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginBottom: 16,
            }}
          >
            <Select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              {map(EMPLOYER_START_HOURS_SELECTIONS, (hour) => (
                <MenuItem value={hour}>{hour}</MenuItem>
              ))}
            </Select>
            <p style={{ margin: '0 16px' }}>~</p>
            <Select
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value)

              }}
              style={{ marginBottom: 16 }}
            >
              {map(EMPLOYER_END_HOUR_SELECTIONS, (hour) => (
                <MenuItem value={hour}>{hour}</MenuItem>
              ))}
            </Select>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <NoMarginP>무급휴게시간 </NoMarginP>
            <Select
              value={restTime}
              onChange={(e) => setRestTime(e.target.value)}
              style={{ marginLeft: 24 }}
            >
              <MenuItem value={0}>0</MenuItem>
              <MenuItem value={0.5}>30분</MenuItem>
              <MenuItem value={1}>1시간</MenuItem>
              <MenuItem value={1.5}>1시간 30분</MenuItem>
              <MenuItem value={2}>2시간</MenuItem>
            </Select>
          </div>

          {job.isDailyLaborReport && <p>인건비신고함</p>}
        </Div>
        <Divider />
        <Div>
          <MainP>{job.storeName}</MainP>
          <p>{job.storeAddress}</p>
        </Div>
        <Divider />
        <Div>
          <MainP>{job.jobKind}</MainP>
          <p>{job.jobSubKinds}</p>
        </Div>
        <Divider />
        <Div>
          <MainP>시급</MainP>
          <Input
            value={salary}
            style={{ marginBottom: 16 }}
            onChange={(e) => setSalary(e.target.value)}
          />
        </Div>
        <Div>
          <MainP>매칭비</MainP>

          <Select
            value={matchingFee}
            onChange={(e) => setMatchingFee(e.target.value)}
            style={{ marginBottom: 16 }}
          >
            <MenuItem value={'0.187'}>0.187</MenuItem>
            <MenuItem value={'0.165'}>0.165</MenuItem>
            <MenuItem value={'0.132'}>0.132</MenuItem>
          </Select>
        </Div>
        <Divider />
        <Div>
          <MainP>신정인원</MainP>
        </Div>
        <Divider />
        <Div>
          <MainP>배정예정시간</MainP>
          <p>
            <Input
              value={seekerAssigningTime}
              style={{ marginBottom: 16 }}
              onChange={(e) => setSeekerAssigningTime(e.target.value)}
            />
          </p>
        </Div>
        <Divider />
        <Div>
          <MainP>상세정보</MainP>
          <p>선호나이 {job.preferedAge || '없음'}</p>
          <p>선호성별 {job.preferedGender || '없음'}</p>
        </Div>
        <Divider />
        <Div>
          {map(job.jobMemo, (memo, index) => (
            <li key={index}>{memo}</li>
          ))}
        </Div>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="primary"
          onClick={throttle(submit, 10000, { trailing: false })}
          disabled={processing}
        >
          {processing ? 'please wait ...' : '등록하기'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default JobRegistrationDialog
