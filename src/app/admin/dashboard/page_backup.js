"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import {
  electionService,
  statsService,
  initializeSampleData,
} from "../../services/firebaseService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Badge } from "@/components/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/dialog";
import { Vote, Users, CheckCircle, Clock, Plus, LogOut, BarChart3, Loader2, X } from "lucide-react";

function StatCard({ title, value, subtitle, icon }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ElectionCard({ election }) {
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
            <p className="text-muted-foreground">Total Votes</p>
            <p className="font-semibold">{election.totalVotes?.toLocaleString() || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Start Date</p>
            <p className="font-semibold">{election.startDate}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">End Date</p>
            <p className="font-semibold">{election.endDate}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Candidates & Results</h4>
          {election.candidates?.map((candidate, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-medium block">{candidate.name}</span>
                  <span className="text-muted-foreground text-xs">{candidate.party}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">
                    {candidate.votes?.toLocaleString() || 0} votes
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({candidate.percentage || 0}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`${getPartyColorClasses(candidate.color)} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${candidate.percentage || 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
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
  }, [currentUser, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Initialize sample data if needed (only runs once)
      await initializeSampleData();

      // Load dashboard statistics
      const stats = await statsService.getDashboardStats();
      setElectionData(stats);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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

    try {
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

      // Create election in Firebase
      await electionService.createElection(newElectionData);

      // Reload dashboard data
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
      console.error("Error creating election:", error);
      alert("Error creating election. Please try again.");
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
                <h1 className="text-3xl font-bold">
                  Election Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back, {adminEmail}
                </p>
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

        {/* Elections Overview */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <BarChart3 className="h-6 w-6 mr-3" />
              Elections Overview
            </h2>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Election
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Election</DialogTitle>
                  <DialogDescription>
                    Set up a new election with candidates and voting parameters
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateElection} className="space-y-6">
                  {/* Election Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Election Title</Label>
                      <Input
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., 2025 Lok Sabha General Election"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="National">National</option>
                        <option value="State">State</option>
                        <option value="Local">Local</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="e.g., Choose your Member of Parliament for the 18th Lok Sabha"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="constituency">Constituency</Label>
                      <Input
                        id="constituency"
                        name="constituency"
                        required
                        value={formData.constituency}
                        onChange={handleInputChange}
                        placeholder="e.g., Mumbai South"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g., Maharashtra"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalVoters">Total Voters</Label>
                      <Input
                        id="totalVoters"
                        name="totalVoters"
                        type="number"
                        required
                        value={formData.totalVoters}
                        onChange={handleInputChange}
                        placeholder="e.g., 1450000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>
                  </div>

                  {/* Candidates Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-base font-semibold">Candidates</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCandidate}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Candidate
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.candidates.map((candidate, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <Label className="text-sm font-medium">
                              Candidate {index + 1}
                            </Label>
                            {formData.candidates.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCandidate(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`candidate-name-${index}`}>Name</Label>
                              <Input
                                id={`candidate-name-${index}`}
                                value={candidate.name}
                                onChange={(e) =>
                                  handleCandidateChange(index, "name", e.target.value)
                                }
                                placeholder="e.g., Arvind Kumar Sharma"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`candidate-party-${index}`}>Party</Label>
                              <Input
                                id={`candidate-party-${index}`}
                                value={candidate.party}
                                onChange={(e) =>
                                  handleCandidateChange(index, "party", e.target.value)
                                }
                                placeholder="e.g., Bharatiya Janata Party (BJP)"
                              />
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <Label htmlFor={`candidate-description-${index}`}>Description</Label>
                            <textarea
                              id={`candidate-description-${index}`}
                              value={candidate.description}
                              onChange={(e) =>
                                handleCandidateChange(index, "description", e.target.value)
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                              placeholder="e.g., Former Mumbai Mayor with 12 years of public service experience"
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Election
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {electionData.elections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        </div>

        {/* Create Election Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Create New Election
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateElection} className="space-y-6">
                {/* Election Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Election Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="e.g., 2025 Lok Sabha General Election"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="National">National</option>
                      <option value="State">State</option>
                      <option value="Local">Local</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="e.g., Choose your Member of Parliament for the 18th Lok Sabha"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Constituency
                    </label>
                    <input
                      type="text"
                      name="constituency"
                      required
                      value={formData.constituency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="e.g., Mumbai South"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="e.g., Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Total Voters
                    </label>
                    <input
                      type="number"
                      name="totalVoters"
                      required
                      value={formData.totalVoters}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="e.g., 1450000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>

                {/* Candidates Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-white">
                      Candidates
                    </h4>
                    <button
                      type="button"
                      onClick={addCandidate}
                      className="inline-flex items-center px-4 py-2 border border-white/20 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    >
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Candidate
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.candidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="text-md font-medium text-blue-200">
                            Candidate {index + 1}
                          </h5>
                          {formData.candidates.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeCandidate(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-blue-200 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={candidate.name}
                              onChange={(e) =>
                                handleCandidateChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                              placeholder="e.g., Arvind Kumar Sharma"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-blue-200 mb-1">
                              Party
                            </label>
                            <input
                              type="text"
                              value={candidate.party}
                              onChange={(e) =>
                                handleCandidateChange(
                                  index,
                                  "party",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                              placeholder="e.g., Bharatiya Janata Party (BJP)"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-xs font-medium text-blue-200 mb-1">
                            Description
                          </label>
                          <textarea
                            value={candidate.description}
                            onChange={(e) =>
                              handleCandidateChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                            placeholder="e.g., Former Mumbai Mayor with 12 years of public service experience"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-white/20 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Create Election
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
