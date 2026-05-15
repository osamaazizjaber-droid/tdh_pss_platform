import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SCALES, CHOICES, RISK_LABELS } from '../lib/scoringLogic'
import Navbar from '../components/Navbar'
import { Download, ArrowRight, CheckCircle, AlertTriangle, XCircle, AlertCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import TDH_LOGO_B64 from '../lib/tdhLogo'

// Hard-coded theme colors (so html2canvas can resolve them without CSS vars)
const C = {
  orange:      '#F37021',
  orangeDark:  '#D4601A',
  orangeLight: '#FFF3EB',
  navy:        '#003366',
  navyDark:    '#001f3f',
  white:       '#FFFFFF',
  gray50:      '#F7F8FA',
  gray100:     '#EEF0F4',
  gray200:     '#DDE1E9',
  gray500:     '#7A8597',
  gray700:     '#3D4A5C',
  gray900:     '#1A202C',
}

const RISK_CFG = {
  low:      { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'منخفض' },
  medium:   { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'متوسط' },
  high:     { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'مرتفع' },
  critical: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'حرج'  },
}

export default function ResultPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const printRef = useRef(null)

  const [evaluation, setEvaluation] = useState(null)
  const [caseData,   setCaseData]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [exporting,  setExporting]  = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: ev, error } = await supabase
        .from('evaluations')
        .select('*, cases(*)')
        .eq('id', id)
        .single()
      if (!error && ev) {
        setEvaluation(ev)
        setCaseData(ev.cases)
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  async function exportPDF() {
    setExporting(true)
    try {
      const el = printRef.current

      // ── 1. Prepare element for capture ────────────────────────────────
      const originalStyle = el.getAttribute('style')
      el.style.height   = 'auto'
      el.style.overflow = 'visible'
      el.style.position = 'relative'
      el.style.width    = '800px' // Fix width for consistent scaling

      // ── 2. Capture high-res canvas ────────────────────────────────────
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 860,
      })

      // Restore original styles
      el.setAttribute('style', originalStyle)

      const imgData = canvas.toDataURL('image/png', 1.0)

      // ── 3. PDF Setup (mm is the only reliable unit) ───────────────────
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

      const PAGE_W    = pdf.internal.pageSize.getWidth()  // 210
      const PAGE_H    = pdf.internal.pageSize.getHeight() // 297
      const MARGIN    = 10  // 10mm margin
      const contentW  = PAGE_W - (MARGIN * 2)
      const contentH  = PAGE_H - (MARGIN * 2) // Height available for content per page

      const imgW = contentW
      const imgH = (canvas.height * imgW) / canvas.width

      const totalPages = Math.ceil(imgH / contentH)

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage()

        // Place image so it fills the content area
        // Shift image up by (i * contentH) to show the next slice
        pdf.addImage(
          imgData,
          'PNG',
          MARGIN,
          MARGIN - (i * contentH),
          imgW,
          imgH,
          undefined,
          'FAST'
        )

        // ── Footer with Page Numbers ────────────────────────────────────
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `${i + 1} / ${totalPages}`,
          PAGE_W / 2,
          PAGE_H - 5,
          { align: 'center' }
        )
      }

      pdf.save(`تقييم_${caseData?.child_name || 'حالة'}_${evaluation?.evaluation_date || ''}.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={styles.spinner} />
      <span style={{ color: C.gray500 }}>جارٍ تحميل النتائج...</span>
    </div>
  )

  if (!evaluation) return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '4rem', color: C.gray500 }}>
        <h2>لم يتم العثور على التقييم</h2>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>العودة</button>
      </div>
    </div>
  )

  const scale    = SCALES[evaluation.scale_id]
  const risk     = evaluation.risk_level
  const riskCfg  = RISK_CFG[risk] || RISK_CFG.low
  const pct      = Math.round(((evaluation.score || 0) / (scale?.maxScore || 1)) * 100)
  const choices  = CHOICES[scale?.choiceList] || []

  return (
    <div style={{ minHeight: '100vh', background: C.gray50 }}>
      <Navbar />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Action Bar — NOT in the printable area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            <ArrowRight size={18} /> العودة للوحة التحكم
          </button>
          <button
            id="export-pdf-btn"
            className="btn btn-primary"
            onClick={exportPDF}
            disabled={exporting}
          >
            {exporting
              ? <><span style={styles.spinnerSm} /> جارٍ التصدير...</>
              : <><Download size={18} /> تصدير PDF</>}
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────
            PRINTABLE AREA — ALL STYLES ARE INLINE / HARDCODED
            html2canvas will render this correctly
            ───────────────────────────────────────────────────────── */}
        <div
          ref={printRef}
          style={{
            background:    C.white,
            borderRadius:  16,
            padding:       '2rem',
            fontFamily:    "'Cairo', 'Tajawal', Arial, sans-serif",
            direction:     'rtl',
            color:         C.gray900,
            boxShadow:     '0 4px 20px rgba(0,33,66,0.1)',
          }}
        >
          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 56, height: 56,
                background: 'white',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(243,112,33,0.2)',
                border: `1px solid ${C.gray200}`,
                overflow: 'hidden',
                padding: 4,
              }}>
                <img src={TDH_LOGO_B64} alt="TDH Italy" style={{ width: 46, height: 46, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.navy }}>تقييم المقاييس و الاختبارات النفسية</div>
                <div style={{ fontSize: '0.8rem', color: C.gray500 }}>Terre des hommes Italy</div>
              </div>
            </div>
            {/* Meta */}
            <div style={{ textAlign: 'left', fontSize: '0.85rem', color: C.gray500, lineHeight: 1.8 }}>
              <div>تاريخ المقابلة: <strong style={{ color: C.gray700 }}>{evaluation.evaluation_date}</strong></div>
              <div>المعالج النفسي: <strong style={{ color: C.gray700 }}>{evaluation.therapist_name}</strong></div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `2px solid ${C.gray100}`, marginBottom: '1.25rem' }} />

          {/* ── Case Info ── */}
          <SectionTitle>معلومات الحالة</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <InfoCell label="اسم الطفل"  value={caseData?.child_name} />
            <InfoCell label="العمر"       value={`${caseData?.age} سنة`} />
            <InfoCell label="الجنس"       value={caseData?.gender} />
            <InfoCell label="رقم الهاتف" value={caseData?.phone || '—'} />
            <div style={{ gridColumn: 'span 2' }}>
              <InfoCell label="العنوان" value={caseData?.address || '—'} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `2px solid ${C.gray100}`, marginBottom: '1.25rem' }} />

          {/* ── Scale Result Banner ── */}
          <SectionTitle>نتيجة التقييم</SectionTitle>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            background: riskCfg.bg,
            border: `2px solid ${riskCfg.border}`,
            borderRadius: 16, padding: '1.25rem 1.5rem',
            marginBottom: '1rem',
          }}>
            {/* Scale icon + name + score */}
            <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{scale?.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: C.navy, marginBottom: 4 }}>
                {scale?.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: riskCfg.color, lineHeight: 1 }}>
                  {evaluation.score}
                </span>
                <span style={{ fontSize: '1rem', color: C.gray500 }}> / {scale?.maxScore}</span>
              </div>
            </div>
            {/* Risk badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: riskCfg.color,
              borderRadius: 12, padding: '0.625rem 1.25rem',
              minWidth: 120, justifyContent: 'center',
            }}>
              <RiskIcon level={risk} />
              <span style={{ color: C.white, fontWeight: 800, fontSize: '1rem' }}>{riskCfg.label}</span>
            </div>
          </div>

          {/* ── Score Bar ── */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: C.gray500, marginBottom: 6 }}>
              <span>الدرجة المحققة</span>
              <span style={{ fontWeight: 700, color: riskCfg.color }}>{pct}%</span>
            </div>
            {/* Track */}
            <div style={{ width: '100%', height: 12, background: C.gray100, borderRadius: 999, overflow: 'hidden' }}>
              {/* Fill — use explicit inline width & background */}
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: riskCfg.color,
                borderRadius: 999,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>

          {/* ── Interpretation ── */}
          <div style={{
            background: C.gray50,
            borderRight: `5px solid ${riskCfg.color}`,
            borderRadius: '0 10px 10px 0',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
          }}>
            <strong style={{ color: C.gray900, display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
              تفسير النتيجة:
            </strong>
            <p style={{ margin: 0, color: C.gray700, fontSize: '0.875rem', lineHeight: 1.75 }}>
              {scale?.hints}
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `2px solid ${C.gray100}`, marginBottom: '1.25rem' }} />

          {/* ── Answers Summary ── */}
          <SectionTitle>ملخص الإجابات</SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}>
            {Object.entries(evaluation.answers || {}).map(([key, val], i) => {
              const choiceLabel = choices.find(c => Number(c.value) === Number(val))?.label
              const isHigh = Number(val) > 1
              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: C.gray50, border: `1px solid ${C.gray200}`,
                  borderRadius: 8, padding: '0.4rem 0.625rem',
                  fontSize: '0.82rem',
                }}>
                  <span style={{
                    width: 22, height: 22, flexShrink: 0,
                    background: C.orangeLight,
                    color: C.orangeDark,
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 800,
                  }}>{i + 1}</span>
                  <span style={{
                    fontWeight: 700,
                    color: isHigh ? RISK_CFG.high.color : RISK_CFG.low.color,
                  }}>
                    {choiceLabel ?? val}
                  </span>
                </div>
              )
            })}
          </div>

          {/* ── Footer ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '0.5rem',
            paddingTop: '1rem', borderTop: `1px solid ${C.gray200}`,
            fontSize: '0.75rem', color: C.gray500,
          }}>
            <span>تم إنشاء هذا التقرير بواسطة تقييم المقاييس و الاختبارات النفسية — Terre des hommes Italy</span>
            <span>{new Date().toLocaleString('ar-IQ')}</span>
          </div>
        </div>
        {/* End printable area */}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────── */

function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
      <div style={{ width: 4, height: 18, background: C.orange, borderRadius: 2 }} />
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: C.navy, margin: 0 }}>{children}</h3>
    </div>
  )
}

function InfoCell({ label, value }) {
  return (
    <div style={{
      background: C.gray50, border: `1px solid ${C.gray200}`,
      borderRadius: 8, padding: '0.625rem 0.875rem',
    }}>
      <div style={{ fontSize: '0.72rem', color: C.gray500, marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.gray900 }}>{value}</div>
    </div>
  )
}

function RiskIcon({ level }) {
  const s = { color: '#fff', width: 20, height: 20 }
  if (level === 'low')      return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={s}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  if (level === 'medium')   return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  if (level === 'high')     return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={s}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={s}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
}

const styles = {
  spinner: {
    width: 40, height: 40,
    border: '3px solid rgba(243,112,33,0.2)',
    borderTopColor: C.orange,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  spinnerSm: {
    display: 'inline-block',
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
}
