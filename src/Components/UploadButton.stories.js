import React from 'react';

import UploadButton from './UploadButton';

export default {
    title: 'Upload Button',
    component: UploadButton
};

const Template = args => <UploadButton {...args} />

export const FirstStory = Template.bind();

FirstStory.args = {
    onTextReturn: console.log
};