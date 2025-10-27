# Auth_Backend

## Project Overview

This repository contains the backend implementation for an authentication system built using Node.js, Express.js, and JavaScript. It focuses on providing a secure and robust authentication mechanism for web applications.

## Key Features & Benefits

- **User Authentication:** Handles user registration, login, and authentication.
- **Token-Based Authentication:** Uses JSON Web Tokens (JWT) for secure session management.
- **Middleware Security:** Employs middleware for request validation and authorization.
- **Database Integration:** Connects to a database (likely MongoDB based on dependencies) for user data persistence.
- **Error Handling:** Implements a standardized API response structure for handling errors and success messages.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

- **Node.js:**  Version compatible with the dependencies (check `package.json` for specifics, generally Node 16 or higher is recommended).
- **npm (Node Package Manager):** Usually comes with Node.js.
- **MongoDB:** A running instance of MongoDB for data storage.

The project also relies on the following npm packages:

- bcrypt
- cookie-parser
- cors
- dotenv
- express
- express-validator
- jsonwebtoken
- mailgen
- mongoose

## Installation & Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sonu-bhardwaj/Auth_Backend.git
   cd Auth_Backend/backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   - Create a `.env` file in the `backend/` directory.
   - Define the necessary environment variables, such as:

     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/your_database_name
     JWT_SECRET=your_secret_key
     JWT_ACCESS_EXPIRY=30m  # Example: 30 minutes
     JWT_REFRESH_EXPIRY=7d   # Example: 7 days
     FRONTEND_URL=http://localhost:3001 #set cross origin for frontend
     SMTP_HOST=your_smtp_host
     SMTP_PORT=587
     SMTP_USER=your_smtp_user
     SMTP_PASS=your_smtp_password
     ```

   - **Note:** Replace placeholder values with your actual configuration.  Pay special attention to `JWT_SECRET`, `MONGODB_URI`, and SMTP settings.

4. **Run the application:**

   ```bash
   npm run dev
   ```

   This will start the server in development mode using `nodemon`, which automatically restarts the server on file changes.

## Usage Examples & API Documentation

### API Endpoints (Example)

| Method | Endpoint           | Description                                    | Request Body (Example)                               | Response (Example)                                      |
| ------ | ------------------ | ---------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| POST   | `/api/v1/auth/register` | Register a new user                              | `{ "username": "testuser", "email": "test@example.com", "password": "password123" }` | `{ "success": true, "message": "User registered successfully", "data": { "user": { ... } } }` |
| POST   | `/api/v1/auth/login`    | Authenticate an existing user                     | `{ "email": "test@example.com", "password": "password123" }` | `{ "success": true, "message": "Login successful", "data": { "accessToken": "...", "refreshToken": "..." } }` |
| GET    | `/api/v1/auth/healthcheck` | Check health of server                             |   N/A                                             | `{ "success": true, "message": "Server is healthy"}`   |
| POST   | `/api/v1/auth/refresh-token` | Refresh access token                              | `{ "refreshToken": "..." }`  | `{ "success": true, "message": "Access token refreshed", "data": { "accessToken": "..." } }` |

**Note:**  This is a simplified example. Refer to the project's controller files (`backend/src/controller/auth.controller.js`) for a comprehensive list of available endpoints and request/response structures.

### Code Snippets

**Example: Importing and using middleware:**

```javascript
// backend/src/app.js
import authMiddleware from "./middleware/auth.middleware.js";

app.get('/api/v1/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});
```

## Configuration Options

- **`.env` file:**  The primary way to configure the application is through environment variables defined in the `.env` file.  These variables control database connections, JWT secrets, and other critical settings.  See the "Installation & Setup Instructions" section for a detailed example.
- **CORS Configuration:**  The `cors` middleware is used to control Cross-Origin Resource Sharing.  Configure allowed origins in your `.env` file using FRONTEND_URL and in `app.js` for advanced CORS settings.
- **Database Configuration:** The `MONGODB_URI` environment variable specifies the connection string for your MongoDB database.

## Contributing Guidelines

We welcome contributions to this project! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear, descriptive messages.
4. Push your branch to your forked repository.
5. Submit a pull request to the main repository.

Please follow these guidelines:

- Adhere to the existing code style.
- Write clear and concise code.
- Include tests for new features or bug fixes.
- Update documentation as needed.

## License Information

License is not specified. All rights reserved to the owner of the repository (sonu-bhardwaj).

## Acknowledgments

- This project utilizes several open-source libraries and frameworks. We thank the developers and maintainers of these projects for their contributions to the community.