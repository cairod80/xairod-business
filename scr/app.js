import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── CONFIG ────────────────────────────────────────────────────────────────────
const SUPA_URL  = process.env.REACT_APP_SUPABASE_URL;
const SUPA_KEY  = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase  = createClient(SUPA_URL, SUPA_KEY);

const COMMISSION_RATES = {
  agency: 12, housing: 10, health: 15,
  travel: 12, food: 10, transport: 17, default: 12
};

const CATEGORIES = [
  "Agency / Admission","Housing","Health","Travel","Food & Catering",
  "Transport","Beauty","Finance","Jobs","Markets","Education","Other"
];

const CATEGORY_MAP = {
  "Agency / Admission":"agency","Housing":"housing","Health":"health",
  "Travel":"travel","Food & Catering":"food","Transport":"transport",
  "Beauty":"beauty","Finance":"finance","Jobs":"jobs",
  "Markets":"markets","Education":"school","Other":"other"
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;0,9..144,900&family=Outfit:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Outfit',sans-serif;background:#0D0A05;color:#FEFCF7;min-height:100vh;}
input,textarea,select{font-family:'Outfit',sans-serif;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
.sidebar{width:220px;background:#141008;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:100;}
.main-wrap{margin-left:220px;min-height:100vh;background:#0D0A05;}
.topbar{background:#141008;border-bottom:1px solid rgba(255,255,255,0.06);padding:0 28px;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
.content{padding:24px 28px 48px;}
.card{background:#141008;border-radius:14px;border:1px solid rgba(255,255,255,0.07);padding:20px;}
.card-sm{background:#141008;border-radius:12px;border:1px solid rgba(255,255,255,0.07);padding:16px;}
.input{width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#FEFCF7;font-family:'Outfit',sans-serif;font-size:13px;outline:none;transition:border-color 0.15s;}
.input:focus{border-color:#4DD994;}
.input::placeholder{color:rgba(255,255,255,0.2);}
select.input option{background:#1a1510;color:#FEFCF7;}
.label{font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);margin-bottom:6px;display:block;text-transform:uppercase;letter-spacing:0.8px;}
.btn-primary{background:#4DD994;color:#03311A;border:none;padding:12px 20px;border-radius:10px;font-family:'Outfit',sans-serif;font-weight:800;font-size:13px;cursor:pointer;transition:opacity 0.15s;}
.btn-primary:hover{opacity:0.88;}
.btn-primary:disabled{opacity:0.4;cursor:default;}
.btn-outline{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1);padding:10px 18px;border-radius:10px;font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;cursor:pointer;}
.btn-red{background:rgba(192,57,43,0.15);color:#E74C3C;border:1px solid rgba(192,57,43,0.25);padding:8px 14px;border-radius:8px;font-family:'Outfit',sans-serif;font-weight:700;font-size:12px;cursor:pointer;}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;margin-bottom:2px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);transition:all 0.15s;}
.nav-item:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.8);}
.nav-item.active{background:rgba(77,217,148,0.12);color:#4DD994;font-weight:700;}
.badge-pill{padding:3px 9px;border-radius:20px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;}
.badge-new{background:rgba(93,173,226,0.2);color:#5DADE2;}
.badge-quoted{background:rgba(245,197,80,0.2);color:#F5C550;}
.badge-accepted{background:rgba(142,68,173,0.2);color:#BB8FCE;}
.badge-progress{background:rgba(200,134,26,0.2);color:#F5C550;}
.badge-completed{background:rgba(77,217,148,0.2);color:#4DD994;}
.badge-cancelled{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.3);}
.stat-card{background:#141008;border-radius:12px;border:1px solid rgba(255,255,255,0.07);padding:18px;position:relative;overflow:hidden;}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.stat-green::before{background:linear-gradient(90deg,#0A6B3E,#4DD994);}
.stat-gold::before{background:linear-gradient(90deg,#C8861A,#F5C550);}
.stat-blue::before{background:linear-gradient(90deg,#2471A3,#5DADE2);}
.stat-purple::before{background:linear-gradient(90deg,#8E44AD,#BB8FCE);}
.table-wrap{background:#141008;border-radius:14px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;}
table{width:100%;border-collapse:collapse;}
th{padding:10px 16px;text-align:left;font-size:9px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.05);}
td{padding:13px 16px;font-size:12px;color:rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.04);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(255,255,255,0.02);}
.td-main{font-weight:700;color:#FEFCF7;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
.modal{background:#1a1510;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;}
.modal-title{font-family:'Fraunces',serif;font-size:18px;font-weight:800;color:#FEFCF7;margin-bottom:16px;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.form-group{margin-bottom:14px;}
.alert{padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600;margin-bottom:12px;}
.alert-error{background:rgba(192,57,43,0.12);border:1px solid rgba(192,57,43,0.25);color:#E74C3C;}
.alert-success{background:rgba(77,217,148,0.1);border:1px solid rgba(77,217,148,0.2);color:#4DD994;}
.alert-warn{background:rgba(200,134,26,0.1);border:1px solid rgba(200,134,26,0.2);color:#F5C550;}
.divider{height:1px;background:rgba(255,255,255,0.06);margin:16px 0;}
.empty-state{text-align:center;padding:48px 20px;color:rgba(255,255,255,0.3);}
.empty-icon{font-size:48px;margin-bottom:14px;}
.empty-title{font-family:'Fraunces',serif;font-size:18px;font-weight:800;color:rgba(255,255,255,0.5);margin-bottom:6px;}
.empty-sub{font-size:13px;line-height:1.6;}
.request-card{background:#141008;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;margin-bottom:10px;transition:border-color 0.15s;}
.request-card:hover{border-color:rgba(77,217,148,0.25);}
.request-card.new-lead{border-left:3px solid #5DADE2;}
.ref-tag{font-family:monospace;font-size:10px;font-weight:700;color:#4DD994;background:rgba(77,217,148,0.1);padding:3px 8px;border-radius:4px;display:inline-block;}
.progress-bar{height:3px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:6px;}
.progress-fill{height:3px;border-radius:2px;background:#4DD994;}
`;

// ── AUTH SCREENS ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [view, setView] = useState("login"); // login | register | forgot
  const [step, setStep] = useState(1); // register steps 1-3
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Login fields
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [bizName, setBizName]   = useState("");
  const [bizCat, setBizCat]     = useState("");
  const [bizCity, setBizCity]   = useState("Cairo, Egypt");
  const [bizPhone, setBizPhone] = useState("");
  const [bizDesc, setBizDesc]   = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPwd, setRegPwd]     = useState("");
  const [regPwd2, setRegPwd2]   = useState("");
  const [agreed, setAgreed]     = useState(false);

  const login = async () => {
    if (!email || !password) { setErr("Enter your email and password."); return; }
    setLoading(true); setErr("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErr("Incorrect email or password."); setLoading(false); return; }
    // Check business account exists
    const { data: biz } = await supabase.from("business_accounts")
      .select("*").eq("user_id", data.user.id).single();
    if (!biz) { setErr("No business account found for this email."); setLoading(false); return; }
    onAuth(data.user, biz);
    setLoading(false);
  };

  const register = async () => {
    if (!bizName || !bizCat || !ownerName || !regEmail || !regPwd) {
      setErr("Please fill all required fields."); return;
    }
    if (regPwd !== regPwd2) { setErr("Passwords do not match."); return; }
    if (regPwd.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (!agreed) { setErr("Please accept the Partner Agreement."); return; }
    setLoading(true); setErr("");
    // Create auth user
    const { data, error } = await supabase.auth.signUp({ email: regEmail, password: regPwd });
    if (error) { setErr(error.message); setLoading(false); return; }
    // Create profile
    await supabase.from("profiles").upsert({
      id: data.user.id, name: ownerName, email: regEmail, role: "Business Owner"
    });
    // Create business account
    const { data: biz, error: bizErr } = await supabase.from("business_accounts").insert({
      user_id: data.user.id,
      name: bizName,
      category: CATEGORY_MAP[bizCat] || "other",
      category_label: bizCat,
      city: bizCity,
      phone: bizPhone,
      description: bizDesc,
      owner_name: ownerName,
      email: regEmail,
      status: "pending", // admin must approve
      commission_rate: COMMISSION_RATES[CATEGORY_MAP[bizCat]] || 12,
    }).select().single();
    if (bizErr) { setErr("Failed to create business account. " + bizErr.message); setLoading(false); return; }
    setSuccess("Account created! Your listing is under review. You'll receive an email once approved.");
    setLoading(false);
  };

  const forgotPassword = async () => {
    if (!email) { setErr("Enter your email address."); return; }
    setLoading(true); setErr("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://business.xairod.com/reset"
    });
    if (error) { setErr(error.message); } else {
      setSuccess("Password reset email sent. Check your inbox.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#0D0A05" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 900, marginBottom: 4 }}>
            <span style={{ color: "#4DD994" }}>X</span><span>airod</span><span style={{ color: "#C8861A" }}>.</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Business Partner Portal</div>
        </div>

        <div style={{ background: "#141008", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
          {/* Tabs */}
          {view !== "forgot" && (
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 4, marginBottom: 24 }}>
              {["login", "register"].map(v => (
                <button key={v} onClick={() => { setView(v); setErr(""); setSuccess(""); setStep(1); }}
                  style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: view === v ? "#4DD994" : "transparent", color: view === v ? "#03311A" : "rgba(255,255,255,0.4)", fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>
                  {v === "login" ? "Sign In" : "Register Business"}
                </button>
              ))}
            </div>
          )}

          {err && <div className="alert alert-error">{err}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* LOGIN */}
          {view === "login" && !success && (
            <>
              <div className="form-group">
                <label className="label">Email Address</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@yourbusiness.com"/>
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" onKeyDown={e => e.key === "Enter" && login()}/>
              </div>
              <button className="btn-primary" onClick={login} disabled={loading} style={{ width: "100%", marginBottom: 12 }}>
                {loading ? "Signing in…" : "Sign In →"}
              </button>
              <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                <button onClick={() => { setView("forgot"); setErr(""); }} style={{ background: "none", border: "none", color: "#4DD994", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 11 }}>
                  Forgot password?
                </button>
              </div>
            </>
          )}

          {/* FORGOT */}
          {view === "forgot" && (
            <>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Reset Password</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 18, lineHeight: 1.6 }}>Enter your business email and we'll send a reset link.</div>
              <div className="form-group">
                <label className="label">Email Address</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@yourbusiness.com"/>
              </div>
              <button className="btn-primary" onClick={forgotPassword} disabled={loading} style={{ width: "100%", marginBottom: 12 }}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <button onClick={() => setView("login")} style={{ width: "100%", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 12 }}>
                ← Back to Sign In
              </button>
            </>
          )}

          {/* REGISTER */}
          {view === "register" && !success && (
            <>
              {/* Step indicator */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
                {[1, 2, 3].map((n, i) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < 2 ? 1 : "initial" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: step > n ? "#4DD994" : step === n ? "#C0392B" : "rgba(255,255,255,0.08)", color: step > n ? "#03311A" : "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {step > n ? "✓" : n}
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: 2, background: step > n ? "#4DD994" : "rgba(255,255,255,0.08)", borderRadius: 2 }}/>}
                  </div>
                ))}
              </div>

              {/* Step 1 — Business Info */}
              {step === 1 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Business Information</div>
                  <div className="form-group">
                    <label className="label">Business Name *</label>
                    <input className="input" value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Universal Prime Agency"/>
                  </div>
                  <div className="form-group">
                    <label className="label">Business Category *</label>
                    <select className="input" value={bizCat} onChange={e => setBizCat(e.target.value)}>
                      <option value="">Select category…</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">City</label>
                      <input className="input" value={bizCity} onChange={e => setBizCity(e.target.value)} placeholder="Cairo, Egypt"/>
                    </div>
                    <div className="form-group">
                      <label className="label">WhatsApp Number</label>
                      <input className="input" value={bizPhone} onChange={e => setBizPhone(e.target.value)} placeholder="+20 100 000 0000"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Business Description</label>
                    <textarea className="input" rows={3} value={bizDesc} onChange={e => setBizDesc(e.target.value)} placeholder="What services do you offer? Who do you serve?"/>
                  </div>
                  <button className="btn-primary" onClick={() => { if (!bizName || !bizCat) { setErr("Business name and category are required."); return; } setErr(""); setStep(2); }} style={{ width: "100%" }}>
                    Continue → Step 2
                  </button>
                </>
              )}

              {/* Step 2 — Account Setup */}
              {step === 2 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Account Setup</div>
                  <div className="form-group">
                    <label className="label">Your Full Name *</label>
                    <input className="input" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Name of the account manager"/>
                  </div>
                  <div className="form-group">
                    <label className="label">Business Email *</label>
                    <input className="input" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="hello@yourbusiness.com"/>
                  </div>
                  <div className="form-group">
                    <label className="label">Create Password *</label>
                    <input className="input" type="password" value={regPwd} onChange={e => setRegPwd(e.target.value)} placeholder="Minimum 8 characters"/>
                  </div>
                  <div className="form-group">
                    <label className="label">Confirm Password *</label>
                    <input className="input" type="password" value={regPwd2} onChange={e => setRegPwd2(e.target.value)} placeholder="Repeat password"/>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
                    <button onClick={() => setAgreed(!agreed)} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${agreed ? "#4DD994" : "rgba(255,255,255,0.2)"}`, background: agreed ? "#4DD994" : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                      {agreed ? "✓" : ""}
                    </button>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                      I agree to the <span style={{ color: "#4DD994", cursor: "pointer" }}>Xairod Partner Agreement</span> including the commission structure (10–17% per completed transaction based on category).
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-outline" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
                    <button className="btn-primary" onClick={register} disabled={loading} style={{ flex: 2 }}>
                      {loading ? "Creating account…" : "Create Account →"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Info strip */}
        <div style={{ marginTop: 20, display: "flex", gap: 16, justifyContent: "center" }}>
          {["🔒 Secure login", "✓ Xairod verified", "💬 WhatsApp connected"].map(t => (
            <div key={t} style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, biz, newLeads }) {
  const nav = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "requests",  icon: "📥", label: "Requests", badge: newLeads },
    { id: "bookings",  icon: "✅", label: "Bookings" },
    { id: "payouts",   icon: "💰", label: "Payouts" },
    { id: "listing",   icon: "🏢", label: "My Listing" },
    { id: "settings",  icon: "⚙️", label: "Settings" },
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 900, marginBottom: 2 }}>
          <span style={{ color: "#4DD994" }}>X</span>airod<span style={{ color: "#C8861A" }}>.</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, fontFamily: "'Outfit',sans-serif", marginLeft: 4 }}>Business</span>
        </div>
      </div>

      {/* Biz badge */}
      <div style={{ margin: "12px 12px 0", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 12px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#FEFCF7", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biz?.name || "Your Business"}</div>
        <div style={{ fontSize: 9, color: biz?.status === "active" ? "#4DD994" : "#F5C550", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
          <span>{biz?.status === "active" ? "◉" : "○"}</span>
          {biz?.status === "active" ? "Active · " + (biz?.category_label || biz?.category || "") : "Pending Review"}
        </div>
        {biz?.status === "active" && (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>
            Commission: {biz?.commission_rate || 12}% per deal
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ padding: "12px 10px", flex: 1 }}>
        {nav.map(item => (
          <div key={item.id} onClick={() => setPage(item.id)}
            className={`nav-item ${page === item.id ? "active" : ""}`}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge > 0 && (
              <span style={{ background: "#C0392B", color: "white", fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 10 }}>{item.badge}</span>
            )}
          </div>
        ))}
      </div>

      {/* Status indicator */}
      {biz?.status === "pending" && (
        <div style={{ margin: "0 12px 12px", background: "rgba(200,134,26,0.1)", border: "1px solid rgba(200,134,26,0.2)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#F5C550", marginBottom: 3 }}>⏳ Under Review</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>Xairod team will activate your listing within 24 hours.</div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0A6B3E", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
            {(biz?.owner_name || "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#FEFCF7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biz?.owner_name || "Account Manager"}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{biz?.email || ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ biz, requests, bookings, setPage }) {
  const totalReqs    = requests.length;
  const newReqs      = requests.filter(r => r.status === "open").length;
  const converted    = bookings.filter(b => b.status === "completed").length;
  const inProgress   = bookings.filter(b => b.status === "in_progress").length;
  const totalEarned  = bookings.filter(b => b.status === "completed")
    .reduce((s, b) => s + (b.payout_amount || 0), 0);
  const convRate     = totalReqs > 0 ? Math.round((converted / totalReqs) * 100) : 0;
  const recentReqs   = requests.slice(0, 5);

  const stats = [
    { label: "Total Requests", value: totalReqs, sub: `${newReqs} new`, cls: "stat-blue", icon: "📥" },
    { label: "Converted", value: converted, sub: `${convRate}% rate`, cls: "stat-green", icon: "✅" },
    { label: "In Progress", value: inProgress, sub: "active deals", cls: "stat-gold", icon: "⚡" },
    { label: "Total Earned", value: `${totalEarned.toLocaleString()} EGP`, sub: "after commission", cls: "stat-purple", icon: "💰" },
  ];

  return (
    <div className="content">
      {/* Pending warning */}
      {biz?.status === "pending" && (
        <div className="alert alert-warn" style={{ marginBottom: 20 }}>
          ⏳ Your business is under review by the Xairod team. You can explore the dashboard but will start receiving requests once approved.
        </div>
      )}

      {/* Alert: new leads */}
      {newReqs > 0 && (
        <div style={{ background: "rgba(200,134,26,0.1)", border: "1px solid rgba(200,134,26,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#F5C550", fontWeight: 600 }}>
            ⚡ {newReqs} new request{newReqs > 1 ? "s" : ""} waiting — respond within 24h to maintain your ranking
          </div>
          <button onClick={() => setPage("requests")} style={{ background: "#C8861A", color: "white", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
            View Requests
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div style={{ position: "absolute", top: 16, right: 16, fontSize: 20, opacity: 0.3 }}>{s.icon}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 900, color: "#FEFCF7", marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline + Subscription */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Pipeline */}
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 800, color: "#FEFCF7", marginBottom: 14 }}>Lead Pipeline</div>
          {[
            { label: "New Requests", status: "open", color: "#5DADE2" },
            { label: "Quoted", status: "quoted", color: "#F5C550" },
            { label: "Accepted", status: "accepted", color: "#BB8FCE" },
            { label: "In Progress", status: "in_progress", color: "#C8861A" },
            { label: "Completed ✓", status: "completed", color: "#4DD994" },
          ].map(stage => {
            const allItems = [...requests, ...bookings];
            const count = allItems.filter(i => i.status === stage.status).length;
            const maxCount = Math.max(...[
              requests.filter(r => r.status === "open").length,
              requests.filter(r => r.status === "quoted").length,
              bookings.filter(b => b.status === "accepted").length,
              bookings.filter(b => b.status === "in_progress").length,
              bookings.filter(b => b.status === "completed").length,
            ], 1);
            return (
              <div key={stage.status} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, flexShrink: 0 }}/>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", flex: 1 }}>{stage.label}</div>
                <div style={{ flex: 2, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{ height: 4, borderRadius: 2, background: stage.color, width: `${Math.max((count / maxCount) * 100, 2)}%`, transition: "width 0.5s" }}/>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FEFCF7", width: 22, textAlign: "right" }}>{count}</div>
              </div>
            );
          })}
          {totalReqs > 0 && (
            <div style={{ marginTop: 10, padding: "9px 12px", background: "rgba(77,217,148,0.07)", borderRadius: 8, border: "1px solid rgba(77,217,148,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Conversion Rate</div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 900, color: "#4DD994" }}>{convRate}%</div>
            </div>
          )}
        </div>

        {/* Commission info */}
        <div style={{ background: "linear-gradient(135deg,#0A6B3E,#03311A)", borderRadius: 14, border: "1px solid rgba(77,217,148,0.15)", padding: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(77,217,148,0.08)" }}/>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#4DD994", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>● How You Earn</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 900, color: "#FEFCF7", marginBottom: 4 }}>Commission Model</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 14, lineHeight: 1.6 }}>
            Free to list. You only pay Xairod when a deal completes.
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Your category rate</div>
              <div style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Fraunces',serif", color: "#4DD994" }}>{biz?.commission_rate || 12}%</div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
              Example: 3,000 EGP deal → Xairod takes {biz?.commission_rate || 12}% = {Math.round(3000 * ((biz?.commission_rate || 12) / 100))} EGP → You receive {3000 - Math.round(3000 * ((biz?.commission_rate || 12) / 100))} EGP
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {["✓ List for free — no monthly fee", "✓ Receive unlimited requests", "✓ Pay only when deal completes", "✓ Payouts processed every Friday"].map(f => (
              <div key={f} style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", display: "flex", gap: 6 }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent requests table */}
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Recent Requests</div>
        {totalReqs > 5 && <button onClick={() => setPage("requests")} style={{ background: "none", border: "none", color: "#4DD994", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>View all →</button>}
      </div>

      {recentReqs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>No requests yet</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{biz?.status === "pending" ? "Requests will appear once your listing is approved." : "Once users connect with you on Xairod, requests appear here."}</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Reference</th><th>User Need</th><th>Budget</th><th>Received</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {recentReqs.map(r => (
                <tr key={r.id}>
                  <td><span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: "#4DD994" }}>{r.ref}</span></td>
                  <td className="td-main" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.what_i_need}</td>
                  <td>{r.budget || "—"}</td>
                  <td style={{ fontSize: 11 }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td><span className={`badge-pill badge-${r.status === "open" ? "new" : r.status}`}>{r.status}</span></td>
                  <td>
                    {r.status === "open" && (
                      <button onClick={() => setPage("requests")} className="btn-primary" style={{ padding: "5px 12px", fontSize: 11 }}>Respond</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── REQUESTS SCREEN ───────────────────────────────────────────────────────────
function RequestsScreen({ biz, requests, onRequestUpdate }) {
  const [filter, setFilter] = useState("all");
  const [quoteModal, setQuoteModal] = useState(null);
  const [price, setPrice] = useState("");
  const [timeline, setTimeline] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const submitQuote = async () => {
    if (!price || !timeline) { setErr("Price and timeline are required."); return; }
    setLoading(true); setErr("");
    const commission = biz?.commission_rate || 12;
    const gross = parseFloat(price);
    const commissionAmt = Math.round(gross * commission / 100);
    const payout = gross - commissionAmt;

    const { error } = await supabase.from("quotes").insert({
      request_id: quoteModal.id,
      business_id: biz.id,
      listing_id: biz.listing_id,
      price: gross,
      commission_rate: commission,
      commission_amount: commissionAmt,
      payout_amount: payout,
      timeline,
      notes: quoteNote,
      status: "pending",
    });
    if (error) { setErr(error.message); setLoading(false); return; }
    // Update request status
    await supabase.from("service_requests").update({ status: "quoted" }).eq("id", quoteModal.id);
    // Notify user via notification
    await supabase.from("notifications").insert({
      user_id: quoteModal.user_id,
      icon: "💬",
      message: `${biz.name} sent you a quote for your request ${quoteModal.ref}`,
      type: "quote",
      metadata: { request_id: quoteModal.id, request_ref: quoteModal.ref },
    });
    onRequestUpdate();
    setQuoteModal(null);
    setPrice(""); setTimeline(""); setQuoteNote("");
    setLoading(false);
  };

  return (
    <div className="content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 900, color: "#FEFCF7" }}>Requests</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{requests.length} total · {requests.filter(r => r.status === "open").length} new</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {["all", "open", "quoted", "accepted", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", borderColor: filter === f ? "#4DD994" : "rgba(255,255,255,0.1)", background: filter === f ? "rgba(77,217,148,0.12)" : "transparent", color: filter === f ? "#4DD994" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", textTransform: "capitalize" }}>
            {f === "all" ? `All (${requests.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${requests.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No {filter === "all" ? "" : filter} requests</div>
          <div className="empty-sub">When users connect with {biz?.name || "your business"} on Xairod, their requests appear here.</div>
        </div>
      ) : filtered.map(req => (
        <div key={req.id} className={`request-card ${req.status === "open" ? "new-lead" : ""}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <span className="ref-tag">{req.ref}</span>
              <span style={{ marginLeft: 8, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{new Date(req.created_at).toLocaleString()}</span>
            </div>
            <span className={`badge-pill badge-${req.status === "open" ? "new" : req.status}`}>
              {req.status === "open" ? "New" : req.status}
            </span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: "#FEFCF7", marginBottom: 6, lineHeight: 1.5 }}>{req.what_i_need}</div>

          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            {req.when_needed && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>📅 {req.when_needed}</div>}
            {req.budget && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>💰 Budget: {req.budget}</div>}
          </div>

          {req.status === "open" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setQuoteModal(req); setErr(""); }}
                className="btn-primary" style={{ padding: "8px 18px", fontSize: 12 }}>
                Send Quote →
              </button>
              <button className="btn-red" onClick={async () => {
                await supabase.from("service_requests").update({ status: "declined" }).eq("id", req.id);
                onRequestUpdate();
              }}>Decline</button>
            </div>
          )}
          {req.status === "quoted" && (
            <div style={{ fontSize: 11, color: "#F5C550", fontWeight: 600 }}>⏳ Waiting for user to accept your quote</div>
          )}
          {req.status === "accepted" && (
            <div style={{ fontSize: 11, color: "#4DD994", fontWeight: 600 }}>✅ Quote accepted — deliver the service</div>
          )}
        </div>
      ))}

      {/* Quote Modal */}
      {quoteModal && (
        <div className="modal-overlay" onClick={() => setQuoteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Send Quote</div>
            <div style={{ background: "rgba(77,217,148,0.07)", borderRadius: 10, padding: "10px 12px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>{quoteModal.ref}</div>
              <div style={{ fontSize: 12, color: "#FEFCF7", lineHeight: 1.5 }}>{quoteModal.what_i_need}</div>
            </div>
            {err && <div className="alert alert-error">{err}</div>}
            <div className="form-group">
              <label className="label">Your Price (EGP) *</label>
              <input className="input" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 3000"/>
              {price && (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6, lineHeight: 1.6 }}>
                  Xairod commission ({biz?.commission_rate || 12}%): {Math.round(parseFloat(price || 0) * (biz?.commission_rate || 12) / 100)} EGP<br/>
                  <strong style={{ color: "#4DD994" }}>You receive: {Math.round(parseFloat(price || 0) * (1 - (biz?.commission_rate || 12) / 100))} EGP</strong>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="label">Timeline *</label>
              <input className="input" value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. 5–7 business days"/>
            </div>
            <div className="form-group">
              <label className="label">Notes (optional)</label>
              <textarea className="input" rows={3} value={quoteNote} onChange={e => setQuoteNote(e.target.value)} placeholder="What's included? Any conditions?"/>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-outline" onClick={() => setQuoteModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={submitQuote} disabled={loading} style={{ flex: 2 }}>
                {loading ? "Sending…" : "Send Quote →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BOOKINGS SCREEN ───────────────────────────────────────────────────────────
function BookingsScreen({ biz, bookings, onUpdate }) {
  const [loading, setLoading] = useState(null);

  const markComplete = async (booking) => {
    setLoading(booking.id);
    // Generate confirmation code
    const code = "XR-CONF-" + Math.floor(100000 + Math.random() * 900000);
    await supabase.from("bookings").update({
      status: "awaiting_confirmation",
      confirmation_code: code,
      completed_at: new Date().toISOString(),
    }).eq("id", booking.id);
    // Notify user
    await supabase.from("notifications").insert({
      user_id: booking.user_id,
      icon: "🎉",
      message: `${biz.name} has completed your service! Enter code ${code} in the app to confirm and release payment.`,
      type: "completion",
      metadata: { booking_id: booking.id, confirmation_code: code },
    });
    onUpdate();
    setLoading(null);
  };

  return (
    <div className="content">
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 900, color: "#FEFCF7", marginBottom: 4 }}>Bookings</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>{bookings.length} total bookings</div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No bookings yet</div>
          <div className="empty-sub">When a user accepts your quote, the booking appears here. Deliver the service, then mark it complete to generate a confirmation code and release payment.</div>
        </div>
      ) : bookings.map(b => (
        <div key={b.id} className="request-card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="ref-tag">{b.ref || b.id?.slice(0, 8)}</span>
            <span className={`badge-pill badge-${b.status === "completed" ? "completed" : b.status === "in_progress" ? "progress" : "accepted"}`}>
              {b.status?.replace("_", " ")}
            </span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: "#FEFCF7", marginBottom: 8 }}>{b.service_description || "Booking"}</div>

          {/* Financial breakdown */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Gross amount</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FEFCF7" }}>{(b.gross_amount || 0).toLocaleString()} EGP</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Xairod commission ({b.commission_rate || biz?.commission_rate || 12}%)</div>
              <div style={{ fontSize: 11, color: "#C0392B" }}>- {(b.commission_amount || 0).toLocaleString()} EGP</div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }}/>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Your payout</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#4DD994" }}>{(b.payout_amount || 0).toLocaleString()} EGP</div>
            </div>
          </div>

          {b.status === "in_progress" && (
            <button onClick={() => markComplete(b)} disabled={loading === b.id}
              className="btn-primary" style={{ width: "100%", padding: "10px" }}>
              {loading === b.id ? "Generating code…" : "✅ Mark Service Complete → Generate Confirmation Code"}
            </button>
          )}

          {b.status === "awaiting_confirmation" && (
            <div style={{ background: "rgba(200,134,26,0.1)", border: "1px solid rgba(200,134,26,0.2)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#F5C550", marginBottom: 4 }}>⏳ Awaiting User Confirmation</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Code sent to user: <strong style={{ color: "#F5C550" }}>{b.confirmation_code}</strong></div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>Payment releases once user confirms in the app.</div>
            </div>
          )}

          {b.status === "completed" && (
            <div style={{ background: "rgba(77,217,148,0.08)", border: "1px solid rgba(77,217,148,0.15)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4DD994" }}>✓ Completed · Payout queued</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Completed: {new Date(b.completed_at).toLocaleDateString()}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── PAYOUTS SCREEN ────────────────────────────────────────────────────────────
function PayoutsScreen({ biz, bookings }) {
  const completed = bookings.filter(b => b.status === "completed");
  const pending   = bookings.filter(b => b.status === "awaiting_confirmation");
  const totalEarned  = completed.reduce((s, b) => s + (b.payout_amount || 0), 0);
  const pendingAmt   = pending.reduce((s, b) => s + (b.payout_amount || 0), 0);
  const totalCommission = completed.reduce((s, b) => s + (b.commission_amount || 0), 0);

  return (
    <div className="content">
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 900, color: "#FEFCF7", marginBottom: 20 }}>Payouts</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <div className="stat-card stat-green">
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Total Earned</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 900, color: "#4DD994" }}>{totalEarned.toLocaleString()} EGP</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>After Xairod commission</div>
        </div>
        <div className="stat-card stat-gold">
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Pending Release</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 900, color: "#F5C550" }}>{pendingAmt.toLocaleString()} EGP</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>Awaiting user confirmation</div>
        </div>
        <div className="stat-card stat-blue">
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Paid to Xairod</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 900, color: "#5DADE2" }}>{totalCommission.toLocaleString()} EGP</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>Total commission deducted</div>
        </div>
      </div>

      <div className="alert alert-warn" style={{ marginBottom: 20 }}>
        <strong>Paystack integration coming soon.</strong> Payouts are currently processed manually every Friday. Once Paystack is live, payouts will be automatic within 24 hours of deal confirmation.
      </div>

      {completed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <div className="empty-title">No payouts yet</div>
          <div className="empty-sub">Completed deals will appear here with a full financial breakdown.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Booking</th><th>Service</th><th>Gross</th><th>Commission</th><th>Your Payout</th><th>Date</th>
            </tr></thead>
            <tbody>
              {completed.map(b => (
                <tr key={b.id}>
                  <td><span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: "#4DD994" }}>{b.ref || b.id?.slice(0, 8)}</span></td>
                  <td className="td-main">{b.service_description || "Service"}</td>
                  <td>{(b.gross_amount || 0).toLocaleString()} EGP</td>
                  <td style={{ color: "#C0392B" }}>- {(b.commission_amount || 0).toLocaleString()} EGP</td>
                  <td style={{ fontWeight: 800, color: "#4DD994" }}>{(b.payout_amount || 0).toLocaleString()} EGP</td>
                  <td style={{ fontSize: 11 }}>{b.completed_at ? new Date(b.completed_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── LISTING SCREEN ────────────────────────────────────────────────────────────
function ListingScreen({ biz, onUpdate }) {
  const [form, setForm] = useState({ name: biz?.name || "", city: biz?.city || "", phone: biz?.phone || "", description: biz?.description || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from("business_accounts").update(form).eq("id", biz.id);
    // Also update the linked listing if it exists
    if (biz.listing_id) {
      await supabase.from("listings").update({ name: form.name, city: form.city, phone: form.phone, description: form.description }).eq("id", biz.listing_id);
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onUpdate();
  };

  return (
    <div className="content">
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 900, color: "#FEFCF7", marginBottom: 20 }}>My Listing</div>

      {biz?.status === "pending" && (
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>⏳ Your listing is under review. The Xairod team will activate it within 24 hours.</div>
      )}
      {biz?.status === "active" && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>✓ Your listing is live on xairod.com. Users can find and connect with you.</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Business Details</div>
            <div className="form-group">
              <label className="label">Business Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
            </div>
            <div className="form-group">
              <label className="label">City / Location</label>
              <input className="input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}/>
            </div>
            <div className="form-group">
              <label className="label">WhatsApp Number</label>
              <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+20 100 000 0000"/>
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="input" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/>
            </div>
            {saved && <div className="alert alert-success">✓ Saved successfully</div>}
            <button className="btn-primary" onClick={save} disabled={saving} style={{ width: "100%" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
        <div>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Account Info</div>
            {[
              ["Category", biz?.category_label || biz?.category || "—"],
              ["Commission Rate", `${biz?.commission_rate || 12}% per completed deal`],
              ["Status", biz?.status === "active" ? "✓ Active" : "⏳ Pending Review"],
              ["Member Since", biz?.created_at ? new Date(biz.created_at).toLocaleDateString() : "—"],
              ["Business Email", biz?.email || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{k}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FEFCF7" }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>How Commission Works</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              Xairod is <strong style={{ color: "#4DD994" }}>free to list</strong>. You only pay a commission when a deal is fully confirmed by both you and the customer.<br/><br/>
              Example for a <strong style={{ color: "#FEFCF7" }}>5,000 EGP</strong> deal:<br/>
              Commission ({biz?.commission_rate || 12}%): <strong style={{ color: "#C0392B" }}>{Math.round(5000 * ((biz?.commission_rate || 12) / 100))} EGP</strong><br/>
              Your payout: <strong style={{ color: "#4DD994" }}>{5000 - Math.round(5000 * ((biz?.commission_rate || 12) / 100))} EGP</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [biz, setBiz]           = useState(null);
  const [page, setPage]         = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Check session on load
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: bizData } = await supabase.from("business_accounts")
          .select("*").eq("user_id", session.user.id).single();
        if (bizData) {
          setAuthUser(session.user);
          setBiz(bizData);
          loadData(bizData.id);
        }
      }
      setLoading(false);
    });
  }, []);

  const loadData = async (bizId) => {
    // Load requests matched to this business
    const { data: reqs } = await supabase.from("service_requests")
      .select("*").eq("assigned_business_id", bizId)
      .order("created_at", { ascending: false });
    setRequests(reqs || []);
    // Load bookings
    const { data: bks } = await supabase.from("bookings")
      .select("*").eq("business_id", bizId)
      .order("created_at", { ascending: false });
    setBookings(bks || []);
  };

  // Realtime: new requests
  useEffect(() => {
    if (!biz?.id) return;
    const ch = supabase.channel("biz_requests_" + biz.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "service_requests", filter: `assigned_business_id=eq.${biz.id}` },
        () => loadData(biz.id))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "service_requests" },
        () => loadData(biz.id))
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `business_id=eq.${biz.id}` },
        () => loadData(biz.id))
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [biz?.id]);

  const handleAuth = (user, bizData) => {
    setAuthUser(user); setBiz(bizData);
    loadData(bizData.id);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D0A05" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 900, color: "#4DD994", marginBottom: 12 }}>Xairod.</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Loading your business portal…</div>
      </div>
    </div>
  );

  if (!authUser || !biz) return (
    <>
      <style>{CSS}</style>
      <AuthScreen onAuth={handleAuth}/>
    </>
  );

  const newLeads = requests.filter(r => r.status === "open").length;

  return (
    <>
      <style>{CSS}</style>
      <Sidebar page={page} setPage={setPage} biz={biz} newLeads={newLeads}/>
      <div className="main-wrap">
        <div className="topbar">
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 800, color: "#FEFCF7" }}>
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {biz.name}
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); setAuthUser(null); setBiz(null); }}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", padding: "6px 14px", borderRadius: 8, fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Sign Out
            </button>
          </div>
        </div>
        {page === "dashboard" && <Dashboard biz={biz} requests={requests} bookings={bookings} setPage={setPage}/>}
        {page === "requests"  && <RequestsScreen biz={biz} requests={requests} onRequestUpdate={() => loadData(biz.id)}/>}
        {page === "bookings"  && <BookingsScreen biz={biz} bookings={bookings} onUpdate={() => loadData(biz.id)}/>}
        {page === "payouts"   && <PayoutsScreen biz={biz} bookings={bookings}/>}
        {page === "listing"   && <ListingScreen biz={biz} onUpdate={() => loadData(biz.id)}/>}
        {page === "settings"  && (
          <div className="content">
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 900, color: "#FEFCF7", marginBottom: 4 }}>Settings</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>Manage your account preferences</div>
            <div className="card">
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
                For account changes, commission disputes, or support — contact the Xairod team at <span style={{ color: "#4DD994" }}>hello@xairod.com</span> or message <span style={{ color: "#4DD994" }}>t.me/ckairod</span>.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
