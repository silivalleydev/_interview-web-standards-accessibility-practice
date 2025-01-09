import React, { useState, useEffect } from "react";
import { Button, CircularProgress } from "@material-ui/core";
import { throttle } from "lodash";

const BlackList = () => {
  let [list, setList] = useState([]);

  const getBlackList = () => {
    // Meteor.call('operationBlackList', {
    //     operation: 'GET'
    //   }, (error, result) => {
    //     setList(result.list)
    //     console.log('what result', result)
    //   });
  };

  useEffect(() => {
    getBlackList();
  }, []);

  return (
    <>
      <div>
        <div style={{ fontSize: 30, fontWeight: "bold" }}>블랙리스트</div>
        <div style={{ fontSize: 17, fontWeight: 500, color: "#5B616C" }}>블랙리스트 등록 및 수정</div>
      </div>
      <div style={{ height: 20 }}></div>
      <AddBlackList getBlackList={getBlackList} />
      {/* 블랙리스트 명단 */}
      {/* <List list={list} getBlackList={getBlackList} /> */}
    </>
  );
};

const AddBlackList = ({ getBlackList }) => {
  let [processing, setProcessing] = useState(false);
  let [name, setName] = useState("");
  let [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = () => {
    setProcessing(true);

    if (!name || !phoneNumber) {
      alert("이름 또는 전화번호를 입력해주세요");
      setProcessing(false);
      return "";
    }

    // Meteor.call('operationBlackList', {
    //     operation: 'ADD',
    //     name,
    //     phoneNumber
    //   }, (error, result) => {
    //     setProcessing(false);
    //     alert('등록되었습니다.');
    //     setName('');
    //     setPhoneNumber('');
    //     getBlackList();
    //     console.log('what result', result)
    //   });
  };

  return (
    <>
      <h5>블랙 리스트 등록</h5>
      <table style={{ width: 500 }}>
        <tr>
          <td style={{ textAlign: "center" }}>이름</td>
          <td style={{ textAlign: "center" }}>전화번호</td>
          <td style={{ textAlign: "center" }}></td>
        </tr>
        <tr>
          <td style={{ textAlign: "center" }}>
            <input
              style={{ width: "100%" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              type="text"
            />
          </td>
          <td style={{ textAlign: "center" }}>
            <input
              style={{ width: "100%" }}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="phoneNumber"
              placeholder="01022223333"
            />
          </td>
          <td style={{ textAlign: "center" }}>
            <Button
              variant="outlined"
              style={{ width: 50, height: 30 }}
              onClick={throttle(handleSubmit, 2000, {
                trailing: false,
              })}
              disabled={processing}
            >
              {processing ? <CircularProgress size={16} /> : "추가"}
            </Button>
          </td>
        </tr>
      </table>
    </>
  );
};
const List = ({ list = [], getBlackList }) => {
  let [processing, setProcessing] = useState(false);

  const handleDelete = (id) => {
    setProcessing(true);
  };

  return (
    <>
      <h5>블랙 리스트 명단</h5>
      <table style={{ width: 500 }}>
        <tr>
          <td style={{ textAlign: "center" }}>이름</td>
          <td style={{ textAlign: "center" }}>전화번호</td>
          <td style={{ textAlign: "center" }}></td>
        </tr>
        {list.map((black = {}) => (
          <tr>
            <td style={{ textAlign: "center" }}>{black.name}</td>
            <td style={{ textAlign: "center" }}>{black.phoneNumber}</td>
            <td style={{ textAlign: "center" }}>
              <Button
                variant="outlined"
                style={{ width: 50, height: 30 }}
                onClick={throttle(() => handleDelete(black.id), 2000, {
                  trailing: false,
                })}
                disabled={processing}
              >
                {processing ? <CircularProgress size={16} /> : "삭제"}
              </Button>
            </td>
          </tr>
        ))}
      </table>
    </>
  );
};

export default BlackList;
