"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { electionService, statsService } from "../../services/firebaseService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Vote,
  Users,
  CheckCircle,
  Clock,
  Plus,
  LogOut,
  BarChart3,
  Loader2,
  X,
  Edit,
  RefreshCw,
} from "lucide-react";

function StatCard({ title, value, subtitle, icon }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ElectionCard({ election, onRefresh }) {
  const getPartyColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-500",
      red: "bg-red-500",
      green: "bg-green-500",
      emerald: "bg-emerald-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-500",
    };
    return colorMap[color] || "bg-primary";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{election.title}</CardTitle>
            <CardDescription>{election.category} Election</CardDescription>
          </div>
          <Badge
            variant={election.status === "active" ? "default" : "secondary"}
            className="capitalize"
          >
            {election.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Votes Cast</p>
            <p className="font-semibold">
              {election.votesCast
                ? parseInt(election.votesCast).toLocaleString()
                : election.totalVotes?.toLocaleString() || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Total Voters</p>
            <p className="font-semibold">
              {election.totalVoters
                ? parseInt(election.totalVoters).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">End Date</p>
            <p className="font-semibold">{election.endDate}</p>
          </div>
        </div>

        {/* Voter Turnout Bar */}
        {election.votesCast && election.totalVoters && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Voter Turnout</span>
              <span className="font-semibold">
                {(
                  (parseInt(election.votesCast) /
                    parseInt(election.totalVoters)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (parseInt(election.votesCast) /
                      parseInt(election.totalVoters)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Candidates</h4>
          {election.candidates?.map((candidate, index) => (
            <div
              key={candidate.id || index}
              className="space-y-2 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="font-medium block text-base">
                    {candidate.name}
                  </span>
                  <span className="text-primary text-sm font-medium">
                    {candidate.party}
                  </span>
                  {candidate.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {candidate.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {candidate.votes && (
                    <>
                      <span className="block font-semibold">
                        {candidate.votes?.toLocaleString() || 0} votes
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({candidate.percentage || 0}%)
                      </span>
                    </>
                  )}
                </div>
              </div>
              {candidate.votes && candidate.percentage && (
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className={`${getPartyColorClasses(
                      candidate.color ||
                        ["blue", "red", "green", "purple", "orange"][index % 5]
                    )} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${candidate.percentage || 0}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
          <p>
            <strong>Election ID:</strong> {election.id}
          </p>
          <p>
            <strong>Constituency:</strong>{" "}
            {election.constituency || election.Constituency}
          </p>
          <p>
            <strong>State:</strong> {election.state}
          </p>
          <p>
            <strong>Category:</strong> {election.category}
          </p>
          <div className="text-xs text-muted-foreground">
            <strong>Status:</strong>{" "}
            <Badge variant="outline" className="text-xs">
              {election.status}
            </Badge>
          </div>
          {election.votesCast && election.totalVoters && (
            <p>
              <strong>Turnout:</strong> {election.votesCast} /{" "}
              {election.totalVoters} voters
            </p>
          )}
          {election.description && (
            <p className="mt-2 italic">"{election.description}"</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [lastDataLoad, setLastDataLoad] = useState(null);
  const [electionData, setElectionData] = useState({
    totalVotes: 0,
    activeElections: 0,
    completedElections: 0,
    totalCandidates: 0,
    elections: [],
    recentVotes: [],
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    endDate: "",
    status: "active",
    category: "",
    constituency: "",
    state: "",
    totalVoters: "",
    candidates: [
      { name: "", party: "", description: "" },
      { name: "", party: "", description: "" },
    ],
  });
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Loading dashboard data from Firebase...");

      // Test Firebase connection
      setFirebaseConnected(false);

      // Load dashboard statistics from Firebase (without initializing sample data)
      const stats = await statsService.getDashboardStats();
      console.log("Raw Firebase data:", stats);

      // If we got here, Firebase is connected
      setFirebaseConnected(true);

      // Filter out duplicate elections by ID to prevent card duplication
      const uniqueElections = stats.elections.filter(
        (election, index, arr) =>
          index === arr.findIndex((e) => e.id === election.id)
      );

      // Update stats with unique elections
      const cleanedStats = {
        ...stats,
        elections: uniqueElections,
      };

      console.log(
        "Loaded elections:",
        uniqueElections.length,
        "unique elections"
      );
      console.log("Elections data:", uniqueElections);
      setElectionData(cleanedStats);
      setLastDataLoad(new Date());
    } catch (error) {
      console.error("Error loading dashboard data from Firebase:", error);
      setFirebaseConnected(false);
      // Show user-friendly error message
      alert(
        "Failed to load data from Firebase. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check authentication
    if (currentUser) {
      setIsAuthenticated(true);
      setAdminEmail(currentUser.email);
      loadDashboardData();
    } else {
      // Check localStorage for backward compatibility
      const authenticated = localStorage.getItem("adminAuthenticated");
      const email = localStorage.getItem("adminEmail");

      if (authenticated === "true" && email) {
        setIsAuthenticated(true);
        setAdminEmail(email);
        loadDashboardData();
      } else {
        router.push("/admin/login");
      }
    }
  }, [currentUser, router, loadDashboardData]);

  const handleLogout = async () => {
    try {
      if (currentUser) {
        await logout();
      }
      // Clear localStorage for backward compatibility
      localStorage.removeItem("adminAuthenticated");
      localStorage.removeItem("adminEmail");
      router.push("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCandidateChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      candidates: prev.candidates.map((candidate, i) =>
        i === index ? { ...candidate, [field]: value } : candidate
      ),
    }));
  };

  const addCandidate = () => {
    setFormData((prev) => ({
      ...prev,
      candidates: [
        ...prev.candidates,
        { name: "", party: "", description: "" },
      ],
    }));
  };

  const removeCandidate = (index) => {
    setFormData((prev) => ({
      ...prev,
      candidates: prev.candidates.filter((_, i) => i !== index),
    }));
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Creating new election in Firebase...");

      // Prepare election data for Firebase
      const newElectionData = {
        title: formData.title,
        description: formData.description,
        endDate: formData.endDate,
        status: formData.status,
        category: formData.category,
        constituency: formData.constituency,
        state: formData.state,
        totalVoters: parseInt(formData.totalVoters),
        startDate: new Date().toISOString().split("T")[0],
        candidates: formData.candidates
          .filter((c) => c.name && c.party)
          .map((candidate, index) => ({
            id: index + 1,
            name: candidate.name,
            party: candidate.party,
            description: candidate.description,
            votes: 0,
            percentage: 0,
            color: ["blue", "red", "green", "purple", "yellow"][index % 5],
          })),
      };

      console.log("Election data to save:", newElectionData);

      // Create election in Firebase
      const electionId = await electionService.createElection(newElectionData);
      console.log("Election created successfully with ID:", electionId);

      // Show success message
      alert("Election created successfully!");

      // Reload dashboard data to show the new election
      await loadDashboardData();

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        endDate: "",
        status: "active",
        category: "",
        constituency: "",
        state: "",
        totalVoters: "",
        candidates: [
          { name: "", party: "", description: "" },
          { name: "", party: "", description: "" },
        ],
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating election in Firebase:", error);
      alert(
        "Error creating election. Please check your Firebase connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {loading ? "Loading dashboard..." : "Checking authentication..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary">
                <Vote className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Election Admin Dashboard</h1>
                <div className="flex items-center gap-4">
                  <p className="text-muted-foreground text-sm">
                    Welcome back, {adminEmail}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        firebaseConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-xs text-muted-foreground">
                      {" "}
                      {firebaseConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Votes"
            value={electionData.totalVotes.toLocaleString()}
            subtitle="All elections"
            icon={<Vote className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Active Elections"
            value={electionData.activeElections}
            subtitle="Currently running"
            icon={<Clock className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Completed Elections"
            value={electionData.completedElections}
            subtitle="Finished"
            icon={<CheckCircle className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Total Candidates"
            value={electionData.totalCandidates}
            subtitle="All elections"
            icon={<Users className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Database Data Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-3" />
            Database Overview
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Constituency Overview
                </CardTitle>
                <CardDescription>
                  Elections by state and constituency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {electionData.elections && electionData.elections.length > 0 ? (
                  <div className="space-y-3">
                    {electionData.elections.map((election, index) => (
                      <div
                        key={election.id || index}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {election.constituency || election.Constituency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {election.state}, {election.category}
                          </p>
                          <p className="text-xs text-primary">
                            {election.candidates?.length || 0} candidates
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              election.status?.toLowerCase() === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {election.status}
                          </Badge>
                          {election.votesCast && election.totalVoters && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {(
                                (parseInt(election.votesCast) /
                                  parseInt(election.totalVoters)) *
                                100
                              ).toFixed(1)}
                              % turnout
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No constituency data found
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Database Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Election Statistics
                </CardTitle>
                <CardDescription>
                  Live data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Elections</span>
                    <Badge variant="secondary">
                      {electionData.elections.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Active Elections
                    </span>
                    <Badge variant="default">
                      {
                        electionData.elections.filter(
                          (e) => e.status?.toLowerCase() === "active"
                        ).length
                      }
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Constituencies
                    </span>
                    <Badge variant="outline">
                      {
                        new Set(
                          electionData.elections.map(
                            (e) => e.constituency || e.Constituency
                          )
                        ).size
                      }
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Candidates
                    </span>
                    <Badge variant="secondary">
                      {electionData.elections.reduce(
                        (sum, e) => sum + (e.candidates?.length || 0),
                        0
                      )}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Registered Voters
                    </span>
                    <Badge variant="secondary">
                      {electionData.elections
                        .reduce(
                          (sum, e) =>
                            sum + (e.totalVoters ? parseInt(e.totalVoters) : 0),
                          0
                        )
                        .toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Votes Cast</span>
                    <Badge variant="default">
                      {electionData.elections
                        .reduce(
                          (sum, e) =>
                            sum + (e.votesCast ? parseInt(e.votesCast) : 0),
                          0
                        )
                        .toLocaleString()}
                    </Badge>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                         Status
                      </span>
                      <Badge
                        variant={firebaseConnected ? "default" : "destructive"}
                      >
                        {firebaseConnected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium">Last Updated</span>
                      <span className="text-xs text-muted-foreground">
                        {lastDataLoad
                          ? lastDataLoad.toLocaleTimeString()
                          : "Not loaded"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setShowRawData(!showRawData)}
                    >
                      {showRawData ? "Hide" : "Show"} Raw Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Raw Data Viewer */}
          {showRawData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="h-5 w-5 mr-2" />
                  Raw Database Data (JSON)
                </CardTitle>
                <CardDescription>
                  Direct view of Firebase Firestore data for debugging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Election Data:</h4>
                    <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                      {JSON.stringify(electionData, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Elections Overview */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <BarChart3 className="h-6 w-6 mr-3" />
              Elections Overview
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDashboardData}
                className="ml-4"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </h2>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Election
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-2xl">
                <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4 bg-slate-50 dark:bg-slate-800 -m-6 mb-6 p-6 rounded-t-lg">
                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                    Create New Election
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
                    Set up a new election with candidates and voting parameters
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleCreateElection}
                  className="space-y-8 bg-white dark:bg-slate-900"
                >
                  {/* Election Basic Info Section */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-600 pb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="title"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Election Title
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          required
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="e.g., 2025 Lok Sabha General Election"
                          className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="category"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Category
                        </Label>
                        <select
                          id="category"
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Category</option>
                          <option value="National">National</option>
                          <option value="State">State</option>
                          <option value="Local">Local</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label
                        htmlFor="description"
                        className="text-slate-700 dark:text-slate-300 font-medium"
                      >
                        Description
                      </Label>
                      <textarea
                        id="description"
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Choose your Member of Parliament for the 18th Lok Sabha"
                      />
                    </div>
                  </div>

                  {/* Location & Voting Details Section */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-600 pb-2">
                      Location & Voting Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="constituency"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Constituency
                        </Label>
                        <Input
                          id="constituency"
                          name="constituency"
                          required
                          value={formData.constituency}
                          onChange={handleInputChange}
                          placeholder="e.g., Mumbai South"
                          className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="state"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          State
                        </Label>
                        <Input
                          id="state"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="e.g., Maharashtra"
                          className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="totalVoters"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Total Voters
                        </Label>
                        <Input
                          id="totalVoters"
                          name="totalVoters"
                          type="number"
                          required
                          value={formData.totalVoters}
                          onChange={handleInputChange}
                          placeholder="e.g., 1450000"
                          className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="endDate"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          End Date
                        </Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          required
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="status"
                          className="text-slate-700 dark:text-slate-300 font-medium"
                        >
                          Status
                        </Label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Candidates Section */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-2">
                        Candidates
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCandidate}
                        className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Candidate
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.candidates.map((candidate, index) => (
                        <Card
                          key={index}
                          className="p-4 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Candidate {index + 1}
                            </Label>
                            {formData.candidates.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCandidate(index)}
                                className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor={`candidate-name-${index}`}
                                className="text-slate-700 dark:text-slate-300 font-medium"
                              >
                                Name
                              </Label>
                              <Input
                                id={`candidate-name-${index}`}
                                value={candidate.name}
                                onChange={(e) =>
                                  handleCandidateChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Arvind Kumar Sharma"
                                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor={`candidate-party-${index}`}
                                className="text-slate-700 dark:text-slate-300 font-medium"
                              >
                                Party
                              </Label>
                              <Input
                                id={`candidate-party-${index}`}
                                value={candidate.party}
                                onChange={(e) =>
                                  handleCandidateChange(
                                    index,
                                    "party",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Bharatiya Janata Party (BJP)"
                                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <Label
                              htmlFor={`candidate-description-${index}`}
                              className="text-slate-700 dark:text-slate-300 font-medium"
                            >
                              Description
                            </Label>
                            <textarea
                              id={`candidate-description-${index}`}
                              value={candidate.description}
                              onChange={(e) =>
                                handleCandidateChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., Former Mumbai Mayor with 12 years of public service experience"
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <DialogFooter className="border-t border-slate-200 dark:border-slate-700 pt-4 bg-slate-50 dark:bg-slate-800 -m-6 mt-8 p-6 rounded-b-lg">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Vote className="h-4 w-4 mr-2" />
                          Create Election
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {electionData.elections.length > 0 ? (
              electionData.elections.map((election, index) => (
                <ElectionCard
                  key={`election-${election.id}-${index}`}
                  election={election}
                  onRefresh={loadDashboardData}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Elections Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {loading
                    ? "Loading elections from Firebase..."
                    : "Create your first election to get started."}
                </p>
                {!loading && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Election
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
