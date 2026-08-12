import '../styles/badge.css';

// Maps common status strings across resources (campaigns/tasks/storefronts/etc.) to a visual
// tone. Falls back to 'neutral' for anything unrecognized rather than guessing.
const TONE_BY_STATUS = {
  active: 'success',
  open: 'warning',
  in_progress: 'warning',
  done: 'success',
  paused: 'neutral',
  completed: 'success',
  inactive: 'danger',
};

export function Badge({ children, tone }) {
  const resolvedTone = tone || TONE_BY_STATUS[String(children).toLowerCase()] || 'neutral';
  return <span className={`badge badge--${resolvedTone}`}>{children}</span>;
}
