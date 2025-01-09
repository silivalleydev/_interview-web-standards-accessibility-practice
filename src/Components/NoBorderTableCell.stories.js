import React from 'react';
import NoBorderTableCell from './NoBorderTableCell';

export default {
    title: 'NoBorderTableCell',
    component: NoBorderTableCell
};

const Template = (args) => (<NoBorderTableCell {...args}>cell content</NoBorderTableCell>);

export const Primary = Template.bind();