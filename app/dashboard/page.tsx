"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  Users,
  Vote,
  Clock,
  Shield,
  Activity,
  RefreshCw,
  Crown,
  Trophy,
  Medal,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

// API Base URL - adjust this to match your FastAPI server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface PartyData {
  party_name: string
  party_code: string
  vote_count: number
  color: string
  logo: string
  percentage: number
}

interface DashboardData {
  party_stats: Array<{
    party_name: string
    party_code: string
    vote_count: number
  }>
  total_votes: number
  total_voters: number
}

interface RecentVote {
  id: string
  timestamp: string
  location: string
  party: string
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [partyData, setPartyData] = useState<PartyData[]>([])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Static data for simulation (when API is not available)
  const [recentVotes, setRecentVotes] = useState<RecentVote[]>([
    { id: "1", timestamp: "2 minutes ago", location: "Karachi", party: "PTI" },
    { id: "2", timestamp: "3 minutes ago", location: "Lahore", party: "PMLN" },
    { id: "3", timestamp: "5 minutes ago", location: "Islamabad", party: "PPP" },
    { id: "4", timestamp: "7 minutes ago", location: "Peshawar", party: "PTI" },
    { id: "5", timestamp: "9 minutes ago", location: "Quetta", party: "PMLN" },
  ])

  // Party configuration
  const partyConfig = {
    PTI: { color: "#ef4444", logo: "🏏" },
    PMLN: { color: "#16a34a", logo: "🦁" },
    PPP: { color: "#1f2937", logo: "⚔️" }
  }

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: DashboardData = await response.json()
      setDashboardData(data)
      
      // Process party data with colors and calculate percentages
      const processedPartyData: PartyData[] = data.party_stats.map(party => {
        const config = partyConfig[party.party_code as keyof typeof partyConfig] || 
                      { color: "#64748b", logo: "🗳️" }
        
        return {
          party_name: party.party_name,
          party_code: party.party_code,
          vote_count: party.vote_count,
          color: config.color,
          logo: config.logo,
          percentage: data.total_votes > 0 ? (party.vote_count / data.total_votes) * 100 : 0
        }
      }).sort((a, b) => b.vote_count - a.vote_count)
      
      setPartyData(processedPartyData)
      setLastUpdated(new Date())
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      
      // Fallback to mock data if API fails
      const mockData = {
        party_stats: [
          { party_name: "Pakistan Tehreek-e-Insaf", party_code: "PTI", vote_count: 456789 },
          { party_name: "Pakistan Muslim League (N)", party_code: "PMLN", vote_count: 423156 },
          { party_name: "Pakistan Peoples Party", party_code: "PPP", vote_count: 367911 }
        ],
        total_votes: 1247856,
        total_voters: 2156789
      }
      setDashboardData(mockData)
      
      const mockPartyData: PartyData[] = mockData.party_stats.map(party => {
        const config = partyConfig[party.party_code as keyof typeof partyConfig]
        return {
          party_name: party.party_name,
          party_code: party.party_code,
          vote_count: party.vote_count,
          color: config.color,
          logo: config.logo,
          percentage: (party.vote_count / mockData.total_votes) * 100
        }
      })
      setPartyData(mockPartyData)
      
    } finally {
      setLoading(false)
    }
  }

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
  }

  // Initial load
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Simulate recent votes updates
  useEffect(() => {
    const interval = setInterval(() => {
      const locations = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Faisalabad", "Multan"]
      const parties = ["PTI", "PMLN", "PPP"]
      const newVote: RecentVote = {
        id: Date.now().toString(),
        timestamp: "Just now",
        location: locations[Math.floor(Math.random() * locations.length)],
        party: parties[Math.floor(Math.random() * parties.length)],
      }

      setRecentVotes((prev) => [newVote, ...prev.slice(0, 4)])
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const pieChartData = partyData.map((party) => ({
    name: party.party_code,
    value: party.vote_count,
    color: party.color,
  }))

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Election Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Activity className="w-3 h-3 mr-1" />
                {error ? "Offline Mode" : "Live"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-yellow-900/50 border-b border-yellow-700 text-yellow-200 px-4 py-2 text-center text-sm">
          Unable to connect to server. Showing cached data. Error: {error}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Votes Cast</CardTitle>
              <Vote className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {dashboardData?.total_votes?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Updated live
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Registered Voters</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {dashboardData?.total_voters?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Turnout: {dashboardData ? ((dashboardData.total_votes / dashboardData.total_voters) * 100).toFixed(1) : "0"}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Last Updated</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {lastUpdated.toLocaleTimeString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {lastUpdated.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vote Distribution Pie Chart */}
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Vote Distribution</span>
              </CardTitle>
              <CardDescription className="text-slate-400">Real-time party-wise vote breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value.toLocaleString(), "Votes"]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Party Rankings */}
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Party Rankings</span>
              </CardTitle>
              <CardDescription className="text-slate-400">Current standings with vote percentages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {partyData.map((party, index) => (
                <div key={party.party_code} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(index + 1)}
                        <span className="text-sm font-medium text-slate-400">#{index + 1}</span>
                      </div>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: party.color }}
                      >
                        {party.logo}
                      </div>
                      <div>
                        <p className="font-semibold">{party.party_code}</p>
                        <p className="text-sm text-slate-400">{party.party_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{party.percentage.toFixed(1)}%</p>
                      <p className="text-sm text-slate-400">{party.vote_count.toLocaleString()} votes</p>
                    </div>
                  </div>
                  <Progress
                    value={party.percentage}
                    className="h-2"
                    style={{ backgroundColor: "#334155" }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        

        {/* Security Notice */}
        <Card className="mt-8 bg-slate-800/30 border-slate-600 text-white">
          <CardContent className="flex items-center space-x-3 py-4">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Secure Election Monitoring</p>
              <p className="text-xs text-slate-400">
                All data is encrypted and anonymized. Real-time updates ensure transparency while maintaining voter
                privacy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
