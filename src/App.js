import React, { useState, useEffect } from 'react';

function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [version, setVersion] = useState('Loading...');
  const [updateStatus, setUpdateStatus] = useState('');
  const [exeUrl, setExeUrl] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    
    if (window.electronAPI) {
      window.electronAPI.getVersion().then(v => setVersion(v));
      window.electronAPI.onUpdateProgress((msg) => setUpdateStatus(msg));
    } else {
       setVersion('Local Web version');
    }
    return () => clearInterval(timer);
  }, []);

  const triggerUpdate = () => {
    if(window.electronAPI && exeUrl) {
       window.electronAPI.downloadAndInstallUpdate(exeUrl);
    } else {
       alert('Enter a URL and ensure electron API is connected!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ fontSize: '3rem', color: '#333' }}>Updater Test Custom</h1>
      <h2 style={{ fontSize: '2rem', color: '#666' }}>Current Version: {version}</h2>
      <h3 style={{ fontSize: '2rem', color: '#007BFF' }}>Time: {time}</h3>
      
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <input 
            type='text' 
            placeholder='Paste new .exe URL here' 
            value={exeUrl} 
            onChange={(e) => setExeUrl(e.target.value)} 
            style={{ width: '400px', padding: '10px' }} 
        />
        <button 
            onClick={triggerUpdate}
            style={{ padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          Test Custom Replace EXE
        </button>
      </div>

      {updateStatus && (
        <div style={{ marginTop: '20px', padding: '15px 30px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', border: '1px solid #c3e6cb', fontSize: '1.2rem' }}>
          {updateStatus}
        </div>
      )}
    </div>
  );
}

export default App;
