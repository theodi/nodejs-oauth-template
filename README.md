# Express.js Authentication Template

This is an Express.js authentication template designed to provide a starting point for developing services that require user authentication using Google OAuth. It includes basic setup for session management, Passport.js integration with Google OAuth, protected routes, error handling, and more.

## Features

- **Google OAuth Authentication:** Allows users to authenticate using their Google accounts.
- **Session Management:** Uses Express.js sessions for managing user sessions.
- **Protected Routes:** Defines routes that require authentication, ensuring only authenticated users can access them.
- **Error Handling:** Includes basic error handling for authentication failures and 404 errors.

## Usage

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd nodejs-oauth-template
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Copy Configuration File:**

   Copy the `config.env.example` file to `config.env`:

   ```bash
   cp config.env.example config.env
   ```

4. **Update Environment Variables:**

   Open the `config.env` file in the root directory of the project and update the following environment variables:

   ```plaintext
   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   GOOGLE_CALLBACK_URL=<your_callback_url>

   # Session Secret
   SESSION_SECRET=<your_session_secret>
   ```

   Replace `<your_google_client_id>`, `<your_google_client_secret>`, `<your_callback_url>`, and `<your_session_secret>` with your actual credentials and configuration.

5. **Start the Server:**

   ```bash
   npm start
   ```

6. **Access the Application:**

   Open a web browser and navigate to `http://localhost:3080` to access the application. You can log in using your Google account to access protected routes.

## Dependencies

- Express.js
- Passport.js
- Passport-Google-OAuth
- Express-Session
- Dotenv

## License

This project is licensed under the [MIT License](LICENSE).