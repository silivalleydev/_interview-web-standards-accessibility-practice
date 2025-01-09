import React, { useEffect, useState } from 'react'

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { map } from 'lodash'
import logo from "../image/ic_soon_main_logo.png";

import {
  deleteAdmin,
  getAdminUsers,
  updateAdmin,
} from '../api/userAccessControl'
import { Card, CardContent, CardHeader } from '@material-ui/core'
import CreateUser from './createUser'
import { initPassword } from '../api/users'
import LoadingSpinner from '../Components/LoadingSpinner'

const UserAccessControlPage: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const [clickedButton, setClickedButton] = useState('')
  const [clickedLabel, setClickedLabel] = useState('')
  const [clickedUserUid, setClickedUserUid] = useState('')
  const [clickedAdminId, setClickedAdminId] = useState('')
  const [rows, setRows] = useState([])
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  function createData(
    name: string,
    group: string,
    changeGroupBtn: Element,
    createTempPasswprdBtn: Element,
    deleteAccountBtn: Element
  ) {
    return { name, group, changeGroupBtn, createTempPasswprdBtn, deleteAccountBtn }
  }

  const group = {
    'admin': '관리자',
    'infosec manager': '정보보안 담당자',
    'operator': '운영매니저',
    'financial manager': '재무담당자',
    'normal user': '일반사용자',
  }

  const handleGetAdminUser = async () => {
    setLoading(true)
    const result = await getAdminUsers()
    setLoading(false)
    if (result.status === 'OK') {
      const list = result.data
        .filter((data) => !data.isDeleted)
        .map((data) =>
          createData(
            data.adminId,
            group[data.permissionName] || data.permissionName,
            <Button
              variant="outlined"
              onClick={() => {
                setClickedUserUid(data.uid)
                setClickedAdminId(data.adminId)
                setOpen(true)
              }}
            >
              변경
            </Button>,
            <Button
              variant="outlined"
              color='secondary'
              onClick={() => {
                setClickedUserUid(data.uid)
                setClickedAdminId(data.adminId)
                onClickCreeateAccountButton(data.adminId)
              }}
            >
              발급
            </Button>,
            <Button
              variant="outlined"
              color="error"
              onClick={() => onClickDeleteAccountButton(data.uid)}
            >
              삭제
            </Button>

          )
        )

      setRows(list)
    }

  }

  useEffect(() => {
    handleGetAdminUser()
    if (open == false) {
      setClickedButton('')
      setClickedLabel('')
      setClickedUserUid('')
      setClickedAdminId('')
    }
  }, [open])

  const onClickDeleteAccountButton = async (userUid) => {
    if (confirm('계정을 삭제하시겠습니까?')) {
      const result = await deleteAdmin({
        uid: userUid,
      })

      if (result.status === 'OK') {
        alert('삭제 완')
        handleGetAdminUser()
      } else {
        alert('실패')
      }
    } else {
    }
  }
  const onClickCreeateAccountButton = async (adminId) => {
    const message = `계정 비밀번호 초기화가 성공적으로 완료되었습니다. 
해당 사용자가 로그인 시 임시 비밀번호를 재설정해야 합니다.`;


    const result = await initPassword({ adminId: adminId })


    if (result.status === 'OK') {
      alert(message)

    } else if (result?.apiError?.detail?.includes('The password that will be changed cannot be the same as the previous password.')) {
      alert('이미 임시 비밀번호 발급이 완료되었습니다.')

    } else {
      alert('다시 시도해주세요')
    }

  }

  // const handleChangeRowsPerPage = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   function createData(
  //     name: string,
  //     group: string,
  //     changeGroupBtn: Element,
  //     deleteAccountBtn: Element,
  //     createTempPasswprdBtn: Element
  //   ) {
  //     return { name, group, changeGroupBtn, createTempPasswprdBtn, deleteAccountBtn }
  //   }
  // }
  return (
    <>
      <LoadingSpinner isLoading={loading} />
      <div>
        <div style={{ fontSize: 30, fontWeight: 'bold' }}>사용자 권한 관리</div>
        <div style={{ fontSize: 17, fontWeight: 500, color: '#5B616C' }}>
          사용자 계정별 어드민 페이지에 대한 권한 부여 및 삭제
        </div>
      </div>
      <div style={{ height: 20 }}></div>

      <Button style={{ width: '150px' }} variant='contained' color='primary' onClick={() => { setOpenCreateModal(true) }}>
        계정 생성
      </Button>
      <Modal
        open={openCreateModal}
        onClose={() => { setOpenCreateModal(false) }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          {/* <Card variant="outlined" > */}
          <CardHeader
            subheader={
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'black', fontWeight: 'bold' }}>계정생성</div>
                <img src={logo} style={{ height: 15 }} />
              </div>
            }
          />
          <CardContent>
            <CreateUser setOpenCreateModal={setOpenCreateModal} handleGetAdminUser={handleGetAdminUser} />
          </CardContent>
          {/* </Card> */}
        </Box>

      </Modal >
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
                <TableCell style={{ fontWeight: 'bold' }} align="left">
                  사용자
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  그룹
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  그룹 변경
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  임시비밀번호 발급
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }} align="center">
                  계정 삭제
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  hover
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="left" component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="center">{row.group}</TableCell>
                  <TableCell align="center">{row.changeGroupBtn}</TableCell>
                  <TableCell align="center">{row.createTempPasswprdBtn}</TableCell>
                  <TableCell align="center">{row.deleteAccountBtn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <BasicModal
        open={open}
        setOpen={setOpen}
        clickedButton={clickedButton}
        setClickedButton={setClickedButton}
        clickedLabel={clickedLabel}
        setClickedLabel={setClickedLabel}
        clickedUserUid={clickedUserUid}
        clickedAdminId={clickedAdminId}
      ></BasicModal>
    </>
  )
}

export default UserAccessControlPage

export const BasicModal = ({
  open,
  setOpen,
  clickedButton,
  setClickedButton,
  clickedLabel,
  setClickedLabel,
  clickedUserUid,
  clickedAdminId,
}) => {
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const groupItem = [
    { id: 'admin', label: '관리자' },
    // { id: 'infosec manager', label: '정보보안 담당자' },
    { id: 'operator', label: '운영매니저' },
    { id: 'financial manager', label: '재무담당자' },
    // { id: 'normal user', label: '일반사용자' },
  ]

  const onClickChangeGroupButton = async () => {
    const result = await updateAdmin({
      uid: clickedUserUid,
      permissionName: clickedButton,
      adminId: clickedAdminId,
    })

    if (result.status === 'OK') {
      alert(` ${clickedLabel} 그룹으로 변경되었습니다.`)
      setClickedButton('')
      setClickedLabel('')
      handleClose()
    } else {
      alert('다시 시도해주세요')
    }
  }

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            align="center"
            width={'100%'}
          >
            그룹 변경
          </Typography>
          <div style={{ height: 10 }}></div>

          <div>
            {map(groupItem, (item, idx) => (
              <>
                <Button
                  style={{
                    width: '100%',
                    fontWeight: clickedButton === item.id ? 'bold' : 'normal',
                    color: clickedButton === item.id ? '#574EDF' : '#1A1E27',
                    borderColor:
                      clickedButton === item.id ? '#574EDF' : '#C4CAD4',
                    borderWidth: clickedButton === item.id ? 2 : 1,
                  }}
                  variant={'outlined'}
                  onClick={() => {
                    if (clickedButton === item.id) {
                      setClickedButton('')
                      setClickedLabel('')
                    } else {
                      setClickedButton(item.id)
                      setClickedLabel(item.label)
                    }
                  }}
                >
                  {item.label}
                </Button>
                <div style={{ height: 10 }}></div>
              </>
            ))}
            <Button
              style={{
                width: '100%',
                backgroundColor: clickedButton ? '#574EDF' : '#C4CAD4',
              }}
              variant="contained"
              disabled={!clickedButton}
              onClick={onClickChangeGroupButton}
            >
              변경하기
            </Button>
            <div style={{ height: 5 }}></div>
          </div>
        </Box>
      </Modal>
      <div style={{ height: 50 }}></div>
    </div>
  )
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}



