import React, { useEffect, useState } from 'react'

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { map } from 'lodash'
import { InputAdornment, InputLabel, MenuItem, Select, TablePagination, TextField } from '@material-ui/core'
import { downloadLoginattemptLog, getAdminLoginAttemptRange } from '../api/log'
import SearchIcon from '@mui/icons-material/Search';
import { DateRangePicker } from 'react-dates'
import * as XLSX from 'xlsx';
import { Box, Button, FormControl, Modal } from '@mui/material'
import { formatDateString } from '../utils/utils'


const UserloginattemptAppLogPage: React.FC = () => {
  const [rows, setRows] = useState([])
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchType, setSearchType] = useState('date')
  const [searchInputValue, setSearchInputValue] = useState('')

  const [startDateStart, setStartDateStart] = useState();
  const [startDateEnd, setStartDateEnd] = useState();
  const [startDateRangeFocusInput, setStartDateRangeFocusInput] = useState();
  const [open, setOpen] = React.useState(false);
  const [inputPassword, setInputPassword] = useState('')
  const [totalPageCount, setTotalPageCount] = useState(10000)
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false)
    setInputPassword('')
  }


  const handleDownloadExcel = async (newPage) => {

    let targetPage = newPage || page

    let adminId = ''
    let note = ''
    let fromCreatedAt = ''
    let toCreatedAt = ''

    if (searchType === 'adminId') {
      adminId = searchInputValue
    }
    if (searchType === 'note') {
      note = searchInputValue
    }
    if (searchType === 'date' && startDateStart && startDateEnd) {

      fromCreatedAt = startDateStart.clone().subtract(3, 'hour').toISOString()
      toCreatedAt = startDateEnd.clone().add(21, 'hour').toISOString()
    }
    const result = await downloadLoginattemptLog({
      adminId,
      note,
      fromCreatedAt,
      toCreatedAt,
      page: targetPage,
      pageSize: rowsPerPage
    })


    const href = URL.createObjectURL(result);

    // create "a" HTML element with href to file & click
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', 'download.xlsx'); //or any other extension
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);



  };





  const handleGetActivityUser = async (newPage) => {

    let targetPage = newPage || page
    let adminId = ''
    let note = ''
    let fromCreatedAtStr = ''
    let toCreatedAtStr = ''

    if (searchType === 'adminId') {
      adminId = searchInputValue
    }
    if (searchType === 'note') {
      note = searchInputValue
    }
    if (searchType === 'date' && startDateStart && startDateEnd) {
      fromCreatedAtStr = startDateStart.clone().toISOString()
      toCreatedAtStr = startDateEnd.clone().toISOString()
    }

    const result = await getAdminLoginAttemptRange({
      adminId,
      note,
      fromCreatedAtStr,
      toCreatedAtStr,
      page: targetPage,
      pageSize: rowsPerPage
    })

    if (result.status === 'OK') {
      const list = result.dataList.data
      setRows(list)
      setTotalPageCount(result.dataList.data.totalPageCount)
    }
  }

  useEffect(() => {
    handleGetActivityUser()

  }, [rowsPerPage])







  const handleChangePage = (event, newPage) => {

    handleGetActivityUser(newPage)
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {

    setRowsPerPage(+event.target.value);

    setPage(0);


  };

  const handleChangeSearchType = (event) => {
    setSearchType(event)

  }
  return (
    <>
      <div style={{ height: '21px' }} />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>


          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            style={{
              width: '130px',
              maxHeight: '36px',
              minHeight: '36px',
              height: '36px',
              marginRight: '4px'
            }}
            value={searchType}
            label="검색유형"
            variant='outlined'
            onChange={(e) => handleChangeSearchType(e.target.value)}
          >
            <MenuItem value={'date'}>날짜</MenuItem>
            <MenuItem value={'adminId'}>수행자</MenuItem>
            <MenuItem value={'note'}>비고</MenuItem>
          </Select>
          {
            searchType === 'date' ?
              <div >
                <DateRangePicker
                  small
                  startDate={startDateStart}
                  startDateId="start_date"
                  endDate={startDateEnd}
                  endDateId="end_date"
                  onDatesChange={({ startDate, endDate }) => {

                    setStartDateStart(startDate);
                    setStartDateEnd(endDate);
                  }}
                  focusedInput={startDateRangeFocusInput}
                  onFocusChange={setStartDateRangeFocusInput}
                  isOutsideRange={() => false}
                  minimumNights={0}
                />
                <Button
                  variant='contained'
                  color='primary'
                  style={{ marginLeft: '4px', width: '65px', height: '36px', background: '#574EDF', color: 'White', fontSize: '16px', fontWeight: '500px', borderRadius: '6px' }}
                  onClick={() => {
                    setPage(0)
                    setTimeout(() => {
                      handleGetActivityUser(0)
                    }, 300)
                  }}>검색</Button>
              </div>

              :
              <TextField
                style={{ width: '230px', maxHeight: '36px' }}
                size="small"
                placeholder=''
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                id="filled-start-adornment"
                variant='outlined'
                InputProps={{
                  endAdornment: <InputAdornment style={{ cursor: 'pointer' }} position="end">
                    <div onClick={() => {
                      setPage(0)
                      setTimeout(() => {
                        handleGetActivityUser(0)
                      }, 300)
                    }}>
                      <SearchIcon />
                    </div>
                  </InputAdornment>,
                }}
              />

          }
        </div>
        <div>

          <Button style={{ width: '85px', height: '36px', background: '#574EDF', color: 'White', fontSize: '16px', fontWeight: '500px' }} onClick={handleOpen}>
            EXCEL
          </Button>
          <ExcelModal
            open={open}
            handleClose={handleClose}
            inputPassword={inputPassword}
            setInputPassword={setInputPassword}
            searchType={searchType}
            handleChangeSearchType={handleChangeSearchType}
            handleDownloadExcel={handleDownloadExcel}
          />
        </div>


      </div >
      <div style={{ height: 20 }} />
      <Paper
        sx={{
          width: '100%',
          overflow: 'hidden',
        }}
        style={{ backgroundColor: '#F7F8FA' }}
      >
        <TableContainer style={{ minWidth: '1200px' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  No
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  사용자
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  로그인 성공여부(실패횟수)
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  접속IP
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  접속일시
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  비고
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow
                  hover
                  key={`activity-log-${idx}`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="center">{idx + 1}</TableCell>
                  <TableCell align="center">{row.adminId}</TableCell>
                  <TableCell align="center">{row.failureCount}</TableCell>
                  <TableCell align="center">{row.ipAddr}</TableCell>
                  <TableCell align="center">{formatDateString(row.createdAt)}</TableCell>

                  <TableCell align="center">{row.note}</TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={totalPageCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  )
}


const ExcelModal = ({
  open,
  handleClose,
  inputPassword,
  setInputPassword,
  searchType,
  handleChangeSearchType,
  handleDownloadExcel
}) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={mdoalStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>


          <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>비밀번호 확인</div>
          <div style={{ marginBottom: '20px' }}>개인정보가 담긴 파일을 다운로드하려면 비밀번호와 사유 확인이 필요합니다.</div>
          <div style={{ marginBottom: '20px' }}>업무 목적 종료시 다운로드 받은 문서는 지체없이 삭제하시기 바라며 업무상 필요에 의해 문서를 기기에 저장할 때는 반드시 암호를 다시 걸어 주시기 바랍니다.</div>


          <TextField
            style={{ maxHeight: '36px' }}
            size="small"
            required
            type="password"
            label="비밀번호"
            InputLabelProps={{
              shrink: true,
            }}
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            id="filled-start-adornment"
            variant='outlined'
            fullWidth
          />
          <div style={{ marginBottom: '10px' }} />
          <FormControl sx={{ m: 1, minWidth: 80 }} size='small' fullWidth>
            <InputLabel id="demo-simple-select-autowidth-label">사유</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-select-small"
              label="사유"
              required
              fullWidth
              style={{
                // width: '130px',
                maxHeight: '36px',
                minHeight: '36px',
                height: '36px',
                marginRight: '4px'
              }}
              value={searchType}
              variant='outlined'
              onChange={(e) => handleChangeSearchType(e.target.value)}
            >
              <MenuItem value={'date'}>거래내역 검수</MenuItem>
              <MenuItem value={'adminId'}>사업자 회원 검수</MenuItem>
              <MenuItem value={'content'}>세금계산서 발행</MenuItem>
              <MenuItem value={'content'}>급여이체</MenuItem>
              <MenuItem value={'content'}>기타</MenuItem>
            </Select>
          </FormControl>

          <div style={{ marginBottom: '10px' }} />

          <Button style={{ height: '36px', background: '#574EDF', color: 'White', fontSize: '16px', fontWeight: '500px' }} onClick={() => handleDownloadExcel()}>
            엑셀 다운로드
          </Button>
        </div>
      </Box>
    </Modal>

  )
}

export default UserloginattemptAppLogPage










const mdoalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};


