import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser'
const app = express();




//basic cors configuration
app.use(express.json({ limit: "16kb" })); //this will let user to send json data of 16kb only
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //this is for form  having multiple input name=sonu&age=20 will treated like {name:"sonu",age:"20"}
app.use(express.static("public")); // this is for public folder


//cookies-parser(cookies)
app.use(cookieParser())


//advance cors configuration using cors library
//cors configuration (this can me more secure using helmet and rate limiter)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173", //change your cross origin with original front end and 5173 is for vite
    credentials: true, //by default it true
    method: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//import the routes
import healthCheckRouter from "./routes/healthCheck.routes.js";
app.use("/api/v1/healthcheck",healthCheckRouter)
//import of register routes
import authRouter from "./routes/auth.routes.js"
app.use("/api/v1/auth",authRouter)

//import of login routes
import login from "./routes/auth.routes.js"
app.use("/api/v1/login",login)


//import of logout routes
import { logoutUser } from "./controller/auth.controller.js";
app.use("/api/v1/logout",logoutUser)

import { getCurrentUser } from "./controller/auth.controller.js";
app.use("/api/v1/currentUser",getCurrentUser)


import { verifyEmail } from "./controller/auth.controller.js";
app.use("/api/v1/verifyEmail",verifyEmail)

app.get("/", (req, res) => {
  res.send("Hello, Sonu Bhardwaj!");
});
app.post("/test", (req, res) => {
  console.log("Body received:", req.body);
  res.json(req.body);
});

export default app;
