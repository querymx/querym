import { useEffect, useState } from 'react';

export const useHotkeyRecorder = (customWindow?: Window | null) => {
  const [recording, setRecording] = useState(true); // Start recording immediately
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (recording) {
      event.preventDefault();
      const { key } = event;
      console.log(event);
      setRecordedKeys((prevKeys) => [...prevKeys, key]);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    const currentWindow = customWindow || window;
    currentWindow.removeEventListener('keydown', handleKeyDown);
  };

  const clearRecordedKeys = () => setRecordedKeys([]);

  useEffect(() => {
    const currentWindow = customWindow || window;

    // Start recording immediately when the component is mounted
    currentWindow.addEventListener('keydown', handleKeyDown);

    // Ensure the event listener is removed when the component unmounts
    return () => {
      stopRecording();
    };
  }, []); // Empty dependency array to ensure it runs once

  return { recording, recordedKeys, stopRecording, clearRecordedKeys };
};
