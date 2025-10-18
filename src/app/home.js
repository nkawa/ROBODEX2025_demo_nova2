"use client";
import 'aframe';
import * as React from 'react'
const THREE = window.AFRAME.THREE; // これで　AFRAME と　THREEを同時に使える

import { AppMode } from './appmode.js';

import '../lib/robotRegistry.js';
import '../lib/robotLoader.js';
import VrControllerComponents from '../components/VrControllerComponents.jsx';
import '../lib/ikWorker.js';
import '../lib/reflectWorkerJoints.js';
import '../lib/armMotionUI.js';

//import StereoVideo from '../components/stereoWebRTC.js';

export default function Home(props) {

  const deg30 = Math.PI / 6.0;
  const deg90 = Math.PI / 2;
  const deg45 = Math.PI / 4;
  const deg22 = Math.PI / 8;
  return (
    <>
      <a-scene scene xr-mode-ui={`enabled: ${!(props.appmode === AppMode.viewer) ? 'true' : 'false'}; XRMode: xr`} >
        <a-entity id="robot-registry"
          robot-registry
          event-distributor>
          <VrControllerComponents />
        </a-entity>
        <a-entity camera position="0 1.7 1"
          look-controls
          wasd-controls="acceleration: 200"
          ></a-entity>


        <a-plane id="nova2-plane"
          position="0 0.6 -1" rotation="-90 0 90"

          width="1" height="1" color="#7BC8A4"
          material="opacity: 0.5; transparent: true; side: double;"
          robot-loader="model: nova2_robot"
          ik-worker={`${deg90}, ${-deg90}, ${deg90}, 0, ${-deg90}, 0`}
          default-target
          reflect-worker-joints
          arm-motion-ui
        />
        {/* <a-sky color="#ECECEC"></a-sky> 
                   ik-worker={`${deg90}, ${-deg90}, ${deg90}, 0, ${-deg90}, 0`}

        */}
      </a-scene>
    </>
  );
}