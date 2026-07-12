/**
 * @fileoverview Email sending utility using Nodemailer.
 * Creates a reusable SMTP transporter from config and exposes a
 * single `sendEmail` function. Failures are logged but never crash
 * the calling process – email is treated as a best-effort side-effect.
 */

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

/**
 * Create a Nodemailer SMTP transporter.
 * The transporter is created once and reused across calls.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // true for 465, false for 587
    auth: {
      user: config.smtp.email,
      pass: config.smtp.password,
    },
  });
};

/**
 * Send an email. Errors are caught and logged so that a failed
 * email never crashes the request handler.
 *
 * @param {Object} options
 * @param {string} options.to       Recipient email address
 * @param {string} options.subject  Email subject line
 * @param {string} options.html     HTML body content
 * @returns {Promise<boolean>}      true if sent, false on failure
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} → ${to}`);
    return true;
  } catch (error) {
    logger.error(`Email send failed → ${to}: ${error.message}`);
    return false;
  }
};

module.exports = sendEmail;
