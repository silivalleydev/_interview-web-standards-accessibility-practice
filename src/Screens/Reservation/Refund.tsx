import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { isEmpty, throttle } from 'lodash';

import {
    Button,
    TextField,
    CircularProgress,
    FormControl,
    InputLabel
} from '@material-ui/core';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import { PaymentDetail } from '/imports/model/Types';
import { processPaymentRefund } from '../../api/jobs';

enum RefundReason {
    PARTIAL_REFUND = '부분취소',
    MATCHING_CANCEL = '배정취소',
    ABSENT_REFUND = '무단결근'
}

type Props = {
    jobId: string;
    paymentDetail: PaymentDetail;
}

const Refund: React.FC<Props> = ({ jobId, paymentDetail, reloadJobInfo }) => {
    const [manualRefundAnchorEl, setManualRefundAnchorEl] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [refundReason, setRefundReason] = useState();
    const [refundAmount, setRefundAmount] = useState();

    const { salary, usedCash, amountToPay } = paymentDetail;

    useEffect(() => {
        if (refundReason !== undefined) {
            switch (refundReason) {
                case RefundReason.PARTIAL_REFUND:
                    setRefundAmount(0);
                    break;

                case RefundReason.MATCHING_CANCEL:
                    setRefundAmount(amountToPay);
                    break;

                case RefundReason.ABSENT_REFUND:
                    setRefundAmount(amountToPay);
                    break;
            }
        }
    }, [refundReason]);

    const refund = async () => {
        setProcessing(true);

        const refundPercentage = refundReason === RefundReason.PARTIAL_REFUND ? +refundAmount / salary : 1;

        const cashRefund = (usedCash * refundPercentage) | 0;

        const ret = confirm(`refund amount: ${refundAmount}, cash refund: ${cashRefund}`);
        if (ret) {
            const ret = await processPaymentRefund({ jobId, refundAmount, cashRefund, refundReason });
            await reloadJobInfo()
            alert(ret?.status === 'OK' ? 'refund succesfully' : 'refund error, ask roger for more detail')

        }

        setProcessing(false);
    }

    return (
        <div >
            <Button
                variant='outlined'
                size='small'
                style={{ borderColor: '#574EDF', color: '#574EDF', marginBottom: 3, width: '100%' }}
                onClick={e => setManualRefundAnchorEl(e.currentTarget)}
            >
                환불선택
            </Button>
            <Popover
                open={Boolean(manualRefundAnchorEl)}
                onClose={() => setManualRefundAnchorEl(null)}
                anchorEl={manualRefundAnchorEl}
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
                    <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column' }}>
                        <FormControl>
                            <InputLabel>환불선택</InputLabel>
                            <Select onChange={e => setRefundReason(e.target.value)}>
                                <MenuItem value={RefundReason.MATCHING_CANCEL}>{RefundReason.MATCHING_CANCEL}</MenuItem>
                                <MenuItem value={RefundReason.ABSENT_REFUND}>{RefundReason.ABSENT_REFUND}</MenuItem>
                                <MenuItem value={RefundReason.PARTIAL_REFUND}>{RefundReason.PARTIAL_REFUND}</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            style={{ marginTop: 8 }}
                            placeholder='금액'
                            value={refundAmount}
                            onChange={e => setRefundAmount(e.target.value)}
                        />
                    </div>

                    <Button
                        variant='outlined'
                        onClick={throttle(refund, 2000, { trailing: false })}
                        disabled={processing || !refundAmount || isEmpty(refundReason)}
                    >
                        {
                            processing ?
                                <CircularProgress size={16} />
                                :
                                '환불'
                        }
                    </Button>

                </div>
            </Popover>
        </div>
    )
}

export default Refund;