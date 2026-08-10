import { z } from 'zod'

// ─── Shared Validation Schemas ───────────────────────────

/**
 * Roles that can be selected during public registration.
 * ADMIN and VERIFICATION_AUTHORITY are excluded — they must be
 * created through controlled mechanisms (seed script / admin API).
 */
export const publicRegistrationRoles = ['PRODUCER', 'LAB', 'DISTRIBUTOR'] as const

export const allRoles = ['ADMIN', 'PRODUCER', 'LAB', 'DISTRIBUTOR', 'VERIFICATION_AUTHORITY'] as const

// ─── Password Policy ─────────────────────────────────────
// Min 8 chars, at least one uppercase, one lowercase, one digit

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// ─── Registration Schema ─────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must be at most 255 characters'),
  password: passwordSchema,
  role: z.enum(allRoles).optional(),
  organization: z.string().max(200, 'Organization must be at most 200 characters').optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number format')
    .optional(),
})

// ─── Login Schema ────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ─── Producer Profile Schema ───────────────────────────────

export const producerProfileSchema = z.object({
  farmName: z.string().min(2, 'Farm name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  village: z.string().min(2, 'Village is required'),
  tehsil: z.string().min(2, 'Tehsil is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  landSize: z.number().positive('Land size must be positive'),
  landSizeUnit: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

// ─── Herb Schema ───────────────────────────────────────────

export const herbSchema = z.object({
  commonName: z.string().min(2, 'Common name is required'),
  botanicalName: z.string().min(2, 'Botanical name is required'),
  localName: z.string().optional(),
  family: z.string().min(2, 'Family is required'),
  description: z.string().optional(),
  medicinalUse: z.string().optional(),
  isActive: z.boolean().optional(),
})

// ─── Batch Schema ──────────────────────────────────────────

export const createBatchSchema = z.object({
  herbId: z.string().min(1, 'Herb ID is required'),
  farmLocation: z.string().min(1, 'Farm location is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().optional(),
  harvestDate: z.coerce.date(),
  cultivationMethod: z.string().min(1, 'Cultivation method is required'),
  harvestDetails: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

export const updateBatchSchema = z.object({
  herbId: z.string().min(1).optional(),
  farmLocation: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  harvestDate: z.coerce.date().optional(),
  cultivationMethod: z.string().min(1).optional(),
  harvestDetails: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

// ─── Verification Schemas ──────────────────────────────────

export const approveVerificationSchema = z.object({
  identityVerified: z.boolean(),
  documentsVerified: z.boolean(),
  landVerified: z.boolean(),
  locationVerified: z.boolean(),
  cultivationVerified: z.boolean(),
  inspectionDate: z.coerce.date(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  observations: z.string().optional(),
})

export const rejectVerificationSchema = z.object({
  rejectionReason: z.string().min(2, 'Rejection reason is required'),
})

// ─── Inspection Schemas ────────────────────────────────────

export const recordInspectionSchema = z.object({
  inspectedQuantity: z.number().nonnegative('Quantity cannot be negative'),
  herbIdentityVerified: z.boolean(),
  physicalQualityStatus: z.string().min(1),
  packagingStatus: z.string().min(1),
  documentsVerified: z.boolean(),
  inspectionDate: z.coerce.date(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  observations: z.string().optional(),
})

export const rejectInspectionSchema = z.object({
  rejectionReason: z.string().min(2, 'Rejection reason is required'),
})

// ─── Lab Testing Schemas ───────────────────────────────────

export const assignLabSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  labId: z.string().min(1, 'Lab ID is required'),
})

export const addTestResultSchema = z.object({
  parameter: z.string().min(1, 'Parameter is required'),
  value: z.number().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  resultStatus: z.enum(['PASS', 'FAIL', 'NOT_APPLICABLE']),
  remarks: z.string().optional(),
})

export const generateLabReportSchema = z.object({
  reportUrl: z.string().url('Invalid report URL'),
  reportFileName: z.string().min(1, 'File name is required'),
  reportFileType: z.string().min(1, 'File type is required'),
})
