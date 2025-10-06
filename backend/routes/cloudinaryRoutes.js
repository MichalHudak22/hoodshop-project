// server/routes/cloudinary.js
const express = require('express');
const crypto = require('crypto');
require('dotenv').config();

const router = express.Router();

// Endpoint pre získanie signed params
router.get('/sign', (req, res) => {
  const { folder, public_id } = req.query;
  const timestamp = Math.floor(Date.now() / 1000);

  let paramsToSign = `timestamp=${timestamp}`;
  if (folder) paramsToSign += `&folder=${folder}`;
  if (public_id) paramsToSign += `&public_id=${public_id}`;

  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
    .digest('hex');

  res.json({
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    folder,
    public_id,
  });
});

// ⚠️ CommonJS export namiesto ESM
module.exports = router;
