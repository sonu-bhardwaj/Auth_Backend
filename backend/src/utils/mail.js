// Importing necessary modules
import Mailgen from "mailgen"; // For generating email templates
import nodemailer from "nodemailer"; // For sending emails

// Function to generate email content for email verification
const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username, // Personalizing the email with the user's name
      intro: "Welcome to YourAppName! We’re excited to have you on board.",
      action: {
        instructions:
          "To get started, please verify your email address by clicking the button below:",
        button: {
          color: "#22BC66", // Button color
          text: "Verify Email Address", // Button text
          link: verificationUrl, // Link to verify the email
        },
      },
      outro: "If you did not sign up for an account, please ignore this email.",
    },
  };
};

// Function to generate email content for forgot password
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username, // Personalizing the email with the user's name
      intro:
        "We received a request to reset your password for your account. If you initiated this request, please click the button below to proceed.",
      action: {
        instructions:
          "Click the Button: Click the Reset Password button below to navigate to the password reset page.",
        button: {
          color: "#22BC66", // Button color
          text: "Reset Password", // Button text
          link: passwordResetUrl, // Link to reset the password
        },
      },
      outro: "If you did not sign up for an account, please ignore this email.",
    },
  };
};

// Function to send email using nodemailer and Mailgen
const sendEmail = async (options) => {
  // Create a new Mailgen instance with theme and product details
  const mailGenerator = new Mailgen({
    theme: "default", // Email theme
    product: {
      name: "Task Manager", // Product name
      link: "https://taskmanagelink.com", // Product link
    },
  });

  // Generate plaintext and HTML versions of the email
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST, // SMTP host from environment variables
    port: process.env.MAILTRAP_SMTP_PORT, // SMTP port from environment variables
    auth: {
      user: process.env.MAILTRAP_SMTP_USER, // SMTP user from environment variables
      pass: process.env.MAILTRAP_SMTP_PASS, // SMTP password from environment variables
    },
  });

  // Define the email message
  const mail = {
    from: "mail.taskmanager@example.com", // Sender's email address
    to: options.email, // Recipient's email address
    subject:options.subject,
    text: emailTextual, // Plaintext email content
    html: emailHtml, // HTML email content
  };

  // Attempt to send the email
  try {
    await transporter.sendMail(mail);
  } catch (error) {
    // Log any errors that occur during email sending
    console.error("Email service failed silently");
    console.error("Error: ", error);
  }
};

// Exporting the functions for use in other parts of the application
export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
