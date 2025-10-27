import { Router } from "express";
import {
    changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from "../controller/auth.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import { userChangeCurrentPasswordValidator, userRegistrationValidator } from "../validators/index.validator.js";
import { login } from "../controller/auth.controller.js";
import { userLoginValidator } from "../validators/index.validator.js";
import { logoutUser } from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { userForgotPasswordValidator } from "../validators/index.validator.js";

const router = Router();

//unsecure routes
router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);

router.route("/verification-email/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-Password")
  .post(userForgotPasswordValidator(), forgotPasswordRequest);
router
  .route("/reset-Password/:resetToken")
  .post(userForgotPasswordValidator(), validate, resetForgotPassword);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-User").post(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(),validate,changeCurrentPassword);
router.route("/resend-Email-Verification").post(verifyJWT, resendEmailVerification);

export default router;
