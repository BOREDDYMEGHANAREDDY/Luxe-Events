const express = require('express');
const router = express.Router();
const { Contact } = require('../models/index');
const { sendEmail } = require('../utils/email');

router.post('/', async (req, res) => {
  const msg = await Contact.create(req.body);
  try {
    await sendEmail({ to: process.env.EMAIL_USER, subject: `New Inquiry: ${req.body.subject}`, template: 'contactNotification', data: req.body });
    await sendEmail({ to: req.body.email, subject: 'Thank you for contacting Luxe Events!', template: 'contactAck', data: { name: req.body.name } });
  } catch (_) {}
  res.status(201).json({ success: true, message: 'Message sent! We will get back to you within 24 hours.', data: { id: msg._id } });
});

module.exports = router;
