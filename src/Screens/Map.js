import React, { useState, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import supercluster from "points-cluster";
import { map, countBy, isEmpty, reduce } from "lodash";
import moment from "moment";
import { Button } from "@material-ui/core";
import { inject } from "mobx-react";
import { observer } from "mobx-react-lite";
import { KeyboardDatePicker } from "@material-ui/pickers";

import LoadingSpinner from "../Components/LoadingSpinner";
import { getActiveJob, getApplyListBo, getRegisteredJobToday, getRegistereJobsdAtDate } from "../api/map";

const Marker = ({ hover, ...data }) => {
  const [employerSteps, setEmployerSteps] = useState({});
  const jobData = data.points[0];
  const [text, setText] = useState();

  const getWorkPeriod = (period) => {
    switch (period) {
      case 0:
        return "하루";
      case 50:
        return "1주일 이하";
      case 100:
        return "1개월 이하";
      case 150:
        return "1개월 이상";
      case 200:
        return "2개월 이상";
      case 250:
        return "3개월 이상";
    }
  };

  const handleGetJobAppliedSeekers = async () => {
    const result = await getApplyListBo({ jobId: jobData.id });
    if (result.status === "OK") {
      setEmployerSteps(countBy(map(result, (seeker) => seeker.employerSteps)));
    }
  };

  useEffect(() => {
    if (data.points.length === 1) {
      handleGetJobAppliedSeekers();
    }
    setText(data.points.length);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#5e4004",
        width: "30px",
        height: "30px",
        borderRadius: "30px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {data.points.length === 1 && !isEmpty(employerSteps) && (
        <div
          style={{
            position: "absolute",
            top: "-30px",
            backgroundColor: "white",
            zIndex: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 10,
            borderRadius: 10,
          }}
        >
          <p style={{ color: "black", fontWeight: "bold", margin: "auto" }}>{JSON.stringify(employerSteps)}</p>
        </div>
      )}
      {hover && jobData.name && (
        <div
          style={{
            position: "absolute",
            top: "35px",
            width: "200px",
            height: "200px",
            backgroundColor: "white",
            padding: "10px",
            zIndex: 1,
          }}
        >
          <p style={{ fontWeight: "bold" }}>{jobData.name}</p>
          <p>{jobData.jobKind}</p>
          <p>{jobData.address}</p>
          <p>
            {jobData.salaryType} : {jobData.salary}
          </p>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {jobData.workPeriod === 0 && (
              <p style={{ marginRight: "10px" }}>{moment(jobData.startDate).format("MM.DD")}</p>
            )}

            {(jobData.workPeriod === undefined || (jobData.workPeriod > 0 && jobData.workPeriod < 150)) && (
              <p style={{ marginRight: "10px" }}>
                {moment(jobData.startDate).format("MM.DD")}~{moment(jobData.endDate).format("MM.DD")}
              </p>
            )}
            {jobData.workPeriod > 150 && (
              <p style={{ marginRight: "10px" }}>
                {moment(jobData.startDate).format("MM.DD")}~{getWorkPeriod(jobData.workPeriod)}
              </p>
            )}

            <p>
              {moment(jobData.startDate).format("HH:mm")}~{moment(jobData.endDate).format("HH:mm")}
            </p>
          </div>
        </div>
      )}
      <p
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: 16,
          margin: "auto",
        }}
      >
        {text}
      </p>
    </div>
  );
};

const defaultProps = {
  center: {
    lat: 36,
    lng: 128,
  },
  zoom: 7,
};

const SoonMonsterMaps = ({ MonsterMainStore }) => {
  const [mapOptions, setMapOptions] = useState({});
  const [clusters, setClusters] = useState([]);
  const [currentKey, setCurrentKey] = useState("");
  const [allActiveJobs, setAllActiveJobs] = useState([]);
  const [registeredJobsToday, setRegisteredJobsToday] = useState([]);
  const [markersData, setMarkersData] = useState([]);
  const [selectedOption, setSelectedOption] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);

  const getWorkPeriod = (period) => {
    switch (period) {
      case 0:
        return "하루";
      case 50:
        return "1주일 이하";
      case 100:
        return "1개월 이하";
      case 150:
        return "1개월 이상";
      case 200:
        return "2개월 이상";
      case 250:
        return "3개월 이상";
    }
  };

  const handleGetRegisteredJobToday = async () => {
    const result = await getRegisteredJobToday({ jobId: jobData.id });
    if (result.status === "OK") {
      setRegisteredJobsToday(
        map(result.data, (data) => ({
          id: data.id,
          lat: data.locations[0].geoPoint._latitude,
          lng: data.locations[0].geoPoint._longitude,
          address: data.locations[0].text,
          name: data.store.name,
          jobKind: data.jobKind,
          startDate: data.startDate,
          endDate: data.endDate,
          salary: data.salary,
          salaryType: data.salaryType,
          workPeriod: data.workPeriod,
        }))
      );
    }
  };
  const handleGetActiveJob = async () => {
    const result = await getActiveJob({ jobId: jobData.id });
    if (result.status === "OK") {
      const data = map(result.data, (data) => ({
        id: data.id,
        lat: data.locations[0].geoPoint._latitude,
        lng: data.locations[0].geoPoint._longitude,
        address: data.locations[0].text,
        name: data.store.name,
        jobKind: data.jobKind,
        startDate: data.startDate,
        endDate: data.endDate,
        salary: data.salary,
        salaryType: data.salaryType,
        workPeriod: data.workPeriod,
        // isCreatedToday:moment(data.createdAt*1000).isSame(moment(), 'day')
      }));

      setAllActiveJobs(data);
      setMarkersData(data);

      MonsterMainStore.changeLoading(false);
    }
  };

  useEffect(() => {
    MonsterMainStore.changeLoading(true);

    handleGetActiveJob();
    handleGetRegisteredJobToday();
  }, []);

  const selectAllActiveJobs = () => {
    setMarkersData(allActiveJobs);
    setSelectedOption(1);
  };

  const selectRegisteredJobsToday = () => {
    setMarkersData(registeredJobsToday);
    setSelectedOption(2);
  };

  useEffect(() => {
    createClusters();
  }, [mapOptions, markersData]);

  const getClusters = () => {
    const clusters = supercluster(markersData, {
      minZoom: 3,
      maxZoom: 16,
      radius: 60,
    });
    return clusters(mapOptions);
  };

  const createClusters = () => {
    setClusters(
      mapOptions.bounds
        ? getClusters().map(({ wx, wy, numPoints, points }) => ({
          lat: wy,
          lng: wx,
          numPoints,
          id: `${numPoints}_${points[0].id}`,
          points,
        }))
        : []
    );
  };

  const handleMapChange = ({ center, zoom, bounds }) => {
    setMapOptions({
      center,
      zoom,
      bounds,
    });
  };

  const onClusterMouseEnter = (key) => setCurrentKey(key);
  const onClusterMouseLeave = () => setCurrentKey("");

  const handleDateChange = async (date) => {
    setSelectedDate(date);

    MonsterMainStore.changeLoading(true);

    const result = await getRegistereJobsdAtDate({ createdAtStr: date });
    if (result.status === "OK") {
      setMarkersData(
        map(result.data, (data) => ({
          id: data.id,
          lat: data.locations[0].geoPoint._latitude,
          lng: data.locations[0].geoPoint._longitude,
          address: data.locations[0].text,
          name: data.store.name,
          jobKind: data.jobKind,
          startDate: data.startDate,
          endDate: data.endDate,
          salary: data.salary,
          salaryType: data.salaryType,
          workPeriod: data.workPeriod,
        }))
      );

      MonsterMainStore.changeLoading(false);
    }
  };

  return (
    // Important! Always set the container height explicitly
    <div style={{ height: "calc(100vh - 40px)", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyBCsVkfDqZW4PAkB--B4jS3tD6dGn8cUIA" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        onChange={handleMapChange}
        onChildClick={() => false}
        onChildMouseEnter={onClusterMouseEnter}
        onChildMouseLeave={onClusterMouseLeave}
        yesIWantToUseGoogleMapApiInternals
      >
        {map(clusters, ({ id, numPoints, ...markerProps }) => (
          <Marker key={id} text={numPoints} hover={numPoints === 1 && id === currentKey} {...markerProps} />
        ))}
      </GoogleMapReact>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Button
            variant={selectedOption === 1 ? "contained" : "outlined"}
            color="primary"
            onClick={selectAllActiveJobs}
          >
            {`Current active jobs (${allActiveJobs.length})`}
          </Button>
          <Button
            variant={selectedOption === 2 ? "contained" : "outlined"}
            color="primary"
            onClick={selectRegisteredJobsToday}
            style={{ marginTop: 20 }}
          >
            {`Registered jobs today (${registeredJobsToday.length})`}
          </Button>

          <p style={{ fontWeight: "bold", color: "#3f51b5", marginTop: 20 }}>Number of jobs: {markersData.length}</p>
          <KeyboardDatePicker
            variant="static"
            margin="normal"
            id="date-picker-dialog"
            label="Select date to see"
            format="MM/DD/yyyy"
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
          />
        </div>
      </div>
      {/* <LoadingSpinner /> */}
    </div>
  );
};

export default inject("MonsterMainStore")(observer(SoonMonsterMaps));
