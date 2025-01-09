import {
  Box,
  Button,
  MenuItem,
  Modal,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  CircularProgress,
  InputBase,
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { useHistory } from 'react-router-dom'

import React, { useEffect, useLayoutEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import moment from 'moment'
import { Pagination } from '@mui/material'
import { DateRangePicker } from 'react-dates'
import { createEnterpriseCode, deleteEnterpriseCode, deleteUserEnterpriseCode, getEnterpriseUsersList, getEnterpriseCodeList, updateUserEnterpriseCode, loadReservationsByDateEnterpriseCodeList } from '../api/enterprise'
import LoadingSpinner from '../Components/LoadingSpinner'


export default function Enterprise() {
  const [enterpriseName, setenterpriseName] = useState<string>('')
  const [enterpriseCode, setenterpriseCode] = useState<string>('')
  const [isDirectPaymentSoon, setIsDirectPaymentSoon] = useState<
    null | boolean
  >(null)

  const [matchingFee, setMatchingFee] = useState<string>('')
  const [targetUid, setTargetUid] = useState<string>('')
  const [targetCode, setTargetCode] = useState<string>('')
  const [enterpriseInfoList, setEnterpriseInfoList] = useState<[]>([])
  const [enterpriseUserList, setEnterpriseUserList] = useState<[]>([])
  const [open, setOpen] = useState(false)
  const [openEnterpriseUserModal, setOpenEnterpriseUserModal] = useState(false)
  const [openSearchInputModal, setOpenSearchInputModal] = useState(false)
  const [openEnterpriseUserTable, setOpenEnterpriseUserTable] = useState(false)
  const [targetName, setTargetName] = useState<string>('')
  const [enterpriseInfo, setEnterpriseInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchUidValue, setSearchUidValue] = useState('')

  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
    setenterpriseName('')
    setenterpriseCode('')
    setMatchingFee('')
  }

  //고객사 코드 리스트 
  const getEnterpriseCode = async () => {
    setIsLoading(true)

    const result = await getEnterpriseCodeList()

    if (result.status === 'OK') {
      setIsLoading(false)
      setEnterpriseInfoList(result?.dataList?.data || [])
    }
    setIsLoading(false)
  }



  //고객사 코드 생성
  const onClickCreateEnterpriseCode = async () => {

    const result = await createEnterpriseCode({
      code: enterpriseCode,
      enterpriseName,
      fixMatchingFee: matchingFee,
      isProgressPayment: isDirectPaymentSoon === 'direct',
    })

    if (result.status === 'OK') {
      alert('생성완료')
      handleClose()

      getEnterpriseCode()
      setenterpriseName('')
      setenterpriseCode('')
      setIsDirectPaymentSoon(null)
      setMatchingFee('')
    } else {
      if (result.message === 'CODE_EXIST') {
        alert('이미 등록된 코드입니다.')
        return
      }
      handleClose()

      alert('실패')
    }


  }

  //고객사 코드 삭제 
  const onClickDeleteEnterpriseCode = async (id) => {
    if (confirm('해당 코드를 삭제하겠습니까')) {

      const result = await deleteEnterpriseCode(id)



      if (result.status === 'OK') {
        alert('삭제완료')
        getEnterpriseCode()
      } else {
        alert('실패')
      }


      getEnterpriseUsers()
    } else {
    }
  }


  let [tatalPage, setTotalPage] = useState(1)


  //코드별 엔터프라이즈 유저들 모든 정보 가져오기
  const getEnterpriseUsers = async (code, page = 1) => {
    setIsLoadingUser(true)
    setEnterpriseUserList([])

    setOpenEnterpriseUserTable(!openEnterpriseUserTable)


    const getEnterpirseUsersResult = await getEnterpriseUsersList({ code, page: page - 1, userUid: searchUidValue })

    if (getEnterpirseUsersResult.status === 'OK') {
      setTotalPage((getEnterpirseUsersResult?.dataList?.totalPageCount || 0) + 1)
      setIsLoadingUser(false)
      setEnterpriseUserList(getEnterpirseUsersResult?.dataList?.data || [])
    }

  }

  //유저 엔터프라이즈 코드부여
  const onClickupdateUserEnterpriseCode = async () => {

    const result = await updateUserEnterpriseCode({
      userUid: targetUid,
      code: targetCode,
    })

    if (result.status === 'OK') {
      if (result.data.message === 'USER_CODE_EXIST') {
        alert('이미 등록된 회원입니다.')
        return
      }
      alert('정상등록되었습니다')
      setTargetCode('')
      setTargetUid('')
      setOpenEnterpriseUserModal(false)
      getEnterpriseCode()



    } else {
      if (result.message === 'USER_CODE_EXIST') {
        alert('이미 등록된 회원입니다.')
        return
      } else {
        alert('실패')
        setTargetCode('')
        setTargetUid('')
        setOpenEnterpriseUserModal(false)
      }
    }


  }
  const onClickDeleteUserEnterpriseCode = async (id, code) => {

    const result = await deleteUserEnterpriseCode(id)
    if (confirm('해당 코드를 삭제하겠습니까')) {

      if (result.status === 'OK') {
        alert('삭제완료')
        getEnterpriseCode()
        getEnterpriseUsers(code, currentPage)
        setTargetCode('')
        setTargetUid('')
      } else {
        alert('실패')
      }


    }
  }

  useEffect(() => {
    getEnterpriseCode()
  }, [])
  return (
    <>
      <LoadingSpinner isLoading={isLoading} />
      <div>
        <div style={{ fontSize: 20, fontWeight: 'bold' }}>고객사 코드 관리</div>
      </div>
      <div style={{ height: 20 }}></div>

      <Button
        variant="outlined"
        color="primary"
        onClick={handleOpen}
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          marginBottom: 25,
          maxWidth: '200px',
        }}
      >
        고객사 코드 추가
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <div style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 20 }}>
            고객사 코드 추가
          </div>

          <TextField
            style={inputStyle}
            InputLabelProps={{
              shrink: true,
            }}
            id="outlined-basic"
            label="기업명"
            variant="outlined"
            value={enterpriseName}
            onChange={(e) => setenterpriseName(e.target.value)}
          />
          <TextField
            style={inputStyle}
            InputLabelProps={{
              shrink: true,
            }}
            id="outlined-basic"
            label="기업코드"
            variant="outlined"
            value={enterpriseCode}
            onChange={(e) => setenterpriseCode(e.target.value)}
          />
          <TextField
            style={inputStyle}
            InputLabelProps={{
              shrink: true,
            }}
            select
            id="outlined-basic"
            label="고객사 직접 지급 여부"
            variant="outlined"
            value={isDirectPaymentSoon}
            onChange={(e) => {
              setIsDirectPaymentSoon(e.target.value)
            }}
          >
            <MenuItem key={'fix'} value={'fix'}>
              고객사 직접 지급(고정 수수료)
            </MenuItem>
            <MenuItem key={'basic'} value={'basic'}>
              고객사 직접 지급(기존 수수료)
            </MenuItem>
            <MenuItem key={'direct'} value={'direct'}>
              쑨에서 지급
            </MenuItem>
          </TextField>

          {isDirectPaymentSoon !== 'basic' && (
            <TextField
              style={inputStyle}
              InputLabelProps={{
                shrink: true,
              }}
              type="number"
              id="outlined-basic"
              label="매칭비(%)"
              variant="outlined"
              value={matchingFee}
              onChange={(e) => {
                setMatchingFee(e.target.value)
              }}
            />
          )}

          <Button
            color="primary"
            variant="contained"
            style={inputStyle}
            disabled={
              isDirectPaymentSoon === null ||
              (isDirectPaymentSoon === true && !matchingFee) ||
              !enterpriseCode ||
              !enterpriseName
            }
            onClick={onClickCreateEnterpriseCode}
          >
            추가하기
          </Button>
        </Box>
      </Modal>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <CodeListTableContainer
          enterpriseInfoList={enterpriseInfoList}
          deleteEnterpriseCode={onClickDeleteEnterpriseCode}
          openEnterpriseUserModal={openEnterpriseUserModal}
          setOpenEnterpriseUserModal={setOpenEnterpriseUserModal}
          targetUid={targetUid}
          setTargetUid={setTargetUid}
          onClickupdateUserEnterpriseCode={onClickupdateUserEnterpriseCode}
          targetCode={targetCode}
          setTargetCode={setTargetCode}
          getEnterpriseUsers={getEnterpriseUsers}
          targetName={targetName}
          setTargetName={setTargetName}
          setEnterpriseInfo={setEnterpriseInfo}
          enterpriseInfo={enterpriseInfo}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          openSearchInputModal={openSearchInputModal}
          setOpenSearchInputModal={setOpenSearchInputModal}
        />
      )}

      <div style={{ height: 30 }}></div>
      {isLoadingUser ? (
        <CircularProgress />
      ) : (
        !!enterpriseInfo === true && (
          <EnterpriseUserListContainer
            enterpriseUserList={enterpriseUserList}
            onClickDeleteUserEnterpriseCode={onClickDeleteUserEnterpriseCode}
            targetName={targetName}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            tatalPage={tatalPage}
            searchUidValue={searchUidValue}
            setSearchUidValue={setSearchUidValue}
            getEnterpriseUsers={getEnterpriseUsers}
            targetCode={targetCode}
          />
        )
      )}

      <div style={{ height: 100 }}></div>
    </>
  )
}

const CodeListTableContainer = ({
  enterpriseInfoList,
  deleteEnterpriseCode,
  openEnterpriseUserModal,
  setOpenEnterpriseUserModal,
  targetUid,
  setTargetUid,
  onClickupdateUserEnterpriseCode,
  setTargetCode,
  targetCode,
  getEnterpriseUsers,
  targetName,
  setTargetName,
  enterpriseInfo,
  setEnterpriseInfo,
  setCurrentPage,
  currentPage,
  openSearchInputModal,
  setOpenSearchInputModal,
}) => {
  const [startDateRange, setStartDateRange] = useState()
  const [endDateRange, setEndDateRange] = useState()
  const [dateRangeFocusInput, setDateRangeFocusInput] = useState()
  const [createdAtRangeFocusInput, setCreatedAtRangeFocusInput] = useState()
  const [createdAtRangeFocusobj, setCreatedAtRangeFocusobj] = useState({})
  const [startDateRangeFocusInput, setStartDateRangeFocusInput] = useState()
  const [createdAtStart, setCreatedAtStart] = useState()
  const [createdAtEnd, setCreatedAtEnd] = useState()

  const openUserModel = (row) => {
    setOpenEnterpriseUserModal(true)
    setTargetCode(row.code)
    setTargetName(row.enterpriseName)
  }
  const closeUserModel = () => {
    setOpenEnterpriseUserModal(false)
    setTargetUid('')
  }
  const openSearchModel = (row) => {
    setOpenSearchInputModal(true)
    setTargetCode(row.code)

    setTargetName(row.enterpriseName)
  }
  const closeSearchModel = () => {
    setCreatedAtStart(null)
    setCreatedAtEnd(null)
    setOpenSearchInputModal(false)
  }

  useEffect(() => {
    if (currentPage && enterpriseInfo?.code) {
      getEnterpriseUsers(enterpriseInfo?.code, currentPage)
    }
  }, [currentPage, enterpriseInfo?.code])

  const openEnterpriseUserButton = (row) => {
    if (enterpriseInfo?.code === row.code) {
      setEnterpriseInfo(null)
      setTargetName(null)
      return
    }
    setCurrentPage(1)
    getEnterpriseUsers(row.code, currentPage)
    setTargetName(row.enterpriseName)
    setEnterpriseInfo(row)
  }
  const [visible, setVisible] = useState(false)
  const history = useHistory()

  const loadReservationsByDateEnterpriseCode = async ({
    createdAtStart,
    createdAtEnd,
    targetCode,
  }) => {


    const result = await loadReservationsByDateEnterpriseCodeList({
      page: currentPage,
      createdAtStartStr: moment(createdAtStart).format('YYYY-MM-DD'),
      createdAtEndStr: moment(createdAtEnd).format('YYYY-MM-DD'),
      enterpriseCode: targetCode,
    })


    if (result.status === 'OK') {
      return result.data

    } else {
      return []
    }

    // return new Promise((resolve, reject) => {
    //   Meteor?.call(
    //     'loadReservationsByDateEnterpriseCode',
    //     {
    //       page: currentPage,
    //       createdAtStart: moment(createdAtStart).toDate(),
    //       createdAtEnd: moment(createdAtEnd).toDate(),
    //       enterpriseCode: targetCode,
    //     },
    //     (err, jobs = []) => {
    //       if (err) reject([])
    //       resolve(jobs)
    //     }
    //   )
    // })
  }


  //날짜별 고객사 등록 알바 리스트 
  const handleButtonClick = async () => {
    const result =
      (await loadReservationsByDateEnterpriseCode({
        createdAtStart,
        createdAtEnd,
        targetCode,
      })) || []

    if (result.length > 0) {
      // 버튼을 클릭할 때 reservation URL로 이동
      history.push(
        `/reservation?createdAtStart=${createdAtStart}&createdAtEnd=${createdAtEnd}&targetCode=${targetCode}`
      )
    } else {
      alert('선택한 날짜에 해당하는 공고가 없습니다.')
    }
  }

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }} align="center">
                구분
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="left">
                회사명
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="left">
                코드명
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="left">
                코드 등록일
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="center">
                코드삭제
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="center">
                회원추가
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="center">
                공고조회
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="center">
                가입고객수
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enterpriseInfoList.map((row) => (
              <TableRow
                hover
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="center">
                  {row.isProgressPayment ? '쑨에서 지급' : '고객사 직접 지급'}
                  {row.fixMatchingFee
                    ? ` (${(row.fixMatchingFee * 100).toFixed(1)}%)`
                    : ''}
                </TableCell>
                <TableCell align="left" component="th" scope="row">
                  {row.enterpriseName}
                </TableCell>
                <TableCell align="left" component="th" scope="row">
                  {row.code}
                </TableCell>
                <TableCell align="left" component="th" scope="row">
                  {row.createdAt &&
                    moment(row.createdAt).format('YYYY-MM-DD')}
                </TableCell>
                <TableCell align="center">
                  {row.isDeleted === true ? (
                    <div>
                      {moment(row.deletedAt).format(
                        'YYYY-MM-DD'
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outlined"
                      color="secondary"
                      style={{ width: 100 }}
                      onClick={() => deleteEnterpriseCode(row.id)}
                    >
                      삭제
                    </Button>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={row.isDeleted === true}
                    style={{ width: 100 }}
                    onClick={() => openUserModel(row)}
                  >
                    추가
                  </Button>
                  <Modal
                    open={openEnterpriseUserModal}
                    onClose={closeUserModel}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box sx={modalStyle}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 'bold',
                          marginBottom: 20,
                        }}
                      >
                        {`${targetName} 회원 추가`}
                      </div>
                      <TextField
                        style={inputStyle}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        id="outlined-basic"
                        label="UID 입력"
                        variant="outlined"
                        value={targetUid}
                        onChange={(e) => setTargetUid(e.target.value)}
                      />

                      <Button
                        color="primary"
                        variant="contained"
                        style={inputStyle}
                        disabled={!targetUid}
                        onClick={onClickupdateUserEnterpriseCode}
                      >
                        추가하기
                      </Button>
                    </Box>
                  </Modal>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={row.isDeleted === true}
                    style={{ width: 100 }}
                    onClick={() => openSearchModel(row)}
                  >
                    조회
                  </Button>
                  <Modal
                    open={openSearchInputModal}
                    onClose={closeSearchModel}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    style={{ overflow: 'visible' }}
                  >
                    <Box sx={searchModalStyle}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 'bold',
                          marginBottom: 20,
                        }}
                      >
                        {`${targetName} 공고 날짜 조회`}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          zIndex: 6000,
                          marginBottom: 20,
                        }}
                      >
                        <DateRangePicker
                          small
                          startDate={createdAtStart} // momentPropTypes.momentObj or null,
                          startDateId="start_date" // PropTypes.string.isRequired,
                          endDate={createdAtEnd} // momentPropTypes.momentObj or null,
                          endDateId="end_date" // PropTypes.string.isRequired,
                          onDatesChange={({ startDate, endDate }) => {
                            setCreatedAtStart(startDate)
                            setCreatedAtEnd(endDate)
                          }}
                          focusedInput={createdAtRangeFocusobj.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                          onFocusChange={(arg) => {
                            if (arg !== createdAtRangeFocusobj.focusedInput) {
                              setTimeout(() => {
                                setCreatedAtRangeFocusobj({
                                  focusedInput: arg,
                                })
                                setCreatedAtRangeFocusInput(arg)
                                setVisible(!visible)
                              }, 300)
                            }
                          }} // PropTypes.func.isRequired,
                          isOutsideRange={() => false}
                          minimumNights={0}
                        />
                      </div>

                      <Button
                        color="primary"
                        variant="contained"
                        style={inputStyle}
                        disabled={!createdAtStart || !createdAtEnd}
                        onClick={handleButtonClick}
                      >
                        조회하기
                      </Button>
                    </Box>
                  </Modal>
                </TableCell>
                <TableCell align="center" component="th" scope="row">
                  <Button
                    disabled={row.isDeleted === true}
                    style={{ color: 'skyblue' }}
                    onClick={() => openEnterpriseUserButton(row)}
                  >
                    {row.isDeleted === true ? '0' : row.count}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
const EnterpriseUserListContainer = ({
  onClickDeleteUserEnterpriseCode,
  enterpriseUserList,
  targetName,
  setCurrentPage,
  currentPage,
  tatalPage,
  searchUidValue,
  setSearchUidValue,
  getEnterpriseUsers,
  targetCode,
}) => {
  const openUserModel = (code) => {
    setOpenEnterpriseUserModal(true)
    setTargetCode(code)
  }

  const activeEnter = (e) => {
    if (e.key === 'Enter') {
      getEnterpriseUsers(targetCode)
    }
  }
  return (
    <>
      <div>
        <div style={{ fontSize: 20, fontWeight: 'bold' }}>{targetName}</div>
      </div>
      <div style={{ height: 20 }}></div>
      <div
        style={{
          width: 330,
          height: '35px',
          flexDirection: 'row',
          position: 'relative',
          border: '1px solid gray',
          borderRadius: '12px',
        }}
      >
        <SearchIcon
          fontSize="small"
          style={{ position: 'absolute', left: 6, top: 4, color: 'gray' }}
        />

        <InputBase
          style={{ width: 310, borderRadius: 12, paddingLeft: 35 }}
          // sx={{ml: 1, flex: 1}}
          placeholder="UID입력 후 엔터를 눌러주세요"
          // variant="outlined"
          inputProps={{ 'aria-label': 'search uid' }}
          onChange={(e) => {
            setSearchUidValue(e.target.value.trim())
          }}
          value={searchUidValue}
          onKeyDown={(e) => activeEnter(e)}
        />

        {/* <Button
          style={{position: 'absolute', right: 0, top: -3}}
          onClick={() => {
            getEnterpriseUsers(targetCode)
          }}
          color="inherit"
        >
          <SearchIcon />
        </Button> */}
      </div>
      <div style={{ height: 20 }}></div>
      <Paper
        sx={{
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  가입일
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  코드등록일
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  UID
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  이름
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  점포명
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  사업자번호
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  예약횟수
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  마지막예약
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  배정알바수
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  예약취소수
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  배정취소수
                </TableCell>

                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  개별 코드 삭제
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enterpriseUserList.map((row, idx) => (
                <TableRow
                  hover
                  key={`enterpriseList-${idx}`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="center">
                    {row.createdAt?._seconds &&
                      moment(row.createdAt).format(
                        'YYYY-MM-DD'
                      )}
                  </TableCell>
                  <TableCell align="center">
                    {row.updatedEnterpriseCodeAt &&
                      moment(
                        row.updatedEnterpriseCodeAt
                      ).format('YYYY-MM-DD')}
                  </TableCell>
                  <TableCell align="center">{row.uid}</TableCell>
                  <TableCell align="left" component="th" scope="row">
                    {row.username}
                  </TableCell>
                  <TableCell align="left" component="th" scope="row">
                    {row?.storeNameList?.map((store, idx) => (
                      <div key={`storename-${idx}`}>{store}</div>
                    ))}
                  </TableCell>
                  <TableCell align="left" component="th" scope="row">
                    {row.bizNumber}
                  </TableCell>
                  <TableCell align="left" component="th" scope="row">
                    {row.reservationCount}
                  </TableCell>
                  <TableCell align="left" component="th" scope="row">
                    {row.lastHiringDate &&
                      moment(row.lastHiringDate).format(
                        'YYYY-MM-DD'
                      )}
                  </TableCell>
                  <TableCell align="left" component="th" scope="row">
                    {row.hiredSeekersCount}
                  </TableCell>
                  <TableCell align="left" component="th" scope="row">
                    {row.hiringCancelCount}
                  </TableCell>
                  <TableCell align="left" component="th" scope="row">
                    {row.hiringCancelCount}
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="secondary"
                      style={{ width: 100 }}
                      onClick={() => onClickDeleteUserEnterpriseCode(row.uid, row.enterpriseCode)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={tatalPage}
          color="primary"
          onChange={(e, page) => setCurrentPage(page)}
          page={currentPage}
          siblingCount={5}
        />
      </Paper>
    </>
  )
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  boxShadow: 24,
  p: 4,
  bgcolor: 'background.paper',

  overflow: 'visible',
}
const searchModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  boxShadow: 24,
  p: 4,
  bgcolor: 'background.paper',

  overflow: 'visible',
}

const inputStyle = {
  width: '100%',
  marginBottom: 20,
}
