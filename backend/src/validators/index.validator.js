import { body } from "express-validator";

// ---------------------------------------------------------------
// 🔹 Validator: User Registration Fields
// ---------------------------------------------------------------
// This validator checks the following fields during user registration:
// 1️⃣ email: must be provided and in valid email format
// 2️⃣ username: required, lowercase, minimum 3 characters, only letters and numbers
// 3️⃣ password: required (can be enhanced with strength rules if needed)
// 4️⃣ fullname: optional, but if provided, cannot be empty
// ---------------------------------------------------------------
const userRegistrationValidator = () => {
  return [
    // ----------------- EMAIL VALIDATION -----------------
    body("email")
      .trim() // remove extra spaces from both ends
      .notEmpty()
      .withMessage("Email is required") // email must not be empty
      .isEmail()
      .withMessage("Email is invalid"), // must be valid email format

    // ----------------- USERNAME VALIDATION -----------------
    body("username")
      .trim() // remove extra spaces
      .notEmpty()
      .withMessage("Username is required") // cannot be empty
      .isLowercase()
      .withMessage("Username must be in lowercase") // enforce lowercase
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters") // minimum length
      .matches(/^[a-z0-9]+$/)
      .withMessage("Username can only contain lowercase letters and numbers"), // allowed characters

    // ----------------- PASSWORD VALIDATION -----------------
    body("password")
      .trim() // remove extra spaces
      .notEmpty()
      .withMessage("Password is required"), // password cannot be empty
    // 🔹 Optional: You can add stronger password rules here using .isLength, .matches for uppercase, numbers, etc.

    // ----------------- FULLNAME VALIDATION -----------------
    body("fullname")
      .optional() // field is optional
      .trim() // remove extra spaces
      .notEmpty() // if provided, cannot be empty
      .withMessage("Fullname cannot be empty if provided"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ];
};
const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};

export {
  userRegistrationValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
};

