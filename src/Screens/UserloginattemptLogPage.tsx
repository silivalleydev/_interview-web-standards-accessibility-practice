import React, { useEffect, useState } from 'react'

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { InputAdornment, InputLabel, MenuItem, Select, TablePagination, TextField } from '@material-ui/core'
import { downloadLoginattemptLog, getAdminLoginAttemptRange } from '../api/log'
import SearchIcon from '@mui/icons-material/Search';
import { DateRangePicker } from 'react-dates'
import * as XLSX from 'xlsx';
import { Box, Button, FormControl, Grid, LinearProgress, Modal } from '@mui/material'
import { formatDateString } from '../utils/utils'


const UserloginattemptLogPage: React.FC = () => {
  const [rows, setRows] = useState([])
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [inputAdminId, setInputAdminId] = useState('')
  const [inputNote, setInputNote] = useState('')
  const [downloadReason, setDownloadReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
    let fromCreatedAtStr = ''
    let toCreatedAtStr = ''

    if (inputAdminId) {
      adminId = inputAdminId
    }
    if (inputNote) {
      note = inputNote
    }
    if (startDateStart && startDateEnd) {

      fromCreatedAtStr = startDateStart.clone().toISOString()
      toCreatedAtStr = startDateEnd.clone().toISOString()
    }
    const result = await downloadLoginattemptLog({
      adminId,
      note,
      fromCreatedAtStr,
      toCreatedAtStr,
      page: targetPage,
      pageSize: rowsPerPage,
      password: inputPassword,
      downloadReason
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
    setIsLoading(true)

    let targetPage = newPage || page
    let adminId = ''
    let note = ''
    let fromCreatedAtStr = ''
    let toCreatedAtStr = ''

    if (inputAdminId) {
      adminId = inputAdminId
    }
    if (inputNote) {
      note = inputNote
    }
    if (startDateStart && startDateEnd) {

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
      setTotalPageCount(result.dataList.totalPageCount * result.dataList.pageSize)
      setIsLoading(false)

    } else if (result.status === 'BAD_REQUEST') {
      if (result.apiError.message) {
        alert(result.apiError.message)
        setIsLoading(false)

      }
    }
    setIsLoading(false)

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

  return (
    <>
      <div style={{ height: '21px' }} />
      <div style={{ padding: '10px', fontSize: '20px', fontWeight: '700' }}>검색조건</div>
      <div style={{ padding: 10, margin: 10, background: '#ffffff', borderRadius: 10, minWidth: '1200px' }}>
        <Grid container rowSpacing={3} columnSpacing={10} padding={5} >
          <Grid item xs={12} md={6} sm={6} display='flex' flexDirection='row' justifyContent='center' alignItems='center'  >
            <Grid item sm={2}>
              <div >수행자</div>
            </Grid>
            <Grid item sm={10}>

              <TextField
                fullWidth
                size="small"
                value={inputAdminId}
                onChange={(e) => setInputAdminId(e.target.value)}
                variant='outlined'
              />
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} sm={6} display='flex' flexDirection='row' justifyContent='center' alignItems='center' >

            <Grid item sm={2}>
              <div >비고</div>
            </Grid>
            <Grid item sm={10}>
              <TextField
                fullWidth
                size="small"
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                variant='outlined'
              />
            </Grid>


          </Grid>
          <Grid item sm={6} display='flex' flexDirection='row' justifyContent='center' alignItems='center' >
            <Grid item xs={12} sm={2}>
              <div >기간</div>
            </Grid>
            <Grid item sm={10}>
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
            </Grid>
          </Grid>
        </Grid>
      </div>


      <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: '10px 0' }}>

        <Button
          variant='contained'
          color='primary'
          style={{ marginRight: '4px', width: '65px', height: '36px', background: '#574EDF', color: 'White', fontSize: '16px', fontWeight: '500px', borderRadius: '6px' }}
          onClick={() => {
            setPage(0)
            setTimeout(() => {
              handleGetActivityUser(0)
            }, 300)
          }}>검색</Button>

        <Button style={{ marginRight: '4px', width: '65px', height: '36px', background: '#046E39', color: 'White', fontSize: '16px', fontWeight: '500px' }} onClick={handleOpen}>
          엑셀
        </Button>
        <ExcelModal
          open={open}
          handleClose={handleClose}
          inputPassword={inputPassword}
          setInputPassword={setInputPassword}
          handleDownloadExcel={handleDownloadExcel}
          downloadReason={downloadReason}
          setDownloadReason={setDownloadReason}
        />
        <Button
          variant='contained'
          color='primary'
          style={{ marginRight: '4px', height: '36px', background: '#516069', color: 'White', fontSize: '16px', fontWeight: '500px', borderRadius: '6px' }}
          onClick={() => {
            setInputNote('')
            setInputAdminId('')
          }}>검색 초기화</Button>
      </div>

      <div style={{ height: 20 }} />
      <div style={{ height: 20 }} />
      <Paper
        sx={{
          width: '100%',
          overflow: 'hidden',
        }}
        style={{ backgroundColor: '#F7F8FA' }}
      >
        <TableContainer style={{ minWidth: '1200px' }}>
          {
            isLoading
              ?
              <div style={{ width: '100%', textAlign: 'center' }}>

                <LinearProgress />
              </div>

              : undefined
          }
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
          rowsPerPageOptions={[15, 30, 50]}
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
  setDownloadReason,
  downloadReason,
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
              value={downloadReason}
              variant='outlined'
              onChange={(e) => setDownloadReason(e.target.value)}
            >
              <MenuItem value={'거래내역 검수'}>거래내역 검수</MenuItem>
              <MenuItem value={'사업자 회원 검'}>사업자 회원 검수</MenuItem>
              <MenuItem value={'세금계산서 발행'}>세금계산서 발행</MenuItem>
              <MenuItem value={'급여이체'}>급여이체</MenuItem>
              <MenuItem value={'기타'}>기타</MenuItem>
            </Select>
          </FormControl>

          <div style={{ marginBottom: '10px' }} />

          <Button disabled={!inputPassword || !downloadReason} style={{ height: '36px', background: (!inputPassword || !downloadReason) ? '#d9d9d9' : '#574EDF', color: 'White', fontSize: '16px', fontWeight: '500px' }} onClick={() => handleDownloadExcel()}>
            엑셀 다운로드
          </Button>
        </div>
      </Box>
    </Modal >

  )
}

export default UserloginattemptLogPage










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


