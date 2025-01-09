import React, { ReactElement, ReactNode, useState } from 'react'
import { shareToSlack } from '../api/slack'

import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import SendIcon from '@mui/icons-material/Send';

import { Checkbox } from '@mui/material';
type SLACK_CHANNEL_CODE = 'SOON-ERROR' | 'SOON-WORKSPACE' | 'SOON-DEV-TEST';

type TARGET_CODE = 'ALL' | "SMG" | 'DEV';

type Props = {
    slackChannelCode?: SLACK_CHANNEL_CODE;
    targetCode?: TARGET_CODE;
    seekerUid?: string;
    tossOid?: string;
    tossTid?: string;
    jobId?: string;
    contractId?: string;
    employerUid?: string;
    successTootipText?: string;
    children?: ReactElement | ReactNode;
}

const SendToSlackButton = ({
    // slackChannelCode = 'SOON-DEV-TEST',
    // targetCode = 'ALL',
    seekerUid,
    tossOid,
    tossTid,
    jobId,
    employerUid,
    successTootipText = '발송 완료',
    children = '발송',
    contractId,
}: Props) => {
    const [shareSuccess, setShareSuccess] = useState(false)
    const [slackChannelCode, setslackChannelCode] = useState('SOON-WORKSPACE')
    const [targetCode, settargetCode] = useState([])
    const handleShareToSlack = async () => {
        if (!slackChannelCode) {

            return;
        }

        const result = await shareToSlack(
            {
                slackChannelCode,
                targetCode: targetCode.length === 0 ? 'NONE' : targetCode.length === 2 ? 'ALL' : targetCode[0],
                seekerUid,
                tossOid,
                tossTid,
                jobId,
                employerUid,
                contractId
            }
        )

        if (result.status === 'OK') {
            setShareSuccess(true);
            setTimeout(() => {
                setShareSuccess(false);
            }, 2000);
            handleClose()
        } else {
            alert(result.status)
        }
    }

    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    return (
        <>
            <div style={{ position: 'relative' }}>
                {shareSuccess &&
                    <div style={{ position: 'absolute', zIndex: 100 }}>
                        <Alert style={{ padding: '5px' }} icon={<CheckIcon fontSize="inherit" />} severity="success">
                            {successTootipText}
                        </Alert>
                    </div>
                }
                <div>
                    <div>
                        <Button aria-describedby={id}
                            size='small'
                            style={{ borderColor: '#D8DCE5', borderWidth: 1, color: '#171A1F', width: '100%' }}

                            variant='outlined' onClick={handleClick}>
                            슬랙으로 공유
                        </Button>
                        <Popover
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            sx={{
                                '& .MuiPaper-root': {
                                    borderRadius: '12px',  // border radius 설정
                                    padding: '10px',       // 패딩 설정 (예시)
                                },
                            }}

                        >
                            <div  >
                                <FormControl>
                                    <div style={{ fontSize: 14, fontWeight: 'bold', color: 'GrayText' }}>채널</div>
                                    <RadioGroup
                                        aria-labelledby="demo-radio-buttons-group-label"
                                        defaultValue="female"
                                        name="radio-buttons-group"
                                        row
                                        value={slackChannelCode}
                                        onChange={(event) => setslackChannelCode(event.target.value)}
                                    >
                                        {/* <FormControlLabel value="SOON-DEV-TEST" control={<Radio checked={slackChannelCode === 'SOON-DEV-TEST'} color='warning' />} label="테스트" /> */}
                                        <FormControlLabel value="SOON-WORKSPACE" control={<Radio checked={slackChannelCode === 'SOON-WORKSPACE'} color='warning' />} label="어드민정보복사" />
                                        <FormControlLabel value="SOON-ERROR" control={<Radio checked={slackChannelCode === 'SOON-ERROR'} color='warning' />} label="오류보고" />
                                    </RadioGroup>
                                </FormControl>
                                <div style={{ height: '0px' }} />
                                <FormControl>
                                    <div style={{ fontSize: 14, fontWeight: 'bold', color: 'GrayText' }}>수신자</div>
                                    <RadioGroup
                                        aria-labelledby="demo-radio-buttons-group-label"
                                        defaultValue="female"
                                        name="radio-buttons-group"
                                        row
                                    >
                                        <FormControlLabel onChange={(event) => {
                                            const value = event.target.value;
                                            if (targetCode.includes(value)) {
                                                settargetCode(targetCode.filter(item => item !== value));
                                            } else {
                                                settargetCode([...targetCode, value]);
                                            }
                                        }} value="SMG" control={<Checkbox checked={targetCode.includes('SMG')} color='warning' />} label="@smg" />
                                        <FormControlLabel onChange={(event) => {
                                            const value = event.target.value;
                                            if (targetCode.includes(value)) {
                                                settargetCode(targetCode.filter(item => item !== value));
                                            } else {
                                                settargetCode([...targetCode, value]);
                                            }
                                        }} value="DEV" checked={targetCode.includes('DEV')} control={<Checkbox color='warning' />} label="@soondev" />
                                    </RadioGroup>
                                </FormControl>
                                <div style={{ height: '7px' }} />
                                <FormControl fullWidth>

                                    <Button onClick={() => {
                                        handleShareToSlack()
                                    }} variant='outlined'
                                        color='inherit'
                                        size='small'
                                        fullWidth
                                        style={{ borderColor: '#D8DCE5', borderWidth: 1, color: '#171A1F' }}
                                    >
                                        {children}
                                    </Button>
                                </FormControl>
                            </div>


                        </Popover>
                    </div>


                </div >
            </div >
        </>
    )
}

export default SendToSlackButton;
