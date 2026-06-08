import { z } from 'zod'

export const registrationSchema = z.object({
  studentName: z.string().min(3, 'Student name must be at least 3 characters'),
  studentPhone: z.string().regex(
  /^03[0-9]{9}$/,
  'Please enter a valid Pakistani mobile number (03XXXXXXXXX)'
),
  age: z.number(),
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

export type StoredRegistration = {
  id?: number
  student_name: string
  student_phone?: string
  age: number
  gender: 'male' | 'female'
  current_class: string
  school_name: string
  parent_name: string
  parent_contact: string
  parent_email: string
  emergency_contact: string
  medical_condition?: string
  payment_method: 'jazzcash' | 'cash'
  screenshot_url?: string
  created_at: string
}
