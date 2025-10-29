import dotenv from "dotenv";
dotenv.config();

/**
 * Middleware to validate that requests are coming from authorized web client or mobile app
 * This prevents abuse of guest endpoints by external applications
 * Supports both web browsers and React Native/Expo mobile apps
 */
const validateWebClientOrigin = (req, res, next) => {
  try {
    // Get the origin from the request
    const origin = req.get("Origin") || req.get("Referer");

    // List of allowed origins for your web client and mobile app
    const allowedOrigins = [
      // Web client origins
      process.env.CLIENT_URL || "http://localhost:3000", // Development
      process.env.PRODUCTION_CLIENT_URL, // Production
      "https://preprod-eduops.danred-server.uk", // Add your production domain
      // Mobile app origins
      "null", // React Native sends null as origin
      "exp://localhost:8081", // Expo development
      "exp://localhost:19000", // Expo development alternative
      "exp://127.0.0.1:8081", // Expo development localhost
      "exp://127.0.0.1:19000", // Expo development localhost alternative
      "myapp://", // Mobile app scheme from app.json
      "eduopsmobile://", // Alternative mobile scheme
      process.env.MOBILE_APP_SCHEME || "myapp://", // Custom mobile scheme from env
    ].filter(Boolean); // Remove undefined values

    // Check if origin is from allowed web client or mobile app
    // Mobile apps may send null or no origin, which is allowed
    const requestOrigin = origin || "null";

    // Skip URL parsing for mobile app schemes and null
    let normalizedOrigin = requestOrigin;
    try {
      if (
        requestOrigin !== "null" &&
        !requestOrigin.startsWith("exp://") &&
        !requestOrigin.startsWith("myapp://") &&
        !requestOrigin.startsWith("eduopsmobile://")
      ) {
        // Extract base origin (remove path and query params) for web URLs
        normalizedOrigin = new URL(origin).origin;
      }
    } catch (error) {
      // If URL parsing fails, use the original origin (likely mobile scheme)
      normalizedOrigin = requestOrigin;
    }

    // Debug logging for development
    if (process.env.NODE_ENV !== "production") {
      console.log("Origin validation:");
      console.log("Request origin:", requestOrigin);
      console.log("Normalized origin:", normalizedOrigin);
      console.log("Allowed origins:", allowedOrigins);
    }

    if (!allowedOrigins.includes(normalizedOrigin)) {
      console.log("Origin validation failed:", {
        requestOrigin,
        normalizedOrigin,
        allowedOrigins,
        userAgent: req.get("User-Agent"),
      });
      return res.status(403).json({
        error: true,
        message: "Access denied: Unauthorized origin",
        code: "UNAUTHORIZED_ORIGIN",
      });
    }

    // Additional security check: validate user-agent to ensure it's a browser or mobile app request
    const userAgent = req.get("User-Agent");
    //checking if in production then validate user-agent (do not allow postman or bot requests)
    if (process.env.NODE_ENV === "production") {
      // Allow if origin is from mobile app (null or mobile schemes)
      const isMobileApp =
        normalizedOrigin === "null" ||
        normalizedOrigin.startsWith("exp://") ||
        normalizedOrigin.startsWith("myapp://") ||
        normalizedOrigin.startsWith("eduopsmobile://");

      // Only validate user-agent for web requests
      if (!isMobileApp && (!userAgent || !userAgent.includes("Mozilla"))) {
        return res.status(403).json({
          error: true,
          message: "Access denied: Invalid client type",
          code: "INVALID_CLIENT",
        });
      }
    }
    next();
  } catch (error) {
    console.error("Web client validation error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error during client validation",
      code: "VALIDATION_ERROR",
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
    const clientToken = req.get("X-Client-Token");
    const expectedToken = process.env.WEB_CLIENT_TOKEN;

    if (!expectedToken) {
      console.warn("WEB_CLIENT_TOKEN not configured in environment");
      return validateWebClientOrigin(req, res, next);
    }

    if (!clientToken || clientToken !== expectedToken) {
      return res.status(403).json({
        error: true,
        message: "Access denied: Invalid client credentials",
        code: "INVALID_CLIENT_TOKEN",
      });
    }

    next();
  } catch (error) {
    console.error("Web client header validation error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error during client validation",
      code: "VALIDATION_ERROR",
    });
  }
};

export { validateWebClientOrigin, validateWebClientWithHeader };
