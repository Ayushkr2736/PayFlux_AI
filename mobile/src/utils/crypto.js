// mobile/src/utils/crypto.js
import CryptoJS from 'react-native-crypto-js';
const SECRET_KEY = "payflux-internal-secure-key";

export const encrypt = (data) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(str, SECRET_KEY).toString();
};

export const decrypt = (ciphertext) => {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (e) { return null; }
};
