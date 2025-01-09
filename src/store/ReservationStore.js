import { observable, action } from "mobx";
class ReservationStore {
    @observable selectedJob;
    @observable jobs;

    @action
    setSelectedJob = job => this.selectedJob = job;

    @action setJobs = jobs => this.jobs = jobs;

    @action setJob = job => {

    }

    getJob = jobId => {
    }
}

export default new ReservationStore();