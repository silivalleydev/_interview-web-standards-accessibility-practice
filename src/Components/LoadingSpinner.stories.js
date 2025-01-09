import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default {
    title: 'Loading Spinner',
    component: LoadingSpinner
};

const Template = args => (<LoadingSpinner {...args} />)

export const FirstStory = Template.bind();

FirstStory.args = {
    isLoading: true
};