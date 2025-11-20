import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  window.location.origin.replace(/:\d+$/, ":5000");

function App() {
  const canvasRef = useRef(null);
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

  // --- BUBBLES BACKGROUND EFFECT ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.onresize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const particles = [];
    const COUNT = 90;
    function spawn() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        alpha: Math.random() * 0.55 + 0.3 // from .3 to .85
      };
    }
    for (let i = 0; i < COUNT; i++) particles.push(spawn());

    function animate() {
      // Soft gradient background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#e7f0ff");
      grad.addColorStop(1, "#c7d7f7");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Ambient blue aurora glow
      ctx.save();
      ctx.filter = "blur(80px)";
      ctx.fillStyle = "rgba(147, 197, 253, 0.22)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "#71a7fa";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId, fullName, email, collegeName, password
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Signup successful! Please login.");
        setMessageType("success");
        setStudentId(""); setFullName(""); setEmail(""); setCollegeName(""); setPassword("");
        setTimeout(() => setIsLogin(true), 2000);
      } else {
        setMessage(data.error || "Signup failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error connecting to server");
      setMessageType("error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId, password
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Login successful!");
        setMessageType("success");
        localStorage.setItem('token', data.token);
      } else {
        setMessage(data.error || "Login failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error connecting to server");
      setMessageType("error");
    }
  };

  return (
    <div className="app-container" style={{position: "relative"}}>
      <canvas ref={canvasRef} className="bubbles-bg" />
      <motion.div
        className="auth-card"
        style={{zIndex: 1, position: "relative"}}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5, type: "spring" }}
      >
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
                  id="studentId" type="text" className="form-input"
                  placeholder="Roll / ID No."
                  value={studentId} onChange={e => setStudentId(e.target.value)} required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password" type="password" className="form-input"
                  placeholder="Password"
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
              </div>
              <button type="submit" className="submit-button">Login</button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName" type="text" className="form-input"
                  placeholder="Full Name"
                  value={fullName} onChange={e => setFullName(e.target.value)} required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="signupStudentId">Student ID</label>
                <input
                  id="signupStudentId" type="text" className="form-input"
                  placeholder="Roll / ID No."
                  value={studentId} onChange={e => setStudentId(e.target.value)} required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email" type="email" className="form-input"
                  placeholder="Email"
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="collegeName">College Name</label>
                <input
                  id="collegeName" type="text" className="form-input"
                  placeholder="College Name"
                  value={collegeName} onChange={e => setCollegeName(e.target.value)} required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="signupPassword">Password</label>
                <input
                  id="signupPassword" type="password" className="form-input"
                  placeholder="Password"
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
              </div>
              <button type="submit" className="submit-button">Sign Up</button>
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
      </motion.div>
    </div>
  );
}

export default App;
