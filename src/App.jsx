import { useState } from 'react';
import './App.css';

const API_BASE = 
  import.meta.env.VITE_API_URL ||
  window.location.origin.replace(/:id$/, ":5000");

function App() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form state
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [password, setPassword] = useState("");
  
  // Message state
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" or "success"
  
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          fullName,
          email,
          collegeName,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Signup successful! Please login.");
        setMessageType("success");
        // Clear form
        setStudentId("");
        setFullName("");
        setEmail("");
        setCollegeName("");
        setPassword("");
        // Switch to login
        setTimeout(() => setIsLogin(true), 2000);
      } else {
        setMessage(data.error || "Signup failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error connecting to server");
      setMessageType("error");
      console.error('Signup error:', error);
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Login successful!");
        setMessageType("success");
        // Store token if needed
        localStorage.setItem('token', data.token);
      } else {
        setMessage(data.error || "Login failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error connecting to server");
      setMessageType("error");
      console.error('Login error:', error);
    }
  };
  
  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="logo-section">
          <div className="logo">B</div>
          <h1 className="app-title">BuildBuddy</h1>
          <p className="app-subtitle">Connect • Collaborate • Create</p>
        </div>
        
        {message && (
          <div className={messageType === "error" ? "error-message" : "success-message"}>
            {message}
          </div>
        )}
        
        <div className="form-container">
          {isLogin ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="studentId">Student ID</label>
                <input
                  id="studentId"
                  type="text"
                  className="form-input"
                  placeholder="Roll / ID No."
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="submit-button">
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="signupStudentId">Student ID</label>
                <input
                  id="signupStudentId"
                  type="text"
                  className="form-input"
                  placeholder="Roll / ID No."
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="collegeName">College Name</label>
                <input
                  id="collegeName"
                  type="text"
                  className="form-input"
                  placeholder="College Name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="signupPassword">Password</label>
                <input
                  id="signupPassword"
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="submit-button">
                Sign Up
              </button>
            </form>
          )}
          
          <div className="toggle-form">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <span className="toggle-link" onClick={() => setIsLogin(false)}>
                  Sign Up
                </span>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <span className="toggle-link" onClick={() => setIsLogin(true)}>
                  Login
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;