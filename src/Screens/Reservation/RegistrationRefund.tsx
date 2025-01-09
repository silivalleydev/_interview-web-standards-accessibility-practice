import React, { useState } from 'react'
import { isNumber, throttle } from 'lodash'
import firebase from 'firebase/app'

import moment from 'moment-timezone'
moment.tz('Asia/Seoul')
moment.locale('ko')

import {
  Button,
  TextField,
  IconButton,
  CircularProgress,
} from '@material-ui/core'

import Typography from '@material-ui/core/Typography'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import Popover from '@material-ui/core/Popover'
import { PaymentDetail } from '/imports/model/Types'
import { Job } from '/imports/model/Job'
import {
  paymentForSeeker,
  refundCash,
  refundForEmployer,
} from '../../api/employers'

type Props = {
  job: Job
  jobId: string
  employerId: string
  seekerId: string
  paymentStatus: string
  paymentDetail: PaymentDetail
  bonusSoon: string
  payment: object
  lastPayment: any
  isDailyLaborReport: any
}

const RegistrationRefund: React.FC<Props> = ({
  job,
  jobId,
  employerId,
  seekerId,
  paymentStatus,
  paymentDetail,
  payment,
  lastPayment,
  isDailyLaborReport,
  reloadJobInfo
}) => {
  const EMPLOYER_REFUND = '사장님환불'
  const SEEKER_TRANSFER = '급여이체'
  const CASH_REFUND = '할인캐시 환불'
  const { toSeeker, toEmployer, cashRefund } = payment || {}

  const {
    transactionPath,
    days,
    usedCash,
    salary,
    amountToPay,
  } = paymentDetail
  const restTime = job.restTime || paymentDetail.restTime
  const [moneyToProcess, setMoneyToProcess] = useState()
  const [isTaskProcessing, setTaskProcessing] = useState(false)
  const [isCheckCalculation, setIsCheckCalculation] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const openRefund = Boolean(anchorEl)
  const [refundPopoverType, setRefundPopupType] = useState('')
  const [realWorkingTime, setRealWorkingTime] = useState('')

  const [moneyToSeeker, setMoneyToSeeker] = useState()
  const [moneyToEmployer, setMoneyToEmployer] = useState()
  const [cashToRefund, setCashToRefund] = useState()
  const [inputBonusSoon, setInputBonusSoon] = useState()

  const openRefundPopover = (e, type) => {
    setAnchorEl(e.currentTarget)
    setRefundPopupType(type)
  }
  const closeRefundPopover = () => setAnchorEl(null)

  const refund = async () => {
    if (moneyToProcess <= 0 && !isNumber(+moneyToProcess)) {
      alert('check the input')
      return
    }
    setTaskProcessing(true)

    // 사장님 환불
    if (refundPopoverType === EMPLOYER_REFUND) {
      const result = await refundForEmployer({
        jobId,
        refundAmount: +moneyToProcess,
      })

      if (result.status === 'OK') {
        setTaskProcessing(false)
        setMoneyToProcess(0)
        alert('환불처리되었습니다.')
        reloadJobInfo()
      } else {
        setTaskProcessing(false)
        setMoneyToProcess(0)

        alert('다시 시도해주세요.')
      }
      closeRefundPopover()
    }

    //급여이체 처리
    if (refundPopoverType === SEEKER_TRANSFER) {
      const result = await paymentForSeeker({
        jobId,
        moneyToProcess: +moneyToProcess,
        employerId,
        bonusSoon: isCheckCalculation === true ? inputBonusSoon : null,
      })
      if (result.status === 'OK') {
        setIsCheckCalculation(false)
        setTaskProcessing(false)
        setMoneyToProcess(0)
        alert('급여이체 처리 되었습니다.')
        reloadJobInfo()
      } else {
        setTaskProcessing(false)
        setMoneyToProcess(0)

        alert('다시 시도해주세요.')
      }
      closeRefundPopover()
    }

    //할인캐시 환불

    if (refundPopoverType === CASH_REFUND) {
      const result = await refundCash({
        jobId,
        cashRefund: +moneyToProcess,
        employerUid: employerId,
      })
      if (result.status === 'OK') {
        setTaskProcessing(false)
        setMoneyToProcess(0)
        alert('환불처리되었습니다.')
        reloadJobInfo()
      } else {
        setTaskProcessing(false)
        setMoneyToProcess(0)

        alert('다시 시도해주세요.')
      }
      closeRefundPopover()
    }
  }

  const calculatePayment = () => {
    let hoursPerDay = 0

    if (job.original.startDate && job.original.endDate) {
      const startTime = moment(job.original.startDate);
      let endTime = moment(job.original.endDate);


      const endHour =
        endTime.get('hour') + (endTime.get('minute') === 30 ? 0.5 : 0);

      const startHour =
        startTime.get('hour') + (startTime.get('minute') === 30 ? 0.5 : 0);

      const diff = endHour - startHour;

      let diffTime = diff;
      if (diff < 0) {
        diffTime = diff + 24;
      }
      hoursPerDay = diffTime
    }

    // 실제 근무시간
    const workingTime = (hoursPerDay - restTime)
    const currentSalary = salary
    const currentAmout = amountToPay;

    setIsCheckCalculation(true)

    // 사자님 환불 금액
    setMoneyToEmployer(
      Math.round(
        (currentAmout * (workingTime - +realWorkingTime)) / workingTime
      )
    )

    //알바 입금 금액
    setMoneyToSeeker(
      Math.round((currentSalary * +realWorkingTime) / workingTime) +
      (+inputBonusSoon || 0)
    )

    //환불 될 할인캐시

    setCashToRefund(
      Math.round((usedCash * (workingTime - +realWorkingTime)) / workingTime)
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!!moneyToEmployer && (
          <Typography style={{ whiteSpace: 'nowrap' }}>
            사장님 환불 금액: {moneyToEmployer?.toLocaleString()}원
          </Typography>
        )}
        {!!moneyToSeeker && (
          <Typography style={{ whiteSpace: 'nowrap' }}>
            알바님 급여지급액: {moneyToSeeker?.toLocaleString()}원
          </Typography>
        )}
        {!!cashToRefund && (
          <Typography style={{ whiteSpace: 'nowrap' }}>
            할인캐시 환불 금액: {cashToRefund?.toLocaleString()}원
          </Typography>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          padding: 8,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TextField
            placeholder="일한시간"
            type="number"
            value={realWorkingTime}
            onChange={(e) => setRealWorkingTime(e.target.value)}
          />
          <TextField
            placeholder="뽀너쑨"
            type="number"
            value={inputBonusSoon}
            onChange={(e) => setInputBonusSoon(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>
        <IconButton onClick={calculatePayment}>
          <ArrowForwardIcon />
        </IconButton>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
        {!!toEmployer && (
          <div>
            <span>사장님환불 : {toEmployer}</span>
          </div>
        )}
        <Button
          disabled={toEmployer}
          variant="outlined"
          onClick={(e) => openRefundPopover(e, '사장님환불')}
        >
          사장님환불
        </Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
        {!!toSeeker && (
          <>
            <div>
              <span>급여이체 : {`${toSeeker?.toLocaleString()}원`}</span>
            </div>
            <div>{`${job?.transferToSeekerDate || job?.paymentProcessedDate || ''
              }`}</div>
          </>
        )}
        <Button
          variant="outlined"
          onClick={(e) => openRefundPopover(e, '급여이체')}
        >
          급여
        </Button>
      </div>
      {usedCash > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
          {!!cashRefund && (
            <div>
              <span>할인캐시환불 : {cashRefund}</span>
            </div>
          )}
          <Button
            disabled={cashRefund}
            variant="outlined"
            onClick={(e) => openRefundPopover(e, '할인캐시 환불')}
          >
            할인캐시 환불
          </Button>
        </div>
      )}

      <Popover
        open={openRefund}
        anchorEl={anchorEl}
        onClose={closeRefundPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <Typography>{refundPopoverType}</Typography>
          <div
            style={{
              marginBottom: 8,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TextField
              value={moneyToProcess}
              onChange={(e) => setMoneyToProcess(e.target.value)}
              type="number"
            />
            <Typography>원</Typography>
          </div>
          <Button
            variant="outlined"
            onClick={throttle(refund, 2000, { trailing: false })}
            disabled={isTaskProcessing}
          >
            {isTaskProcessing ? (
              <CircularProgress size={16} />
            ) : (
              refundPopoverType
            )}
          </Button>
        </div>
      </Popover>
    </div>
  )
}

export default RegistrationRefund
