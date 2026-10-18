import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdult } from '../src/lib/age.ts';

const today = new Date(2026, 9, 17, 12);
test('18th birthday is accepted, tomorrow is not', () => {
  assert.equal(isAdult('2008-10-17', today), true);
  assert.equal(isAdult('2008-10-18', today), false);
  assert.equal(isAdult('2008-10-16', today), true);
});
test('invalid calendar dates and formats are rejected', () => {
  for (const date of [
    '2000-02-30',
    '2001-02-29',
    '2000-13-01',
    '2000-00-01',
    '2000-01-00',
    '10/17/2000',
    '',
    'abcd-ef-gh',
  ]) {
    assert.equal(isAdult(date, today), false, date);
  }
});
test('future dates and implausible birth years are rejected', () => {
  assert.equal(isAdult('2027-01-01', today), false);
  assert.equal(isAdult('1899-01-01', today), false);
});
test('leap-day birthdays reach adulthood on March 1 in non-leap years', () => {
  assert.equal(isAdult('2008-02-29', new Date(2026, 1, 28)), false);
  assert.equal(isAdult('2008-02-29', new Date(2026, 2, 1)), true);
});
