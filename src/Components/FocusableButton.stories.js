import React from 'react';
import FocusableButton from './FocusableButton';

export default {
    title: 'Focusable Button',
    component: FocusableButton
}

const Template = (args) => (<FocusableButton {...args}>Focusable</FocusableButton>);

export const Primary = Template.bind();