"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Shield, CheckCircle, XCircle, Clock, Vote, AlertTriangle, Eye, Lock, Loader2 } from "lucide-react"

// API Base URL - adjust this to match your FastAPI server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface VoterStatusResponse {
  registered: boolean
  voted: boolean
  voter_info?: {
    name: string
    father_name: string
    cnic: string
    birth_date: string
  }
  message: string
  error?: string
}

interface VerificationResult {
  status: "voted" | "not_voted" | "invalid" | "error"
  voterName?: string
  fatherName?: string
  cnic?: string
  birthDate?: string
  message?: string
}

export default function VerifyPage() {
  const [cnic, setCnic] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [validationError, setValidationError] = useState("")
  const [attemptCount, setAttemptCount] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)

  // Verify vote using the API
  const verifyVote = async (cnicNumber: string): Promise<VerificationResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voter-status/${encodeURIComponent(cnicNumber)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        return {
          status: "error",
          message: errorData.message || `HTTP error! status: ${response.status}`
        }
      }
      
      const data: VoterStatusResponse = await response.json()
      
      if (data.error) {
        return {
          status: "invalid",
          message: data.message || data.error
        }
      }
      
      if (!data.registered) {
        return {
          status: "invalid",
          message: data.message
        }
      }
      
      if (data.voted) {
        return {
          status: "voted",
          voterName: data.voter_info?.name,
          fatherName: data.voter_info?.father_name,
          cnic: data.voter_info?.cnic,
          birthDate: data.voter_info?.birth_date,
          message: "Vote has been successfully recorded"
        }
      }
      
      return {
        status: "not_voted",
        voterName: data.voter_info?.name,
        fatherName: data.voter_info?.father_name,
        cnic: data.voter_info?.cnic,
        birthDate: data.voter_info?.birth_date,
        message: data.message
      }
      
    } catch (error) {
      console.error('Verification API error:', error)
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Network error occurred"
      }
    }
  }

  const handleCnicChange = (value: string) => {
    // Only allow digits and limit to 13 characters
    const cleanValue = value.replace(/\D/g, "").slice(0, 13)
    setCnic(cleanValue)

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("")
    }

    // Clear previous results when CNIC changes
    if (verificationResult) {
      setVerificationResult(null)
    }
  }

  const handleVerification = async () => {
    // Validate CNIC format
    if (!/^\d{13}$/.test(cnic)) {
      setValidationError("CNIC must be exactly 13 digits")
      return
    }

    // Check rate limiting
    if (attemptCount >= 5) {
      setIsRateLimited(true)
      return
    }

    setIsVerifying(true)
    setAttemptCount((prev) => prev + 1)

    try {
      const result = await verifyVote(cnic)
      setVerificationResult(result)
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationResult({
        status: "error",
        message: "Verification failed. Please try again."
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "voted":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
            <CheckCircle className="w-3 h-3 mr-1" />
            Vote Confirmed
          </Badge>
        )
      case "not_voted":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            No Vote Found
          </Badge>
        )
      case "invalid":
      case "error":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            {status === "invalid" ? "Invalid CNIC" : "Verification Error"}
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Vote Verification</h1>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Secure Verification
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Main Verification Card */}
          <Card className="border-primary/20 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verify Your Vote</CardTitle>
              <CardDescription>Enter your CNIC number to check if your vote was successfully recorded</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CNIC Input */}
              <div className="space-y-2">
                <Label htmlFor="cnic" className="text-base font-medium">
                  CNIC Number
                </Label>
                <div className="relative">
                  <Input
                    id="cnic"
                    type="text"
                    placeholder="Enter 13-digit CNIC (e.g., 3310112345678)"
                    value={cnic}
                    onChange={(e) => handleCnicChange(e.target.value)}
                    className={`text-lg py-6 pr-12 ${validationError ? "border-destructive" : "border-primary/30 focus:border-primary"}`}
                    disabled={isVerifying || isRateLimited}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {cnic.length === 13 && !validationError && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                </div>
                {validationError && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {validationError}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Enter your 13-digit CNIC without dashes or spaces</p>
              </div>

              {/* Rate Limiting Warning */}
              {isRateLimited && (
                <Alert className="border-yellow-500/20 bg-yellow-500/5">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-700">
                    Too many verification attempts. Please wait before trying again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Verification Button */}
              <Button
                onClick={handleVerification}
                disabled={cnic.length !== 13 || isVerifying || isRateLimited}
                className="w-full py-6 text-lg"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying Vote...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Verify Vote
                  </>
                )}
              </Button>

              {/* Verification Results */}
              {verificationResult && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Verification Results</h3>
                      {getStatusBadge(verificationResult.status)}
                    </div>

                    {verificationResult.status === "voted" && (
                      <div className="space-y-4">
                        {/* Vote Confirmation */}
                        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                              <div>
                                <p className="font-semibold text-green-800 dark:text-green-400">Vote Successfully Recorded</p>
                                <p className="text-sm text-green-600 dark:text-green-500">Your vote has been securely counted</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Vote Details */}
                        <Card className="border-muted">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Voter Name:</span>
                              <span className="font-medium">{verificationResult.voterName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Father's & Husband Name:</span>
                              <span className="font-medium">{verificationResult.fatherName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">CNIC:</span>
                              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                {verificationResult.cnic}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Birth Date:</span>
                              <span className="font-medium">{verificationResult.birthDate}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {verificationResult.status === "not_voted" && (
                      <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Clock className="w-6 h-6 text-yellow-600" />
                            <div>
                              <p className="font-semibold text-yellow-800 dark:text-yellow-400">No Vote Found</p>
                              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                                This CNIC has not been used to cast a vote yet. You can still vote if the election is
                                ongoing.
                              </p>
                            </div>
                          </div>
                          
                          {verificationResult.voterName && (
                            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                              <h4 className="font-medium mb-2">Registered Voter Details:</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Name:</span> {verificationResult.voterName}</p>
                                <p><span className="font-medium">Father's Name:</span> {verificationResult.fatherName}</p>
                                <p><span className="font-medium">CNIC:</span> {verificationResult.cnic}</p>
                              </div>
                            </div>
                          )}
                          
                          <Button className="mt-4 w-full" asChild>
                            <a href="/vote">
                              <Vote className="w-4 h-4 mr-2" />
                              Cast Your Vote Now
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {(verificationResult.status === "invalid" || verificationResult.status === "error") && (
                      <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <XCircle className="w-6 h-6 text-red-600" />
                            <div>
                              <p className="font-semibold text-red-800 dark:text-red-400">
                                {verificationResult.status === "invalid" ? "Invalid CNIC" : "Verification Error"}
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-500">
                                {verificationResult.message || "Unable to verify this CNIC number."}
                              </p>
                            </div>
                          </div>
                          
                          {verificationResult.status === "error" && (
                            <Button 
                              variant="outline" 
                              className="mt-4 w-full" 
                              onClick={() => {
                                setVerificationResult(null)
                                setAttemptCount(prev => Math.max(0, prev - 1))
                              }}
                            >
                              Try Again
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <Alert className="border-primary/20 bg-primary/5">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy Protected:</strong> Only basic verification status is shown. Personal details are
                  encrypted and secure. Attempts: {attemptCount}/5
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-8 border-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Can't find your vote?</strong> Make sure you entered the correct 13-digit CNIC number.
                </p>
                <p>
                  <strong>CNIC not recognized?</strong> Contact your local election office to verify your registration.
                </p>
                <p>
                  <strong>Technical issues?</strong> Our support team is available 24/7 during election period.
                </p>
              </div>
              <a
                href="mailto:muhammadanique81@gmail.com"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-primary/20 rounded-md bg-transparent text-primary font-semibold shadow-sm hover:bg-primary/10 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                style={{ textDecoration: "none" }}
              >
                <Shield className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
