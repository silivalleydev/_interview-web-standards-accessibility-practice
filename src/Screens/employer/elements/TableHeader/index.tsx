import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';

const columns = [
    { align: 'center', width: 300, label: 'uid' },
    { align: 'center', width: 180, label: '계정상태' },
    { align: 'center', width: 150, label: '이름(코드)' },
    { align: 'center', width: 100, label: '디바이스', subLabel: '앱 버전' },
    { align: 'center', width: 350, label: '점포정보' },
    // { align: 'center', label: '결제카드' },
    { align: 'center', label: '사업자등록번호' },
    { align: 'center', minWidth: 100, label: '예약내역' },
    // { align: 'center', minWidth: 150, label: '신고' },
    // { align: 'center', label: '성실성 평점' },
    // { align: 'center', label: '전문성 평점' },
    { align: 'center', label: '할인캐시' },
    { align: 'center', label: '메모' },
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

export default TableHeader;
