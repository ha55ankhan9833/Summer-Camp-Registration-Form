import { useState } from 'react'
import { supabase } from './lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Check, Award, Calendar, Users, MapPin, CreditCard, Upload, Sparkles, Code, Puzzle, Palette, Brain, Trash2, Download } from 'lucide-react'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { Input } from './components/ui/Input'
import { Checkbox } from './components/ui/Checkbox'
import { Clock } from 'lucide-react'
import { registrationSchema, RegistrationFormData, StoredRegistration } from './lib/validation'

function App() {
  const fetchSubmissions = async () => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch error:', error)
    return
  }

  setSubmissions(data || [])
}
  const [isSubmitted, setIsSubmitted] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)
const [showAdmin, setShowAdmin] = useState(false)
const [showAdminLogin, setShowAdminLogin] = useState(false)

const [previewUrl, setPreviewUrl] = useState('')

const [submissions, setSubmissions] = useState<StoredRegistration[]>(() => {
  const saved = localStorage.getItem('campSubmissions')
  return saved ? JSON.parse(saved) : []
})
  

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      agreements: {
        accurateInfo: false,
        feeUnderstanding: false,
        paymentVerification: false,
        campRules: false,
        photographyConsent: false,
      },
    },
  })

  const onSubmit = async (data: RegistrationFormData) => {
  try {
    setIsSubmitting(true)

    let screenshotUrl = ''
    const file = data.paymentScreenshot?.[0]

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName)

      screenshotUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('registrations').insert({
      student_name: data.studentName,
      student_phone: data.studentPhone,
      age: data.age,
      gender: data.gender,
      current_class: data.currentClass,
      school_name: data.schoolName,
      parent_name: data.parentName,
      parent_contact: data.parentContact,
      parent_email: data.parentEmail,
      emergency_contact: data.emergencyContact,
      medical_condition: data.medicalCondition || '',
      payment_method: data.paymentMethod,
      screenshot_url: screenshotUrl,
    })

    if (error) throw error

    setIsSubmitted(true)
  } catch (error) {
    console.error('Submission error:', error)
    alert('Submission failed. Please check Supabase policies or console error.')
  } finally {
    setIsSubmitting(false)
  }
}

  const deleteSubmission = (index: number) => {
    const newSubmissions = submissions.filter((_, i) => i !== index)
    setSubmissions(newSubmissions)
    localStorage.setItem('campSubmissions', JSON.stringify(newSubmissions))
  }

  const downloadSubmissions = () => {
    const dataStr = JSON.stringify(submissions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'camp-submissions.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleAdminLogin = (username: string, password: string) => {
    // Simple hardcoded credentials (in production, use proper backend authentication)
    if (username === 'admin' && password === 'coderaxo2026') {
      setShowAdminLogin(false)
      setShowAdmin(true)
      fetchSubmissions()
    } else {
      alert('Invalid credentials')
    }
  }

  const handleAdminLogout = () => {
    setShowAdmin(false)
  }

  const agreements = watch('agreements')

  // Admin Login View
  if (showAdminLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-center gradient-text">Admin Login</h1>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleAdminLogin(
                formData.get('username') as string,
                formData.get('password') as string
              )
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">Username</label>
                <input
                  name="username"
                  type="text"
                  required
                  className="glass-input w-full"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="glass-input w-full"
                  placeholder="Enter password"
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button
                type="button"
                onClick={() => setShowAdminLogin(false)}
                variant="secondary"
                className="w-full"
              >
                Cancel
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Admin Dashboard View
  if (showAdmin) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
            <div className="flex gap-3">
              <Button onClick={downloadSubmissions} variant="secondary" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download JSON
              </Button>
              <Button onClick={handleAdminLogout} variant="secondary">
                Logout
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-brand-white mb-2">
                Total Registrations: {submissions.length}
              </h2>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-brand-gray text-lg">No registrations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-6 rounded-xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-brand-white">
                          {submission.studentName}
                        </h3>
                        <p className="text-sm text-brand-gray">
                          Submitted: {new Date(submission.submittedAt || '').toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSubmission(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-brand-gray mb-1">Age</p>
                        <p className="text-brand-white font-medium">{submission.age}</p>
                      </div>
                      <div>
                        <p className="text-brand-gray mb-1">Gender</p>
                        <p className="text-brand-white font-medium capitalize">{submission.gender}</p>
                      </div>
                      <div>
                        <p className="text-brand-gray mb-1">Class/Grade</p>
                        <p className="text-brand-white font-medium">{submission.currentClass}</p>
                      </div>
                      <div>
                        <p className="text-brand-gray mb-1">School</p>
                        <p className="text-brand-white font-medium">{submission.schoolName}</p>
                      </div>
                      <div>
                        <p className="text-brand-gray mb-1">Parent Name</p>
                        <p className="text-brand-white font-medium">{submission.parentName}</p>
                      </div>
                      <div>
                        <p className="text-brand-gray mb-1">Parent Contact</p>
                        <p className="text-brand-white font-medium">{submission.parentContact}</p>
                      </div>
                      <div>
                        <p className="text-brand-gray mb-1">Parent Email</p>
                        <p className="text-brand-white font-medium">{submission.parentEmail}</p>
                      </div>
                      <div>
                        <p className="text-brand-gray mb-1">Emergency Contact</p>
                        <p className="text-brand-white font-medium">{submission.emergencyContact}</p>
                      </div>
                      <div>
                        <p className="text-brand-gray mb-1">Payment Method</p>
                        <p className="text-brand-white font-medium capitalize">
                          {submission.paymentMethod?.replace('_', ' ')}
                        </p>
                      </div>
                      {submission.medicalCondition && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <p className="text-brand-gray mb-1">Medical Condition</p>
                          <p className="text-brand-white font-medium">{submission.medicalCondition}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">🎉 Registration Submitted Successfully!</h1>
          <p className="text-brand-gray text-lg mb-8">
            Thank you for registering for Summer Tech Camp 2026. Our team will contact you shortly regarding payment verification and camp details.
          </p>
          <Button onClick={() => setIsSubmitted(false)} variant="secondary">
            Register Another Student
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 gradient-text">
            Summer Tech Camp 2026
          </h1>
          <p className="text-2xl sm:text-3xl text-primary-light mb-6 font-semibold">
            "Learn. Create. Innovate."
          </p>
          <p className="text-brand-gray max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            Join an exciting 4-week summer program designed for students aged 12 years and above. Explore Artificial Intelligence, Front-End Development, Mathematics, and Digital Creativity through interactive learning, projects, competitions, and challenges.
          </p>
          <p className="text-brand-gray max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">Phone No/Whatsapp: +92 333 5580537 , +92 336 5069443</p>
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            'Certificate of Completion',
            'Weekly Quizzes',
            'Goodie Bags',
            'Competitions & Challenges',
            'Hands-on Projects',
            'Limited Seats Available',
          ].map((badge, index) => (
            <motion.span
              key={badge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-brand-white hover:bg-white/20 transition-all cursor-default"
            >
              {badge}
            </motion.span>
          ))}
        </motion.div>

        {/* Camp Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">Camp Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: Calendar, label: 'Duration', value: '4 Weeks' },
                { icon: Users, label: 'Age Requirement', value: 'Under 18' },
                { icon: CreditCard, label: 'Fee', value: 'PKR 10,000' },
                { icon: MapPin, label: 'Location', value: 'On Campus' },
                { icon: Award, label: 'Certificate', value: 'Included' },
                { icon: Clock, label: 'Deadline', value: '20 June 2026'}
              ].map((detail, index) => (
                <motion.div
                  key={detail.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <detail.icon className="w-8 h-8 mx-auto mb-2 text-primary-light" />
                  <p className="text-xs text-brand-gray mb-1">{detail.label}</p>
                  <p className="text-sm font-semibold text-brand-white">{detail.value}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Program Modules Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Program Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: 'Fun with AI',
                items: ['AI Tools', 'Image Generation', 'Prompt Engineering', 'AI Projects'],
              },
              {
                icon: Code,
                title: 'Web Development',
                items: ['HTML', 'CSS', 'Java Script', 'Portfolio Website'],
              },
              {
                icon: Puzzle,
                title: 'Fun with Mathematics',
                items: ['Logic Games', 'Puzzles', 'Brain Teasers', 'Mental Math'],
              },
              {
                icon: Palette,
                title: 'English Language & Communication',
                items: ['Spoken English Practice', 'Grammar & Vocabulary', 'Public Speaking Skills', 'Writing & Comprehension'],
              },
              {
                icon: Palette,
                title: 'Calligraphy',
                items: ['Brush Pen Techniques', 'Modern Calligraphy Styles', 'Lettering Composition', 'Custom Art & Quotes'],
              },
            ].map((module) => (
              <Card key={module.title} hover className="p-6">
                <module.icon className="w-12 h-12 mb-4 text-primary-light" />
                <h3 className="text-xl font-bold mb-4 text-brand-white">{module.title}</h3>
                <ul className="space-y-2">
                  {module.items.map((item) => (
                    <li key={item} className="text-sm text-brand-gray flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="p-6 sm:p-8">
            <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Registration Form</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Student Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-brand-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary-light" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Student Full Name"
                    placeholder="Enter student's full name"
                    {...register('studentName')}
                    error={errors.studentName?.message}
                    required
                  />
                  <Input
  label="Student Phone Number"
  type="tel"
  placeholder="03XXXXXXXXX"
  {...register('studentPhone')}
  error={errors.studentPhone?.message}
  required
/>
                  <Input
                    label="Age"
                    type="number"
                    placeholder="Enter age"
                    {...register('age', { valueAsNumber: true })}
                    error={errors.age?.message}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">
                      Gender <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="male"
                          {...register('gender')}
                          className="w-5 h-5 text-primary focus:ring-primary"
                        />
                        <span className="text-brand-gray">Male</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="female"
                          {...register('gender')}
                          className="w-5 h-5 text-primary focus:ring-primary"
                        />
                        <span className="text-brand-gray">Female</span>
                      </label>
                    </div>
                    {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender.message}</p>}
                  </div>
                  <Input
                    label="Current Class / Grade"
                    placeholder="e.g., 10th Grade"
                    {...register('currentClass')}
                    error={errors.currentClass?.message}
                    required
                  />
                  <Input
                    label="School / College Name"
                    placeholder="Enter school or college name"
                    {...register('schoolName')}
                    error={errors.schoolName?.message}
                    required
                    className="md:col-span-2"
                  />
                </div>
              </div>

              {/* Parent / Guardian Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-brand-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary-light" />
                  Parent / Guardian Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Parent / Guardian Name"
                    placeholder="Enter parent/guardian name"
                    {...register('parentName')}
                    error={errors.parentName?.message}
                    required
                  />
                  <Input
                    label="Parent / Guardian Contact Number"
                    type="tel"
                    placeholder="03XXXXXXXXX"
                    {...register('parentContact')}
                    error={errors.parentContact?.message}
                    required
                  />
                  <Input
                    label="Parent / Guardian Email Address"
                    type="email"
                    placeholder="parent@example.com"
                    {...register('parentEmail')}
                    error={errors.parentEmail?.message}
                    required
                    className="md:col-span-2"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-brand-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary-light" />
                  Emergency Contact
                </h3>
                <Input
                  label="Emergency Contact Number"
                  type="tel"
                  placeholder="03XXXXXXXXX"
                  {...register('emergencyContact')}
                  error={errors.emergencyContact?.message}
                  required
                />
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-brand-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary-light" />
                  Medical Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">
                    Any Medical Condition, Allergy, or Special Requirement? (Optional)
                  </label>
                  <textarea
                    {...register('medicalCondition')}
                    placeholder="Please provide any medical information we should be aware of"
                    className="glass-input w-full min-h-[100px] resize-none"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-brand-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-primary-light" />
                  Payment Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">
                      Payment Method  <span className="text-red-400">*</span>
                    </label>
                    <p className="text-brand-gray max-w-3xl text-base sm:text-lg leading-relaxed text-left"><b>Account Title:</b> Ali Rafaiye<br></br>
                    <b>Payment Method:</b> Jazz Cash <br></br>
                    <b>JazzCash Number:</b> 03335580537 <br></br><br></br>
                    

                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['jazzcash','cash'].map((method) => (
                        <label key={method} className="cursor-pointer">
                          <input
                            type="radio"
                            value={method}
                            {...register('paymentMethod')}
                            className="sr-only peer"
                          />
                          <div className="p-3 rounded-xl border-2 border-white/20 bg-white/5 text-center peer-checked:border-primary peer-checked:bg-primary/20 transition-all hover:bg-white/10">
                            <span className="text-sm font-medium text-brand-white capitalize">
                              {method.replace('_', ' ')}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.paymentMethod && <p className="text-red-400 text-sm mt-1">{errors.paymentMethod.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">
                      Upload Payment Screenshot / Receipt (Optional)
                    </label>
                    <div className="relative">
                      <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="paymentScreenshot"
                      {...register('paymentScreenshot')}
                      onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                      setPreviewUrl(URL.createObjectURL(file))
                       }
                       }}
                      />
                     <label
                      htmlFor="paymentScreenshot"
                      className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-brand-gray cursor-pointer"
                      >
                      <Upload className="w-6 h-6 text-primary-light" />
                  
                      <span className="text-brand-gray">
                       Click to upload payment screenshot
                       </span>
                      </label>
                      {previewUrl && (
  <div className="mt-3">
    <img
      src={previewUrl}
      alt="Payment Screenshot Preview"
      className="rounded-lg max-h-48 border border-white/20"
    />

    <button
      type="button"
      onClick={() => {
        setPreviewUrl('')
      }}
      className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
    >
      Remove Screenshot
    </button>
  </div>
)}
                        <Upload className="w-6 h-6 text-primary-light mt-3" />
                        <span className="text-brand-gray">Click to upload payment screenshot</span>
                      
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-brand-white flex items-center">
                  <Check className="w-5 h-5 mr-2 text-primary-light" />
                  Agreement
                </h3>
                <div className="space-y-3">
                  <Checkbox
                    label="I confirm that the information provided is accurate"
                    checked={agreements.accurateInfo}
                    onChange={(checked) => setValue('agreements.accurateInfo', checked)}
                    error={errors.agreements?.accurateInfo?.message}
                  />
                  <Checkbox
                    label="I understand the fee is PKR 10,000"
                    checked={agreements.feeUnderstanding}
                    onChange={(checked) => setValue('agreements.feeUnderstanding', checked)}
                    error={errors.agreements?.feeUnderstanding?.message}
                  />
                  <Checkbox
                    label="I understand that registration is confirmed after payment verification"
                    checked={agreements.paymentVerification}
                    onChange={(checked) => setValue('agreements.paymentVerification', checked)}
                    error={errors.agreements?.paymentVerification?.message}
                  />
                  <Checkbox
                    label="I agree to camp rules and attendance requirements"
                    checked={agreements.campRules}
                    onChange={(checked) => setValue('agreements.campRules', checked)}
                    error={errors.agreements?.campRules?.message}
                  />
                  <Checkbox
                    label="I consent to photography and videography during camp activities"
                    checked={agreements.photographyConsent}
                    onChange={(checked) => setValue('agreements.photographyConsent', checked)}
                    error={errors.agreements?.photographyConsent?.message}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-12">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Submitting...
                    </span>
                  ) : (
                    'Register Now'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-12 text-brand-gray text-sm"
        >
          <p>© 2026 CoderAxo. All rights reserved.</p>
          <button
            onClick={() => setShowAdminLogin(true)}
            className="mt-2 text-brand-gray/50 hover:text-brand-gray transition-colors text-xs"
          >
            Admin
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default App
