# Authentication Service

This service handles all authentication-related API calls and user session management.

## Features

- **Login/Logout**: Handle user authentication with the backend API
- **Token Management**: Store and manage authentication tokens
- **User Session**: Manage user data in localStorage
- **Error Handling**: Comprehensive error handling for API failures
- **Type Safety**: Full TypeScript support with proper interfaces

## Usage

### Login
```typescript
import { authService } from '../services';

try {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'password123',
    role: 'schools'
  });
  
  if (response.success) {
    // Navigate to dashboard
    navigate('/school-admin');
  }
} catch (error) {
  console.error('Login failed:', error);
}
```

### Check Authentication Status
```typescript
if (authService.isAuthenticated()) {
  // User is logged in
} else {
  // Redirect to login
}
```

### Logout
```typescript
await authService.logout();
// User is logged out and local storage is cleared
```

## API Configuration

The service uses the API configuration from `src/config/api.ts`:

- **Base URL**: `http://localhost:5000/api`
- **Login Endpoint**: `/auth/login`
- **Logout Endpoint**: `/auth/logout`

## Response Format

### Login Response
```typescript
{
  success: boolean;
  message: string;
  user: {
    email: string;
    role: string;
    schoolId: string;
  };
  timestamp: string;
}
```

## Error Handling

The service includes comprehensive error handling:
- Network errors
- API errors (4xx, 5xx status codes)
- Invalid responses
- Token expiration

## Local Storage

The service manages two localStorage keys:
- `auth_token`: Stores the authentication token
- `auth_user`: Stores the user data

## Security Notes

- Tokens are stored in localStorage (consider using httpOnly cookies for production)
- User data is stored as JSON in localStorage
- All API calls include the Authorization header when a token is available 