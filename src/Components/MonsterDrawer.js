import React, { useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import ListItemText from "@material-ui/core/ListItemText";

import logo from "../image/ic_soon_on_demand.png";
import packageJson from "../../package.json";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Link, useHistory } from "react-router-dom";
import { LogoutUser } from "../api/users";
import { usePRD } from "../api/requestApi";
import { deleteCookie } from "../utils/soonUtill";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const logGroup = [
  {
    name: '로그인/아웃 로그',
    path: 'auth_log',
  },
  {
    name: '계정 관리 로그',
    path: 'account_log',
  },
  {
    name: '계정 활동 로그',
    path: 'activity_log',
  },
  {
    name: '(앱) 로그인/아웃 로그',
    path: 'auth_log_app',
  },
];
const menuItemsGroup1 = [
  {
    name: "대시보드",
    path: "dashboard",
  },
  {
    name: "유저들",
    path: "userinfo",
  },
  {
    name: "리뷰들",
    path: "reviews",
  },
];

const menuItemsGroup2 = [
  {
    name: "공지사항관리",
    path: "managenotice",
  },
  // {
  //   name: "지도",
  //   path: "map",
  // },
];

const onDemand = [
  {
    name: "알바신청 리스트",
    path: "reservation",
  },
  {
    name: "(구)알바신청 리스트",
    path: "reservation_old",
  },
  {
    name: "장기알바 리스트",
    path: "longterm",
  },
  {
    name: "사장님 리스트",
    path: "employers",
  },
  {
    name: "알바님 리스트",
    path: "alba",
  },
  {
    name: "입금 예정 내역",
    path: "transactions",
  },
  // {
  //   name: "본인인증요청",
  //   path: "user_verification_request",
  // },
  {
    name: '고객사 코드관리',
    path: 'enterprise',
  },
  // {
  //   name: "데이터 센터",
  //   path: "data",
  // },
  {
    name: "사용자 권한 관리",
    path: "userAccessControlPage",
  },
  {
    name: "탈퇴 회원 조회",
    path: "searchWithdraw",
  },
  // {
  //   name: "블랙리스트 명단",
  //   path: "blacklist",
  // },
];

function MonsterDrawer(props) {
  const { window, changePage, currentPage } = props;
  const theme = useTheme();
  const classes = useStyles(theme);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const history = useHistory();
  const onClickLogout = async () => {

    try {
      const logoutResult = await LogoutUser()
      if (logoutResult.status === "OK") {
        deleteCookie('@accessToken')
        deleteCookie('@refreshToken')
        localStorage.setItem("@id", "");
        props.clear();
        history.push("/");
      }
    } catch (error) {
      console.log('로그아웃 실패')
    }



  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const [isDevEnv, setIsDevEnv] = React.useState(false);

  useEffect(() => {

    const isDev = (window.location.host.includes('dev-admin') || window.location.host.includes('localhost') && usePRD === false)
    if (isDev) {
      setIsDevEnv(true)
    }

  }, [window])


  const drawer = (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logo} width="60%" style={{ margin: 16 }} />
        <span style={{ fontSize: 16, color: "#574EDF" }}>{` ${packageJson.version}`}{isDevEnv && <div style={{ fontSize: 14, color: 'red', fontWeight: 'bold' }}>{`(${isDevEnv ? "개발환경" : ""})`}</div>}</span>
      </div>
      <Divider />
      <List>
        {onDemand.map((item, index) => (
          <Link key={item.name} to={`/${item.path}`} onClick={changePage?.bind(null, item.path)}>
            <ListItem button selected={currentPage === item.path}>
              {/* <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon> */}
              <ListItemText primary={item.name} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      {/* <List>
        {logGroup.map((item, index) => (
          <Link key={item.name} to={`/${item.path}`} onClick={changePage?.bind(null, item.path)}>
            <ListItem button selected={currentPage === item.path}>
              <ListItemText primary={item.name} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider /> */}
      {/* <List>
        {menuItemsGroup1.map((item, index) => (
          <Link key={item.name} to={`/${item.path}`} onClick={changePage?.bind(null, item.path)}>
            <ListItem button selected={currentPage === item.path}>
              <ListItemText primary={item.name} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider /> */}
      <List>
        {menuItemsGroup2.map((item, index) => (
          <Link key={item.name} to={`/${item.path}`} onClick={changePage?.bind(null, item.path)}>
            <ListItem button selected={currentPage === item.path}>
              {/* <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon> */}
              <ListItemText primary={item.name} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button>
          <div key={"logout"} onClick={onClickLogout}>
            {/* <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon> */}
            <ListItemText primary={"로그아웃"} />
          </div>
        </ListItem>
      </List>
    </div >
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
    </div>
  );
}

MonsterDrawer.propTypes = {};

export default MonsterDrawer;
