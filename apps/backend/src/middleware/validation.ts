import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateTransitionRequest: ValidationChain[] = [
  body('event')
    .trim()
    .notEmpty().withMessage('Event is required')
    .isIn(['CHECK_STATUS', 'SUBMIT_FORM', 'APPROVE_REGISTRATION', 'FIND_POLLING_STATION', 'CAST_VOTE', 'VIOLATION_DETECTED'])
    .withMessage('Invalid event type'),
  body('userId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 128 }).withMessage('User ID must be 1-128 characters')
];

export const validatePollingRequest: ValidationChain[] = [
  query('lat')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 }).withMessage('Radius must be between 100 and 50000 meters')
];

export const validateStationIdParam: ValidationChain[] = [
  param('stationId')
    .trim()
    .notEmpty().withMessage('Station ID is required')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Invalid station ID format')
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({
        field: (e as any).param || (e as any).path,
        message: e.msg
      }))
    });
    return;
  }
  next();
};
