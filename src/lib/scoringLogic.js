/**
 * Scoring Logic for all 9 Psychological Scales
 * Derived directly from Kobo.xlsx hint fields
 */

export const SCALES = {
  q1: {
    id: 'q1',
    name: 'مقياس العزلة',
    nameEn: 'Isolation Scale',
    icon: '🧩',
    items: ['iso1','iso2','iso3','iso4','iso5','iso6','iso7','iso8','iso9','iso10','iso11'],
    choiceList: 'qv09c88',
    maxScore: 33,
    interpret: (score) => {
      if (score <= 16) return { level: 'low',    ar: 'لا يوجد شعور بالعزلة',    en: 'No Isolation', color: 'risk-low' }
      return               { level: 'high',   ar: 'يوجد إحساس بالعزلة',        en: 'Isolation Present', color: 'risk-high' }
    },
    hints: 'العلامة الكلية تتراوح بين (0-33). (0-16) لا يوجد شعور بالعزلة. (17-33) تدل على وجود إحساس بالعزلة، كلما ارتفعت الدرجة ارتفع مؤشر العزلة.',
  },
  q2: {
    id: 'q2',
    name: 'مقياس الاكتئاب',
    nameEn: 'Depression Scale',
    icon: '😔',
    items: ['dep1','dep2','dep3','dep4','dep5','dep6','dep7','dep8','dep9','dep10','dep11','dep12','dep13','dep14','dep15','dep16','dep17','dep18','dep19','dep20'],
    choiceList: 'fa86q45',
    maxScore: 60,
    interpret: (score) => {
      if (score <= 9)  return { level: 'low',      ar: 'لا يوجد اكتئاب',    en: 'No Depression', color: 'risk-low' }
      if (score <= 15) return { level: 'medium',   ar: 'اكتئاب ضعيف',       en: 'Mild Depression', color: 'risk-medium' }
      if (score <= 23) return { level: 'high',     ar: 'اكتئاب متوسط',      en: 'Moderate Depression', color: 'risk-high' }
      return                  { level: 'critical', ar: 'اكتئاب شديد',        en: 'Severe Depression', color: 'risk-critical' }
    },
    hints: 'العلامة الكلية تتراوح بين (0-60). (0-9) لا يوجد اكتئاب. (10-15) اكتئاب ضعيف. (16-23) اكتئاب متوسط. (23+) اكتئاب شديد.',
  },
  q3: {
    id: 'q3',
    name: 'مقياس العدوانية',
    nameEn: 'Aggressiveness Scale',
    icon: '⚡',
    items: ['agra_1','agra_2','agra_3','agra_4','agra_5','agra_6','agra_7','agra_8','agra_9','agra_10','agra_11','agra_12','agra_13','agra_14','agra_15','agra_16','agra_17','agra_18','agra_19','agra_20','agra_21','agra_22'],
    choiceList: 'to2mv81',
    maxScore: 44,
    interpret: (score) => {
      if (score < 18) return { level: 'low',  ar: 'مستوى عدوانية طبيعي', en: 'Normal', color: 'risk-low' }
      return                 { level: 'high', ar: 'مستوى عالٍ من العدوانية', en: 'High Aggressiveness', color: 'risk-critical' }
    },
    hints: 'العلامة الكلية تتراوح بين (0-44). العلامة (18) فما فوق تعتبر مستوى عالياً من العدوانية.',
  },
  q4: {
    id: 'q4',
    name: 'مقياس الصحة النفسية',
    nameEn: 'Mental Health Scale',
    icon: '🧠',
    items: ['mh_1','mh_2','mh_3','mh_4','mh_5','mh_6','mh_7','mh_8','mh_9','mh_10','mh_11','mh_12','mh_13','mh_14','mh_15'],
    choiceList: 'xm6zh72',
    maxScore: 15,
    interpret: (score) => {
      if (score >= 13) return { level: 'low',      ar: 'صحة نفسية ممتازة',            en: 'Excellent Mental Health', color: 'risk-low' }
      if (score >= 9)  return { level: 'medium',   ar: 'صحة نفسية جيدة',              en: 'Good Mental Health', color: 'risk-low' }
      if (score >= 5)  return { level: 'high',     ar: 'يحتاج إلى توازن نفسي',        en: 'Needs Balance', color: 'risk-medium' }
      return                  { level: 'critical', ar: 'يعاني من اضطراب ويحتاج دعم',  en: 'Disorder – Needs Support', color: 'risk-critical' }
    },
    hints: 'العلامة الكلية تتراوح بين (0-15). (13-15) صحة نفسية ممتازة. (9-12) صحة نفسية جيدة. (5-8) يحتاج توازن. (أقل من 5) اضطراب.',
  },
  q5: {
    id: 'q5',
    name: 'مقياس القلق والتوتر',
    nameEn: 'Anxiety & Stress Scale',
    icon: '😰',
    items: ['st_1','st_2','st_3','st_4','st_5','st_6','st_7','st_8','st_9','st_10','st_11','st_12','st_13','st_14','st_15','st_16','st_17','st_18','st_19','st_20','st_21','st_22','st_23','st_24','st_25','st_26','st_27','st_28','st_29','st_30','st_31','st_32','st_33','st_34','st_35'],
    choiceList: 'wq1dt68',
    maxScore: 70,
    interpret: (score) => {
      if (score <= 17) return { level: 'low',      ar: 'توتر نفسي منخفض',  en: 'Low Stress', color: 'risk-low' }
      if (score <= 34) return { level: 'medium',   ar: 'توتر نفسي متوسط',  en: 'Moderate Stress', color: 'risk-medium' }
      if (score <= 52) return { level: 'high',     ar: 'توتر نفسي مرتفع',  en: 'High Stress', color: 'risk-high' }
      return                  { level: 'critical', ar: 'توتر نفسي شديد',   en: 'Severe Stress', color: 'risk-critical' }
    },
    hints: 'العلامة الكلية تتراوح بين (0-70). (0) درجة منخفضة. (35) درجة متوسطة. (70) درجة عالية.',
  },
  q6: {
    id: 'q6',
    name: 'مقياس اضطراب ما بعد الصدمة',
    nameEn: 'PTSD Scale',
    icon: '💭',
    items: ['pt1','pt2','pt3','pt4','pt5','pt6','pt7','pt8','pt9','pt10','pt11','pt12','pt13','pt14','pt15','pt16','pt17'],
    choiceList: 'se7kw59',
    maxScore: 51,
    interpret: (score) => {
      if (score <= 12) return { level: 'low',      ar: 'لا يوجد اضطراب ما بعد الصدمة', en: 'No PTSD', color: 'risk-low' }
      if (score <= 24) return { level: 'medium',   ar: 'أعراض PTSD خفيفة',              en: 'Mild PTSD Symptoms', color: 'risk-medium' }
      if (score <= 38) return { level: 'high',     ar: 'أعراض PTSD متوسطة',             en: 'Moderate PTSD', color: 'risk-high' }
      return                  { level: 'critical', ar: 'أعراض PTSD شديدة',              en: 'Severe PTSD', color: 'risk-critical' }
    },
    hints: 'مقياس اضطراب ما بعد الصدمة PTSD.',
  },
  q7: {
    id: 'q7',
    name: 'مقياس فرط النشاط',
    nameEn: 'Hyperactivity Scale',
    icon: '🌀',
    items: ['ac_1','ac_2','ac_3','ac_4','ac_5','ac_6','ac_7','ac_8','ac_9','ac_10','ac_11','ac_12','ac_13','ac_14','ac_15','ac_16','ac_17','ac_18','ac_19','ac_20','ac_21','ac_22'],
    choiceList: 'ec5pq68',
    maxScore: 88,
    interpret: (score) => {
      if (score <= 29) return { level: 'low',      ar: 'لا يوجد فرط نشاط',      en: 'Normal', color: 'risk-low' }
      if (score <= 50) return { level: 'medium',   ar: 'فرط نشاط خفيف',          en: 'Mild Hyperactivity', color: 'risk-medium' }
      if (score <= 70) return { level: 'high',     ar: 'فرط نشاط متوسط',         en: 'Moderate Hyperactivity', color: 'risk-high' }
      return                  { level: 'critical', ar: 'فرط نشاط شديد يحتاج تدخل', en: 'Severe Hyperactivity', color: 'risk-critical' }
    },
    hints: 'مقياس فرط النشاط وتشتت الانتباه ADHD.',
  },
  q8: {
    id: 'q8',
    name: 'مقياس التبول اللاإرادي',
    nameEn: 'Bedwetting Scale',
    icon: '💧',
    items: ['b1','b2','b3','b4','b5','b6','b7','b8','b9','b10','b11','b12','b13','b14','b15','b16','b17','b18','b19','b20'],
    choiceList: 'zc2eo67',
    maxScore: 20,
    interpret: (score) => {
      if (score <= 5)  return { level: 'low',      ar: 'ضمن النمو الطبيعي',                     en: 'Normal Development', color: 'risk-low' }
      if (score <= 10) return { level: 'medium',   ar: 'متوسط – يحتاج متابعة منزلية',           en: 'Moderate – Home Follow-up', color: 'risk-medium' }
      if (score <= 15) return { level: 'high',     ar: 'يُفضل استشارة طبيب وأخصائي نفسي',       en: 'High – Consult Specialist', color: 'risk-high' }
      return                  { level: 'critical', ar: 'خطر عالٍ – يتطلب تدخلاً طبياً فورياً', en: 'Critical – Immediate Medical Intervention', color: 'risk-critical' }
    },
    hints: 'الدرجة النهائية بين (0-20). (0-5) ضمن النمو الطبيعي. (6-10) متوسط. (11-15) يُفضل استشارة. (16-20) خطر عالٍ.',
  },
  q9: {
    id: 'q9',
    name: 'مقياس الانتحار',
    nameEn: 'Suicide Risk Scale',
    icon: '⚠️',
    items: ['su1','su2','su3','su4','su5','su6','su7','su8','su9','su10','su11','su12','su13','su14','su15','su16','su17','su18','su19','su20'],
    choiceList: 'ap4ae03',
    maxScore: 20,
    interpret: (score) => {
      if (score <= 4)  return { level: 'low',      ar: 'خطر منخفض – ضيق بسيط',              en: 'Low Risk', color: 'risk-low' }
      if (score <= 9)  return { level: 'medium',   ar: 'خطر متوسط – طلب استشارة نفسية',     en: 'Moderate Risk', color: 'risk-medium' }
      if (score <= 14) return { level: 'high',     ar: 'خطر مرتفع – تواصل مع مختص فوراً',   en: 'High Risk', color: 'risk-high' }
      return                  { level: 'critical', ar: 'خطر شديد – مساعدة فورية طوارئ',      en: 'Critical Risk – Emergency', color: 'risk-critical' }
    },
    hints: 'الدرجة (0-20). (0-4) خطر منخفض. (5-9) خطر متوسط. (10-14) خطر مرتفع. (15-20) خطر شديد.',
    isSensitive: true,
  }
}

export const CHOICES = {
  qv09c88: [ { value: 0, label: 'لا أوافق' }, { value: 1, label: 'غير متأكد' }, { value: 2, label: 'أوافق' }, { value: 3, label: 'أوافق بشدة' } ],
  fa86q45: [ { value: 0, label: 'كلا' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'غالباً' }, { value: 3, label: 'نعم تماماً' } ],
  to2mv81: [ { value: 0, label: 'لا يحدث' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'باستمرار' } ],
  xm6zh72: [ { value: 0, label: 'لا ينطبق' }, { value: 1, label: 'ينطبق' } ],
  wq1dt68: [ { value: 0, label: 'لا ينطبق' }, { value: 1, label: 'أحياناً' }, { value: 2, label: 'كثيراً' } ],
  se7kw59: [ { value: 0, label: 'أبداً لم يحصل' }, { value: 1, label: 'أحياناً (مرة في الأسبوع)' }, { value: 2, label: 'غالباً (2-4 مرات في الأسبوع)' }, { value: 3, label: 'دائماً (5 مرات أو أكثر)' } ],
  ec5pq68: [ { value: 1, label: 'نهائياً' }, { value: 2, label: 'بعض الأحيان' }, { value: 3, label: 'كثيراً' }, { value: 4, label: 'دائماً' } ],
  zc2eo67: [ { value: 0, label: 'لا أوافق' }, { value: 1, label: 'أوافق' } ],
  ap4ae03: [ { value: 0, label: 'لا أوافق' }, { value: 1, label: 'أوافق' } ],
}

export function calculateScore(scaleId, answers) {
  const scale = SCALES[scaleId]
  if (!scale) return 0
  return scale.items.reduce((sum, item) => {
    const val = answers[item]
    return sum + (val !== undefined && val !== null && val !== '' ? Number(val) : 0)
  }, 0)
}

export function getInterpretation(scaleId, score) {
  const scale = SCALES[scaleId]
  if (!scale) return null
  return scale.interpret(score)
}

export const RISK_LABELS = {
  low:      { ar: 'منخفض', color: '#27ae60' },
  medium:   { ar: 'متوسط', color: '#f39c12' },
  high:     { ar: 'مرتفع', color: '#e67e22' },
  critical: { ar: 'حرج',   color: '#c0392b' },
}
