// Calendar dates avoid timezone shifts from parsing YYYY-MM-DD as UTC.
export function isAdult(birthdate: string, today = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) return false;
  const [year, month, day] = birthdate.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return false;
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  )
    age--;
  return age >= 18 && year >= 1900;
}
