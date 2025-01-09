import React, { useState, useEffect } from 'react';
import {
    TableRow,
    Popover,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    ButtonGroup,
} from '@material-ui/core';
import Alert from '@mui/material/Alert';
import Pagination from "@material-ui/lab/Pagination";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";


import CheckIcon from '@material-ui/icons/Check';
import { map, slice, size, join } from 'lodash';
import {
    loadTotalPaymentForSeeker,
    newReviewList,
    syncReview,
    updateSeekerMemo,
} from "../../../../api/seeker";

import SendToSlackButton from '../../../../Components/SendToSlackButton';
import PenaltyButton from '../../../../Components/penaltyButton';
import AppendPenaltyButton from '../../../../Components/appendPenaltyButton';
import SeekerReviewTableRow from '../../../../Components/SeekerReviewTableRow';
import SeekerResumeTableRow from '../../../../Components/SeekerResumeTableRow';
import Button2 from '@mui/material/Button';
import ResetLoginFailedCountButton from '../../../../Components/resetLoginFailedCountButton';
import styles from './index.module.css';
import { getUserReviewNResumes } from '../../../../api/reviews';
import { useHistory } from 'react-router-dom';


interface SeekerItemProps {
    seeker: any;
    onClickSuggestionBtn?: (seeker: any) => void;
    changeStatus: boolean;
    setChangeStatus: (status: boolean) => void;
}

const TableItem: React.FC<SeekerItemProps> = ({ seeker, onClickSuggestionBtn, changeStatus, setChangeStatus }) => {
    const [cashBalance, setCashBalance] = useState(0);
    const [hiredCount, setHiredCount] = useState(0);
    const [memo, setMemo] = useState(seeker.adminMemo);
    const [totalPayment, setTotalPayment] = useState(0);
    const [reviewRate, setReviewRate] = useState<any>({});
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogNew, setOpenDialogNew] = useState(false);
    const [reviewDialogData, setReviewDialogData] = useState<any[]>([]);
    const [resumeDialogData, setResumeDialogData] = useState<any[]>([]);
    const [newReviewDialogData, setNewReviewDialogData] = useState<any[]>([]);
    const [showSkills, setShowSkills] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [tableData, setTableData] = useState<any[]>([]);
    const [isVisibleDelete, setIsVisibleDelete] = useState(false);
    const [seekerName, setSeekerName] = useState('');
    const [seekerPhoneNumber, setSeekerPhoneNumber] = useState('');
    const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);

    const handleClose = () => {
        setAnchorEl(null);
        setShowSkills(false);
    };

    const handleGetUserReviewNResumes = async (type: string) => {
        const result = await getUserReviewNResumes(seeker.id);
        if (result.status === 'OK') {
            if (type === 'resume') {
                setResumeDialogData(result.data.resumes);
            } else if (type === 'review') {
                setReviewDialogData(result.data.reviews);
            }
        }
    };

    useEffect(() => {
        if (seeker.id) {
            handleGetNewReview();
        }
    }, [seeker.id]);

    const handleGetNewReview = async () => {
        const result = await newReviewList(seeker.id);
        if (result.status === 'OK') {
            setNewReviewDialogData(result?.dataList?.data);
            setTableData(slice(result?.dataList?.data, (currentPage - 1) * 10, currentPage * 10));
        }
    };

    useEffect(() => {
        if (reviewDialogData) {
            setTableData(slice(reviewDialogData, (currentPage - 1) * 10, currentPage * 10));
            return;
        }

        if (resumeDialogData) {
            setTableData(slice(resumeDialogData, (currentPage - 1) * 10, currentPage * 10));
            return;
        }
        if (newReviewDialogData) {
            setTableData(slice(newReviewDialogData, (currentPage - 1) * 10, currentPage * 10));
            return;
        }
    }, [currentPage, reviewDialogData, resumeDialogData]);

    // 입금액 일단 주석
    // useEffect(() => {
    //     loadPaymentHistory(seeker.id);
    // }, []);

    const saveMemo = async () => {
        const result = await updateSeekerMemo({ uid: seeker.id, adminMemo: memo });
        if (result.status === 'OK') {
            alert('저장되었습니다.');
        } else {
            alert('error');
        }
    };

    const loadPaymentHistory = async (seekerUid: string) => {
        const result = await loadTotalPaymentForSeeker({ seekerUid: seekerUid });
        if (result.status === 'OK') {
            setTotalPayment(result.data);
        }
    };

    const handleGetAppliedSeeker = async () => {
        const result = await getUserNonMaskingBo({ uid: seeker.id });
        if (result.status === 'OK') {
            setSeekerName(result.data.username);
            setSeekerPhoneNumber(result.data.phoneNumber);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl2(event.currentTarget);
        handleGetAppliedSeeker();
    };

    const handleClosePopover = () => {
        setAnchorEl2(null);
    };

    const handleCopyClick = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => {
                setCopySuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleShareToSlack = async () => {
        const result = await shareToSlack();
        if (result.status === 'OK') {
            setShareSuccess(true);
            setTimeout(() => {
                setShareSuccess(false);
            }, 2000);
        }
    };
    const history = useHistory()
    const open = Boolean(anchorEl2);
    const usernamePopId = open ? 'simple-popover' : undefined;

    return (
        <TableRow>
            <TableCell align='center' style={{ padding: '3px' }}>
                <div>{seeker.id}</div>
                <div style={{ position: 'relative' }}>
                    {shareSuccess && (
                        <div style={{ position: 'absolute', zIndex: 100 }}>
                            <Alert style={{ padding: '5px' }} icon={<CheckIcon fontSize="inherit" />} severity="success">
                                복사 완료
                            </Alert>
                        </div>
                    )}
                    <div>
                        <SendToSlackButton seekerUid={seeker.id} />
                    </div>
                </div>
            </TableCell>

            <TableCell>
                <>
                    <div className={styles.row}>
                        <div className={styles.label} >
                            가입일
                        </div>
                        {
                            seeker.registrationDate ?
                                <div className={styles.value}>{seeker.registrationDate || "NO DATA"}</div>
                                :
                                <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"NO DATA"}</div>
                        }
                    </div>
                    <div className={styles.row}>

                        <div className={styles.label} >
                            탈퇴일
                        </div>
                        {
                            seeker.membershipWithdrawalDate ?
                                <div className={styles.value}>{seeker.membershipWithdrawalDate || "NO DATA"}</div>
                                :
                                <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"NO DATA"}</div>
                        }
                    </div>
                    <div className={styles.row}>

                        <div className={styles.label} >
                            패널티
                        </div>
                        {
                            seeker?.penalty ?
                                <PenaltyButton setChangeStatus={setChangeStatus} changeStatus={changeStatus} user={seeker.seeker} />
                                :
                                <AppendPenaltyButton setChangeStatus={setChangeStatus} changeStatus={changeStatus} user={seeker.seeker} />
                        }
                    </div>
                </>
            </TableCell>
            <TableCell align='center' style={{ padding: '3px' }}>
                <div>
                    {!!seeker?.leftAt && <div onClick={() => { history.push(`/searchWithdraw?userUid=${seeker.id}`) }} style={{ cursor: 'pointer', fontWeight: 'bold', color: 'red' }}>
                        (탈퇴회원) 정보 확인하러가기
                    </div>}
                    {seeker.name === 'false' ? (
                        <div style={{ color: 'green', fontSize: '13px', fontWeight: 'bold' }}>본인인증 필요</div>
                    ) : (
                        <div
                            style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', right: 10, marginBottom: 2 }}
                            aria-describedby={usernamePopId}
                            onClick={handleClick}
                        >
                            {seeker.name}
                        </div>
                    )}
                    {(seeker.gender || seeker.age) && (
                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                            {seeker.gender}-({seeker.age}세)
                        </div>
                    )}
                    <Popover
                        id={usernamePopId}
                        open={open}
                        anchorEl={anchorEl2}
                        onClose={handleClosePopover}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                        <div style={{ padding: 10 }}>
                            <div style={{ fontSize: 16 }}>{seekerName}</div>
                            <div style={{ height: 10 }}></div>
                            <div style={{ fontSize: 16 }}>{seekerPhoneNumber}</div>
                        </div>
                    </Popover>
                </div>
                <div style={{ height: '10px' }} />
                <ResetLoginFailedCountButton user={seeker.seeker} />
            </TableCell>
            <TableCell align='center' style={{ padding: '3px' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{seeker.phoneNumber}</div>
                    <div style={{ height: '10px' }}></div>
                    {seeker.ci && (
                        <div>
                            <div style={{ height: '2px' }}></div>
                            <div style={{ position: 'relative' }}>
                                {copySuccess && (
                                    <div style={{ position: 'absolute', zIndex: 100 }}>
                                        <Alert style={{ padding: '5px' }} icon={<CheckIcon fontSize="inherit" />} severity="success">
                                            복사 완료
                                        </Alert>
                                    </div>
                                )}
                                <Tooltip title={`${seeker.ci}`}>
                                    <Button
                                        onClick={() => handleCopyClick(seeker.ci)}
                                        style={{ borderRadius: 25, textTransform: 'none' }}
                                        variant='outlined'
                                        color='primary'
                                        size='small'
                                    >
                                        {seeker.ci.slice(0, 11)}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell align='center' style={{ padding: '3px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>{seeker.device}</div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{seeker.appVersion}</div>
            </TableCell>
            <TableCell align='center'>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ marginRight: 4, fontWeight: 500 }}>
                        스킬
                    </div>
                    <Button
                        variant="outlined"
                        size='small'
                        onClick={(event) => {
                            setShowSkills(!showSkills);
                            setAnchorEl(event.currentTarget);
                        }}
                        disabled={seeker.skillCount === 0}
                    >
                        {seeker.skillCount}
                    </Button>
                    <Popover
                        id={seeker.id}
                        open={showSkills}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <div style={{ maxWidth: 300, padding: 12 }}>{join(seeker.skills, ", ")}</div>
                    </Popover>

                </div>
                <div style={{ height: 4 }}>

                </div>

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ marginRight: 4, fontWeight: 500 }}>
                        경력
                    </div>
                    <div>
                        <Button
                            size='small'
                            variant="outlined"
                            onClick={() => {
                                setReviewDialogData(null);
                                setResumeDialogData(null);
                                handleGetUserReviewNResumes('resume');
                                setOpenDialog(true);
                            }}
                        >
                            {seeker.resumeCount}
                        </Button>

                    </div>
                </div>



            </TableCell>
            <TableCell align="center">
                <div>
                    <div style={{ position: 'relative', marginBottom: '5px' }}>
                        <Button2
                            onClick={async () => {
                                const result = await syncReview(seeker.id);
                                if (result.status === 'OK') {
                                    setSyncSuccess(true);
                                    setTimeout(() => {
                                        setSyncSuccess(false);
                                    }, 2000);
                                }
                            }}
                            color='success'
                            variant='contained'
                            size='small'
                        >
                            리뷰 동기화
                        </Button2>
                        {syncSuccess && (
                            <div style={{ position: 'absolute', right: '10px', zIndex: 110 }}>
                                <Alert style={{ padding: '7px' }} icon={<CheckIcon fontSize="inherit" />} severity="success">
                                    동기화 완료
                                </Alert>
                            </div>
                        )}
                    </div>
                    <ButtonGroup disableElevation aria-label="Disabled button group">
                        <Button2
                            variant="outlined"
                            color='success'
                            onClick={() => {
                                setReviewDialogData(null);
                                setResumeDialogData(null);
                                handleGetUserReviewNResumes('review');
                                setOpenDialog(true);
                                setIsVisibleDelete(false);
                            }}
                        >
                            {`${seeker.reviewCount}건`}
                        </Button2>
                        <div style={{ position: 'relative' }}>
                            <div style={{ zIndex: 100, borderRadius: 2, backgroundColor: 'rgb(237, 247, 237)', padding: '2px', position: 'absolute', right: '-4px', top: '-7px', color: 'green', fontWeight: 'bold', fontSize: '10px' }}>
                                NEW
                            </div>
                            <Button2
                                variant="outlined"
                                color='success'
                                onClick={() => {
                                    setReviewDialogData(null);
                                    setResumeDialogData(null);
                                    handleGetNewReview('review');
                                    setOpenDialogNew(true);
                                    setIsVisibleDelete(true);
                                }}
                            >
                                {`${newReviewDialogData.length}건`}
                            </Button2>
                        </div>
                    </ButtonGroup>
                </div>
            </TableCell>
            <TableCell align='center' style={{ padding: '3px' }}>
                {map(seeker.address, (item) => (
                    <React.Fragment key={item}>
                        <span>{item}</span>
                        <br />
                    </React.Fragment>
                ))}
            </TableCell>
            {/* <TableCell style={{ padding: '3px' }}>{seeker.selfIntro}</TableCell>
            <TableCell>{hiredCount}</TableCell>
            <TableCell>{seeker.reviewRate.att}</TableCell>
            <TableCell>{seeker.reviewRate.serving}</TableCell>
            <TableCell>{seeker.reviewRate.kitchen}</TableCell>
            <TableCell>{totalPayment}</TableCell> */}
            <TableCell>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <TextField variant="outlined" multiline={true} value={memo} onChange={(e) => setMemo(e.target.value)} />
                    <Button variant="outlined" style={{ marginTop: 5 }} onClick={saveMemo}>
                        저장
                    </Button>
                </div>
            </TableCell>
            <Dialog onClose={() => setOpenDialog(false)} open={openDialog} maxWidth={false}>
                <DialogTitle onClose={() => setOpenDialog(false)}>
                    {reviewDialogData && (
                        <div>
                            주방리뷰 {seeker.reviewCountByJobKind("주방")}회 / 서빙리뷰 {seeker.reviewCountByJobKind("서빙")}회
                        </div>
                    )}
                    {resumeDialogData && (
                        <div>
                            주방경력 {seeker.kitchenResumeCount}회 / 서빙경력 {seeker.servingResumeCount}회
                        </div>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Table>
                        <TableBody>
                            {reviewDialogData && map(tableData, (row) => <SeekerReviewTableRow item={row} />)}
                            {resumeDialogData && map(tableData, (row) => <SeekerResumeTableRow item={row} />)}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Pagination
                        count={Math.ceil((size(reviewDialogData) || size(resumeDialogData)) / 10)}
                        onChange={(event, page) => setCurrentPage(page)}
                        page={currentPage}
                    />
                </DialogActions>
            </Dialog>
            <Dialog onClose={() => setOpenDialogNew(false)} open={openDialogNew} maxWidth={false}>
                <DialogTitle onClose={() => setOpenDialogNew(false)}>
                    {newReviewDialogData && (
                        <div>
                            주방리뷰 {newReviewDialogData.filter(review => review.jobKind === '주방').length}회 / 서빙리뷰 {newReviewDialogData.filter(review => review.jobKind === '서빙').length}회
                        </div>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Table>
                        <TableBody>
                            {newReviewDialogData && map(tableData, (row) => (
                                <SeekerReviewTableRow
                                    key={row.id}
                                    handleGetNewReview={handleGetNewReview}
                                    isVisibleDelete={isVisibleDelete}
                                    item={row}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Pagination
                        count={Math.ceil((size(newReviewDialogData)) / 10)}
                        onChange={(event, page) => setCurrentPage(page)}
                        page={currentPage}
                    />
                </DialogActions>
            </Dialog>
        </TableRow>
    );
};

export default TableItem;
