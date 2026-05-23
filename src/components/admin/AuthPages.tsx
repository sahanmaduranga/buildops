import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Lock, Mail, User, ShieldCheck, Eye, EyeOff, KeySquare, HelpCircle, ArrowRight, ShieldCheck as MFAIcon, CheckCircle, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const AuthPages = () => {
  const { currentPath, navigateTo, mockLogin, mockForgotPassword, mockResetPassword, mockVerifyMfa } = useAuth();

  // General Input States
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // MFA States
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [mfaTimer, setMfaTimer] = useState(59);

  // Reset errors/success states on route shifts
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
  }, [currentPath]);

  // MFA Countdown
  useEffect(() => {
    if (currentPath !== '/mfa-verification') return;
    const interval = setInterval(() => {
      setMfaTimer(prev => prev > 0 ? prev - 1 : 59);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPath]);

  // Form Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!identity || !password) {
      setErrorMsg('Please input both your enterprise identity details and password key.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await mockLogin(identity, password);
      if (response.success) {
        if (response.mfaRequired && response.user) {
          // Temporary save MFA user context reference 
          localStorage.setItem('iam_tmp_mfa_user', JSON.stringify(response.user));
          navigateTo('/mfa-verification');
        } else {
          // Clear any previously selected project to show portfolio dashboard
          localStorage.removeItem('buildops_selected_project_id');
          // Send to portfolio dashboard on success
          navigateTo('/portfolio');
        }
      } else {
        setErrorMsg(response.error || 'Identity credentials validation failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connecting to security directory channel failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!identity) {
      setErrorMsg('Please enter your primary corporate email address.');
      setIsLoading(false);
      return;
    }

    const res = await mockForgotPassword(identity);
    if (res.success) {
      setSuccessMsg(res.msg);
    } else {
      setErrorMsg(res.error || res.msg);
    }
    setIsLoading(false);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (newPassword.length < 5) {
      setErrorMsg('Password fails strict tenant structural complexity requirements (minimum 5 characters).');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Verification passphrase inputs do not balance.');
      setIsLoading(false);
      return;
    }

    const res = await mockResetPassword(newPassword);
    if (res.success) {
      setSuccessMsg(res.msg);
      setTimeout(() => navigateTo('/login'), 2000);
    } else {
      setErrorMsg(res.error || res.msg);
    }
    setIsLoading(false);
  };

  const handleMfaInput = async (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // Allow numeric only

    const newCode = [...mfaCode];
    newCode[index] = val.slice(-1);
    setMfaCode(newCode);

    // Auto focus next box
    if (val && index < 5) {
      const el = document.getElementById(`mfa-box-${index + 1}`);
      el?.focus();
    }

    // Trigger auto validation when full 6-digit is inputted
    const fullyEnteredCode = newCode.join('');
    if (fullyEnteredCode.length === 6) {
      setErrorMsg('');
      setIsLoading(true);
      try {
        const response = await mockVerifyMfa(fullyEnteredCode);
        if (response.success) {
          localStorage.removeItem('iam_tmp_mfa_user');
          // Clear any previously selected project to show portfolio dashboard
          localStorage.removeItem('buildops_selected_project_id');
          navigateTo('/portfolio');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'TOTP Validation failed.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPasswordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 5) return { label: 'Weak', css: 'bg-rose-500 w-1/3' };
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return { label: 'Medium Age Strength', css: 'bg-amber-500 w-2/3' };
    return { label: 'High Policy Standards Passed', css: 'bg-emerald-500 w-full' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen w-full bg-[#070b13] flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden relative">
      {/* Ambient Corporate Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[250px] h-[250px] rounded-full bg-indigo-600/5 blur-[90px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Center Interactive Form Card Container */}
      <div className="w-full max-w-[400px] md:max-w-[785px] bg-[#0e1624]/90 backdrop-blur-md border border-[#19273c] rounded-2xl shadow-2xl relative text-[13px] text-slate-300 flex flex-col md:flex-row overflow-hidden animate-fade-in mx-auto">
        {/* Card Top Branding Accent line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 via-emerald-600 to-indigo-600 opacity-90 rounded-t-2xl z-10" />
 
        {/* 1. Integrated Left Information Panel - Hidden on mobile, beautiful side panel on desktop */}
        <div className="hidden md:flex md:w-[350px] bg-[#0c1221]/90 border-r border-[#19273c]/60 p-8 flex-col justify-between relative overflow-hidden select-none shrink-0">
          <img
            src="/src/assets/images/enterprise_construction_1779512439514.png"
            alt="BuildOps Professional Background"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-lighten pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#070b13]/95 via-[#0c1221]/80 to-primary-950/40 opacity-95" />
          <div className="absolute top-[-100px] right-[-100px] w-[220px] h-[220px] rounded-full bg-primary-600/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-100px] left-[-100px] w-[220px] h-[220px] rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

          {/* Core Logo & App Info */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                <span className="text-white font-black text-base italic select-none tracking-tight">B</span>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#152033] shadow-sm" />
              </div>
              <div>
                <h1 className="text-xl tracking-tight leading-none font-extrabold text-white">
                  Build<span className="text-primary-400 font-semibold">Ops</span>
                </h1>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] block mt-1">
                  Enterprise Resource Platform
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#1e304b]/30">
              <span className="inline-block bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                Platform Blueprint
              </span>
              <p className="text-[13px] font-bold leading-relaxed text-slate-200">
                Unify control parameters for heavy industries & site team networks.
              </p>
              <p className="text-[12px] text-slate-400 leading-relaxed font-normal">
                SaaS environment tracking Bill of Quantities baselines, resource schedulers, financial forecasts, and subcontractor commercial billing IPC approvals in real-time.
              </p>
            </div>
          </div>

          {/* Spec details table */}
          <div className="relative z-10 space-y-2 border-t border-[#1e304b]/35 pt-5 text-[11px] text-slate-400 font-semibold">
            <div className="flex items-center justify-between">
              <span>Security Certification:</span>
              <span className="text-emerald-400 font-bold">ISO-27001</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Access Protocol:</span>
              <span className="text-white">Multi-Project RBAC</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Secure Gateway:</span>
              <span className="text-[#94a3b8] font-mono">v5.2-Hashed</span>
            </div>
          </div>
        </div>

        {/* 2. Interactive Form Panel (Right side or Full pane on mobile) */}
        <div className="flex-1 p-5 md:p-8 flex flex-col justify-center space-y-4 min-w-0 relative">
          
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-xl text-xs font-semibold leading-relaxed animate-shake">
              <span className="font-extrabold block mb-0.5">Access Protocol Refused:</span>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW: LOGIN FORM */}
          {currentPath === '/login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Centered App Logo matching real app */}
              <div className="flex flex-col items-center justify-center pt-1 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    <span className="text-white font-black text-xl leading-none italic select-none tracking-tight">B</span>
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0e1624] shadow-sm" />
                  </div>
                  <h1 className="text-2xl tracking-tight leading-none font-extrabold text-white">
                    Build<span className="text-primary-400 font-semibold">Ops</span>
                  </h1>
                </div>
                <span className="text-[9px] text-[#94a3b8] font-black uppercase tracking-widest mt-1.5 block">
                  Enterprise Security Challenge
                </span>
              </div>

              {/* Identity input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} className="text-slate-500" /> Enterprise Identity / Email
                </label>
                <input
                  type="text"
                  placeholder="robert.chen@buildops.com"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-[#070b13] border border-[#1e304b] text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl font-semibold shadow-sm placeholder:text-slate-600 text-xs transition-all"
                  id="login-identity-field"
                  disabled={isLoading}
                />
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  <span className="flex items-center gap-1.5">
                    <Lock size={12} className="text-slate-500" /> Password Sign-On Key
                  </span>
                  <button 
                    type="button" 
                    onClick={() => navigateTo('/forgot-password')} 
                    className="text-primary-400 hover:underline hover:text-primary-300 capitalize font-bold leading-none cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2.5 pl-3.5 pr-10 bg-[#070b13] border border-[#1e304b] text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl font-semibold shadow-sm placeholder:text-slate-650 text-xs transition-all"
                    id="login-password-field"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember me control */}
              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#1e304b] bg-[#070b13] text-primary-600 focus:ring-primary-500 w-4 h-4"
                  />
                  <span>Authorize secure login directory parameters</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer font-sans text-xs"
              >
                {isLoading ? 'Authenticating Gateway...' : 'Submit Security Credentials'}
                <ArrowRight size={13} />
              </button>

              {/* Quick Click Autofill Sandbox Credentials */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <p className="text-center text-[9px] text-[#94a3b8] font-black uppercase tracking-wider leading-none">Sandbox Click-to-Autofill</p>
                
                <div className="flex flex-wrap gap-1.5 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentity('s.johnson@buildops.com');
                      setPassword('password');
                    }}
                    className="px-2 py-1 bg-[#121c2c] hover:bg-[#1a293d] border border-[#1e304b] text-[#cbd5e1] hover:text-white rounded-lg transition-all text-[11px] font-bold cursor-pointer"
                    title="Sarah Johnson - Direct authentication, no MFA prompt"
                  >
                    👤 Sarah (Direct)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentity('robert.chen@buildops.com');
                      setPassword('password');
                    }}
                    className="px-2 py-1 bg-[#121c2c] hover:bg-[#1a293d] border border-[#1e304b] text-[#cbd5e1] hover:text-white rounded-lg transition-all text-[11px] font-bold cursor-pointer"
                    title="Robert Chen - Requires MFA setup simulation trigger"
                  >
                    🔑 Robert (MFA)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentity('robert.chen@buildops.com');
                      setPassword('lockme');
                    }}
                    className="px-2 py-1 bg-[#121c2c] hover:bg-[#1a293d] border border-[#1e304b] text-slate-400 hover:text-slate-300 rounded-lg transition-all text-[11px] font-bold cursor-pointer"
                    title="Triggers security directory lockout check"
                  >
                    ⚠️ Lockout Test
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentity('robert.chen@buildops.com');
                      setPassword('expired');
                    }}
                    className="px-2 py-1 bg-[#121c2c] hover:bg-[#1a293d] border border-[#1e304b] text-slate-400 hover:text-slate-300 rounded-lg transition-all text-[11px] font-bold cursor-pointer"
                    title="Simulates expired password rotation check"
                  >
                    🔄 Expired Pass
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {currentPath === '/forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-slide-up">
              
              {/* Core App Logo */}
              <div className="flex items-center gap-2.5 justify-center mb-1 pb-1 border-b border-white/5">
                <div className="relative w-7 h-7 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-black text-sm italic">B</span>
                </div>
                <h1 className="text-lg font-extrabold text-white">BuildOps Recovery</h1>
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-white tracking-tight">Credentials Recovery</h2>
                <p className="text-slate-400 text-xs font-semibold">Initiate sign-on parameters check.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Mail size={12} className="text-slate-400" /> Workspace Email Address
                </label>
                <input
                  type="email"
                  placeholder="robert.chen@buildops.com"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="w-full py-2 px-3 bg-[#070b13] border border-[#1e304b] text-white focus:outline-none focus:border-primary-500 rounded-xl font-semibold shadow-sm placeholder:text-slate-650 text-xs"
                  id="forgot-email-field"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl transition-all shadow-lg cursor-pointer text-xs"
                disabled={isLoading}
              >
                {isLoading ? 'Processing Recovery...' : 'Dispatch Token Link'}
              </button>

              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="text-slate-400 hover:text-white font-semibold flex items-center justify-center gap-1 mx-auto hover:underline cursor-pointer bg-transparent border-none text-xs w-full py-1"
              >
                ← Return to Sign-On Challenge
              </button>
            </form>
          )}

          {/* VIEW: VIEW PRESET PASSWORD RESET */}
          {currentPath === '/reset-password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-slide-up">
              
              <div className="flex items-center gap-2.5 justify-center mb-1 pb-1 border-b border-white/5">
                <div className="relative w-7 h-7 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm italic">B</span>
                </div>
                <h1 className="text-lg font-extrabold text-white">Reset Credentials</h1>
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-white tracking-tight">Rotate Secure Key</h2>
                <p className="text-slate-450 text-xs text-slate-400 font-semibold">Change expired tenant credential credentials map.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  New Hashed Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full py-2 px-3 bg-[#070b13] border border-[#1e304b] text-white focus:outline-none focus:border-primary-500 rounded-xl font-semibold shadow-sm placeholder:text-slate-650 text-xs"
                  id="reset-newpassword-field"
                  disabled={isLoading}
                />
                
                {/* Strength Indicators */}
                {strength && (
                  <div className="space-y-1 pt-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 leading-none">
                      <span>Complexity rating:</span>
                      <span className="text-white">{strength.label}</span>
                    </div>
                    <div className="w-full h-1 bg-[#1e304b] rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all", strength.css)} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Confirm Password Rotation
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full py-2 px-3 bg-[#070b13] border border-[#1e304b] text-white focus:outline-none focus:border-primary-500 rounded-xl font-semibold shadow-sm placeholder:text-slate-650 text-xs"
                  id="reset-confirmpassword-field"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl transition-all shadow-lg cursor-pointer text-xs"
                disabled={isLoading}
              >
                {isLoading ? 'Encrypting Credentials...' : 'Commit Vault Override'}
              </button>
            </form>
          )}

          {/* VIEW: MFA VERIFICATION */}
          {currentPath === '/mfa-verification' && (
            <div className="space-y-4 animate-slide-up">
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 bg-primary-500/10 text-primary-400 rounded-full flex items-center justify-center mx-auto border border-primary-500/20 shadow-inner">
                  <MFAIcon size={20} />
                </div>
                <h2 className="text-base font-black text-white tracking-tight">Factor Challenge Check</h2>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold max-w-xs mx-auto">
                  Authenticator dispatch success. Please supply the 6-digit challenge code.
                </p>
              </div>

              {/* Digits row */}
              <div className="flex justify-between gap-1.5 max-w-xs mx-auto">
                {mfaCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`mfa-box-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleMfaInput(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        const prevEl = document.getElementById(`mfa-box-${index - 1}`);
                        prevEl?.focus();
                      }
                    }}
                    className="w-10 h-11 text-center text-base font-extrabold bg-[#070b13] border border-[#1e304b] text-white focus:outline-none focus:border-primary-500 rounded-xl shadow-lg focus:ring-1 focus:ring-primary-500"
                    autoFocus={index === 0}
                    disabled={isLoading}
                  />
                ))}
              </div>

              {/* OTP timer countdown */}
              <p className="text-center text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1 leading-none py-0.5">
                <Smartphone size={12} className="text-slate-500" />
                Resend window opens in: <strong className="text-white">{mfaTimer}s</strong>
              </p>

              <button
                type="button"
                onClick={() => {
                  setMfaCode(['', '', '', '', '', '']);
                  setMfaTimer(59);
                  alert('Security directory challenge reassert completed.');
                }}
                disabled={mfaTimer > 0 || isLoading}
                className="w-full py-1.5 bg-transparent border border-[#1e304b] hover:bg-slate-800 disabled:opacity-50 text-[#cbd5e1] text-[11px] font-bold rounded-xl transition-all cursor-pointer"
              >
                Reassert Code Dispatch
              </button>

              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto hover:underline cursor-pointer bg-transparent border-none font-semibold text-[11px] w-full mt-2"
              >
                ← Cancel Authorization Flow
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default AuthPages;
