import { Request, Response } from 'express';
import { PublicVerificationService } from '../services/public-verification.service';
import { sendSuccess, sendError } from '../lib/response';

export class PublicController {
  
  /**
   * Verify a QR code and return a public-safe traceability timeline
   * GET /api/public/verify/:code
   */
  public async verifyQR(req: Request, res: Response): Promise<void> {
    try {
      const code = req.params.code as string;
      if (!code) {
        sendError(res, 'Code is required', 400);
        return;
      }

      // Input validation on code format
      if (!/^DRV-[A-Z0-9]{8}$/.test(code)) {
        sendError(res, 'Invalid code format.', 400);
        return;
      }

      const result = await PublicVerificationService.verifyQR(code);

      if (!result.verified && result.status) {
        // Safe rejection for public
        sendSuccess(res, 'Verification failed', {
          verified: false,
          status: result.status,
          message: result.message
        });
        return;
      }

      // Success
      // Note: The original returned the bare result, but since we are standardizing we will use sendSuccess
      sendSuccess(res, 'Verification successful', result);
    } catch (error: any) {
      console.error('Public verification error:', error);
      // DO NOT expose stack traces or internal DB errors
      sendError(res, 'An internal error occurred during verification.', 500);
    }
  }
}
