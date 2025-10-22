// middleware/failedLoginAttempts.js
const attempts = new Map(); // email -> { count, lockUntil }

function getAttempts(email) {
  if (!attempts.has(email)) {
    attempts.set(email, { count: 0, lockUntil: null });
  }
  return attempts.get(email);
}

function registerFailedAttempt(email) {
  const data = getAttempts(email);
  const now = Date.now();

  if (data.lockUntil && now < data.lockUntil) {
    return data; // už blokovaný
  }

  data.count += 1;
  if (data.count >= 5) {
    data.lockUntil = now + 5 * 60 * 1000; // 10 minút blok
    data.count = 0; // resetujeme counter po locku
  }

  attempts.set(email, data);
  return data;
}

function resetAttempts(email) {
  attempts.set(email, { count: 0, lockUntil: null });
}

module.exports = { getAttempts, registerFailedAttempt, resetAttempts };
