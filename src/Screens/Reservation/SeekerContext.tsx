import React from 'react';

const SeekerContext = React.createContext({
    selectedReviews: null,
    setSelectedReviews: () => {}
})

export default SeekerContext;