import React, { Component } from 'react';
import moment from 'moment';

const LoadMoreBtn = ({ loadMore, type, btnTxt, isDisabled, wrapperStyles, buttonStyles }) => {
    return (
        <div
            style={wrapperStyles}
        >
            <button
                disabled={isDisabled}
                type="button"
                className="btn btn-default"
                onClick={loadMore.bind(null, type)}
                style={{
                    backgroundColor: isDisabled ? '#999' : '#574EE0',
                    textAlign: 'center',
                    fontSize: 18,
                    fontWeight: 'bold',
                    padding: 18,
                    color: '#fff',
                    flex: 1,
                }}
            >
                {btnTxt}
            </button>
        </div>
    )
};

LoadMoreBtn.defaultProps = {
    btnTxt: '더 보기',
    wrapperStyles: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    isDisabled: false,
    type: '',
    buttonStyles: {}
};

export default LoadMoreBtn