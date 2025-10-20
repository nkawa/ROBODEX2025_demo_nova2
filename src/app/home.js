"use client";
import 'aframe';
import * as React from 'react'
const THREE = window.AFRAME.THREE; // これで　AFRAME と　THREEを同時に使える

import { AppMode } from './appmode.js';

import '../compo_aframe/robotRegistry.js';
import '../compo_aframe/robotLoader.js';
import VrControllerComponents from '../components/VrControllerComponents.jsx';
import '../compo_aframe/ikWorker.js';
import '../compo_aframe/reflectWorkerJoints.js';
import '../compo_aframe/armMotionUI.js';
import '../compo_aframe/gripControl.js';
import '../compo_aframe/default_event_target.js';
import '../compo_aframe/motionFilter.js'

import { getCookie } from '../lib/cookie_id.js';
import { setupMQTT } from '../lib/MQTT_jobs.js';

//import StereoVideo from '../components/stereoWebRTC.js';



// 角度、横方向のオフセットを Cookie から取得して初期化
const getCookiesForInitalize = (appmode, setVrModeAngle, setVrModeOffsetX) => {
  // Cookie, Offsetの取得
  if (!(appmode === AppMode.viewer)) {
    const wk_vrModeAngle = getCookie('vrModeAngle')
    setVrModeAngle(wk_vrModeAngle ? parseFloat(wk_vrModeAngle) : -90);  // change default to 90
    const wk_vrModeOffsetX = getCookie('vrModeOffsetX')
    setVrModeOffsetX( wk_vrModeOffsetX ? parseFloat(wk_vrModeOffsetX) : 0.55); // デフォルト X 方向オフセット
   // console.log("Cookie read vrModeAngle, OffsetX:", vrModeAngle_ref.current, vrModeOffsetX_ref.current);
  }
}


export default function Home(props) {
  const robotIDRef = React.useRef("robot_id_reference"); // ロボットUUID 保持用
  
  const [vrModeAngle,setVrModeAngle] = React.useState(-180);       // ロボット回転角度
  const [vrModeOffsetX,setVrModeOffsetX] = React.useState(0.55);   // X offset
  const [base_rotation, setBaseRotation] = React.useState(`-90 -180 0`);     // ベース角度
  const [base_position, setBasePosition] = React.useState(`0.55 0.55 -1`);   // ベース位置

  const nova2_ref = React.useRef(null);

  const deg30 = Math.PI / 6.0;
  const deg90 = Math.PI / 2;
  const deg45 = Math.PI / 4;
  const deg22 = Math.PI / 8;

  // モードに応じて初期ポーズを変更
  let initial_pose = `${deg90}, ${-deg90}, ${deg90}, 0, ${-deg90}, 0`;
  if (props.appmode === AppMode.simRobot) {
    initial_pose = `${deg45}, ${-deg90}, ${deg45}, 0, ${-deg90}, 0`;
  }

  // MQTT 対応
  React.useEffect(() => {
    setupMQTT(props, robotIDRef, nova2_ref); // useEffect で1回だけ実行される。
  }, []);

  // Cookie から初期値取得
  React.useEffect(()=>{ 
     getCookiesForInitalize(props.appmode, setVrModeAngle, setVrModeOffsetX);
  },[]);
  // base_position, base_rotation 更新
  React.useEffect(()=>{
    setBasePosition(`${vrModeOffsetX} 0.55 -1`);
    setBaseRotation(`-90 ${vrModeAngle} 0`);
    console.log("Home base_pos, rotation:", base_position, base_rotation);
  },[vrModeAngle, vrModeOffsetX]);


  return (
    <>
      <a-scene scene xr-mode-ui={`enabled: ${!(props.appmode === AppMode.viewer) ? 'true' : 'false'}; XRMode: xr`} >
        <a-entity id="robot-registry"
          robot-registry
          event-distributor>
          <VrControllerComponents appmode={props.appmode} />
        </a-entity>
        <a-entity camera position="0 1.7 1"
          look-controls
          wasd-controls="acceleration: 200"
        ></a-entity>


        <a-plane id="nova2-plane"
          ref={nova2_ref}
          position={base_position} rotation={base_rotation}

          width="1" height="1" color="#7BC8A4"
          material="opacity: 0.5; transparent: true; side: double;"
          robot-loader="model: nova2_robot"
          ik-worker={initial_pose}
          reflect-worker-joints={`appmode: ${props.appmode}`}
          motion-dynamic-filter
          arm-motion-ui
          grip-control
          default-event-target
        />
        {/* <a-sky color="#ECECEC"></a-sky> 
                   ik-worker={`${deg90}, ${-deg90}, ${deg90}, 0, ${-deg90}, 0`}

        */}
      </a-scene>
    </>
  );
}