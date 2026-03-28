import React, { useState, useEffect } from 'react';

function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [version, setVersion] = useState('Loading...');
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    
    if (window.electronAPI) {
      window.electronAPI.getVersion().then(v => setVersion(v));
      
      window.electronAPI.onUpdateAvailable(() => setUpdateStatus('Update available! Downloading in background...'));
      window.electronAPI.onUpdateDownloaded(() => {
          setUpdateStatus('Update downloaded! Restarting...');
          setTimeout(() => {
              window.electronAPI.restartApp();
          }, 3000);
      });
    } else {
       setVersion('Local Web version');
    }
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ fontSize: '3rem', color: '#333' }}>IMS Version Test</h1>
      <h2 style={{ fontSize: '2rem', color: '#666' }}>Current Version: {version}</h2>
      <h3 style={{ fontSize: '2rem', color: '#007BFF' }}>Time: {time}</h3>
      {updateStatus && (
        <div style={{ marginTop: '20px', padding: '15px 30px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', border: '1px solid #c3e6cb', fontSize: '1.2rem' }}>
          {updateStatus}
        </div>
      )}
    </div>
  );
}

export default App;
