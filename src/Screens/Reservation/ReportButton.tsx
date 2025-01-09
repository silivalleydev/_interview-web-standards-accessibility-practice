import React from 'react'
import { Button, Menu, MenuItem } from '@material-ui/core'
import firebase from 'firebase'
import { reportForJob } from '../../api/jobs'

export default function ReportButton({ job, reloadJobInfo }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleClickReport = async (type) => {

    const hiredSeekers = job.hiredSeekers || job.hiredSeeker

    const result = await reportForJob({
      fromType: 'reportThisSeeker',
      seekerUid: Object.keys(hiredSeekers).find(
        (uid) => hiredSeekers[uid] === 'HIRED'
      ),
      employerUid: job.employerUid || job.employerId,
      jobId: job.id,
      reportType: type,
    })

    if (result?.status === 'OK') {
      handleClose()
      await reloadJobInfo()
      alert('신고되었습니다.')
    } else {
      alert('실패')
    }

  }

  return (
    <div>
      <Button
        id="report-button"
        variant="contained"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size='small'
        color='secondary'
      >
        신고
      </Button>
      <Menu
        id="report-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'report-button',
        }}
      >
        <MenuItem onClick={() => handleClickReport('didntCome')}>결근</MenuItem>
        <MenuItem onClick={() => handleClickReport('etc')}>기타</MenuItem>
      </Menu>
    </div>
  )
}
