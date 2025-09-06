import dotenv from 'dotenv';
dotenv.config();

/**
 * Middleware to validate that requests are coming from authorized web client only
 * This prevents abuse of guest endpoints by external applications
 */
const validateWebClientOrigin = (req, res, next) => {
  try {
    // Get the origin from the request
    const origin = req.get('Origin') || req.get('Referer');

    // List of allowed origins for your web client
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000', // Development
      process.env.PRODUCTION_CLIENT_URL, // Production
      'https://preprod-eduops.danred-server.uk', // Add your production domain
    ].filter(Boolean); // Remove undefined values

    // Check if origin is from allowed web client
    if (!origin) {
      return res.status(403).json({
        error: true,
        message: 'Access denied: Missing origin header',
        code: 'ORIGIN_REQUIRED',
      });
    }

    // Extract base origin (remove path and query params)
    const requestOrigin = new URL(origin).origin;

    // Debug logging for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Origin validation:');
      console.log('Request origin:', requestOrigin);
      console.log('Allowed origins:', allowedOrigins);
    }

    if (!allowedOrigins.includes(requestOrigin)) {
      console.log('Origin validation failed:', {
        requestOrigin,
        allowedOrigins,
        userAgent: req.get('User-Agent'),
      });
      return res.status(403).json({
        error: true,
        message: 'Access denied: Unauthorized origin',
        code: 'UNAUTHORIZED_ORIGIN',
      });
    }

    // Additional security check: validate user-agent to ensure it's a browser request
    const userAgent = req.get('User-Agent');
    //checking if in production then validate user-agent (do not allow postman requests)
    if (process.env.NODE_ENV === 'production') {
      if (!userAgent || !userAgent.includes('Mozilla')) {
        return res.status(403).json({
          error: true,
          message: 'Access denied: Invalid client type',
          code: 'INVALID_CLIENT',
        });
      }
    }
    next();
  } catch (error) {
    console.error('Web client validation error:', error);
    return res.status(500).json({
      error: true,
      message: 'Internal server error during client validation',
      code: 'VALIDATION_ERROR',
    });
  }
};

/**
 * Alternative middleware for stricter validation using custom headers
 * Use this if you want to add a custom header to your web client requests
 */
const validateWebClientWithHeader = (req, res, next) => {
  try {
    // Check for custom header that your web client should send
    const clientToken = req.get('X-Client-Token');
    const expectedToken = process.env.WEB_CLIENT_TOKEN;

    if (!expectedToken) {
      console.warn('WEB_CLIENT_TOKEN not configured in environment');
      return validateWebClientOrigin(req, res, next);
    }

    if (!clientToken || clientToken !== expectedToken) {
      return res.status(403).json({
        error: true,
        message: 'Access denied: Invalid client credentials',
        code: 'INVALID_CLIENT_TOKEN',
      });
    }

    next();
  } catch (error) {
    console.error('Web client header validation error:', error);
    return res.status(500).json({
      error: true,
      message: 'Internal server error during client validation',
      code: 'VALIDATION_ERROR',
    });
  }
};

export { validateWebClientOrigin, validateWebClientWithHeader };
