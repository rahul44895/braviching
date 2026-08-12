const UNITS = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

// Parses simple durations like '15m', '7d', '30s' into milliseconds.
function parseDuration(value) {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) throw new Error(`Invalid duration string: ${value}`);
  const [, amount, unit] = match;
  return Number(amount) * UNITS[unit];
}

module.exports = parseDuration;
