import React from "react";
import "./scss/index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {Provider} from 'mobx-react'

import MonsterMainStore from './store/MonsterMainStore'
import ReservationStore from './store/ReservationStore'
import PaymentStore from './store/PaymentStore'
import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <Provider
  MonsterMainStore={MonsterMainStore}
  ReservationStore={ReservationStore}
  PaymentStore={PaymentStore}
>
  {/* <@material-ui/pickers > */}
    <App />
  {/* </MuiPickersUtilsProvider> */}
</Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
