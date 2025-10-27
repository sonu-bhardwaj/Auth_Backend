// ============================================================================
// 🔹 Import Required Modules and Utilities
// ============================================================================
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js"
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// ============================================================================
// 🔹 Helper Function: Generate Access and Refresh Tokens
// ----------------------------------------------------------------------------
// This function generates both JWT access and refresh tokens for a user.
// The refresh token is saved in the database for token rotation and verification.
// ============================================================================
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate tokens from instance methods defined in the User model
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

// ============================================================================
// 🔹 Controller: Register User
// ----------------------------------------------------------------------------
// Registers a new user, generates a verification token, and sends an email
// for account verification using Mailgen.
// ============================================================================
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  // Check if username or email already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }

  // Create new user (unverified initially)
  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  // Generate email verification token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailverificationToken = hashedToken;
  user.emailverificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // Send verification email
  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  // Return created user details without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully. Verification email sent."
      )
    );
});

// ============================================================================
// 🔹 Controller: Login User (with Cookies)
// ----------------------------------------------------------------------------
// Authenticates a user using email and password. On success, generates access
// and refresh tokens, stores them in cookies (HTTP-only, secure), and returns
// basic user information.
// ============================================================================
const login = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (/*!username || */ !email) {
    throw new ApiError(400, "Email or username is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid credentials");
  }

  // Generate JWT tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Send tokens and user data
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // Prepare secure cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// ============================================================================
// 🔹 Controller: Logout User
// ----------------------------------------------------------------------------
// Clears tokens from cookies and database, effectively logging the user out.
// ============================================================================
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ============================================================================
// 🔹 Controller: Delete User Account
// ----------------------------------------------------------------------------
// Deletes the user's account and clears authentication cookies.
// ============================================================================
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await User.findByIdAndDelete(userId);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User account deleted successfully"));
});

// ============================================================================
// 🔹 Controller: Get Current User
// ----------------------------------------------------------------------------
// Returns the currently authenticated user's data (from auth middleware).
// ============================================================================
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { name: req.user.username }, "Current user fetched successfully"));
});

// ============================================================================
// 🔹 Controller: Verify Email
// ----------------------------------------------------------------------------
// Verifies user's email using token sent to their inbox. Activates account
// if token is valid and not expired.
// ============================================================================
const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params; //param means url

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  user.emailverificationToken = undefined;
  user.emailverificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEmailVerified: true },
        "Email verified successfully"
      )
    );
});

// ============================================================================
// 🔹 Controller: Resend Email Verification
// ----------------------------------------------------------------------------
// Resend verification email if the user is not verified yet.
// ============================================================================
const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification email resent successfully"));
});

// ============================================================================
// 🔹 Controller: Refresh Access Token
// ----------------------------------------------------------------------------
// Validates refresh token from cookies and issues new access and refresh tokens.
// ============================================================================
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshAccessToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token expired or invalid");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

// ============================================================================
// 🔹 Controller: Forgot Password Request
// ----------------------------------------------------------------------------
// Generates a temporary token and sends password reset email to the user.
// ============================================================================
const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist", []);
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Password Reset Request",
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset email sent successfully"));
});

// ============================================================================
// 🔹 Controller: Reset Forgot Password
// ----------------------------------------------------------------------------
// Validates reset token and updates user's password with new one.
// ============================================================================
const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been reset successfully"));
});

// ============================================================================
// 🔹 Controller: Change Current Password
// ----------------------------------------------------------------------------
// Allows logged-in users to change their password after verifying the old one.
// ============================================================================
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ============================================================================
// 🔹 Export All Controllers
// ============================================================================
export {
  registerUser,
  login,
  logoutUser,
  deleteAccount,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword,
};
