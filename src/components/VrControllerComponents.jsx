// ********
// ********
import AFRAME from 'aframe';
import './vrControllerThumbMenu.js'; // with thumbMenuEventHandler
import './axesFrame.js';
import { isControlMode, AppMode } from '../app/appmode.js';

export default VrControllerComponents;

function VrControllerComponents(props) {
  const menuItems = "nova2-plane,act,deact,open,ray,close";

  return (
    <>
      {isControlMode(props.appmode) ? // モードによって動かさない
        <>
          <a-entity right-controller
            laser-controls="hand: right"
            raycaster="objects: .clickable"
            line="color: blue; opacity: 0.75"
            thumbstick-menu={`items: ${menuItems}`}
            thumbmenu-event-handler
            target-selector
            visible="true">
            <a-entity a-axes-frame />
          </a-entity>
          <a-entity cursor="rayOrigin: mouse"
            mouse-cursor
            raycaster="objects: .clickable"></a-entity>
        </>
        :
        <a-entity cursor="rayOrigin: mouse"
          mouse-cursor
          raycaster="objects: .clickable"></a-entity>

      }

    </>
  );
}
