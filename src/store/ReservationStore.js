import { observable, action } from "mobx";
import { findIndex, find } from 'lodash';
class ReservationStore {
    @observable selectedJob;
    @observable jobs;

    @action
    setSelectedJob = job => this.selectedJob = job;

    @action setJobs = jobs => this.jobs = jobs;

    @action setJob = job => {
        const foundIndex = findIndex(this.jobs, ['id', job.id]);
        if (foundIndex >= 0) {
            this.jobs[foundIndex] = { ...job };
            this.jobs = [...this.jobs];
        }
    }

    getJob = jobId => {
        return find(this.job, ['id', jobId]);
    }
}

export default new ReservationStore();