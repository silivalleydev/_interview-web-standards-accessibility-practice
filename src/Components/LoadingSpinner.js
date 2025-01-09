import React from 'react';

const LoadingSpinner = ({ isLoading }) => (
    <div
        id="loading-spinner"
        style={{
            display: isLoading ? '' : 'none',
            backgroundColor: isLoading ? 'rgba(0, 0, 0, 0.2)' : '#fff',
            position: 'absolute',
            top: 0, bottom: 0,
            left: 0, right: 0,
            zIndex: 9999
        }}
    >
        <div
            className="spinner-wrapper"
            style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
            }}
        >
        </div>
    </div>
);

export default LoadingSpinner;