import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SCALES, RISK_LABELS } from '../lib/scoringLogic'
import Navbar from '../components/Navbar'
import {
  Users, ClipboardList, PlusCircle, Search, Eye, Calendar,
  AlertTriangle, CheckCircle, Trash2, AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  const navigate  = useNavigate()
  const [cases,      setCases]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [confirmDel, setConfirmDel] = useState(null)  // case object to delete
  const [deleting,   setDeleting]   = useState(false)

  useEffect(() => {
    fetchCases()
  }, [])

  async function fetchCases() {
    setLoading(true)
    const { data, error } = await supabase
      .from('cases')
      .select(`*, evaluations ( id, evaluation_date, scale_id, score, risk_level, therapist_name )`)
      .order('created_at', { ascending: false })

    if (!error) setCases(data || [])
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirmDel) return
    setDeleting(true)
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', confirmDel.id)
    if (!error) {
      setCases(prev => prev.filter(c => c.id !== confirmDel.id))
    }
    setDeleting(false)
    setConfirmDel(null)
  }

  const filtered = cases.filter(c =>
    c.child_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  )

  const totalEvals  = cases.reduce((s, c) => s + (c.evaluations?.length || 0), 0)
  const criticalCount = cases.reduce((s, c) =>
    s + (c.evaluations?.filter(e => e.risk_level === 'critical').length || 0), 0)

  const riskColors = { low: '#27ae60', medium: '#f39c12', high: '#e67e22', critical: '#c0392b' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="container-wide" style={{ padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div className="dash-header animate-fade-in-up">
          <div>
            <h1 style={{ color: 'var(--tdh-navy)', marginBottom: '0.3rem' }}>لوحة التحكم</h1>
            <p>إدارة الحالات والتقييمات النفسية</p>
          </div>
          <button
            id="new-assessment-btn"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/assessment/new')}
          >
            <PlusCircle size={20} />
            تقييم جديد
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid animate-fade-in">
          <StatCard icon={<Users size={24} />} label="إجمالي الحالات" value={cases.length} color="var(--tdh-orange)" />
          <StatCard icon={<ClipboardList size={24} />} label="إجمالي التقييمات" value={totalEvals} color="var(--tdh-navy)" />
          <StatCard icon={<AlertTriangle size={24} />} label="حالات حرجة" value={criticalCount} color="#c0392b" />
          <StatCard icon={<CheckCircle size={24} />} label="حالات منخفضة الخطورة"
            value={cases.reduce((s,c) => s + (c.evaluations?.filter(e => e.risk_level === 'low').length || 0), 0)}
            color="#27ae60" />
        </div>

        {/* Search + Table */}
        <div className="card animate-fade-in-up" style={{ marginTop: '1.5rem' }}>
          <div className="table-toolbar">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>الحالات المسجّلة</h2>
            <div className="input-wrapper" style={{ maxWidth: 300 }}>
              <Search size={16} className="input-icon" style={{ color: 'var(--text-muted)' }} />
              <input
                className="form-control form-control-icon"
                placeholder="البحث بالاسم أو العنوان..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <span>جارٍ التحميل...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">
              <ClipboardList size={48} style={{ color: 'var(--border-medium)', marginBottom: '1rem' }} />
              <p>لا توجد حالات مسجّلة بعد. ابدأ بإضافة تقييم جديد!</p>
              <button className="btn btn-primary" onClick={() => navigate('/assessment/new')}>
                <PlusCircle size={18} /> بدء تقييم
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>اسم الطفل</th>
                    <th>العمر</th>
                    <th>الجنس</th>
                    <th>آخر تقييم</th>
                    <th>المقياس</th>
                    <th>مستوى الخطر</th>
                    <th style={{ width: '120px' }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const lastEval = c.evaluations?.[0]
                    return (
                      <tr key={c.id}>
                        <td><strong>{c.child_name}</strong></td>
                        <td>{c.age} سنة</td>
                        <td><span className="badge badge-navy">{c.gender}</span></td>
                        <td>
                          {lastEval
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <Calendar size={14} />
                                {new Date(lastEval.evaluation_date).toLocaleDateString('ar-IQ')}
                              </span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                          }
                        </td>
                        <td>
                          {lastEval
                            ? <span className="badge badge-orange">{SCALES[lastEval.scale_id]?.name}</span>
                            : '—'
                          }
                        </td>
                        <td>
                          {lastEval?.risk_level
                            ? <span className={`badge ${lastEval.risk_level === 'low' ? 'risk-low' : lastEval.risk_level === 'medium' ? 'risk-medium' : lastEval.risk_level === 'high' ? 'risk-high' : 'risk-critical'}`}
                                style={{ padding: '4px 12px', borderRadius: '999px' }}>
                                {RISK_LABELS[lastEval.risk_level]?.ar}
                              </span>
                            : '—'
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => navigate(`/assessment/${lastEval?.id}/result`)}
                              disabled={!lastEval}
                              title="عرض التقرير"
                            >
                              <Eye size={15} />
                              عرض
                            </button>
                            <button
                              id={`delete-case-${c.id}`}
                              className="btn btn-sm btn-delete"
                              onClick={() => setConfirmDel(c)}
                              title="حذف الحالة"
                            >
                              <Trash2 size={15} />
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Delete Confirmation Modal ── */}
      {confirmDel && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,33,66,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }} onClick={() => !deleting && setConfirmDel(null)}>
          <div
            style={{
              background: 'white', borderRadius: 20, padding: '2rem',
              maxWidth: 420, width: '100%', textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,33,66,0.25)',
              animation: 'fadeInUp 0.25s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Warning icon */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(220,38,38,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <AlertCircle size={32} color="#DC2626" />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A202C', marginBottom: '0.5rem' }}>
              تأكيد الحذف
            </h3>
            <p style={{ color: '#7A8597', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>
              هل أنت متأكد من حذف حالة
            </p>
            <p style={{
              fontWeight: 800, fontSize: '1.05rem', color: '#003366',
              background: '#F0F4FF', borderRadius: 10,
              padding: '0.5rem 1rem', display: 'inline-block', marginBottom: '1rem',
            }}>
              {confirmDel.child_name}
            </p>
            <p style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              ⚠️ سيتم حذف جميع التقييمات المرتبطة بهذه الحالة بشكل نهائي ولا يمكن التراجع عنه.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmDel(null)}
                disabled={deleting}
                style={{ flex: 1 }}
              >
                إلغاء
              </button>
              <button
                id="confirm-delete-btn"
                className="btn"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(220,38,38,0.3)',
                }}
              >
                {deleting
                  ? <><span className="spinner-sm" style={{ borderTopColor: 'white' }} /> جارٍ الحذف...</>
                  : <><Trash2 size={16} /> حذف نهائي</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-light);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .stat-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-value { font-size: 2rem; font-weight: 800; line-height: 1; }
        .stat-label { font-size: 0.875rem; color: var(--text-muted); margin-top: 2px; }
        .table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .table-loading, .table-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          gap: 0.75rem;
          color: var(--text-muted);
          text-align: center;
        }
        .table-wrap { overflow-x: auto; }
        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.9rem;
        }
        .data-table th {
          padding: 0.75rem 1rem;
          text-align: right;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-light);
          font-size: 0.825rem;
          white-space: nowrap;
        }
        .data-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-light);
          vertical-align: middle;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tbody tr:hover { background: var(--tdh-orange-subtle); }
        .btn-delete {
          background: transparent;
          color: #DC2626;
          border: 1.5px solid rgba(220,38,38,0.25);
          font-family: var(--font-arabic);
        }
        .btn-delete:hover {
          background: rgba(220,38,38,0.08);
          border-color: #DC2626;
          transform: translateY(-1px);
        }
        .spinner-sm {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}
