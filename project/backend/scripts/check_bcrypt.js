import bcrypt from 'bcrypt';

const hash = '$2b$10$OABPu3jVsafwlMfmBgFqWOnTgu5YBgqUOZMvRyOw3/ym2eBmd78im';
const password = '123456';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Match:', result);
  }
});
