import React, { useState, useEffect } from "react";

export default function CurrentTotalEventPageMobileTest({ t, setCurrentPage }) {
  const [debugInfo, setDebugInfo] = useState("Component loading...");
  const [screenInfo, setScreenInfo] = useState({});
  const [testData, setTestData] = useState([]);

  // Debug function
  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${message}`);
    console.log(`[DEBUG] ${message}`);
  };

  useEffect(() => {
    addDebugInfo("Component mounted");
    
    // Get screen info
    const screenData = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      userAgent: navigator.userAgent,
      isMobile: window.innerWidth < 768
    };
    
    setScreenInfo(screenData);
    addDebugInfo(`Screen: ${screenData.width}x${screenData.height}, Mobile: ${screenData.isMobile}`);
    
    // Set test data
    const testResults = [
      {
        id: 1,
        name: "Max Mustermann",
        points: 3456,
        rank: "Clanführer"
      },
      {
        id: 2,
        name: "Erika Musterfrau",
        points: 2800,
        rank: "Offizier"
      },
      {
        id: 3,
        name: "Hans Beispiel",
        points: 4200,
        rank: "Mitglied"
      }
    ];
    
    setTestData(testResults);
    addDebugInfo(`Test data loaded: ${testResults.length} entries`);
    
    // Test mobile detection
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      addDebugInfo(`Mobile check: ${mobile}, Width: ${window.innerWidth}`);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      addDebugInfo("Component unmounting");
    };
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h1 style={{
          margin: '0 0 20px 0',
          fontSize: '24px',
          color: '#333'
        }}>
          Mobile Test - Event Results
        </h1>
        
        <button 
          onClick={() => setCurrentPage('navigation')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Zurück zur Navigation
        </button>
      </div>

      {/* Screen Info */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333' }}>
          Screen Info
        </h2>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <div><strong>Width:</strong> {screenInfo.width}px</div>
          <div><strong>Height:</strong> {screenInfo.height}px</div>
          <div><strong>Device Pixel Ratio:</strong> {screenInfo.devicePixelRatio}</div>
          <div><strong>Mobile:</strong> {screenInfo.isMobile ? 'Yes' : 'No'}</div>
          <div><strong>User Agent:</strong> {screenInfo.userAgent}</div>
        </div>
      </div>

      {/* Test Data */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333' }}>
          Test Data ({testData.length} entries)
        </h2>
        
        {testData.map((item) => (
          <div key={item.id} style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '10px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {item.name}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <span style={{ marginRight: '15px' }}>
                <strong>Punkte:</strong> {item.points}
              </span>
              <span>
                <strong>Rang:</strong> {item.rank}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Debug Info */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333' }}>
          Debug Info
        </h2>
        <pre style={{
          backgroundColor: '#f8f9fa',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#333',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {debugInfo}
        </pre>
      </div>
    </div>
  );
}
