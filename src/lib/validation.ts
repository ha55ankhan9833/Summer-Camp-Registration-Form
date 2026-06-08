import { z } from 'zod'

export const registrationSchema = z.object({
  studentName: z.string().min(3, 'Student name must be at least 3 characters'),
  age: z.number().min(12, 'Student must be at least 12 years old').max(25, 'Age must be 25 or below'),
  gender: z.enum(['male', 'female'], { required_error: 'Please select a gender' }),
  currentClass: z.string().min(1, 'Please enter your current class/grade'),
  schoolName: z.string().min(3, 'School name must be at least 3 characters'),
  parentName: z.string().min(3, 'Parent/Guardian name must be at least 3 characters'),
  parentContact: z.string().regex(/^03[0-9]{9}$/, 'Please enter a valid Pakistani mobile number (03XXXXXXXXX)'),
  parentEmail: z.string().email('Please enter a valid email address'),
  emergencyContact: z.string().regex(/^03[0-9]{9}$/, 'Please enter a valid Pakistani mobile number (03XXXXXXXXX)'),
  medicalCondition: z.string().optional(),
  paymentMethod: z.enum(['easypaisa', 'jazzcash', 'bank_transfer', 'cash'], { required_error: 'Please select a payment method' }),
  paymentScreenshot: z.any().optional(),
  agreements: z.object({
    accurateInfo: z.boolean().refine((val: boolean) => val === true, 'You must confirm the information is accurate'),
    feeUnderstanding: z.boolean().refine((val: boolean) => val === true, 'You must understand the fee is PKR 10,000'),
    paymentVerification: z.boolean().refine((val: boolean) => val === true, 'You must understand registration is confirmed after payment verification'),
    campRules: z.boolean().refine((val: boolean) => val === true, 'You must agree to camp rules and attendance requirements'),
    photographyConsent: z.boolean().refine((val: boolean) => val === true, 'You must consent to photography and videography'),
  }),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>

export type StoredRegistration = RegistrationFormData & {
  submittedAt: string
}
