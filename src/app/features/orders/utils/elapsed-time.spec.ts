import { formatElapsed } from './elapsed-time';

describe('formatElapsed', () => {
  const createdAt = '2026-09-27T09:00:00.000Z';
  const createdMs = Date.parse(createdAt);

  it('formats durations under an hour as minutes and seconds', () => {
    expect(formatElapsed(createdAt, createdMs + (4 * 60 + 12) * 1000)).toBe('4m 12s ago');
    expect(formatElapsed(createdAt, createdMs + (24 * 60 + 15) * 1000)).toBe('24m 15s ago');
  });

  it('formats durations under a day as hours and minutes', () => {
    expect(formatElapsed(createdAt, createdMs + (3 * 60 + 5) * 60 * 1000)).toBe('3h 5m ago');
  });

  it('formats multi-day durations as days and hours', () => {
    expect(formatElapsed(createdAt, createdMs + (17 * 24 + 2) * 60 * 60 * 1000)).toBe('17d 2h ago');
  });

  it('does not invent a duration for an invalid timestamp', () => {
    expect(formatElapsed('not-a-date', createdMs)).toBe('Unknown time');
  });
});
