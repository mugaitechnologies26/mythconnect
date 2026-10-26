const { verifyMetaSignature } = require('../../utils/crypto');
const config = require('../../config');
const logger = require('../../utils/logger');

function validateMetaRequest(req) {
  // If in local dev or simulation mode, allow relaxed signature if explicitly set
  if (config.nodeEnv === 'development' && req.headers['x-bypass-signature'] === 'true') {
    logger.warn('META_SIG', 'Signature check bypassed via development flag');
    return true;
  }

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    logger.warn('META_SIG', 'Missing x-hub-signature-256 header in Meta request');
    return false;
  }

  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
  const isValid = verifyMetaSignature(rawBody, signature, config.meta.appSecret);
  
  if (!isValid) {
    logger.error('META_SIG', 'Invalid Meta webhook signature detected');
  }
  return isValid;
}

module.exports = {
  validateMetaRequest
};
