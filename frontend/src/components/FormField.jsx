import '../styles/form.css';

export function FormField({ label, error, children, hint }) {
  return (
    <div className="form-field">
      {label && <label className="form-field__label">{label}</label>}
      {children}
      {hint && !error && <div className="form-field__hint">{hint}</div>}
      {error && <div className="form-field__error">{error}</div>}
    </div>
  );
}

export function Input(props) {
  return <input className="form-field__input" {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className="form-field__input" {...props}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea className="form-field__input" rows={3} {...props} />;
}
