import { CHOICES } from '../lib/scoringLogic'

export default function ScaleQuestion({ question, index, scaleId, choiceList, value, onChange }) {
  const choices = CHOICES[choiceList] || []

  return (
    <div className={`scale-q animate-fade-in-up`} style={{ animationDelay: `${index * 0.04}s`, opacity: 0, animation: `fadeInUp 0.4s ease ${index * 0.04}s forwards` }}>
      <div className="scale-q-text">
        <span className="scale-q-num">{index + 1}</span>
        <span>{question.label}</span>
      </div>
      <div className="scale-q-choices">
        {choices.map(choice => (
          <label
            key={choice.value}
            className={`choice-btn ${Number(value) === Number(choice.value) && value !== '' && value !== undefined ? 'choice-selected' : ''}`}
            htmlFor={`${question.name}_${choice.value}`}
          >
            <input
              type="radio"
              id={`${question.name}_${choice.value}`}
              name={question.name}
              value={choice.value}
              checked={Number(value) === Number(choice.value) && value !== '' && value !== undefined}
              onChange={() => onChange(question.name, choice.value)}
              style={{ display: 'none' }}
            />
            <span className="choice-indicator" />
            <span className="choice-label">{choice.label}</span>
          </label>
        ))}
      </div>

      <style>{`
        .scale-q {
          background: white;
          border: 1.5px solid var(--border-light);
          border-radius: 14px;
          padding: 1.1rem 1.25rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .scale-q:hover { border-color: rgba(243,112,33,0.3); box-shadow: var(--shadow-sm); }
        .scale-q-text {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.5;
        }
        .scale-q-num {
          flex-shrink: 0;
          width: 26px; height: 26px;
          background: var(--tdh-orange-subtle);
          color: var(--tdh-orange-dark);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .scale-q-choices {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-right: 2rem;
        }
        .choice-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          border: 1.5px solid var(--border-light);
          border-radius: 999px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.15s ease;
          user-select: none;
          white-space: nowrap;
          background: var(--bg-primary);
        }
        .choice-btn:hover {
          border-color: var(--tdh-orange);
          color: var(--tdh-orange);
          background: var(--tdh-orange-subtle);
        }
        .choice-selected {
          border-color: var(--tdh-orange) !important;
          background: linear-gradient(135deg, var(--tdh-orange), var(--tdh-orange-dark)) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(243,112,33,0.25);
        }
        .choice-indicator {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.5;
        }
        .choice-selected .choice-indicator { opacity: 1; background: white; }
      `}</style>
    </div>
  )
}
