import React, { useState, useEffect } from 'react';
import { 
  Activity, Settings, BrainCircuit, HeartPulse, Wind, 
  Thermometer, Droplets, Volume2, Sun, Move, Fingerprint
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [isConnected, setIsConnected] = useState(false);
  
  // ==========================================
  // 🔴 SIMULATED ESP32 DATA STATE
  // ==========================================
  const [sensorData, setSensorData] = useState({
    heartRate: 75,        
    spo2: 98, 
    gsr: 2400,              
    motion: 'Still',
    airQuality: 105,       
    temperature: 28.5,      
    humidity: 60,         
    light: 360,            
    noise: 72.5
  });

  // ==========================================
  // 🟢 REALISTIC MOCK DATA GENERATOR
  // ==========================================
  useEffect(() => {
    // Simulate a successful connection sequence
    setTimeout(() => setIsConnected(true), 1000);

    const interval = setInterval(() => {
      setSensorData(prev => {
        // "Random Walk" logic to make data drift naturally instead of jumping wildly
        const walk = (val, min, max, step) => {
          let newVal = val + (Math.random() * step * 2 - step);
          if (newVal < min) return min;
          if (newVal > max) return max;
          return newVal;
        };

        // Simulating occasional movement
        const isMoving = Math.random() > 0.85;

        // If moving, heart rate and GSR might spike slightly
        const hrStep = isMoving ? 5 : 2;
        const gsrStep = isMoving ? 50 : 15;

        return {
          // Kattankulathur lab baselines applied
          temperature: parseFloat(walk(prev.temperature, 27.0, 30.0, 0.1).toFixed(1)),
          humidity: Math.round(walk(prev.humidity, 55, 70, 1)),
          light: Math.round(walk(prev.light, 340, 400, 4)),
          airQuality: Math.round(walk(prev.airQuality, 95, 120, 2)), // Crowded room AQI
          noise: parseFloat(walk(prev.noise, 65.0, 80.0, 1.5).toFixed(1)), // Conversational dB
          gsr: Math.round(walk(prev.gsr, 2200, 2600, gsrStep)),
          heartRate: Math.round(walk(prev.heartRate, 65, 105, hrStep)),
          spo2: Math.round(walk(prev.spo2, 96, 100, 0.4)), // Keeps it realistically high
          motion: isMoving ? 'Moving' : 'Still'
        };
      });
    }, 2000); // Updates every 2 seconds (smooth, steady pace)

    return () => clearInterval(interval);
  }, []);


  const FUSION_MODULES = [
    {
      id: 1, name: "Cardiac Risk Detection", sensors: "MAX30102 + MPU6050",
      logic: "HR > 100 bpm + Inactive", color: "#f43f5e", 
      isActive: sensorData.heartRate > 100 && sensorData.motion === 'Still'
    },
    {
      id: 2, name: "Environmental Stress", sensors: "GSR + Sound Sensor",
      logic: "GSR > 3000 + Noise > 80", color: "#8b5cf6", 
      isActive: sensorData.gsr > 3000 && sensorData.noise > 80
    },
    {
      id: 3, name: "Respiratory Risk", sensors: "MQ135 + DHT11",
      logic: "AQI > 150 + Humidity > 70%", color: "#06b6d4", 
      isActive: sensorData.airQuality > 150 && sensorData.humidity > 70
    },
    { 
      id: 4, name: "Sedentary State", sensors: "PIR + MPU6050",
      logic: "Prolonged Inactivity", color: "#eab308", 
      isActive: sensorData.motion === 'Still'
    },
    {
      id: 5, name: "Stress-Induced Cardiac", sensors: "GSR + MAX30102",
      logic: "GSR > 3000 + HR > 100", color: "#3b82f6", 
      isActive: sensorData.gsr > 3000 && sensorData.heartRate > 100
    },
    {
      id: 6, name: "Unhealthy Environment", sensors: "GSR + MQ135 + MPU6050",
      logic: "Stress + AQI > 150 + Inactive", color: "#10b981", 
      isActive: sensorData.gsr > 3000 && sensorData.airQuality > 150 && sensorData.motion === 'Still'
    },
    {
      id: 7, name: "Visual / Mental Strain", sensors: "LDR + GSR",
      logic: "Low Light (< 500) + High Stress", color: "#f59e0b", 
      isActive: sensorData.light < 500 && sensorData.gsr > 3000
    }
  ];

  return (
    <div className="app-container">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <Fingerprint size={36} color="#38bdf8" />
          Nexus<span style={{fontWeight: 300, color: '#94a3b8'}}>IoT</span>
        </div>
        <nav style={{marginTop: 30}}>
          <div className={`nav-item ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
            <Activity size={20} /> <span>Live Telemetry</span>
          </div>
          <div className={`nav-item ${activeTab === 'fusion' ? 'active' : ''}`} onClick={() => setActiveTab('fusion')}>
            <BrainCircuit size={20} /> <span>Fusion AI</span>
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> <span>Hardware Settings</span>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1>Command Center</h1>
            <p style={{color: '#94a3b8', fontSize: '15px', marginTop: 8}}>
               Edge Processing Node: {isConnected ? 'Active & Receiving' : 'Awaiting Connection'}
            </p>
          </div>
          
          <div style={{
            display:'flex', alignItems:'center', gap:12, 
            background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            padding:'10px 20px', borderRadius:'12px', 
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            <div className={`pulse-dot ${isConnected ? 'active' : ''}`} 
                 style={{backgroundColor: isConnected ? '#10b981' : '#ef4444', color: isConnected ? '#10b981' : '#ef4444'}}></div>
            <span style={{fontWeight:700, color: isConnected ? '#10b981' : '#ef4444'}}>
              {isConnected ? 'DATA LINK ONLINE' : 'LINK OFFLINE'}
            </span>
          </div>
        </header>

        {activeTab === 'monitoring' && (
          <div className="dashboard-grid">
            
            {/* LEFT COLUMN */}
            <div className="panel">
              <div className="section-title">Raw Telemetry Data</div>
              
              <div className="sensor-grid">
                <div className="sensor-box">
                  <div className="sensor-glow" style={{background: '#f43f5e'}}></div>
                  <HeartPulse className="sensor-icon" size={32} color="#f43f5e" />
                  <div className="sensor-val">{sensorData.heartRate} <span style={{fontSize:14, color:'#94a3b8'}}>BPM</span></div>
                  <div className="sensor-label">Heart Rate</div>
                </div>

                <div className="sensor-box">
                  <div className="sensor-glow" style={{background: '#38bdf8'}}></div>
                  <Activity className="sensor-icon" size={32} color="#38bdf8" />
                  <div className="sensor-val">{sensorData.spo2} <span style={{fontSize:14, color:'#94a3b8'}}>%</span></div>
                  <div className="sensor-label">SpO2 Level</div>
                </div>

                <div className="sensor-box">
                  <div className="sensor-glow" style={{background: '#8b5cf6'}}></div>
                  <Activity className="sensor-icon" size={32} color="#8b5cf6" />
                  <div className="sensor-val">{sensorData.gsr}</div>
                  <div className="sensor-label">GSR Resistance</div>
                </div>

                <div className="sensor-box">
                  <div className="sensor-glow" style={{background: '#eab308'}}></div>
                  <Move className="sensor-icon" size={32} color="#eab308" />
                  <div className="sensor-val" style={{fontSize:20, marginTop:15, marginBottom:8}}>{sensorData.motion}</div>
                  <div className="sensor-label">Kinematic State</div>
                </div>

                <div className="sensor-box">
                  <div className="sensor-glow" style={{background: '#06b6d4'}}></div>
                  <Wind className="sensor-icon" size={32} color="#06b6d4" />
                  <div className="sensor-val">{sensorData.airQuality}</div>
                  <div className="sensor-label">AQI Index</div>
                </div>

                <div className="sensor-box">
                  <div className="sensor-glow" style={{background: '#f97316'}}></div>
                  <Thermometer className="sensor-icon" size={32} color="#f97316" />
                  <div className="sensor-val">{sensorData.temperature}°</div>
                  <div className="sensor-label">Temperature</div>
                </div>

                <div className="sensor-box">
                  <div className="sensor-glow" style={{background: '#3b82f6'}}></div>
                  <Droplets className="sensor-icon" size={32} color="#3b82f6" />
                  <div className="sensor-val">{sensorData.humidity}%</div>
                  <div className="sensor-label">Humidity</div>
                </div>

                <div className="sensor-box">
                  <div className="sensor-glow" style={{background: '#facc15'}}></div>
                  <Sun className="sensor-icon" size={32} color="#facc15" />
                  <div className="sensor-val">{sensorData.light}</div>
                  <div className="sensor-label">Lux Level</div>
                </div>

                <div className="sensor-box">
                  <div className="sensor-glow" style={{background: '#a855f7'}}></div>
                  <Volume2 className="sensor-icon" size={32} color="#a855f7" />
                  <div className="sensor-val">{sensorData.noise} <span style={{fontSize:14, color:'#94a3b8'}}>dB</span></div>
                  <div className="sensor-label">Acoustic Noise</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="panel" style={{height: '100%', overflowY: 'auto', maxHeight: '820px'}}>
              <div className="section-title">
                <span>Fusion Diagnostics</span>
                <span style={{fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', color: '#fff'}}>
                  7 PROTOCOLS LOADED
                </span>
              </div>
              
              <p style={{fontSize: 14, color: '#94a3b8', marginBottom: 25, lineHeight: 1.6}}>
                Engine actively correlating multi-sensor telemetry to detect anomalous patterns.
              </p>

              {FUSION_MODULES.map((module) => (
                <div 
                  key={module.id} 
                  className={`fusion-item ${module.isActive ? 'active' : ''}`}
                  style={{
                    borderLeft: `4px solid ${module.isActive ? module.color : '#334155'}`,
                    boxShadow: module.isActive ? `0 0 20px ${module.color}20, inset 0 0 10px ${module.color}10` : 'none',
                    borderColor: module.isActive ? `${module.color}50` : 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                    <div style={{fontWeight: 700, color: module.isActive ? '#fff' : '#cbd5e1', fontSize: 16, display: 'flex', alignItems: 'center'}}>
                      {module.isActive && <span className="pulse-dot active" style={{backgroundColor: module.color, color: module.color}}></span>}
                      {module.name}
                    </div>
                    <div className="badge" style={{
                      background: module.isActive ? module.color : '#334155',
                      color: module.isActive ? '#000' : '#94a3b8',
                      boxShadow: module.isActive ? `0 0 10px ${module.color}` : 'none'
                    }}>
                      {module.isActive ? 'CRITICAL DETECT' : 'STANDBY'}
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: 12, color: '#cbd5e1', fontFamily: 'monospace', 
                    background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px', marginBottom: 8
                  }}>
                    <span style={{color: module.color}}>► LOGIC:</span> {module.logic}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}