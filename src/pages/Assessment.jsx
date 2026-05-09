import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { SCALES, calculateScore, getInterpretation } from '../lib/scoringLogic'
import { SCALE_QUESTIONS } from '../lib/questions'
import ScaleQuestion from '../components/ScaleQuestion'
import Navbar from '../components/Navbar'
import {
  User, Calendar, Phone, MapPin, ClipboardList,
  ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, Brain
} from 'lucide-react'

const STEPS = ['consent', 'demographics', 'scale_select', 'assessment', 'confirm']

const CONSENT_TEXT = `هذا الاستبيان هو لجمع المعلومات التقنية الخاصة بالمخاطر النفسية التي تؤثر سلبياً على الرفاه النفسي والاجتماعي. كل المعلومات سرية وطيّ الكتمان ولا أحد يطلع عليها إلا بموافقتك. هل توافق على إجراءه؟`

export default function Assessment() {
  const navigate  = useNavigate()
  const { user }  = useAuth()

  const [step,        setStep]        = useState(0) // 0=consent,1=demo,2=scale,3=assess,4=confirm
  const [consented,   setConsented]   = useState(false)
  const [demo,        setDemo]        = useState({ child_name: '', age: '', gender: '', address: '', phone: '', therapist_name: '', evaluation_date: new Date().toISOString().split('T')[0] })
  const [selectedScale, setSelectedScale] = useState('')
  const [answers,     setAnswers]     = useState({})
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const currentScale = SCALES[selectedScale]
  const questions    = SCALE_QUESTIONS[selectedScale] || []
  const answered     = questions.filter(q => answers[q.name] !== undefined && answers[q.name] !== '')
  const progress     = questions.length > 0 ? Math.round((answered.length / questions.length) * 100) : 0

  function handleAnswer(name, val) {
    setAnswers(prev => ({ ...prev, [name]: val }))
  }

  function canProceed() {
    if (step === 0) return consented
    if (step === 1) return demo.child_name && demo.age && demo.gender && demo.therapist_name && demo.evaluation_date
    if (step === 2) return !!selectedScale
    if (step === 3) return answered.length === questions.length
    return true
  }

  async function handleSubmit() {
    setSaving(true)
    setError('')
    try {
      const score          = calculateScore(selectedScale, answers)
      const interpretation = getInterpretation(selectedScale, score)

      // 1. Upsert case
      const { data: caseData, error: caseErr } = await supabase
        .from('cases')
        .insert({
          child_name: demo.child_name,
          age:        Number(demo.age),
          gender:     demo.gender,
          address:    demo.address || null,
          phone:      demo.phone   || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (caseErr) throw caseErr

      // 2. Insert evaluation
      const { data: evalData, error: evalErr } = await supabase
        .from('evaluations')
        .insert({
          case_id:         caseData.id,
          scale_id:        selectedScale,
          therapist_name:  demo.therapist_name,
          evaluation_date: demo.evaluation_date,
          score,
          risk_level:      interpretation.level,
          answers,
          created_by:      user.id,
        })
        .select()
        .single()

      if (evalErr) throw evalErr

      navigate(`/assessment/${evalData.id}/result`)
    } catch (err) {
      console.error(err)
      setError('حدث خطأ أثناء الحفظ: ' + (err.message || 'خطأ غير معروف'))
    } finally {
      setSaving(false)
    }
  }

  const stepTitles = ['الموافقة المستنيرة', 'بيانات الحالة', 'اختيار المقياس', 'الأسئلة', 'المراجعة والإرسال']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="container-narrow" style={{ padding: '2rem 1.5rem' }}>
        {/* Step Progress */}
        <div className="wizard-progress card animate-fade-in-up" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
          <div className="wizard-steps">
            {stepTitles.map((t, i) => (
              <div key={i} className={`wizard-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="wizard-step-dot">
                  {i < step ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
                </div>
                <span className="wizard-step-label">{t}</span>
              </div>
            ))}
          </div>
          {step === 3 && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>تقدم الإجابات</span>
                <span>{answered.length} / {questions.length}</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Step 0: Consent */}
        {step === 0 && (
          <div className="card animate-fade-in-up">
            <div className="step-header">
              <div className="step-icon-wrap" style={{ background: 'rgba(243,112,33,0.1)' }}>
                <ClipboardList size={24} style={{ color: 'var(--tdh-orange)' }} />
              </div>
              <div>
                <h2>الموافقة المستنيرة</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>يرجى قراءة النص التالي والموافقة على المتابعة</p>
              </div>
            </div>
            <div className="consent-box">{CONSENT_TEXT}</div>
            <label className="consent-checkbox">
              <input type="checkbox" checked={consented} onChange={e => setConsented(e.target.checked)} id="consent-check" />
              <span>أوافق على إجراء التقييم وقد أُبلغت بحقوقي في سرية المعلومات</span>
            </label>
          </div>
        )}

        {/* Step 1: Demographics */}
        {step === 1 && (
          <div className="card animate-fade-in-up">
            <div className="step-header">
              <div className="step-icon-wrap" style={{ background: 'rgba(0,51,102,0.08)' }}>
                <User size={24} style={{ color: 'var(--tdh-navy)' }} />
              </div>
              <div>
                <h2>بيانات الحالة</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>أدخل معلومات الطفل والجلسة</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="child_name">اسم الطفل *</label>
                <div className="input-wrapper">
                  <User size={16} style={{ position:'absolute', right:'0.85rem', color:'var(--text-muted)', pointerEvents:'none' }} />
                  <input id="child_name" className="form-control" style={{ paddingRight: '2.5rem' }} placeholder="الاسم الكامل"
                    value={demo.child_name} onChange={e => setDemo(d => ({ ...d, child_name: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="age">العمر *</label>
                <input id="age" type="number" className="form-control" placeholder="مثال: 10" min={3} max={18}
                  value={demo.age} onChange={e => setDemo(d => ({ ...d, age: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="gender">الجنس *</label>
                <select id="gender" className="form-control"
                  value={demo.gender} onChange={e => setDemo(d => ({ ...d, gender: e.target.value }))} required>
                  <option value="">اختر...</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="phone">رقم الهاتف</label>
                <input id="phone" type="tel" className="form-control" placeholder="07XXXXXXXXX"
                  value={demo.phone} onChange={e => setDemo(d => ({ ...d, phone: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="address">العنوان الكامل</label>
                <input id="address" className="form-control" placeholder="المحافظة / الحي / الشارع"
                  value={demo.address} onChange={e => setDemo(d => ({ ...d, address: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="therapist_name">اسم المعالج النفسي *</label>
                <input id="therapist_name" className="form-control" placeholder="اسم المعالج"
                  value={demo.therapist_name} onChange={e => setDemo(d => ({ ...d, therapist_name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="eval_date">تاريخ المقابلة *</label>
                <input id="eval_date" type="date" className="form-control"
                  value={demo.evaluation_date} onChange={e => setDemo(d => ({ ...d, evaluation_date: e.target.value }))} required />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Scale Selection */}
        {step === 2 && (
          <div className="card animate-fade-in-up">
            <div className="step-header">
              <div className="step-icon-wrap" style={{ background: 'rgba(243,112,33,0.1)' }}>
                <Brain size={24} style={{ color: 'var(--tdh-orange)' }} />
              </div>
              <div>
                <h2>اختيار المقياس النفسي</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>اختر المقياس المناسب للحالة</p>
              </div>
            </div>
            <div className="scales-grid">
              {Object.values(SCALES).map(scale => (
                <button
                  key={scale.id}
                  id={`scale-${scale.id}`}
                  className={`scale-card ${selectedScale === scale.id ? 'scale-card-selected' : ''}`}
                  onClick={() => { setSelectedScale(scale.id); setAnswers({}) }}
                >
                  <span className="scale-card-icon">{scale.icon}</span>
                  <span className="scale-card-name">{scale.name}</span>
                  <span className="scale-card-count">{SCALE_QUESTIONS[scale.id]?.length} فقرة</span>
                  {scale.isSensitive && <span className="scale-sensitive">⚠️ حساس</span>}
                </button>
              ))}
            </div>
            {selectedScale && (
              <div className="scale-hint animate-fade-in">
                <AlertTriangle size={16} style={{ color: 'var(--tdh-orange)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {SCALES[selectedScale]?.hints}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Questions */}
        {step === 3 && currentScale && (
          <div>
            <div className="card" style={{ marginBottom: '1rem', padding: '1rem 1.5rem', background: 'linear-gradient(135deg, var(--tdh-navy), var(--tdh-navy-dark))', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{currentScale.icon}</span>
                <div>
                  <h3 style={{ color: 'white', margin: 0 }}>{currentScale.name}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0 }}>
                    {questions.length} فقرة — الدرجة الكلية من {currentScale.maxScore}
                  </p>
                </div>
              </div>
            </div>
            <div className="questions-list">
              {questions.map((q, i) => (
                <ScaleQuestion
                  key={q.name}
                  question={q}
                  index={i}
                  scaleId={selectedScale}
                  choiceList={currentScale.choiceList}
                  value={answers[q.name]}
                  onChange={handleAnswer}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && currentScale && (
          <div className="card animate-fade-in-up">
            <div className="step-header">
              <div className="step-icon-wrap" style={{ background: 'rgba(39,174,96,0.1)' }}>
                <CheckCircle size={24} style={{ color: '#27ae60' }} />
              </div>
              <div>
                <h2>مراجعة وإرسال</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>راجع المعلومات قبل الإرسال النهائي</p>
              </div>
            </div>
            <div className="confirm-grid">
              <InfoRow label="اسم الطفل" value={demo.child_name} />
              <InfoRow label="العمر" value={`${demo.age} سنة`} />
              <InfoRow label="الجنس" value={demo.gender} />
              <InfoRow label="المعالج النفسي" value={demo.therapist_name} />
              <InfoRow label="تاريخ المقابلة" value={demo.evaluation_date} />
              <InfoRow label="المقياس المختار" value={`${currentScale.icon} ${currentScale.name}`} />
              <InfoRow label="عدد الفقرات المجاب عنها" value={`${answered.length} / ${questions.length}`} />
            </div>
            {error && (
              <div className="alert alert-error animate-fade-in" style={{ marginTop: '1rem' }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="wizard-nav animate-fade-in">
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} disabled={saving}>
              <ChevronRight size={18} /> السابق
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button
              id="wizard-next-btn"
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              التالي <ChevronLeft size={18} />
            </button>
          ) : (
            <button
              id="wizard-submit-btn"
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? <><span className="spinner-sm" /> جارٍ الحفظ...</> : <><CheckCircle size={18} /> حفظ وعرض النتائج</>}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .step-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-light);
        }
        .step-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .step-header h2 { margin: 0 0 4px; }
        .consent-box {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          padding: 1.25rem;
          font-size: 0.95rem;
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }
        .consent-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.75rem;
          border-radius: 12px;
          background: rgba(243,112,33,0.05);
          border: 1.5px solid rgba(243,112,33,0.15);
        }
        .consent-checkbox input { width: 18px; height: 18px; accent-color: var(--tdh-orange); margin-top: 2px; flex-shrink: 0; }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

        .scales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .scale-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          padding: 1.25rem 0.75rem;
          border: 2px solid var(--border-light);
          border-radius: 14px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-arabic);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
        }
        .scale-card:hover {
          border-color: var(--tdh-orange);
          background: var(--tdh-orange-subtle);
          color: var(--tdh-orange-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-orange);
        }
        .scale-card-selected {
          border-color: var(--tdh-orange) !important;
          background: linear-gradient(135deg, var(--tdh-orange), var(--tdh-orange-dark)) !important;
          color: white !important;
          box-shadow: var(--shadow-orange);
        }
        .scale-card-icon { font-size: 2rem; }
        .scale-card-name { font-weight: 700; }
        .scale-card-count { font-size: 0.8rem; opacity: 0.75; }
        .scale-sensitive {
          position: absolute;
          top: 6px; left: 6px;
          font-size: 0.7rem;
          background: rgba(192,57,43,0.12);
          color: #c0392b;
          border-radius: 6px;
          padding: 2px 6px;
        }
        .scale-hint {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          background: rgba(243,112,33,0.05);
          border: 1px solid rgba(243,112,33,0.2);
          border-radius: 12px;
          padding: 0.875rem 1rem;
        }

        .questions-list { display: flex; flex-direction: column; gap: 0.75rem; }

        .confirm-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        @media (max-width: 600px) { .confirm-grid { grid-template-columns: 1fr; } }

        .wizard-steps {
          display: flex;
          gap: 0;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .wizard-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
          position: relative;
        }
        .wizard-step::after {
          content: '';
          position: absolute;
          top: 13px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--border-light);
        }
        .wizard-step:last-child::after { display: none; }
        .wizard-step.done::after { background: var(--tdh-orange); }
        .wizard-step-dot {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          background: var(--border-light);
          color: var(--text-muted);
          position: relative;
          z-index: 1;
          transition: all 0.2s;
        }
        .wizard-step.active .wizard-step-dot {
          background: var(--tdh-orange);
          color: white;
          box-shadow: 0 0 0 4px rgba(243,112,33,0.2);
        }
        .wizard-step.done .wizard-step-dot {
          background: var(--tdh-orange);
          color: white;
        }
        .wizard-step-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          white-space: nowrap;
        }
        .wizard-step.active .wizard-step-label { color: var(--tdh-orange); font-weight: 600; }

        .wizard-nav {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .alert-error {
          background: rgba(231,76,60,0.1);
          border: 1px solid rgba(231,76,60,0.25);
          color: #c0392b;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
        }
        .spinner-sm {
          display: inline-block;
          width: 18px; height: 18px;
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

function InfoRow({ label, value }) {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-light)',
      borderRadius: 10,
      padding: '0.75rem 1rem',
    }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
