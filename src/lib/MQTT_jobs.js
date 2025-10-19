"use client"
import * as React from 'react'

import { connectMQTT, mqttclient, idtopic, subscribeMQTT, publishMQTT, codeType } from '../lib/MetaworkMQTT'
import { AppMode, isControlMode, isNonControlMode } from '../app/appmode.js';


const MQTT_REQUEST_TOPIC = "mgr/request";
const MQTT_DEVICE_TOPIC = "dev/" + idtopic;
const MQTT_CTRL_TOPIC = "control/" + idtopic; // 自分のIDに制御を送信
const MQTT_ROBOT_STATE_TOPIC = "robot/";
//const MQTT_AIST_LOGGER_TOPIC = "AIST/logger/Cobotta";

let send_count = 0;

let receive_state = false // ロボットの状態を受信してるかのフラグ

export const sendRobotJointMQTT = (joints) => {
//  console.log("Joints!", joints)
  const ctl_json = JSON.stringify({
    time: send_count++,
    joints: joints,
    grip: [],
  });

  publishMQTT(MQTT_CTRL_TOPIC, ctl_json);
}


// MQTT connected request
const requestRobot = (mqclient) => {
  // 制御対象のロボットを探索（表示された時点で実施）
  const requestInfo = {
    devId: idtopic, // 自分のID
    type: codeType,  //  コードタイプ（Request でマッチングに利用)
  }
  console.log("Publish request", requestInfo)
  publishMQTT(MQTT_REQUEST_TOPIC, JSON.stringify(requestInfo));
}


export const setupMQTT = (props, robotIDRef) => {
  // register to MQTT
  if (typeof window.mqttClient === 'undefined') {
    if (props.appmode === AppMode.practice) { // 練習モードは　MQTT 接続しない
      return;
    }
    if (mqttclient != null) {
      window.mqttClient = mqttclient;
      subscribeMQTT([
        MQTT_DEVICE_TOPIC
      ]);
      if (isControlMode(props.appmode))
        requestRobot(mqttclient);
    } else {
      if (isControlMode(props.appmode)) {
        window.mqttClient = connectMQTT(requestRobot);
      } else {
        window.mqttClient = connectMQTT();
      }
      subscribeMQTT([
        MQTT_DEVICE_TOPIC
      ]);
    }
    //      console.log("Subscribe:",MQTT_DEVICE_TOPIC);
    //        MQTT_CTRL_TOPIC  // MQTT Version5 なので、 noLocal が効くはず

    if (isNonControlMode(props.appmode)) {// Viewer /SimRobotの場合
      //サブスクライブ時の処理
      window.mqttClient.on('message', (topic, message) => {
        if (topic === MQTT_DEVICE_TOPIC) { // デバイスへの連絡用トピック
          console.log(" MQTT Device Topic: ", message.toString());
          // ここでは Viewer の設定を実施！
          let data = JSON.parse(message.toString())
          if (data.controller !== undefined) {// コントローラ情報ならば！
            robotIDRef.current = data.devId
            subscribeMQTT([
              "control/" + data.devId
            ]);
          }
        } else if (topic === "control/" + robotIDRef.current) {
          let data = JSON.parse(message.toString())
          if (data.joints !== undefined) {
            // 次のフレームあとにtarget を確認してもらう（IKが出来てるはず
            console.log("Viewer control topic:", data.joints)
            /*
              if (input_rotateRef.current.some((e, i) => e !== data.joints[i])) {
                console.log("Viewer!!!", data.joints)
                set_input_rotate([...data.joints])
                inputRotateFlg.current = true
              }
                */
          }
        }
      })
    } else { // not viewer
      //自分向けメッセージサブスクライブ処理
      window.mqttClient.on('message', (topic, message) => {
        if (topic === MQTT_DEVICE_TOPIC) { // デバイスへの連絡用トピック
          let data = JSON.parse(message.toString())
          console.log(" MQTT Device Topic: ", message.toString());
          if (data.devId === "none") {
            console.log("Can't find robot!")
          } else {
            console.log("Assigned robot:", data.devId)
            robotIDRef.current = data.devId
            if (receive_state === false) { // ロボットの姿勢を受け取るまで、スタートしない。
              subscribeMQTT([
                MQTT_ROBOT_STATE_TOPIC + robotIDRef.current // ロボットの姿勢を待つ
              ])
            }
          }
        }

        if (topic === MQTT_ROBOT_STATE_TOPIC + robotIDRef.current) { // ロボットの姿勢を受け取ったら
          let data = JSON.parse(message.toString()) ///
          const joints = data.joints
          // ここで、joints の安全チェックをすべき
          // 常時受信する形に変更されたので　Unsubscribeしない

          //mqttclient.unsubscribe(MQTT_ROBOT_STATE_TOPIC+robotIDRef.current) //
          if (firstReceiveJoint) {
            // ここで、ジョイントから target を逆計算する（ツールによって変化すべし）
            if (input_rotateRef.current.some((e, i) => e !== joints[i])) {
              //                  console.log("receive joints from:", robotIDRef.current, joints)

              // TODO:
              //    set_input_rotate([...joints])
              //inputRotateFlg.current = true
            }

          }

          if (firstReceiveJoint) {

            if (props.appmode !== AppMode.monitor) {
              firstReceiveJoint = false
              window.setTimeout(() => {
                console.log("Start to send movement!")
                receive_state = true; //
                // ロボットに指令元を伝える
                publishMQTT("dev/" + robotIDRef.current, JSON.stringify({ controller: "browser", devId: idtopic })) // 自分の topic を教える
              }, 1000);
            } else {// monitor の時、このきっかけがないので、動かなかった。。。
              //console.log(joints)
            }
          }
        }

      })
    }
  }
  // 消える前にイベントを呼びたい
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  }
}

const handleBeforeUnload = () => {
  if (mqttclient !== undefined) {
    publishMQTT("mgr/unregister", JSON.stringify({ devId: idtopic }));
  }
}
