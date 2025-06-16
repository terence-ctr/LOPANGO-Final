import { Request, Response, NextFunction, validationResult } from 'express-validator';
import { ValidationException } from '../utils/exceptions/api.exception';
import logger from '../utils/logger';
import { isJsonString, safeJsonParse } from '../utils/helpers';

declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

/**
 * Middleware pour valider les données de la requête
 * Utilise express-validator pour valider les données
 */
export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] || 'no-request-id';
    
    try {
      // Log the incoming request for debugging
      const logContext = {
        method: req.method,
        url: req.originalUrl,
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
        hasBody: !!req.body && Object.keys(req.body).length > 0
      };
      
      logger.debug(`[${requestId}] [VALIDATION] Starting validation`, logContext);

      // Handle empty body for JSON requests
      if (req.is('application/json') && (!req.body || Object.keys(req.body).length === 0)) {
        if (req.rawBody) {
          try {
            req.body = typeof req.rawBody === 'string' ? JSON.parse(req.rawBody) : req.rawBody;
            logger.debug(`[${requestId}] [VALIDATION] Parsed body from rawBody`);
            logContext.hasBody = true; // Update the log context
          } catch (error) {
            const rawBodyPreview = typeof req.rawBody === 'string' 
              ? req.rawBody.substring(0, 200) + (req.rawBody.length > 200 ? '...' : '')
              : '[not a string]';
              
            logger.warn(`[${requestId}] [VALIDATION] Failed to parse rawBody`, {
              error: error.message,
              rawBodyPreview
            });
          }
        }
      }

      // Run validations with better error handling and debugging
      try {
        logger.debug(`[${requestId}] [VALIDATION] Starting ${validations.length} validation chains`);
        
        // Run all validations using Promise.all with individual error handling
        await Promise.all(validations.map(async (validation, index) => {
          try {
            // Safely get field name for logging
            let fieldName = 'unknown';
            try {
              // Try different ways to get the field name
              if (validation.builder?.fields?.[0]) {
                fieldName = validation.builder.fields[0];
              } else if (validation._fields?.[0]) {
                fieldName = validation._fields[0];
              } else if (validation.context?.fields?.[0]) {
                fieldName = validation.context.fields[0];
              } else if (validation.fields?.[0]) {
                fieldName = validation.fields[0];
              }
              
              logger.debug(`[${requestId}] [VALIDATION] [${index+1}/${validations.length}] Validating field: ${fieldName}`);
              
              // Run the validation
              await validation.run(req);
              logger.debug(`[${requestId}] [VALIDATION] [${index+1}/${validations.length}] Validation passed for field: ${fieldName}`);
              
            } catch (validationError) {
              // Log detailed error for debugging
              logger.warn(`[${requestId}] [VALIDATION] Error in validation chain for field ${fieldName}:`, {
                error: validationError.message,
                stack: validationError.stack,
                validationIndex: index,
                fieldName
              });
              // Continue with other validations
            }
          } catch (outerError) {
            // Catch any errors in our error handling logic
            logger.error(`[${requestId}] [VALIDATION] Unexpected error in validation wrapper:`, {
              error: outerError.message,
              stack: outerError.stack,
              validationIndex: index
            });
          }
        }));
        
      } catch (error) {
        logger.error(`[${requestId}] [VALIDATION] Critical error in validation middleware:`, {
          error: error.message,
          stack: error.stack
        });
        // Continue to validation results even if there was an error
      }

      // Get validation results
      const errors = validationResult.withDefaults({
        formatter: (error) => {
          return {
            param: error.param,
            msg: error.msg,
            value: error.value,
            location: error.location,
            nestedErrors: (error as any).nestedErrors
          };
        }
      });
      
      const result = errors(req);
      const errorArray = result.array({ onlyFirstError: false });
      
      // Log detailed validation results
      const validationLog = {
        hasErrors: !result.isEmpty(),
        errorCount: errorArray.length,
        errors: errorArray,
        requestBody: {
          ...req.body,
          password: req.body?.password ? '***' : undefined,
          passwordConfirmation: req.body?.passwordConfirmation ? '***' : undefined
        }
      };
      
      logger.debug(`[${requestId}] [VALIDATION] Validation results:`, validationLog);
      
      // If no errors, continue to next middleware
      if (result.isEmpty()) {
        logger.debug(`[${requestId}] [VALIDATION] All validations passed`);
        return next();
      }
      
      // Log detailed error information
      logger.error(`[${requestId}] [VALIDATION] Validation failed with ${errorArray.length} errors:`, {
        errorDetails: errorArray,
        validationContext: {
          path: req.path,
          method: req.method,
          headers: req.headers
        }
      });

      // Format validation errors for response
      const formattedErrors: Record<string, string[]> = {};
      
      try {
        logger.debug(`[${requestId}] [VALIDATION] Processing ${errorArray.length} validation errors`);
        
        errorArray.forEach((error, index) => {
          try {
            logger.debug(`[${requestId}] [VALIDATION] Processing error ${index + 1}:`, {
              error,
              errorString: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
            
            const param = (error as any)?.param || (error as any)?.path || '_error';
            const errorMessage = (error as any)?.msg || (error as any)?.message || 'Validation failed';
            
            logger.debug(`[${requestId}] [VALIDATION] Extracted param: ${param}, message: ${errorMessage}`);
            
            if (!formattedErrors[param]) {
              formattedErrors[param] = [];
            }
            
            if (!formattedErrors[param].includes(errorMessage)) {
              formattedErrors[param].push(errorMessage);
            }
          } catch (formatError) {
            logger.error(`[${requestId}] [VALIDATION] Error formatting validation error ${index}:`, {
              formatError,
              originalError: error,
              errorString: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
          }
        });
        
        // Log the final formatted errors
        logger.debug(`[${requestId}] [VALIDATION] Formatted errors for response:`, { 
          formattedErrors,
          formattedErrorsString: JSON.stringify(formattedErrors, null, 2)
        });
      } catch (formatAllError) {
        logger.error(`[${requestId}] [VALIDATION] Critical error formatting validation errors:`, {
          error: formatAllError,
          errorArray: errorArray.map(e => ({
            ...e,
            toString: e.toString()
          }))
        });
        // Fallback to a generic error if we can't format the specific errors
        formattedErrors['_error'] = ['Une erreur de validation est survenue'];
      }

      // Log validation error with detailed information
      const logData: any = {
        requestId,
        path: req.path,
        method: req.method,
        ip: req.ip,
        validationErrors: formattedErrors,
        headers: {
          'content-type': req.headers['content-type'],
          'content-length': req.headers['content-length'],
          'accept': req.headers['accept'],
          'user-agent': req.headers['user-agent']
        },
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString()
      };

      // Add sanitized request body for logging
      if (req.body) {
        logData.body = { ...req.body };
        if (logData.body.password) logData.body.password = '***';
        if (logData.body.passwordConfirmation) logData.body.passwordConfirmation = '***';
      }

      logger.warn(`[${requestId}] [VALIDATION] Validation failed`, logData);

      // Throw validation exception
      next(ValidationException.fromValidationErrors(formattedErrors));
    } catch (error) {
      logger.error(`[${requestId}] [VALIDATION] Unexpected error`, {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body ? JSON.stringify(req.body).substring(0, 200) : 'No body'
      });
      
      next(error);
    }
  };
};

/**
 * Middleware pour gérer les erreurs de validation
 * Doit être utilisé après les validateurs express-validator
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors: Record<string, string[]> = {};
    errors.array().forEach(error => {
      const param = (error as any).path || '_error';
      if (!formattedErrors[param]) {
        formattedErrors[param] = [];
      }
      formattedErrors[param].push(error.msg);
    });

    logger.warn('Erreur de validation des données', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      errors: formattedErrors,
    });

    return next(ValidationException.fromValidationErrors(formattedErrors));
  }
  next();
};

export default {
  validate,
  handleValidationErrors,
};
