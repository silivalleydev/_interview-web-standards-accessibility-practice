import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { transferUser } from '../api/users';
import TextField from '@mui/material/TextField';


interface TransferUserProps {
  to: 'user' | 'store';
}

const TransferUserType: React.FC<TransferUserProps> = ({ to }) => {
  console.log('TransferUser')
  const [value, setValue] = useState<string>('');

  const handleClick = async () => {
    const userType = to === 'user' ? 'user' : 'store';
    const toType = to === 'user' ? '알바님' : '사장님';

    const payload = { uid: value, type: userType };

    try {
      const result = await transferUser(payload);

      if (result.status === 'OK') {
        alert(`${toType}으로 변경되었습니다.`);
      } else {
        alert('정보를 다시 확인해주세요.');
      }
    } catch (error) {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <TextField
        placeholder={'uid를 입력해주세요'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        id="outlined-basic"
        size='small'
        style={{ marginRight: '3px', width: '300px' }}
      />
      <Button
        style={{ backgroundColor: '#574EDF', borderRadius: '4px', fontSize: '16px', fontWeight: 500, color: 'white' }}
        size='small'
        onClick={handleClick}
        variant="contained"
      >
        {`${to === 'user' ? '알바로 전환' : '사장으로 전환'}`}
      </Button>
    </div>
  );
};

export default TransferUserType;
