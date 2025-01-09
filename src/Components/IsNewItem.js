import React, { Component } from 'react';
import utils from '../utils/utils';

const IsNewItem = ({ createdAt }) => (
    <span style={{ color: '#ff0000',}}>{utils.getIsToday(createdAt) ? 'NEW' : ''}</span>
);

export default IsNewItem;
    