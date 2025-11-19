import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.onresize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const particles = [];
    const COUNT = 400;
    const mouse = { x: null, y: null, radius: 150 };

    canvas.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    canvas.addEventListener("mouseleave", () => {
      mouse.x = null;
      mouse.y = null;
    });

    function spawn() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 1400 + 100,
        size: Math.random() * 2.5 + 0.5,
        hue: Math.random() * 60 + 180,
        alpha: Math.random() * 0.7 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      };
    }

    for (let i = 0; i < COUNT; i++) {
      particles.push(spawn());
    }

    function animate() {
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
      gradient.addColorStop(0, "rgba(10, 20, 40, 1)");
      gradient.addColorStop(0.5, "rgba(5, 10, 25, 1)");
      gradient.addColorStop(1, "rgba(0, 0, 10, 1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(100, 150, 255, 0.1)";
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.globalAlpha = (1 - dist / 120) * 0.2;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        p.twinklePhase += p.twinkleSpeed;
        const twinkle = Math.sin(p.twinklePhase) * 0.3 + 0.7;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force * 5;
            p.y += Math.sin(angle) * force * 5;
            p.alpha = Math.min(1, p.alpha + force * 0.5);
          } else {
            p.alpha = Math.max(0.3, p.alpha - 0.02);
          }
        }

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.alpha * twinkle})`);
        gradient.addColorStop(0.4, `hsla(${p.hue}, 100%, 50%, ${p.alpha * twinkle * 0.5})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 100%, 30%, 0)`);

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${p.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas}></canvas>
      
      <div style={styles.loginContainer}>
        <div style={styles.glassCard}>
          <div style={styles.header}>
            <h1 style={styles.logo}>BuildBuddy</h1>
            <p style={styles.tagline}>Connect. Collaborate. Create.</p>
          </div>

          <div style={styles.tabs}>
            <button
              style={isLogin ? {...styles.tab, ...styles.tabActive} : styles.tab}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              style={!isLogin ? {...styles.tab, ...styles.tabActive} : styles.tab}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form style={styles.form}>
            {!isLogin && (
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Full Name"
                  style={styles.input}
                />
              </div>
            )}
            
            <div style={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email"
                style={styles.input}
              />
            </div>

            {!isLogin && (
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="College Name"
                  style={styles.input}
                />
              </div>
            )}

            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                style={styles.input}
              />
            </div>

            {!isLogin && (
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  style={styles.input}
                />
              </div>
            )}

            <button type="submit" style={styles.submitBtn}>
              {isLogin ? "Login" : "Create Account"}
            </button>
          </form>

          {isLogin && (
            <div style={styles.footer}>
              <a href="#" style={styles.link}>Forgot Password?</a>
            </div>
          )}

          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🚀</span>
              <span style={styles.featureText}>List Projects</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🤝</span>
              <span style={styles.featureText}>Find Teammates</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>💡</span>
              <span style={styles.featureText}>Share Ideas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    margin: 0,
    padding: 0,
  },
  canvas: {
    display: "block",
    position: "absolute",
    top: 0,
    left: 0,
  },
  loginContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 10,
  },
  glassCard: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "40px",
    width: "400px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logo: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
    marginBottom: "8px",
  },
  tagline: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.9rem",
    margin: 0,
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "5px",
  },
  tab: {
    flex: 1,
    padding: "12px",
    border: "none",
    background: "transparent",
    color: "rgba(255, 255, 255, 0.6)",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  tabActive: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "14px 18px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s ease",
  },
  submitBtn: {
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    transition: "transform 0.2s ease",
  },
  footer: {
    textAlign: "center",
    marginTop: "20px",
  },
  link: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
  features: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "30px",
    paddingTop: "25px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  feature: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  featureIcon: {
    fontSize: "1.5rem",
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "0.8rem",
  },
};