import { Request, Response, NextFunction } from 'express'
import compression from 'compression'

/**
 * Compression middleware for mobile optimization
 * Reduces response sizes for faster mobile loading
 */
export const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,

  // Compression level (0-9, 6 is default)
  level: 6,

  // Filter function to determine what to compress
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't accept gzip
    if (req.headers['x-no-compression']) {
      return false
    }

    // Compress JSON responses
    if (res.getHeader('Content-Type')?.toString().includes('application/json')) {
      return true
    }

    // Compress text responses
    if (res.getHeader('Content-Type')?.toString().includes('text/')) {
      return true
    }

    // Use default compression filter
    return compression.filter(req, res)
  },
})
