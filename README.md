# Express.js Authentication Template

This is an Express.js authentication template designed to provide a starting point for developing services that require user authentication using Google OAuth as well as Django OAuth. It includes basic setup for session management, Passport.js integration with Google OAuth and Django OAuth, protected routes, error handling, and more.

## Features

- Google OAuth Authentication: Allows users to authenticate using their Google accounts.
- Django OAuth Authentication: Allows users to authenticate using their Django accounts.
- Session Management: Uses Express.js sessions for managing user sessions.
- Protected Routes: Defines routes that require authentication, ensuring only authenticated users can access them.
- Error Handling: Includes basic error handling for authentication failures and 404 errors.

## Usage

1. Clone the Repository:

```
git clone <repository-url>
cd nodejs-oauth-template
```

2. Install Dependencies:

```
npm install
```

3. Copy Configuration File:

Copy the config.env.example file to config.env:

```
cp config.env.example config.env
```

4. Update Environment Variables:

Open the config.env file in the root directory of the project and update the following environment variables:

```
# Google OAuth Credentials
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_CALLBACK_URL=<your_callback_url>

# Django OAuth Credentials
DJANGO_CLIENT_ID=<your_django_client_id>
DJANGO_CLIENT_SECRET=<your_django_client_secret>
DJANGO_CALLBACK_URL=<your_django_callback_url>

# Session Secret
SESSION_SECRET=<your_session_secret>
```

Replace `<your_google_client_id>`, `<your_google_client_secret>`, `<your_callback_url>`, `<your_django_client_id>`, `<your_django_client_secret>`, `<your_django_callback_url>`, and `<your_session_secret>` with your actual credentials and configuration.

5. Start the Server:

```
npm start
```

6. Access the Application:

Open a web browser and navigate to http://localhost:3080 to access the application. You can log in using your Google account or Django account to access protected routes.

## Dependencies

- Express.js
- Passport.js
- Passport-Google-OAuth
- Passport-OAuth2
- Express-Session
- Dotenv
- node-fetch

## License
This project is licensed under the MIT License.