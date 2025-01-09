import React, { useEffect } from 'react';
import { MenuItem, CircularProgress, Button, InputAdornment } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';
import styles from './index.module.css';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

interface SearchingBoxProps {
    searchingForUser: () => void;
    isLoading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    searchingValue: string;
    setSearchingValue: React.Dispatch<React.SetStateAction<string>>;
    searchingTerm: string;
    setSearchingTerm: React.Dispatch<React.SetStateAction<string>>;
    setData: (data: any) => void;
    loadingPage: boolean;
    resetData: () => void;
    currentPage?: number;
}

const SearchingBox: React.FC<SearchingBoxProps> = ({
    searchingForUser, searchingValue, setSearchingValue, searchingTerm, setSearchingTerm, setData, loadingPage, resetData, setLoadingPage
}) => {

    useEffect(() => {
        setLoadingPage(loadingPage);
    }, [loadingPage, setLoadingPage]);
    const searchingBoxKeyEventHandle = async (e) => {
        if (e.key === "Enter") {
            searchingForUser()
        }
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Select
                size='small'
                style={{ marginRight: 4, minWidth: 100 }}
                value={searchingTerm}
                onChange={(e) => {
                    setSearchingTerm(e.target.value);
                    setSearchingValue("");
                }}

            >
                <MenuItem value="id">UID</MenuItem>
                <MenuItem value="name">이름</MenuItem>
                <MenuItem value="phone">전화번호</MenuItem>
            </Select>
            <TextField
                size='small'
                style={{ width: '400px' }}
                className={styles.inputBase}
                onChange={(e) => setSearchingValue(e.target.value)}
                value={searchingValue}
                onKeyDown={searchingBoxKeyEventHandle}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="start">
                            {
                                loadingPage ?
                                    <CircularProgress size='small' />
                                    :
                                    <div style={{ cursor: 'pointer' }} onClick={searchingForUser}>
                                        <SearchIcon />
                                    </div>
                            }
                        </InputAdornment>
                    ),
                }}
            >
            </TextField>
            {/* <IconButton
                onClick={() => {
                    setSearchingValue("");
                    resetData();
                }}
                disabled={isLoading}
            >
                <Refresh />
            </IconButton> */}
        </div >
    );
};

export default SearchingBox;





