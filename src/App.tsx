import React, { Component, Suspense, startTransition } from "react";
import { observable } from "mobx";
import { observer, inject } from "mobx-react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import LoadingSpinner from "./Components/LoadingSpinner";
import PleaseTellWhoYouAre from "./Screens/PleaseTellWhoYouAre";

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
    const id = localStorage.getItem("@id");
    const accessToken = localStorage.getItem("@accessToken");
    if (id) {
      startTransition(() => {
        this.whoAmI = id;
        this.props.MonsterMainStore.setCurrentUser(accessToken, "accessToken");
      })
    }

  }

  componentDidMount() {
    this.checkAccessToken();
  }

  render() {
    // // 초기 로딩 상태 처리
    // if (this.loadingToken) {
    //   return (
    //     <div
    //       style={{
    //         display: "flex",
    //         justifyContent: "center",
    //         alignItems: "center",
    //         height: "100vh",
    //       }}
    //     >
    //       <CircularProgress />
    //     </div>
    //   );
    // }

    // 로그인 화면 처리
    if (this.whoAmI === "") {
      return (
        <div style={{ width: "100vw", height: "100vh" }}>
          <PleaseTellWhoYouAre
            window={window}
            loginCallback={(displayName) =>
              startTransition(() => {
                this.whoAmI = displayName;
                this.props.MonsterMainStore.setCurrentUser(displayName, "accessToken");
                localStorage.setItem('@id', displayName)
                localStorage.setItem('@accessToken', "accessToken")
              })
            }
          />
        </div>
      );
    }

    // 메인 앱 화면 렌더링
    return (
      <Router>
        <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
          <Suspense fallback={<div>Loading...</div>}>
            <MonsterDrawer
              window={window}
              currentPage={this.props.currentPage}
              clear={() => {
                startTransition(() => {
                  this.whoAmI = "";
                  this.props.MonsterMainStore.setCurrentUser(null, null);
                  this.loadingToken = false;
                });
              }}
            />
          </Suspense>
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
        </div>
      </Router>
    );
  }
}

export default inject("MonsterMainStore")(observer(App));
