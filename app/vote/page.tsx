"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Upload,
  FileImage,
  CheckCircle,
  User,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Shield,
  Loader2,
  Vote,
  Sparkles,
  PartyPopper,
  Calendar,
  UserCheck,
  Hash,
} from "lucide-react"
import { useDropzone } from "react-dropzone"

// API Base URL - adjust this to match your FastAPI server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface VoterDetails {
  name: string
  father_name: string
  cnic: string
  birth_date: string
}

interface Party {
  id: string
  name: string
  fullName: string
  color: string
  logo: string
  description: string
}

interface CNICExtractionResponse {
  name: string
  father_name: string
  cnic: string
  birth_date: string
  all_text?: string[]
  warning?: string
  error?: string
}

interface VoterRegistrationResponse {
  message: string
  cnic: string
}

interface VoteCastResponse {
  message: string
  party: string
}

export default function VotePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showCNICModal, setShowCNICModal] = useState(false)
  // Info dialog for CNIC upload requirements
  const [showInfoDialog, setShowInfoDialog] = useState(true)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voteSubmitted, setVoteSubmitted] = useState(false)
  const [voterDetails, setVoterDetails] = useState<VoterDetails>({
    name: "",
    father_name: "",
    cnic: "",
    birth_date: "",
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const parties: Party[] = [
    {
      id: "PTI",
      name: "PTI",
      fullName: "Pakistan Tehreek-e-Insaf",
      color: "bg-red-500",
      logo: "🏏",
      description: "Justice, Humanity, Self Esteem",
    },
    {
      id: "PMLN",
      name: "PMLN",
      fullName: "Pakistan Muslim League Nawaz",
      color: "bg-green-600",
      logo: "🦁",
      description: "Progress, Development, Prosperity",
    },
    {
      id: "PPP",
      name: "PPP",
      fullName: "Pakistan Peoples Party",
      color: "bg-black",
      logo: "⚔️",
      description: "Democracy, Equality, Social Justice",
    },
    {
      id: "JUIF",
      name: "JUI-F",
      fullName: "Jamiat Ulema-e-Islam Fazl",
      color: "bg-green-700",
      logo: "📖",
      description: "Islamic Values, Religious Unity",
    },
    {
      id: "ANP",
      name: "ANP",
      fullName: "Awami National Party",
      color: "bg-red-600",
      logo: "🏔️",
      description: "Pashtun Rights, Provincial Autonomy",
    },
    {
      id: "MQM",
      name: "MQM-P",
      fullName: "Muttahida Qaumi Movement Pakistan",
      color: "bg-red-700",
      logo: "🌆",
      description: "Urban Rights, Middle Class Representation",
    },
    {
      id: "BAP",
      name: "BAP",
      fullName: "Balochistan Awami Party",
      color: "bg-orange-600",
      logo: "🏜️",
      description: "Baloch Rights, Provincial Development",
    },
    {
      id: "PMLQ",
      name: "PML-Q",
      fullName: "Pakistan Muslim League Quaid-e-Azam",
      color: "bg-blue-600",
      logo: "⭐",
      description: "Unity, Faith, Discipline",
    },
    {
      id: "TLP",
      name: "TLP",
      fullName: "Tehreek-e-Labbaik Pakistan",
      color: "bg-green-800",
      logo: "🕌",
      description: "Religious Protection, Islamic Values",
    },
    {
      id: "PSP",
      name: "PSP",
      fullName: "Pak Sarzameen Party",
      color: "bg-purple-600",
      logo: "🏛️",
      description: "Social Justice, Economic Equality",
    },
    {
      id: "JI",
      name: "JI",
      fullName: "Jamaat-e-Islami Pakistan",
      color: "bg-green-900",
      logo: "☪️",
      description: "Islamic Governance, Social Welfare",
    },
    {
      id: "GDA",
      name: "GDA",
      fullName: "Grand Democratic Alliance",
      color: "bg-yellow-600",
      logo: "🤝",
      description: "Democratic Alliance, Sindh Rights",
    },
    {
      id: "PKMAP",
      name: "PKMAP",
      fullName: "Pashtunkhwa Milli Awami Party",
      color: "bg-orange-700",
      logo: "🗻",
      description: "Pashtun Nationalism, Cultural Rights",
    },
    {
      id: "BNP",
      name: "BNP-M",
      fullName: "Balochistan National Party Mengal",
      color: "bg-yellow-700",
      logo: "🦅",
      description: "Baloch Nationalism, Resource Rights",
    },
    {
      id: "QWP",
      name: "QWP",
      fullName: "Qaumi Watan Party",
      color: "bg-indigo-600",
      logo: "🏴",
      description: "National Unity, Federal Balance",
    },
  ]

  // Upload CNIC and extract text using YOLO
  const uploadAndExtractCNIC = async (file: File): Promise<CNICExtractionResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/upload-cnic`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('CNIC upload error:', error)
      throw error
    }
  }

  // Register voter using API
  const registerVoter = async (voterData: VoterDetails): Promise<VoterRegistrationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/register-voter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: voterData.name,
          father_name: voterData.father_name,
          cnic: voterData.cnic,
          birth_date: voterData.birth_date,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Voter registration error:', error)
      throw error
    }
  }

  // Cast vote using API
  const castVote = async (cnic: string, party: string): Promise<VoteCastResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/cast-vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cnic: cnic,
          party: party,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Vote casting error:', error)
      throw error
    }
  }

  // Format CNIC for display (add dashes)
  const formatCNIC = (cnic: string) => {
    return cnic.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3')
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Get current date and time
  const getCurrentDateTime = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setIsProcessing(true)
      setApiError(null)

      // Simulate upload progress
      for (let i = 0; i <= 90; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      try {
        const extractedData = await uploadAndExtractCNIC(file)
        
        if (extractedData.error) {
          throw new Error(extractedData.error)
        }

        // Convert API response to internal format
        setVoterDetails({
          name: extractedData.name || "",
          father_name: extractedData.father_name || "",
          cnic: extractedData.cnic || "",
          birth_date: extractedData.birth_date || "",
        })
        
        setUploadProgress(100)
        
        if (extractedData.warning) {
          setApiError(extractedData.warning)
        }
        
        setTimeout(() => {
          setIsProcessing(false)
          setShowCNICModal(false)
          setCurrentStep(2)
        }, 500)
        
      } catch (error) {
        setIsProcessing(false)
        const errorMessage = error instanceof Error ? error.message : "Failed to process CNIC image"
        setApiError(errorMessage)
        console.error("Error processing CNIC:", error)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
  })

  const validateVoterDetails = async () => {
    setIsValidating(true)
    setApiError(null)
    const errors: Record<string, string> = {}

    // Validate CNIC format (13 digits)
    if (!/^\d{13}$/.test(voterDetails.cnic)) {
      errors.cnic = "CNIC must be exactly 13 digits"
    }

    // Validate required fields
    if (!voterDetails.name.trim()) {
      errors.name = "Name is required"
    }
    if (!voterDetails.father_name.trim()) {
      errors.father_name = "Father's & Husband name is required"
    }
    if (!voterDetails.birth_date) {
      errors.birth_date = "Date of birth is required"
    } else {
      // Validate MM/DD/YYYY format
      const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/
      if (!dobRegex.test(voterDetails.birth_date)) {
        errors.birth_date = "Date of birth must be in MM/DD/YYYY format"
      } else {
        // Check if valid date and age >= 18 and not in future
        const [month, day, year] = voterDetails.birth_date.split("/").map(Number)
        const dob = new Date(year, month - 1, day)
        const now = new Date()
        if (
          dob.getFullYear() !== year ||
          dob.getMonth() !== month - 1 ||
          dob.getDate() !== day
        ) {
          errors.birth_date = "Date of birth is not a valid date"
        } else if (dob > now) {
          errors.birth_date = "Date of birth cannot be in the future"
        } else {
          // Check age >= 18
          const age = now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0)
          if (age < 18) {
            errors.birth_date = "You must be at least 18 years old to vote"
          }
        }
      }
    }

    setValidationErrors(errors)

    // If basic validation passes, try to register the voter
    if (Object.keys(errors).length === 0) {
      try {
        await registerVoter(voterDetails)
        setCurrentStep(3)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to register voter"
        if (errorMessage.includes("already registered")) {
          // Voter already exists, that's fine, proceed to voting
          setCurrentStep(3)
        } else if (errorMessage.includes("already voted")) {
          setApiError("This CNIC has already been used to vote")
        } else {
          setApiError(errorMessage)
        }
      }
    }
    
    setIsValidating(false)
  }

  const handleInputChange = (field: keyof VoterDetails, value: string) => {
    setVoterDetails((prev) => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }))
    }
    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null)
    }
  }

  const handlePartySelection = (party: Party) => {
    setSelectedParty(party)
  }

  const proceedToConfirmation = () => {
    if (selectedParty) {
      setCurrentStep(4)
    }
  }

  const submitVote = async () => {
    if (!selectedParty) return
    
    setIsSubmitting(true)
    setApiError(null)

    try {
      const result = await castVote(voterDetails.cnic, selectedParty.id)
      console.log("Vote cast successfully:", result)
      
      setIsSubmitting(false)
      setVoteSubmitted(true)

      // Auto-redirect to dashboard after 5 seconds
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 5000)
      
    } catch (error) {
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : "Failed to cast vote"
      setApiError(errorMessage)
      console.error("Error casting vote:", error)
    }
  }

  const resetToManualEntry = () => {
    setShowCNICModal(false)
    setUploadedFile(null)
    setUploadProgress(0)
    setIsProcessing(false)
    setApiError(null)
    setCurrentStep(2) // Go directly to manual entry
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Info Dialog: CNIC Upload Requirements */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="text-primary text-center">Important CNIC Upload Instructions</DialogTitle>
            <DialogDescription className="text-foreground text-center">
              <ul className="list-disc list-inside text-left space-y-1 mt-2">
                <li>Upload <span className="font-semibold">English CNIC</span> only.</li>
                <li>AI model <span className="font-semibold text-destructive">does not recognize Urdu CNIC</span>.</li>
                <li>Upload <span className="font-semibold">only the front side</span> of the CNIC.</li>
                <li>Ensure the image is <span className="font-semibold">clear and readable</span>.</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowInfoDialog(false)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-semibold shadow hover:bg-primary/90 transition"
              autoFocus
            >
              OK, Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Secure Voting Process</h1>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Step {currentStep} of 4
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 py-4">
        <Progress value={(currentStep / 4) * 100} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>CNIC Upload</span>
          <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Voter Details</span>
          <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Party Selection</span>
          <span className={currentStep >= 4 ? "text-primary font-medium" : ""}>Confirmation</span>
        </div>
      </div>

      {/* API Error Display */}
      {apiError && (
        <div className="container mx-auto px-4">
          <Alert className="mb-4 border-destructive/20 bg-destructive/5">
            <AlertDescription className="text-destructive">
              {apiError}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Step 1: CNIC Upload */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">CNIC Verification</CardTitle>
                <CardDescription>Upload your CNIC to verify your identity and auto-fill voter details</CardDescription>
              </CardHeader>
<CardContent className="flex flex-col items-center gap-4">
  <Button size="lg" onClick={() => setShowCNICModal(true)} className="w-full max-w-xs px-8 py-6 text-lg">
    <Upload className="w-5 h-5 mr-2" />
    Upload CNIC
  </Button>
  <p className="text-sm text-muted-foreground w-full max-w-xs text-center">Supported formats: JPG, PNG • Maximum size: 5MB</p>
  
  {/* Divider with "Or" */}
  <div className="flex items-center w-full max-w-xs my-2">
    <div className="flex-grow border-t border-muted-foreground/30"></div>
    <span className="mx-3 text-xs uppercase text-muted-foreground bg-background px-2 tracking-widest">Or</span>
    <div className="flex-grow border-t border-muted-foreground/30"></div>
  </div>
  
  <Button variant="outline" onClick={resetToManualEntry} className="w-full max-w-xs px-8 py-6 text-lg">
    <User className="w-5 h-5 mr-2" />
    Enter Details Manually
  </Button>
</CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Voter Details */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-secondary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Voter Details</CardTitle>
                <CardDescription>
                  {uploadedFile ? "Verify the information extracted from your CNIC" : "Enter your voter information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={voterDetails.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`border-black focus:border-black ${validationErrors.name ? "border-destructive" : ""}`}
                      placeholder="Enter your full name"
                    />
                    {validationErrors.name && <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="father_name">Father's & Husband Name</Label>
                    <Input
                      id="father_name"
                      value={voterDetails.father_name}
                      onChange={(e) => handleInputChange("father_name", e.target.value)}
                      className={`border-black focus:border-black ${validationErrors.father_name ? "border-destructive" : ""}`}
                      placeholder="Enter your father's & husband name"
                    />
                    {validationErrors.father_name && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.father_name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cnic">CNIC Number</Label>
                    <Input
                      id="cnic"
                      value={voterDetails.cnic}
                      onChange={(e) => handleInputChange("cnic", e.target.value.replace(/\D/g, "").slice(0, 13))}
                      placeholder="3310112345678"
                      className={`border-black focus:border-black ${validationErrors.cnic ? "border-destructive" : ""}`}
                    />
                    {validationErrors.cnic && <p className="text-sm text-destructive mt-1">{validationErrors.cnic}</p>}
                    <p className="text-sm text-muted-foreground mt-1">13 digits, no dashes</p>
                  </div>

                  <div>
                    <Label htmlFor="birth_date">Date of Birth</Label>
<Input
  id="birth_date"
  type="text"
  value={voterDetails.birth_date}
  onChange={(e) => handleInputChange("birth_date", e.target.value)}
  placeholder="MM/DD/YYYY"
  className={`border-black focus:border-black ${validationErrors.birth_date ? "border-destructive" : ""}`}
/>
                    {validationErrors.birth_date && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.birth_date}</p>
                    )}
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your information is encrypted and will only be used for voter verification.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={validateVoterDetails} disabled={isValidating} className="flex-1">
                    {isValidating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    {isValidating ? "Validating..." : "Continue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Party Selection */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-accent/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Select Your Party</CardTitle>
                <CardDescription>Choose the political party you want to vote for in this election</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {parties.map((party) => (
                    <Card
                      key={party.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                        selectedParty?.id === party.id
                          ? "ring-2 ring-primary border-primary/50 bg-primary/5"
                          : "hover:border-primary/30"
                      }`}
                      onClick={() => handlePartySelection(party)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div
                          className={`w-20 h-20 ${party.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold shadow-lg`}
                        >
                          {party.logo}
                        </div>
                        <CardTitle className="text-xl">{party.name}</CardTitle>
                        <CardDescription className="font-medium text-foreground">{party.fullName}</CardDescription>
                        <p className="text-sm text-muted-foreground italic">{party.description}</p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {selectedParty?.id === party.id && (
                          <div className="flex items-center justify-center space-x-2 text-primary animate-fade-in">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Selected</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedParty && (
                  <Alert className="border-primary/20 bg-primary/5">
                    <Vote className="h-4 w-4" />
                    <AlertDescription>
                      You have selected <strong>{selectedParty.fullName}</strong>. Click continue to proceed to
                      confirmation.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Add bottom padding for fixed button bar on mobile */}
                <div className="pb-32 sm:pb-0"></div>
              </CardContent>
              {/* Fixed bottom action bar for mobile, static on desktop */}
              <div className="flex gap-4 fixed bottom-0 left-0 w-full bg-white/90 p-4 z-50 border-t sm:static sm:bg-transparent sm:p-0 sm:border-0 max-w-4xl mx-auto">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={proceedToConfirmation} disabled={!selectedParty} className="flex-1">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue to Confirmation
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Confirmation & Submission */}
        {currentStep === 4 && (
          <div className="max-w-2xl mx-auto">
            {!voteSubmitted ? (
              <Card className="border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Confirm Your Vote</CardTitle>
                  <CardDescription>Please review your information and confirm your vote</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enhanced Voter Summary */}
                  <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-6 space-y-4 border">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground">Voter Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* Full Name */}
                      <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg border">
                        <User className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
                          <p className="font-semibold text-lg text-foreground">{voterDetails.name}</p>
                        </div>
                      </div>

                      {/* Father's Name */}
                      <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg border">
                        <User className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Father's & Husband Name</label>
                          <p className="font-semibold text-lg text-foreground">{voterDetails.father_name}</p>
                        </div>
                      </div>

                      {/* CNIC */}
                      <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg border">
                        <Hash className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">CNIC Number</label>
                          <p className="font-semibold text-lg text-foreground font-mono">{formatCNIC(voterDetails.cnic)}</p>
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg border">
                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Date of Birth</label>
                          <p className="font-semibold text-lg text-foreground">{formatDate(voterDetails.birth_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Party Selection Summary */}
{selectedParty && (
  <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
        <Vote className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold text-lg text-foreground">Selected Party</h3>
    </div>
    {/* Responsive party summary: column on mobile, row on desktop */}
    <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0 p-4 bg-white/50 rounded-lg border text-center md:text-left">
      <div
        className={`w-16 h-16 ${selectedParty.color} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto md:mx-0`}
      >
        {selectedParty.logo}
      </div>
      <div className="flex-1">
        <p className="font-bold text-2xl text-foreground">{selectedParty.name}</p>
        <p className="text-lg text-muted-foreground font-medium">{selectedParty.fullName}</p>
        <p className="text-sm text-muted-foreground italic mt-1">{selectedParty.description}</p>
      </div>
      <div className="flex justify-center md:justify-end">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          <CheckCircle className="w-4 h-4 mr-1" />
          Selected
        </Badge>
      </div>
    </div>
  </div>
)}

                  {/* Vote Summary Card */}
                  <div className="bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-accent" />
                      <span>Vote Summary</span>
                    </h3>
<div className="space-y-3">
  <div className="flex flex-col items-start gap-1 py-2 border-b border-accent/10 md:flex-row md:items-center md:justify-between">
    <span className="text-muted-foreground">Voting Date & Time:</span>
    <span className="font-medium break-all">{getCurrentDateTime()}</span>
  </div>
  <div className="flex flex-col items-start gap-1 py-2 border-b border-accent/10 md:flex-row md:items-center md:justify-between">
    <span className="text-muted-foreground">Voter ID:</span>
    <span className="font-mono font-medium break-all">{formatCNIC(voterDetails.cnic)}</span>
  </div>
  <div className="flex flex-col items-start gap-1 py-2 md:flex-row md:items-center md:justify-between">
    <span className="text-muted-foreground">Selected Party:</span>
    <span className="font-medium break-all">{selectedParty?.name} ({selectedParty?.fullName})</span>
  </div>
</div>
                  </div>

                  <Alert className="border-orange-200 bg-orange-50">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Important:</strong> Once you submit your vote, it cannot be changed. Please ensure all
                      information is correct before proceeding.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-4 sm:static fixed bottom-0 left-0 w-full bg-white/90 p-4 z-50 border-t sm:border-0 sm:bg-transparent sm:p-0">
                    <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={submitVote}
                      disabled={isSubmitting}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Vote className="w-4 h-4 mr-2" />
                      )}
                      {isSubmitting ? "Submitting Vote..." : "Submit Vote"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Success Animation */
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="text-center py-12">
                  <div className="animate-bounce mb-6">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-12 h-12 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-2xl">
                      <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                      <h2 className="text-2xl font-bold text-primary">Vote Successfully Cast!</h2>
                      <PartyPopper className="w-6 h-6 text-accent animate-pulse" />
                    </div>

                    <p className="text-lg text-muted-foreground">
                      Thank you for participating in Pakistan's democratic process
                    </p>

                    <div className="bg-white/50 rounded-lg p-4 mt-6">
                      <p className="text-sm text-muted-foreground">Redirecting to dashboard in 3 seconds...</p>
                      <div className="mt-2">
                        <Progress value={100} className="h-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* CNIC Upload Modal */}
      <Dialog open={showCNICModal} onOpenChange={setShowCNICModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload CNIC</DialogTitle>
            <DialogDescription>Upload a clear photo of your CNIC for automatic data extraction</DialogDescription>
          </DialogHeader>

          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-primary">Drop your CNIC here...</p>
              ) : (
                <>
                  <p className="text-foreground font-medium mb-2">Drag & drop your CNIC here, or click to select</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG up to 5MB</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <FileImage className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                {!isProcessing && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing CNIC...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {isProcessing && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>Using AI to extract text from your CNIC. This may take a moment.</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
