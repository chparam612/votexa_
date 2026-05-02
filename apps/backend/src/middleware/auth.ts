import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { logError } from '../utils/logging';

/**
 * Middleware to authenticate requests using Firebase ID tokens.
 * Injects the decoded user object into the request.
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: Missing or invalid authorization header' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: Empty token' 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    (req as any).user = decodedToken;
    (req as any).token = token;

    next();
  } catch (error) {
    logError(error as Error, 'AUTH_MIDDLEWARE');
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Invalid authentication token' 
    });
  }
}

/**
 * Middleware to authorize access based on user ownership of a resource.
 */
export async function authorizeUserOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const resourceUserId = req.body.userId || req.query.userId || req.params.userId;
  const currentUserId = (req as any).user?.uid;

  if (resourceUserId && resourceUserId !== currentUserId) {
    return res.status(403).json({ 
      success: false, 
      error: 'Forbidden: Unauthorized access to this resource' 
    });
  }

  next();
}
