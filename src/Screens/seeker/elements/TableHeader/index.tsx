import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';

const columns = [
    { label: 'UID', width: 200 },
    { label: '계정상태', width: 160 },
    { label: '이름', width: 150 },
    { label: '전화번호/CI', width: 80 },
    { label: '디바이스 / 앱 버전', width: 100, isMultiLine: true },
    { label: '스킬/경력', width: 110 },
    { label: '리뷰', width: 110 },
    { label: '주소', width: 100 },
    // { label: '한줄소개', width: 100 },
    // { label: '배정수', width: 100 },
    // { label: '성실성 평점', width: 100 },
    // { label: '서빙 전문성 평점', width: 100 },
    // { label: '주방 전문성 평점', width: 100 },
    // { label: '누적입금액', width: 100 },
    { label: '메모', width: 300 },
];

const TableHeader: React.FC = () => {
    return (
        <TableHead style={{ textAlign: 'center' }}>
            <TableRow>
                {columns.map((column, idx) => (
                    <TableCell key={idx} align='center' style={{ width: column.width }}>
                        {column.isMultiLine ? (
                            column.label.split(' / ').map((line, lineIdx) => (
                                <div key={lineIdx}>{line}</div>
                            ))
                        ) : (
                            column.label
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};

export default TableHeader;