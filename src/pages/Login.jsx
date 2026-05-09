import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Lock, Mail, Eye, EyeOff, Brain } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    setLoading(false)
  }

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-container animate-fade-in-up">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Brain size={32} color="white" />
          </div>
          <div className="login-logo-text">
            <strong>منصة التقييم النفسي</strong>
            <span>Terre des hommes Italy</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-header">
            <h1>مرحباً بعودتك</h1>
            <p>سجّل دخولك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-error animate-fade-in">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-control form-control-icon"
                  placeholder="example@org.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">كلمة المرور</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-control form-control-icon form-control-icon-end"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-end"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? <span className="spinner-sm" /> : '🔐 تسجيل الدخول'}
            </button>
          </form>
        </div>

        <p className="login-footer">
          هذه المنصة مخصصة للمعالجين النفسيين المعتمدين فقط
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(145deg, #001f3f 0%, #003366 40%, #1a4a82 100%);
          padding: 2rem;
        }
        .login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .login-blob-1 {
          width: 500px; height: 500px;
          background: rgba(243,112,33,0.15);
          top: -100px; right: -100px;
          animation: float1 8s ease-in-out infinite;
        }
        .login-blob-2 {
          width: 400px; height: 400px;
          background: rgba(0,100,200,0.12);
          bottom: -80px; left: -80px;
          animation: float2 10s ease-in-out infinite;
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.08); }
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .login-logo-icon {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, #F37021, #D4601A);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(243,112,33,0.4);
        }
        .login-logo-text strong {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
        }
        .login-logo-text span {
          display: block;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
        }

        .login-card {
          width: 100%;
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header h1 {
          color: white;
          font-size: 1.75rem;
          font-weight: 800;
        }
        .login-header p {
          color: rgba(255,255,255,0.6);
          margin-top: 0.5rem;
          font-size: 0.95rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .login-form label {
          color: rgba(255,255,255,0.85);
          font-size: 0.875rem;
        }
        .login-form .form-control {
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.15);
          color: white;
        }
        .login-form .form-control::placeholder { color: rgba(255,255,255,0.35); }
        .login-form .form-control:focus {
          border-color: #F37021;
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 0 3px rgba(243,112,33,0.2);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          right: 0.85rem;
          color: rgba(255,255,255,0.45);
          pointer-events: none;
          z-index: 1;
        }
        .form-control-icon { padding-right: 2.75rem; }
        .form-control-icon-end { padding-left: 2.75rem; }
        .input-icon-end {
          position: absolute;
          left: 0.85rem;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.45);
          display: flex;
          align-items: center;
          padding: 0;
        }
        .input-icon-end:hover { color: rgba(255,255,255,0.8); }

        .alert {
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .alert-error {
          background: rgba(231,76,60,0.15);
          border: 1px solid rgba(231,76,60,0.3);
          color: #ff8b7b;
        }

        .login-footer {
          color: rgba(255,255,255,0.4);
          font-size: 0.8rem;
          text-align: center;
        }

        .spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(243,112,33,0.2);
          border-top-color: #F37021;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .spinner-sm {
          display: inline-block;
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
