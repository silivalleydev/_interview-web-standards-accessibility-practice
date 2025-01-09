import React, { useEffect, useState } from 'react'
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import { TableHead, TableRow, TableCell } from '@mui/material';
import styles from './index.module.css'
import TextField from '@mui/material/TextField';
import { getWithdrawUser } from '../../api/users';
import LoadingSpinner from '../../Components/LoadingSpinner';


const SearchWithdraw: React.FC = ({ }) => {
  const [userUid, setUserUid] = useState('');
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const searchWithdrawUser = async (searchUid = '') => {
    if (!userUid?.trim() && !searchUid) {
      alert('userUid를 입력해주세요.');
      setUserUid('');
      setUser({});
      return;
    }
    setLoading(true);
    const res = await getWithdrawUser({ userUid: searchUid || userUid })
    setLoading(false);
    if (res?.status === 'OK') {
      const data = res?.data || {}

      if (!data.userUid) {
        alert('조회된 데이터가 없습니다.')
        setUser({});
      } else {
        setUser(data);
      }
    } else {
      alert(res?.apiError?.detail | res?.apiError?.message || res?.message || 'API 에러')
      setUser({});
    }

  }
  const searchingBoxKeyEventHandle = async (e) => {
    if (e.key === "Enter") {
      await searchWithdrawUser()
    }
  }
  const searchParams = new URLSearchParams(location.search)
  const searchUserUid = searchParams.get('userUid')
  useEffect(() => {
    if (searchUserUid) {
      setLoading(true);
      setTimeout(async () => {
        await searchWithdrawUser(searchUserUid)
      }, 1000)
    }

  }, [searchUserUid])


  return (
    <>
      <TextField
        size="small"
        style={{ flex: 1, width: '450px' }}
        onChange={(e) => setUserUid(e.target.value)}
        placeholder='탈퇴회원 userUid 입력 후 엔터를 입력해주세요'
        value={userUid}
        onKeyPress={searchingBoxKeyEventHandle}
      />
      <div style={{ height: 20 }}></div>
      <LoadingSpinner isLoading={loading} />
      <TableContainer component={Paper}>
        <Table style={{ minWidth: 1800 }} aria-label="simple table">
          <TableHeader />
          <TableBody>
            {(user?.userUid ? [user] : []).map((row, idx) => (
              <TableItem
                key={`employer-${idx}`}
                employer={row}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

const columns = [
  { align: 'center', width: 80, label: 'uid' },
  { align: 'center', width: 100, label: '탈퇴일' },
  { align: 'center', width: 80, label: '이름/휴대폰번호/CI' },
  { align: 'center', width: 200, label: '점포정보' },
  { align: 'center', width: 500, label: '' },
];

const TableHeader: React.FC = () => {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column, index) => (
          <TableCell
            key={index}
            align={column.align}
            style={{
              width: column.width,
              minWidth: column.minWidth,
            }}
          >
            <div>{column.label}</div>
            {column.subLabel && <div>{column.subLabel}</div>}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const TableItem = ({ employer = {} }) => {

  const tableCells = [
    {
      content: (
        <>
          <div>{employer?.userUid || ''}</div>
        </>
      ),
      align: 'center'
    },
    {
      content: (
        <>
          <div className={styles.row}>
            <div className={styles.label} >
              탈퇴일
            </div>
            {employer?.leftAt || ''}
          </div>
        </>
      ), align: 'center'
    },
    {
      content: (
        <>
          <div className={styles.row}>
            <div className={styles.label} >
              이름
            </div>
            {employer?.username || ''}
          </div>
          <div className={styles.row}>
            <div className={styles.label} >
              휴대폰번호
            </div>
            {employer?.phoneNumber || ''}
          </div>
          <div className={styles.row}>
            <div className={styles.label} >
              CI
            </div>
            {employer?.ci || ''}
          </div>
        </>
      ),
      align: 'center'
    },
    {
      content: (
        <>
          {(employer?.storeList || []).map((store, idx) => (
            <div style={{ textAlign: 'left', borderBottom: '0.2px dashed #959dad' }} key={idx}>
              <div className={styles.row}>
                <div className={styles.label} >
                  이름
                </div>
                <div className={styles.value}>{store.storeName}</div>
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


export default SearchWithdraw;