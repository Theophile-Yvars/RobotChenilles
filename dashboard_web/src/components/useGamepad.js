import { useState, useEffect, useRef } from 'react';

const useGamepad = () => {
  const [gamepad, setGamepad] = useState(null);
  const requestRef = useRef();

  const updateStatus = () => {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      setGamepad({
        axes: [...gamepads[0].axes],
        buttons: gamepads[0].buttons.map(b => b.pressed)
      });
    }
    requestRef.current = requestAnimationFrame(updateStatus);
  };

  useEffect(() => {
    window.addEventListener("gamepadconnected", updateStatus);
    return () => {
      window.removeEventListener("gamepadconnected", updateStatus);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return gamepad;
};

export default useGamepad;