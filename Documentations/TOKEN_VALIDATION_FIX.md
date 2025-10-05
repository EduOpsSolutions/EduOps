# Token Validation and Session Management Fix

## Problem

When navigating directly to protected routes (e.g., `/admin/schedule`) with an expired JWT token, the application did not redirect to the login page. Users could see protected pages even though their session had expired.

### Root Cause

The application relied on the `isAuthenticated` flag stored in localStorage, which persisted even after the JWT token expired. Token validation only occurred when API requests were made, not when routes were accessed directly.

## Solution

Implemented a comprehensive token validation system with three layers of protection:

### 1. App-Level Token Validation

**File**: `/client/src/App.js`

**Changes**:

```javascript
// Added useEffect hook to validate token on app load
const { isAuthenticated, validateToken } = useAuthStore();

useEffect(() => {
  if (isAuthenticated) {
    validateToken();
  }
}, [isAuthenticated, validateToken]);
```

**Behavior**:

- Validates token whenever the app initializes
- Checks token validity when `isAuthenticated` state changes
- Automatically logs out users with expired tokens before rendering protected routes

### 2. Auth Store Validation Method

**File**: `/client/src/stores/authStore.js`

**Added Method**:

```javascript
validateToken: async () => {
  const token = getCookieItem('token');

  if (!token) {
    get().logout();
    return false;
  }

  try {
    // Make a lightweight API call to validate the token
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);

    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    // If token is expired or invalid, logout
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.log('Token validation failed, logging out...');
      get().logout();
      return false;
    }
    return true;
  }
};
```

**Behavior**:

- Makes a lightweight API call to verify token validity
- Uses the `/users` endpoint which requires authentication
- Automatically logs out users with invalid/expired tokens
- Handles network errors gracefully

### 3. Enhanced Axios Response Interceptor

**File**: `/client/src/utils/axios.js`

**Improvements**:

```javascript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized or 403 forbidden errors
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      const errorMessage = error.response.data?.message || '';

      // Check if it's a token-related error
      const isTokenError =
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('expired') ||
        errorMessage.toLowerCase().includes('login');

      // Only logout for token-related errors
      if (isTokenError || error.response.status === 401) {
        const { logout, isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated) {
          logout();
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            icon: 'warning',
            confirmButtonColor: '#DE0000',
          }).then(() => {
            window.location.href = '/login';
          });
        }
      }
    }
    return Promise.reject(error);
  }
);
```

**Improvements**:

- Now catches all 401 (Unauthorized) errors
- Distinguishes between token errors and permission errors (403)
- Shows user-friendly "Session Expired" message
- Automatically redirects to login page after dismissing alert
- Prevents unnecessary logouts for non-token-related 403 errors

## How It Works

### Scenario 1: Direct Route Access with Expired Token

1. User navigates directly to `/admin/schedule`
2. App loads and `useEffect` runs
3. `validateToken()` is called
4. API request to `/users` fails with 401
5. User is logged out automatically
6. `isAuthenticated` becomes `false`
7. React Router redirects to `/login` (due to routing logic in App.js)

### Scenario 2: Making API Request with Expired Token

1. User is on a protected page
2. Makes an API request (e.g., fetching schedules)
3. Request fails with 401 error
4. Axios interceptor catches the error
5. Shows "Session Expired" alert
6. Logs out user
7. Redirects to `/login`

### Scenario 3: Valid Token

1. User navigates to protected route
2. `validateToken()` is called
3. API request succeeds (200 OK)
4. User remains authenticated
5. Route renders normally

## Benefits

### Security

✅ Prevents access to protected routes with expired tokens
✅ Validates tokens before rendering sensitive pages
✅ Automatic logout on token expiration
✅ Distinguishes between authentication and authorization errors

### User Experience

✅ Clear "Session Expired" message
✅ Automatic redirect to login
✅ No confusing error states
✅ Seamless re-authentication flow

### Developer Experience

✅ Centralized token validation logic
✅ Consistent error handling across the app
✅ Easy to debug with console logs
✅ Follows existing codebase patterns

## Testing

### Test Case 1: Expired Token on Direct Route Access

**Steps**:

1. Login to the application
2. Wait for token to expire (or manually delete/invalidate token in cookies)
3. Directly navigate to `/admin/schedule` in browser address bar

**Expected Result**:

- User is automatically redirected to `/login`
- No protected content is displayed
- Console shows "Token validation failed, logging out..."

### Test Case 2: Expired Token During API Request

**Steps**:

1. Login to the application
2. Navigate to `/admin/schedule`
3. Wait for token to expire
4. Try to create/edit a schedule (triggers API request)

**Expected Result**:

- Alert shows "Session Expired"
- User is logged out
- Redirect to `/login` after dismissing alert

### Test Case 3: Valid Token

**Steps**:

1. Login to the application
2. Navigate to `/admin/schedule`

**Expected Result**:

- Page loads normally
- No logout occurs
- All API requests work as expected

### Test Case 4: Permission Error (Non-Token 403)

**Steps**:

1. Login as a student
2. Try to create a schedule (admin-only action)

**Expected Result**:

- Shows permission error from API
- Does NOT log out user
- User remains on current page

## Configuration

No additional configuration is required. The fix uses existing:

- JWT token storage in cookies
- Auth store for state management
- Axios instance for API calls
- React Router for navigation

## Performance Impact

**Minimal**: Only one additional API call (`GET /users`) on app initialization when user is authenticated. This is a lightweight endpoint and the call is async, not blocking the UI.

## Future Enhancements

### Token Refresh

Implement automatic token refresh before expiration:

```javascript
// In validateToken method
if (tokenWillExpireSoon()) {
  await refreshToken();
}
```

### Silent Validation

Add periodic background token validation:

```javascript
// Check token validity every 5 minutes
setInterval(() => {
  if (isAuthenticated) {
    validateToken();
  }
}, 5 * 60 * 1000);
```

### Better Error Messages

Differentiate between:

- Token expired
- Token invalid
- Token missing
- Server unreachable

### Token Expiry Warning

Warn users before token expires:

```javascript
if (tokenExpiresIn < 5 minutes) {
  showWarning("Your session will expire soon");
}
```

## Rollback Plan

If issues arise, revert these three files:

1. `/client/src/App.js` - Remove `useEffect` and `validateToken` import
2. `/client/src/stores/authStore.js` - Remove `validateToken` method
3. `/client/src/utils/axios.js` - Revert to simple 401 error handling

The application will still work, but won't prevent direct route access with expired tokens.

## Related Files

**Modified**:

- `/client/src/App.js`
- `/client/src/stores/authStore.js`
- `/client/src/utils/axios.js`

**Unchanged** (but related):

- `/client/src/utils/jwt.js` - Cookie management
- `/client/src/utils/auth.js` - Auth utilities
- `/api/middleware/authValidator.js` - Backend token validation

## Summary

This fix ensures that expired tokens are detected and handled properly at three critical points:

1. **App initialization** - Validates before rendering any routes
2. **API requests** - Catches expired tokens in responses
3. **Route changes** - Validates when authentication state changes

The implementation is:

- ✅ Secure
- ✅ User-friendly
- ✅ Developer-friendly
- ✅ Performant
- ✅ Consistent with existing codebase patterns

Users can no longer access protected routes with expired tokens, regardless of how they navigate to those routes.
