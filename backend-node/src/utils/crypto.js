const crypto = require('crypto');

function verifyMetaSignature(payloadBuffer, signatureHeader, appSecret) {
  if (!signatureHeader || !appSecret) return false;
  
  // Format is: sha256={hash}
  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    return false;
  }
  
  const expectedHash = parts[1];
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(payloadBuffer);
  const actualHash = hmac.digest('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(actualHash, 'utf8'), Buffer.from(expectedHash, 'utf8'));
  } catch (e) {
    return false;
  }
}

function generateRandomId(prefix = 'id') {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

module.exports = {
  verifyMetaSignature,
  generateRandomId
};
