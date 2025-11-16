import { Request, Response, NextFunction } from 'express'

/**
 * API versioning middleware
 * Extracts version from header or URL path
 */
export const apiVersionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check for version in Accept header (e.g., Accept: application/vnd.eduplatforma.v1+json)
  const acceptHeader = req.headers['accept']
  let version = 'v1' // Default version

  if (acceptHeader && typeof acceptHeader === 'string') {
    const versionMatch = acceptHeader.match(/vnd\.eduplatforma\.(v\d+)\+json/)
    if (versionMatch) {
      version = versionMatch[1]
    }
  }

  // Also check for version in custom header
  const versionHeader = req.headers['api-version'] || req.headers['x-api-version']
  if (versionHeader) {
    version = versionHeader as string
  }

  // Store version in request object
  ;(req as any).apiVersion = version

  next()
}

/**
 * Helper to check if request is from mobile app
 */
export const isMobileRequest = (req: Request): boolean => {
  const userAgent = req.headers['user-agent']?.toLowerCase() || ''
  const mobileHeader = req.headers['x-mobile-app']

  // Check for mobile app header
  if (mobileHeader === 'true' || mobileHeader === '1') {
    return true
  }

  // Check user agent
  return (
    userAgent.includes('mobile') ||
    userAgent.includes('android') ||
    userAgent.includes('iphone') ||
    userAgent.includes('ipad')
  )
}

/**
 * Middleware to detect mobile requests
 */
export const detectMobile = (req: Request, res: Response, next: NextFunction) => {
  ;(req as any).isMobile = isMobileRequest(req)
  next()
}
