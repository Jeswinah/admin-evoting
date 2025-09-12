"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Mock election data - in a real app, this would come from your database
const mockElectionData = {
  totalVotes: 2847,
  activeElections: 2,
  completedElections: 5,
  totalCandidates: 12,
  elections: [
    {
      id: 1,
      title: "2025 Presidential Election",
      status: "active",
      totalVotes: 1456,
      type: "Presidential",
      candidates: [
        {
          name: "Sarah Johnson",
          party: "Democratic Party",
          votes: 584,
          percentage: 40.1,
          color: "blue",
        },
        {
          name: "Michael Chen",
          party: "Republican Party",
          votes: 467,
          percentage: 32.1,
          color: "red",
        },
        {
          name: "Lisa Rodriguez",
          party: "Independent",
          votes: 291,
          percentage: 20.0,
          color: "green",
        },
        {
          name: "David Thompson",
          party: "Green Party",
          votes: 114,
          percentage: 7.8,
          color: "emerald",
        },
      ],
      startDate: "2025-09-01",
      endDate: "2025-09-30",
    },
    {
      id: 2,
      title: "2025 Senate Election - District 5",
      status: "active",
      totalVotes: 892,
      type: "Senate",
      candidates: [
        {
          name: "Robert Martinez",
          party: "Democratic Party",
          votes: 401,
          percentage: 45.0,
          color: "blue",
        },
        {
          name: "Jennifer Adams",
          party: "Republican Party",
          votes: 356,
          percentage: 39.9,
          color: "red",
        },
        {
          name: "Thomas Wilson",
          party: "Independent",
          votes: 135,
          percentage: 15.1,
          color: "green",
        },
      ],
      startDate: "2025-09-05",
      endDate: "2025-09-25",
    },
    {
      id: 3,
      title: "2025 Governor Election",
      status: "completed",
      totalVotes: 499,
      type: "Governor",
      candidates: [
        {
          name: "Amanda Foster",
          party: "Democratic Party",
          votes: 274,
          percentage: 54.9,
          color: "blue",
        },
        {
          name: "James Parker",
          party: "Republican Party",
          votes: 175,
          percentage: 35.1,
          color: "red",
        },
        {
          name: "Maria Gonzalez",
          party: "Independent",
          votes: 50,
          percentage: 10.0,
          color: "green",
        },
      ],
      startDate: "2025-08-15",
      endDate: "2025-09-01",
    },
  ],
  recentVotes: [
    {
      id: 1,
      voter: "Voter ID: V12345",
      election: "2025 Presidential Election",
      candidate: "Sarah Johnson",
      party: "Democratic Party",
      timestamp: "2025-09-12 14:30",
    },
    {
      id: 2,
      voter: "Voter ID: V67890",
      election: "2025 Senate Election - District 5",
      candidate: "Robert Martinez",
      party: "Democratic Party",
      timestamp: "2025-09-12 14:25",
    },
    {
      id: 3,
      voter: "Voter ID: V54321",
      election: "2025 Presidential Election",
      candidate: "Michael Chen",
      party: "Republican Party",
      timestamp: "2025-09-12 14:20",
    },
    {
      id: 4,
      voter: "Voter ID: V98765",
      election: "2025 Senate Election - District 5",
      candidate: "Jennifer Adams",
      party: "Republican Party",
      timestamp: "2025-09-12 14:15",
    },
    {
      id: 5,
      voter: "Voter ID: V13579",
      election: "2025 Presidential Election",
      candidate: "Lisa Rodriguez",
      party: "Independent",
      timestamp: "2025-09-12 14:10",
    },
  ],
};

function StatCard({ title, value, subtitle, icon, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center">
        <div
          className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}
        >
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-blue-100/80">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-blue-200/70">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function ElectionCard({ election }) {
  const statusConfig =
    election.status === "active"
      ? {
          text: "text-green-200",
          bg: "bg-green-500/20",
          border: "border-green-400/30",
        }
      : {
          text: "text-gray-300",
          bg: "bg-gray-500/20",
          border: "border-gray-400/30",
        };

  const getPartyColorClasses = (color) => {
    const colorMap = {
      blue: "from-blue-400 to-blue-600",
      red: "from-red-400 to-red-600",
      green: "from-green-400 to-green-600",
      emerald: "from-emerald-400 to-emerald-600",
      purple: "from-purple-400 to-purple-600",
    };
    return colorMap[color] || "from-blue-400 to-purple-500";
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 transform hover:scale-105 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-white mb-1">
            {election.title}
          </h3>
          <p className="text-blue-200/70 text-sm">{election.type} Election</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.text} ${statusConfig.bg} border ${statusConfig.border} backdrop-blur-sm`}
        >
          {election.status}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <p className="text-blue-200/70">Total Votes</p>
          <p className="text-white font-semibold">
            {election.totalVotes.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-blue-200/70">Start Date</p>
          <p className="text-white font-semibold">{election.startDate}</p>
        </div>
        <div className="text-center">
          <p className="text-blue-200/70">End Date</p>
          <p className="text-white font-semibold">{election.endDate}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-blue-200/80 mb-3">
          Candidates & Results
        </h4>
        {election.candidates.map((candidate, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-xl p-3 backdrop-blur-sm"
          >
            <div className="flex justify-between text-sm mb-2">
              <div>
                <span className="font-medium text-white block">
                  {candidate.name}
                </span>
                <span className="text-blue-200/70 text-xs">
                  {candidate.party}
                </span>
              </div>
              <span className="text-blue-200/80 text-right">
                <span className="block font-semibold">
                  {candidate.votes.toLocaleString()} votes
                </span>
                <span className="text-xs">({candidate.percentage}%)</span>
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
              <div
                className={`bg-gradient-to-r ${getPartyColorClasses(
                  candidate.color
                )} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${candidate.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [electionData, setElectionData] = useState(mockElectionData);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const authenticated = localStorage.getItem("adminAuthenticated");
    const email = localStorage.getItem("adminEmail");

    if (authenticated === "true" && email) {
      setIsAuthenticated(true);
      setAdminEmail(email);
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Election Admin Dashboard
                </h1>
                <p className="text-blue-200/70 text-sm">
                  Welcome back, {adminEmail}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-6 py-3 border border-white/20 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 backdrop-blur-sm"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
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
            color="blue"
            icon={
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Active Elections"
            value={electionData.activeElections}
            subtitle="Currently running"
            color="green"
            icon={
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
          />
          <StatCard
            title="Completed Elections"
            value={electionData.completedElections}
            subtitle="Finished"
            color="yellow"
            icon={
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Total Candidates"
            value={electionData.totalCandidates}
            subtitle="All elections"
            color="purple"
            icon={
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
        </div>


        {/* Elections Overview */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg
              className="h-6 w-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Elections Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {electionData.elections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
