import React from 'react';

function SimpleApp() {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1>🎉 React App is Working!</h1>
      <h2>Retail Forecast Platform</h2>
      <p>Modern AI-powered sales forecasting for retail stores</p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '12px',
        margin: '20px auto',
        maxWidth: '600px'
      }}>
        <h3>✅ If you can see this message, React is working correctly!</h3>
        <p>The issue was likely with component imports or routing.</p>
      </div>
    </div>
  );
}

export default SimpleApp;