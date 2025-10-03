import nodemailer from 'nodemailer';

// Create transporter
export const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});