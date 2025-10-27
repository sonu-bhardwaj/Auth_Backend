import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // to generate long string

// Define the schema for “User” documents
const userSchema = new Schema(
  {
    // Avatar info (image) for the user
    avatar: {
      type: {
        // URL to a hosted image
        url: String,
        // Local file system path (if stored locally)
        localPath: String,
      },
      default: {
        // Default avatar if user doesn’t upload one
        url: "https://placehold.co/200x200",
        localPath: "",
      },
    },

    // Unique username identifier for login / display
    username: {
      type: String,
      required: true, // must be provided
      unique: true, // cannot be duplicated in DB
      lowercase: true, // convert to lowercase before saving
      trim: true, // remove whitespace at ends
      index: true, // add an index for faster queries
    },

    // Email address of the user
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Full name / display name (optional)
    fullName: {
      type: String,
      trim: true, // trim whitespace on both sides
    },

    // Password (hashed ideally)
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // Whether the user has verified their email
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Token used for "remember me" / session refresh
    refreshToken: {
      type: String,
    },

    // Token for password reset
    forgotPasswordToken: {
      type: String,
    },

    // Expiry timestamp for password reset token
    forgotPasswordTokenExpiry: {
      type: Date,
    },

    // Token for email verification
    emailverificationToken: {
      type: String,
    },

    // Expiry timestamp for email verification token
    emailverificationExpiry: {
      type: Date,
    },
  },
  {
    // Adds `createdAt` & `updatedAt` automatically
    timestamps: true,
  }
);

// Compile the schema into a model named “User”
// This model is your interface to the `users` collection in MongoDB

//now we installed bcrypt to hash password this is pre hook
// Pre-save hook to hash the user's password before storing it in the database
userSchema.pre("save", async function (next) {
  // Proceed only if the password field has been modified or is new
  if (!this.isModified("password")) return next();

  // Hash the password using bcrypt with a salt rounds factor of 10
  this.password = await bcrypt.hash(this.password, 10);

  // Proceed to the next middleware or save operation
  next();
});

// Instance method to verify if the provided plain-text password matches the stored hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  // Use bcrypt's compare function to check if the entered password matches the stored hash
  return await bcrypt.compare(password, this.password);
};

// Instance method to generate an Access Token for this user document
userSchema.methods.generateAccessToken = function () {
  // jwt.sign takes three arguments: payload, secret, options (like expiry)
  // The “payload” is the data you embed in the token (claims)
  return jwt.sign(
    {
      // Data (claims) inside the payload – this is what you are sharing in the token:
      _id: this._id, // user’s unique ID
      email: this.email, // user’s email address
      username: this.username, // user's username
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret used to sign and later verify the token
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Expiry time for this token
    }
  );
};

// Instance method to generate a Refresh Token for this user
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      // Payload data for refresh token – may repeat or differ from access token’s payload
      _id: this._id,
      //   email: this.email,
      //   username: this.username,
    },
    process.env.REFRESH_TOKEN_SECRET, // Secret for refresh tokens
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Expiry for this refresh token
    }
  );
};
//above this token with data and below this line token without data
userSchema.methods.generateTemporaryToken = function () {
  const unhashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");
  // const tokenExpiry = Date.now() + 20 * 60 * 1000; //20minutes
  const tokenExpiry = new Date(Date.now() + 20 * 60 * 1000);

  return { unhashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
