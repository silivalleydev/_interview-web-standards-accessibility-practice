import React from 'react';
import { Button } from '@material-ui/core';

const UploadButton = ({onTextReturn}) => {

    const onFileChangeHandle = e => {
        const file = e.target.files[0];

        const fileReader = new FileReader();

        fileReader.onload = () => {
            onTextReturn(fileReader.result);
        };

        fileReader.readAsText(file);
    };

    const resetFileInput = e => e.target.value = '';

    return(
        <div style={{margin: 8}}>
            <input 
                accept='.csv'
                multiple
                type='file'
                id='contained-button-file'
                onChange={onFileChangeHandle}
                onClick={resetFileInput}
                style={{display: 'none'}}
            />
            <label htmlFor='contained-button-file' style={{margin: 0}}>
                <Button variant='outlined' color='primary' component='span'>
                    Upload employer uids
                </Button>
            </label>
        </div>
    )
}

export default UploadButton;