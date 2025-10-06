// server/routes/cloudinary.js
import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Endpoint pre získanie signed params
router.get('/sign', (req, res) => {
  const { folder, public_id } = req.query;

  const timestamp = Math.floor(Date.now() / 1000);

  // Nastavenie parametrov pre Cloudinary signature
  let paramsToSign = `timestamp=${timestamp}`;
  if (folder) paramsToSign += `&folder=${folder}`;
  if (public_id) paramsToSign += `&public_id=${public_id}`;

  // Vytvorenie signature pomocou API_SECRET
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

export default router;
