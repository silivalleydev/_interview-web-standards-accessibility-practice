import React, { useState } from 'react';

import { map, isEmpty, range, throttle } from 'lodash';
import {
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    IconButton,
    DialogContentText,
    FormControl,
    InputLabel
} from '@material-ui/core';

import Add from '@material-ui/icons/Add';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const BonusSoonDialog = ({open, onClose, onSubmit}) => {

    const [ bonus, setBonus ] = useState();
    const [ bonusReason, setBonusReason ] = useState('');

    const [ noOfIds, setNoOfIds ] = useState(1);
    const [ ids, setIDs ] = useState([]);

    const submit = () => {
        onSubmit(+bonus, bonusReason, ids)
        onClose()
    }

    return(
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>뽀너~쑨</DialogTitle>
            <DialogContent>
                <DialogContentText style={{marginBottom: 0}}>급여</DialogContentText>
                <TextField
                    placeholder='10000'
                    fullWidth
                    onChange={e => setBonus(e.target.value)}
                    value={bonus}
                    type='number'
                />
                <FormControl style={{width: '100%', marginTop: 16}}>
                    <InputLabel id='bonus_soon_reason_label'>사유 선택</InputLabel>
                    <Select
                        labelId='bonus_soon_reason_label'
                        value={bonusReason}
                        onChange={e => setBonusReason(e.target.value)}
                    >
                        <MenuItem value='지원자X'>지원자X</MenuItem>
                        <MenuItem value='대체근무자'>대체근무자</MenuItem>
                    </Select>
                </FormControl>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16}}>
                    <DialogContentText style={{margin: 0}}>제외</DialogContentText>
                    <IconButton size='small' onClick={() => setNoOfIds(noOfIds + 1)}>
                        <Add />
                    </IconButton>
                </div>
                {
                    map(range(noOfIds), index => (
                        <TextField
                            key={index}
                            placeholder='UID'
                            fullWidth
                            onChange={e => ids[index] = e.target.value}
                            value={ids[index]}
                            style={{marginBottom: 8}}
                        />
                    ))
                }
            </DialogContent>
            <DialogActions>
                <Button
                    variant='outlined'
                    color='primary'
                    disabled={+bonus <= 0 || isEmpty(bonusReason)}
                    onClick={throttle(submit, 10000, {trailing: false})}
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default BonusSoonDialog;