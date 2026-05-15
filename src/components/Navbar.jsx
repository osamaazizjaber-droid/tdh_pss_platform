import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, PlusCircle, LogOut, User } from 'lucide-react'
import TDH_LOGO_B64 from '../lib/tdhLogo'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
          <div className="navbar-brand-logo" style={{ background: 'white', padding: '3px', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}>
            <img src={TDH_LOGO_B64} alt="TDH Italy" style={{ width: 38, height: 38, objectFit: 'contain' }} />
          </div>
          <div className="navbar-title">
            <strong>تقييم المقاييس و الاختبارات النفسية</strong>
            <span>Terre des hommes Italy</span>
          </div>
        </NavLink>

        <div className="navbar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={17} />
            لوحة التحكم
          </NavLink>
          <NavLink to="/assessment/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={17} />
            تقييم جديد
          </NavLink>
          <div className="nav-divider" />
          <div className="nav-user">
            <User size={16} />
            <span>{user?.email?.split('@')[0]}</span>
          </div>
          <button className="nav-link nav-link-danger" onClick={handleSignOut} title="تسجيل الخروج">
            <LogOut size={17} />
            خروج
          </button>
        </div>
      </div>

      <style>{`
        .nav-divider {
          width: 1px;
          height: 24px;
          background: var(--border-light);
          margin: 0 0.25rem;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 0.4rem 0.75rem;
          background: var(--bg-primary);
          border-radius: var(--radius-md);
        }
        .nav-link-danger { color: var(--text-muted) !important; }
        .nav-link-danger:hover { background: rgba(231,76,60,0.08) !important; color: #e74c3c !important; }
        @media (max-width: 768px) {
          .nav-user span, .nav-divider { display: none; }
          .navbar-title span { display: none; }
        }
      `}</style>
    </nav>
  )
}
