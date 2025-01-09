import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    Popover,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField
} from "@material-ui/core";
import moment from "moment";
import { map } from "lodash";
import {
    getEmployerCashTransactionHistory,
    getEmployerLastHiring,
    getReviewRateByEmployer,
    getStoresBo,
    getUserCashBalance,
    getUserTaxInfoBo,
    updateAddCashForEmployer,
    updateEmployerMemo
} from "../../../../api/employers";
import { Store } from "../../../../model/Store";
import { getUserNonMaskingBo } from "../../../../api/appliedSeeker";
import SendToSlackButton from "../../../../Components/SendToSlackButton";
import PenaltyButton from "../../../../Components/penaltyButton";
import AppendPenaltyButton from "../../../../Components/appendPenaltyButton";
import ResetLoginFailedCountButton from "../../../../Components/resetLoginFailedCountButton";
import styles from './index.module.css'
import Modal from '@mui/material/Modal';
import { useHistory } from "react-router-dom";


const TableItem = ({ employer, setChangeStatus, changeStatus }) => {
    const [cashBalance, setCashBalance] = useState(0);
    const [inProcessing, setInProcessing] = useState(false);
    const [memo, setMemo] = useState(employer.adminMemo);
    const [stores, setStores] = useState([]);
    const [reviewRate, setReviewRate] = useState({});
    const [bizNo, setBizNo] = useState('사업자 번호가 등록되지 않은 유저입니다.');
    const [lastHiringDate, setLastHiringDate] = useState();
    const [additionalCashInput, setAdditionalCashInput] = useState();
    const [additionalCashNote, setAdditionalCashNote] = useState("");
    const [cashUsingHistory, setCashUsingHistory] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openCashHistoryDialog, setOpenCashHistoryDialog] = useState(false);
    const [employerName, setEmployerName] = useState("");
    const [employerPhoneNumber, setEmployerPhoneNumber] = useState("");
    const [anchorEl2, setAnchorEl2] = useState(null);
    const [anchorEl3, setAnchorEl3] = useState(null);
    const history = useHistory()


    const [openModal, setOpenModal] = useState(false)

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        maxHeight: 800,
        bgcolor: 'background.paper',
        borderRadius: 10,
        boxShadow: 24,
        p: 3,
        overflowY: 'auto'
    };

    useEffect(() => {
        loadEmployerData();
    }, [employer.id]);

    const loadEmployerData = async () => {
        await Promise.all([
            getCashBalance(employer.id),
            getStores(employer.id),
            handleGetReviewRateByEmployer(employer.id),
            handleGetEmployerLastHiring(employer.id),
        ]);
    };

    const handleGetEmployerLastHiring = async (id) => {
        const result = await getEmployerLastHiring({ employerUid: id });
        if (result.status === "OK") {
            setLastHiringDate(moment(result.data[0]?.createdAt).format("YYYY-M-D"));
        }
    };

    const getCashBalance = async (id) => {
        const result = await getUserCashBalance({ uid: id });
        if (result.status === "OK") {
            setCashBalance(result.data.balance || 0);
        } else {
            console.log("getCashBalance error");
        }
    };

    const getBizNo = async (id) => {
        const result = await getUserTaxInfoBo({ userUid: id });
        if (result?.status === "OK") {
            setBizNo(result?.data?.bizNumber);
        } else {
            setBizNo('사업자 번호가 등록되지 않은 유저입니다.');
        }
    };

    const addCashForEmployer = async () => {
        if (+additionalCashInput <= 0) return;
        setInProcessing(true);

        const result = await updateAddCashForEmployer({
            userUid: employer.id,
            balance: +additionalCashInput,
            detail: additionalCashNote,
        });

        if (result.status === "OK") {
            setInProcessing(false);
            setCashBalance(cashBalance + +additionalCashInput);
            setAnchorEl(false);
            alert("충전 되었습니다.");
        } else {
            setInProcessing(false);
            alert("충전 실패하였습니다.", result.status);
        }
    };

    const saveMemo = async () => {
        const result = await updateEmployerMemo({ uid: employer.id, adminMemo: memo });
        if (result.status === "OK") {
            alert("저장되었습니다.");
        } else {
            alert("다시 시도해주세요");
        }
    };

    const getStores = async (id) => {
        const result = await getStoresBo({ userUid: id });
        if (result.status === "OK") {
            setStores(map(result.data, (store) => new Store(store)));
        }
    };

    const loadCashHistory = async () => {
        setOpenCashHistoryDialog(true);
        const result = await getEmployerCashTransactionHistory({ uid: employer.id });

        if (result.status === "OK") {
            setCashUsingHistory(result.data);
        } else {
            alert("실패", result.status);
        }
    };

    const handleGetReviewRateByEmployer = async (id) => {
        const result = await getReviewRateByEmployer({ employerUid: id });
        if (result.status === "OK") {
            setReviewRate(result.data);
        }
    };

    const handleGetAppliedemployer = async () => {
        const result = await getUserNonMaskingBo({ uid: employer.id });
        if (result.status === "OK") {
            setEmployerName(result.data.username);
            setEmployerPhoneNumber(result.data.phoneNumber);
        }
    };

    const handleClick = (event) => {
        setAnchorEl2(event.currentTarget);
        handleGetAppliedemployer();
    };

    const handleClick3 = (event) => {
        setAnchorEl3(event.currentTarget);
        getBizNo(employer.id);
        handleGetAppliedemployer();
    };

    const handleClose = () => {
        setAnchorEl2(null);
    };

    const open3 = Boolean(anchorEl3);
    const usernamePopId3 = open ? "simple-popover" : undefined;
    const handleClose3 = () => {
        setAnchorEl3(null);
    };

    const renderPopover = (anchorEl, handleClose, content) => (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
            <div className={styles.popoverContent}>
                {content}
            </div>
        </Popover>
    );

    const tableCells = [
        {
            content: (
                <>
                    <div>{employer.id}</div>
                    <SendToSlackButton employerUid={employer?.id} />
                </>
            ),
            align: 'center'
        },
        {
            content: (
                <>
                    <div className={styles.row}>
                        <div className={styles.label} >
                            가입일
                        </div>
                        {
                            employer.registrationDate ?
                                <div className={styles.value}>{employer.registrationDate || "NO DATA"}</div>
                                :
                                <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"NO DATA"}</div>
                        }
                    </div>
                    <div className={styles.row}>

                        <div className={styles.label} >
                            탈퇴일
                        </div>
                        {
                            employer.membershipWithdrawalDate ?
                                <div className={styles.value}>{employer.membershipWithdrawalDate || "NO DATA"}</div>
                                :
                                <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"NO DATA"}</div>
                        }
                    </div>
                    <div className={styles.row}>

                        <div className={styles.label} >
                            패널티
                        </div>
                        {
                            employer?.penalty ?
                                <PenaltyButton setChangeStatus={setChangeStatus} changeStatus={changeStatus} user={employer.employer} />
                                :
                                <AppendPenaltyButton setChangeStatus={setChangeStatus} changeStatus={changeStatus} user={employer.employer} />
                        }
                    </div>
                </>
            ), align: 'center'
        },
        {
            content: (
                <>
                    {!!employer?.leftAt && <div onClick={() => { history.push(`/searchWithdraw?userUid=${employer.id}`) }} style={{ cursor: 'pointer', fontWeight: 'bold', color: 'red' }}>
                        (탈퇴회원) 정보 확인하러가기
                    </div>}
                    <Button aria-describedby="simple-popover" onClick={handleClick} className={styles.button}>
                        {employer.name}
                    </Button>
                    {/* <div>
                        {employer?.phoneNumber}
                    </div> */}
                    {renderPopover(anchorEl2, handleClose, (
                        <>
                            <div className={styles.popoverText}>{employerName}</div>
                            <div className={styles.popoverSpacing}></div>
                            <div className={styles.popoverText}>{employerPhoneNumber}</div>
                        </>
                    ))}
                    <ResetLoginFailedCountButton user={employer.employer} />

                    <div>
                        {employer.enterpriseCode}
                    </div>
                </>
            ),
            align: 'center'
        },
        {
            content: (
                <>
                    <div className={styles.boldText}>{employer.device}</div>
                    <div className={styles.boldText}>{employer.appVersion}</div>
                </>
            ),
            align: 'center',
            style: { padding: '3px' } // style은 객체로 전달되어야 합니다.
        },
        {
            content: (
                <>
                    {stores.map((store, idx) => (
                        <div style={{ textAlign: 'left', borderBottom: '0.2px dashed #959dad' }} key={idx}>
                            <div className={styles.row}>
                                <div className={styles.label} >
                                    이름
                                </div>
                                <div className={styles.value}>{store.name}</div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.label} >
                                    업종
                                </div>
                                <div className={styles.value}>{store.bizKind}</div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.label} >
                                    주소
                                </div>
                                <div className={styles.value}>{store.address}</div>
                            </div>
                        </div>
                    ))}


                </>

            ),
            align: 'center'
        },
        // { content: employer.creditcard, align: 'center' },
        {
            content: (
                <>
                    <Button
                        style={{ borderWidth: 1, borderColor: '#574EDF', color: '#574EDF', width: '100%' }}
                        size="small"
                        className={styles.fullWidthButton}
                        variant="outlined"
                        onClick={handleClick3}>
                        확인
                    </Button>
                    <Popover
                        id={usernamePopId3}
                        open={open3}
                        anchorEl={anchorEl3}
                        onClose={handleClose3}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                        }}
                    >
                        <div style={{ padding: 10 }}>
                            <div style={{ fontSize: 16 }}>{bizNo}</div>
                            <div style={{ height: 10 }}></div>
                        </div>
                    </Popover>
                </>
            ),
            align: 'center'
        },
        {
            content: (
                <>
                    <div className={styles.row}>
                        <div className={styles.label} >
                            예약 횟수
                        </div>
                        {
                            employer.reservationCount ?
                                <div className={styles.value}>{employer.reservationCount || "0건"}</div>
                                :
                                <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"0건"}</div>
                        }
                    </div>
                    <div className={styles.row}>
                        <div className={styles.label} >
                            마지막예약
                        </div>
                        {
                            lastHiringDate ?
                                <div className={styles.value}>{lastHiringDate || "NO DATA"}</div>
                                :
                                <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"NO DATA"}</div>
                        }
                    </div>
                    <div className={styles.row}>
                        <div className={styles.label} >
                            배정알바수
                        </div>
                        {
                            employer.hiredSeekersCount ?
                                <div className={styles.value}>{employer.hiredSeekersCount || "0건"}</div>
                                :
                                <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"0건"}</div>
                        }
                    </div>
                    <div className={styles.row}>
                        <div className={styles.label} >
                            예약취소수
                        </div>
                        {
                            employer.reservationCancelCount ?
                                <div className={styles.value}>{employer.reservationCancelCount || "0건"}</div>
                                :
                                <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"0건"}</div>
                        }
                    </div>
                    <div className={styles.row}>
                        <div className={styles.label} >
                            배정취소수
                        </div>
                        {
                            employer.hiringCancelCount ?
                                <div className={styles.value}>{employer.hiringCancelCount || "0건"}</div>
                                :
                                <div style={{ fontWeight: 'bold', color: '#C4CAD4', fontSize: '14px' }}>{"0건"}</div>
                        }
                    </div>
                </>
            )

        },
        // { content: employer.reportStatus, align: 'center' },
        // { content: reviewRate.att, align: 'center' },
        // { content: reviewRate.prof, align: 'center' },
        {
            content: (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ marginBottom: 10 }}>{cashBalance}</div>
                    <Button
                        style={{ borderWidth: 1, borderColor: '#574EDF', color: '#574EDF', width: '100%' }}
                        size="small"
                        className="add-cash-btn"
                        variant="outlined"
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                        disabled={inProcessing}>
                        충전하기
                    </Button>
                    <Popover
                        open={!!anchorEl}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "center",
                        }}
                    >
                        <div style={{ padding: 24, display: "flex", flexDirection: "column" }}>
                            <div style={{ marginBottom: 8, display: "flex", flexDirection: "row", alignItems: "center" }}>
                                <TextField value={additionalCashInput} onChange={(e) => setAdditionalCashInput(e.target.value)} type="number" />
                                <div>원</div>
                            </div>
                            <div style={{ marginBottom: 8, display: "flex", flexDirection: "row", alignItems: "center" }}>
                                <div>Note</div>
                                <TextField value={additionalCashNote} onChange={(e) => setAdditionalCashNote(e.target.value)} />
                            </div>
                            <Button className="add-cash" variant="outlined" onClick={addCashForEmployer}>
                                {inProcessing ? <CircularProgress size={16} /> : "충전하기"}
                            </Button>
                        </div>
                    </Popover>
                    <div style={{ height: '8px' }} />
                    <Button
                        style={{ borderWidth: 1, borderColor: '#574EDF', color: '#574EDF', width: '100%' }}
                        size="small"
                        className="add-history"
                        variant="outlined"
                        disabled={inProcessing}
                        onClick={loadCashHistory}>
                        충전이력
                    </Button>
                    <Dialog open={openCashHistoryDialog} onClose={() => setOpenCashHistoryDialog(false)}>
                        <DialogContent>
                            <Table>
                                <TableBody>
                                    {cashUsingHistory.length > 0 ? (
                                        map(cashUsingHistory, (history) => (
                                            <TableRow key={history.id}>
                                                <TableCell>{moment(history.time).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm")}</TableCell>
                                                <TableCell>{history.type}</TableCell>
                                                <TableCell style={{ color: history.amount > 0 ? "green" : "red" }}>{history.amount}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <div style={{ padding: 100 }}>충전이력이 존재하지 않습니다.</div>
                                    )}
                                </TableBody>
                            </Table>
                        </DialogContent>
                    </Dialog>
                </div>
            ),
            align: 'center'
        },
        {
            content: (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <TextField variant="outlined" multiline={true} value={memo} onChange={(e) => setMemo(e.target.value)} />
                    <Button className="save-memo" variant="outlined" style={{ marginTop: 5 }} onClick={saveMemo}>
                        저장
                    </Button>
                </div>
            ),
            align: 'center'
        }
    ];

    return (
        <TableRow>
            {tableCells.map((cell, idx) => (
                <TableCell key={idx} align={cell.align} style={cell.style}>
                    {cell.content}
                </TableCell>
            ))}
        </TableRow>
    );

};

export default TableItem;
