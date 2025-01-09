import React, { useState, useEffect } from "react";
import { Button, CircularProgress, Select, MenuItem } from "@material-ui/core";
import { forEach, map, throttle } from "lodash";
import { sendPushToken } from "../api/users";
import Axios from "axios";
import { DEV_HOST, HOST, HOST_VPN, SOON_APP_DEV_HOST, SOON_APP_HOST, SOON_APP_HOST_VPN } from "../api/requestApi";

export default function DataCenter() {
  const [file, setFile] = useState();
  const [file2, setFile2] = useState();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dataList, setdataList] = useState([]);
  const [dataList2, setdataList2] = useState([]);
  const [eventCash, setEventCash] = useState(0);
  const [headerList, setHeaderList] = useState<string[]>([]);
  let [processingUpload, setProcessingUpload] = useState<boolean>(false);
  let [processingUpload2, setProcessingUpload2] = useState<boolean>(false);
  let [processingUpload3, setProcessingUpload3] = useState<boolean>(false);

  useEffect(() => {
    // content
    // Meteor.call(
    //   'getEventCashChannel',
    //   {
    //     operation: 'GET',
    //   },
    //   (error, result) => {
    //     setEventCashChannelList(result.eventCashChannelList)
    //     console.log('what result', result)
    //   }
    // )
    return () => {
      // clearEffect
    };
  }, []);

  const exportPaymentData = (rows) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const header = "회원타입,회원가입일,UID,이름,전화번호\r\n";
    csvContent += header;
    forEach(rows, (data) => {
      const { uid, phoneNumber, username, createdAt, type } = data;

      let row = type + "," + createdAt + "," + uid + ", " + username + ", " + phoneNumber + "\r\n";
      csvContent += row;
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "userData.csv");
    document.body.appendChild(link); // Required for FF

    link.click();

    setProcessingUpload2(false);
  };

  const fileReader = new FileReader();

  const csvFileToArray = (string, setdataList) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });



    const extractHeader = [
      "Event Name",
      "Event Value",
      "Event Time",
      "Media Source",
      "Campaign",
      "Channel",
      "Customer User ID",
      "Original URL",
      "Platform",
    ];

    if (array?.length > 0) {
      const header = Object.keys(array[0]).filter((key) => extractHeader.includes(key));
      setHeaderList(header);

      let data = [];

      data = array.map((obj) => {
        let newObj = {};
        header.forEach((head) => {
          newObj[head] = obj[head];
          if (head === "Customer User ID") {
            newObj["uid"] = obj[head];
          }
        });
        return newObj;
      });

      setdataList(data);
    }
  };
  const csvFileToArray2 = (string, setdataList) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((i) => {

      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });


    const extractHeader = [
      "uid"
    ];

    if (array?.length > 0) {
      const header = Object.keys(array[0]).filter((key) => extractHeader.includes(key));
      setHeaderList(header);

      let data = [];

      data = array.map((obj) => {
        let newObj = {};
        header.forEach((head) => {
          newObj[head] = obj[head];

        });
        return newObj;
      });

      setdataList(data);
    }
  };

  const handleChange = (event) => {
    setFile(event.target.files[0]);

    if (event.target.files[0]) {
      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray(text, setdataList);
      };

      fileReader.readAsText(event.target.files[0]);
    }
  };
  const handleChange2 = (event) => {
    setFile2(event.target.files[0]);

    if (event.target.files[0]) {
      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray2(text, setdataList2);
      };

      fileReader.readAsText(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (eventCash === 0) {
      alert("지급할 캐시 금액을 선택해주세요.");
      return;
    }
    setProcessingUpload(true);
    // Meteor.call(
    //   'uploadCsv',
    //   {
    //     dataList,
    //     eventCash,
    //   },
    //   (error, result) => {
    //     console.log(result)
    //     alert('정보입력(지급) 완료되었습니다.')
    //     setProcessingUpload(false)
    //   }
    // )
  };

  const SLICE_COUNT = 50;
  const sendPush = async (arr = []) => {
    if (arr.length > 0) {
      const sendTarget = arr.splice(0, SLICE_COUNT);
      const remainArr = arr


      const result = await sendPushToken({
        uids: sendTarget,
        title,
        body
      })

      setpushCompleteCount((prevCount) => prevCount + sendTarget.length)
      await sendPush(remainArr)
    } else {
      alert('finished')
    }
  }
  const [pushCompleteCount, setpushCompleteCount] = useState(0)

  const handleSubmit2 = async () => {
    setProcessingUpload3(true);
    setpushCompleteCount(0)
    const list = map(dataList2, (data) => data.uid);
    // console.log("senddata", list);
    await sendPush(list)
    setProcessingUpload3(false);

    // Meteor.call(
    //   'getUserByIds',

    //   compact(list),

    //   (error, result) => {
    //     console.log(result)
    //     const exportData = []
    //     result.forEach((data) => {
    //       const uid = data?.[0]
    //       const phoneNumber = data?.[1]
    //       const username = data?.[2]
    //       const excelData = find(dataList, (data) => data.uid === uid)
    //       const type =
    //         excelData['Event Value']
    //           ?.split(':')?.[1]
    //           ?.replace('"', '')
    //           .replace('}', '') || ''
    //       exportData.push({
    //         uid,
    //         phoneNumber,
    //         username,
    //         createdAt: excelData['Event Time'],
    //         type: type.includes('store')
    //           ? '사장'
    //           : type.includes('user')
    //           ? '알바'
    //           : '',
    //       })
    //     })
    //     exportPaymentData(exportData)
    //     alert('다운로드가 완료되었습니다.')
    //     setProcessingUpload2(false)
    //   }
    // )
  };

  return (
    <>
      <Button
        variant='contained'
        color='primary'
        style={{ width: 230, marginTop: 20 }}
        onClick={async () => {
          let data = JSON.stringify({
            "key": "value"
          });
          const isDev = window.location.host.includes('dev-admin')
          const isVpn = window.location.host.includes('admin-vpn')
          let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: (isVpn ? HOST_VPN : (isDev ? DEV_HOST : HOST)) + '/checkHealth',
            headers: {
              'Content-Type': 'application/json',
            },
            data: data
          };

          Axios.request(config)
            .then((response) => {

            })
            .catch((error) => {
              alert(JSON.stringify(error));
              console.log(error);
            });

        }}

      >
        {"checkHealth"}
      </Button>
      <h3 style={{ marginBottom: 30 }}>마케팅 이벤트 지급</h3>
      <input type="file" onChange={handleChange} accept={".csv"} />
      {file && (
        <Button
          variant="outlined"
          style={{ width: 230, marginTop: 20 }}
          onClick={throttle(handleSubmit, 2000, {
            trailing: false,
          })}
          disabled={processingUpload}
        >
          {processingUpload ? <CircularProgress size={16} /> : "정보입력(이벤트 캐시 지급)하기"}
        </Button>
      )}
      {file && (
        <Button
          variant="outlined"
          style={{ width: 230, marginTop: 20 }}
          onClick={throttle(handleSubmit2, 2000, {
            trailing: false,
          })}
          disabled={processingUpload2}
        >
          {processingUpload2 ? <CircularProgress size={16} /> : "회원정보 파일 다운로드"}
        </Button>
      )}
      <Select
        style={{ maxWidth: 200 }}
        value={eventCash}
        label="eventCash"
        onChange={(e) => setEventCash(e.target.value)}
      >
        <MenuItem value={0}>지급할 캐시 선택</MenuItem>
        <MenuItem value={10000}>10000원</MenuItem>
        <MenuItem value={20000}>20000원</MenuItem>
      </Select>
      <h5 style={{ margin: "10px 0 10px 0" }}>업로드된 파일 리스트</h5>
      <hr style={{ width: "100%" }} />
      <div style={{ border: "1px solid black", padding: 20, width: "100%" }}>
        <table>
          <tr>
            {headerList.map((header) => (
              <th style={{ textAlign: "center" }}>{header}</th>
            ))}
          </tr>
          {dataList.map((data) => (
            <tr>
              {Object.keys(data).map((key) => (
                <td style={{ textAlign: "center" }}>{data[key]}</td>
              ))}
            </tr>
          ))}
        </table>
      </div>
      <hr />
      <h3 style={{ marginBottom: 30 }}>푸시 발송하기</h3>
      <input type="file" onChange={handleChange2} accept={".csv"} />
      <div style={{ margin: 10 }}>
        제목: <input type="text" onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div style={{ margin: 10 }}>
        내용: <textarea style={{ width: 400 }} rows={10} onChange={(e) => setBody(e.target.value)} />
      </div>
      {file2 && (
        <>
          <div>
            푸시 발송 완료: {pushCompleteCount}
          </div>
          <Button
            variant="outlined"
            style={{ width: 230, marginTop: 20 }}
            onClick={throttle(handleSubmit2, 2000, {
              trailing: false,
            })}
            disabled={processingUpload3 || !title || !body}
          >
            {processingUpload3 ? <CircularProgress size={16} /> : "푸시발송하기"}
          </Button>
        </>
      )}
      <h5 style={{ margin: "10px 0 10px 0" }}>업로드된 파일 리스트</h5>
      <hr style={{ width: "100%" }} />
      <div style={{ border: "1px solid black", padding: 20, width: "100%" }}>
        <table>
          {/* {dataList2.map((data) => (
            <tr>
              {Object.keys(data).map((key) => (
                <td style={{ textAlign: "center" }}>{data[key]}</td>
              ))}
            </tr>
          ))} */}
          {dataList2.length}
        </table>
      </div>
    </>
  );
}
