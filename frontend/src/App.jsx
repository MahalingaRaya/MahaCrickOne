import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState("Not tested yet")

  // This function tests your live Render backend connection
  const testConnection = async () => {
    setBackendStatus("Connecting to Render...")
    try {
      const response = await fetch('https://mahacrickone.onrender.com/')
      // Even a 404 Whitelabel error means the server responded!
      if (response.status === 404 || response.ok) {
        setBackendStatus("Success! Frontend connected to Render backend ✅")
      } else {
        setBackendStatus(`Server responded with status: ${response.status}`)
      }
    } catch (error) {
      setBackendStatus("Connection failed. Check CORS configuration on backend ❌")
    }
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>MahaCrickOne UI</h1>
          <p>
            Testing full-stack cloud deployment.
          </p>
        </div>

        {/* Connection Test Section */}
        <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <button type="button" onClick={testConnection} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Test Backend Connection
          </button>
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Status: {backendStatus}</p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
          </ul>
        </div>
      </section>
      <section id="spacer"></section>
    </>
  )
}

export default App
