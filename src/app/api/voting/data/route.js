import { NextResponse } from "next/server";

// Mock election data - in a real app, this would come from your database
const electionData = {
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

export async function GET() {
  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Query your database for actual voting data
    // 3. Apply proper data filtering and pagination

    return NextResponse.json(
      { success: true, data: electionData },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
