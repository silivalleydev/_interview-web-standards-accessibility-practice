import React, { useState, useContext, useEffect } from 'react';
import {
    Button,
    Box, Dialog,
    DialogActions,
    DialogContent,
    CircularProgress
} from '@material-ui/core';

import { size, filter, isNumber, map, find, forEach, remove, isEmpty, indexOf, findIndex, range, keys, values, findLastIndex, includes, isArray, split, throttle, toInteger, get } from 'lodash';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SwipeableViews from 'react-swipeable-views';
import Typography from '@material-ui/core/Typography';

import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';

import SeekerContext from './SeekerContext';
import SeekerReviewTableRow from '../../Components/SeekerReviewTableRow';
import SeekerResumeTableRow from '../../Components/SeekerResumeTableRow';
import { updateJobApply } from '../../api/jobs';
import { getUserReviewNResumes } from '../../api/reviews';
import { newReviewList } from '../../api/seeker';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            <Box p={2}>
                <Typography>{children}</Typography>
            </Box>
        </div>
    );
}

const SeekerDialog = inject('ReservationStore')(observer(({ jobId, seeker, open, close }) => {

    const [value, setValue] = React.useState(0);
    const [loading, setLoading] = useState(false);
    const [reviewList, setReviewList] = useState([]);
    const [resumeList, setResumeList] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    const { selectedReviews, setSelectedReviews } = useContext(SeekerContext);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const onSelectedReview = review => {
        selectedReviews.push(review);
        setSelectedReviews(selectedReviews);
    }



    const onUnSelectedReview = (jobId: string) => {
        remove(selectedReviews, review => review.jobId === jobId);
        setSelectedReviews(selectedReviews);
    }

    const pickSeekerProfile = async () => {
        setLoading(true);

        const result = await updateJobApply({
            jobId,
            seekerId: seeker.id,
            reviews: selectedReviews
        })


        setLoading(false);


        if (result.status === "OK") {
            alert('리뷰가 저장되었습니다. ')
            close()

        } else {
            setLoading(false);

        }


    }
    const handleGetUserReviewNResumes = async () => {
        setTableLoading(true)
        const result = await getUserReviewNResumes(seeker.id)
        if (result.status === 'OK') {
            // setReviewList(result.data.reviews)
            setResumeList(result.data.resumes)
            setTableLoading(false)
        }
        const resultNew = await newReviewList(seeker.id)
        if (resultNew.status === 'OK') {
            setReviewList(resultNew?.dataList?.data)
        }
        setTableLoading(false)
    }

    useEffect(() => {
        handleGetUserReviewNResumes()
    }, [])


    return (
        <Dialog onClose={close} open={open} maxWidth={false}>

            <DialogContent style={{ maxHeight: 600 }}>
                <AppBar position="static" color="default">
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                    >
                        <Tab label="REVIEWS" />
                        <Tab label="RESUMES" />
                    </Tabs>
                </AppBar>
                {
                    !!tableLoading === true ? <div style={{ width: '100%', textAlign: 'center', marginTop: 40 }}>
                        <CircularProgress size={30} />
                    </div> : undefined
                }

                <SwipeableViews
                    index={value}
                    onChangeIndex={handleChangeIndex}
                >

                    <TabPanel value={value} index={0} >
                        <Table>
                            <TableBody>
                                {
                                    map(reviewList, review => (
                                        <SeekerReviewTableRow
                                            key={review.jobId}
                                            item={review}
                                            onSelectedReview={onSelectedReview}
                                            onUnSelectedReview={onUnSelectedReview}
                                            selected={findIndex(selectedReviews, ['jobId', review.jobId]) >= 0}
                                            handleGetNewReview={handleGetUserReviewNResumes}
                                            isVisibleDelete={true}
                                        />
                                    )
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TabPanel>
                    <TabPanel value={value} index={1} >
                        <Table>
                            <TableBody>
                                {
                                    map(resumeList, resume => (
                                        <SeekerResumeTableRow
                                            key={resume.resumeId}
                                            item={resume}
                                        />
                                    )
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TabPanel>
                </SwipeableViews>
            </DialogContent>
            {
                value === 0 &&
                <DialogActions>
                    <Button
                        disabled={loading}
                        variant='outlined'
                        color='default'
                        onClick={pickSeekerProfile}
                    >
                        {
                            loading ?
                                <CircularProgress size={16} />
                                :
                                '저장'
                        }
                    </Button>
                </DialogActions>
            }
        </Dialog>
    )
}))

export default SeekerDialog;