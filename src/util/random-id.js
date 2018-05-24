/* eslint-disable */
// gotta keep it within MAX_SAFE_INTEGER
const extraDigits = 3;

function createRandomId() {


  // 13 time digits
  const datePart = new Date().getTime() * Math.pow(10, extraDigits);
  // 3 random digits
  const extraPart = Math.floor(Math.random() * Math.pow(10, extraDigits));
  return datePart + extraPart;
}
// 16 digits
module.exports = createRandomId;
