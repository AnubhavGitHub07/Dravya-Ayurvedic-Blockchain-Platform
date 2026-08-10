import { Request, Response } from 'express';
import { PublicVerificationService } from '../services/public-verification.service';

export class PublicController {
  
  /**
   * Verify a QR code and return a public-safe traceability timeline
   * GET /api/public/verify/:code
   */
  public async verifyQR(req: Request, res: Response): Promise<void> {
    try {
      const code = req.params.code;
      if (!code) {
        res.status(400).json({ success: false, message: 'Code is required' });
        return;
      }

      // Input validation on code format
      if (!/^DRV-[A-Z0-9]{8}$/.test(code)) {
        res.status(400).json({ success: false, status: 'INVALID_FORMAT', message: 'Invalid code format.' });
        return;
      }

      const result = await PublicVerificationService.verifyQR(code);

      if (!result.verified && result.status) {
        // Safe rejection for public
        res.status(200).json({ 
          success: true, 
          data: {
            verified: false,
            status: result.status,
            message: result.message
          }
        });
        return;
      }

      // Success
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Public verification error:', error);
      // DO NOT expose stack traces or internal DB errors
      res.status(500).json({ success: false, message: 'An internal error occurred during verification.' });
    }
  }
}
