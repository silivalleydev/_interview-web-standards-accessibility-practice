import React, { Component, Suspense } from "react";
import { observable } from "mobx";
import { observer, inject } from "mobx-react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";
import { getTokenFromCookie } from "./utils/soonUtill";
import LoadingSpinner from "./Components/LoadingSpinner";
import PleaseTellWhoYouAre from './Screens/PleaseTellWhoYouAre'

// Lazy-loaded components
const MonsterDrawer = React.lazy(() => import("./Components/MonsterDrawer"));
const Reservation = React.lazy(() => import("./Screens/Reservation"));
const ReservationOld = React.lazy(() => import("./Screens/ReservationOld"));
const LongtermReservation = React.lazy(() => import("./Screens/LongtermReservation"));
const Enterprise = React.lazy(() => import("./Screens/Enterprise"));
const ManageNotice = React.lazy(() => import("./Screens/ManageNotice"));
const UserAccessControlPage = React.lazy(() => import("./Screens/UserAccessControlPage"));
const SearchWithdraw = React.lazy(() => import("./Screens/SearchWithdraw"));
const EmployerList = React.lazy(() => import("./Screens/employer/EmployerList"));
const SeekerList = React.lazy(() => import("./Screens/seeker/SeekerList"));
const Transaction = React.lazy(() => import("./Screens/Transaction"));

class App extends Component {
  @observable whoAmI = "";
  @observable loadingToken = true;

  async checkAccessToken() {
    const refreshToken = getTokenFromCookie("@refreshToken");
    if (!refreshToken) {
      this.whoAmI = "";
      this.props.MonsterMainStore.setCurrentUser(null, null);
      this.loadingToken = false;
    } else {
      const id = localStorage.getItem("@id");
      const accessToken = getTokenFromCookie("@accessToken");
      this.whoAmI = id;
      this.props.MonsterMainStore.setCurrentUser(id, accessToken);
    }
  }

  componentDidMount() {
    // this.checkAccessToken();
  }

  render() {
    if (this.whoAmI === "") {
      return (
        <div style={{ width: "100vw", height: "100vh" }}>

          <PleaseTellWhoYouAre
            window={window}
            loginCallback={(displayName) => (this.whoAmI = displayName)}
          />

        </div>
      );
    }

    return (
      <Router>
        <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
          <MonsterDrawer
            window={window}
            currentPage={this.props.currentPage}
            clear={() => {
              this.whoAmI = "";
              this.props.MonsterMainStore.setCurrentUser(null, null);
              this.loadingToken = false;
            }}
          />
          <div
            id="content-area"
            style={{
              padding: 18,
              paddingBottom: 0,
              display: "flex",
              flex: 1,
              flexDirection: "column",
            }}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <Route exact path="/" component={() => <Redirect to="/reservation" />} />
              <Route path="/reservation" component={Reservation} />
              <Route path="/reservation_old" component={ReservationOld} />
              <Route path="/longterm" component={LongtermReservation} />
              <Route path="/enterprise" component={Enterprise} />
              <Route path="/managenotice" component={ManageNotice} />
              <Route path="/userAccessControlPage" component={UserAccessControlPage} />
              <Route path="/searchWithdraw" component={SearchWithdraw} />
              <Route path="/employers" component={EmployerList} />
              <Route path="/alba" component={SeekerList} />
              <Route path="/transactions" component={Transaction} />
            </Suspense>
          </div>
          <LoadingSpinner />
        </div>
      </Router>
    );
  }
}

export default inject("MonsterMainStore")(observer(App));
