import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Collections
const ELECTIONS_COLLECTION = "elections";
const VOTES_COLLECTION = "votes";
const VOTERS_COLLECTION = "voters";

// Election Management Functions
export const electionService = {
  // Create a new election
  async createElection(electionData) {
    try {
      const docRef = await addDoc(collection(db, ELECTIONS_COLLECTION), {
        ...electionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalVotes: 0,
        status: electionData.status || "active",
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating election:", error);
      throw error;
    }
  },

  // Get all elections
  async getAllElections() {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, ELECTIONS_COLLECTION),
          orderBy("createdAt", "desc")
        )
      );
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching elections:", error);
      throw error;
    }
  },

  // Get election by ID
  async getElectionById(electionId) {
    try {
      const docRef = doc(db, ELECTIONS_COLLECTION, electionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error("Election not found");
      }
    } catch (error) {
      console.error("Error fetching election:", error);
      throw error;
    }
  },

  // Update election
  async updateElection(electionId, updateData) {
    try {
      const docRef = doc(db, ELECTIONS_COLLECTION, electionId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating election:", error);
      throw error;
    }
  },

  // Delete election
  async deleteElection(electionId) {
    try {
      await deleteDoc(doc(db, ELECTIONS_COLLECTION, electionId));
    } catch (error) {
      console.error("Error deleting election:", error);
      throw error;
    }
  },

  // Get active elections
  async getActiveElections() {
    try {
      const q = query(
        collection(db, ELECTIONS_COLLECTION),
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching active elections:", error);
      throw error;
    }
  },

  // Listen to elections in real-time
  onElectionsSnapshot(callback) {
    const q = query(
      collection(db, ELECTIONS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (querySnapshot) => {
      const elections = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(elections);
    });
  },
};

// Vote Management Functions
export const voteService = {
  // Cast a vote
  async castVote(voteData) {
    try {
      // Add vote record
      const voteRef = await addDoc(collection(db, VOTES_COLLECTION), {
        ...voteData,
        timestamp: serverTimestamp(),
      });

      // Update election vote counts
      await electionService.updateElectionVotes(
        voteData.electionId,
        voteData.candidateId
      );

      return voteRef.id;
    } catch (error) {
      console.error("Error casting vote:", error);
      throw error;
    }
  },

  // Get votes for an election
  async getVotesByElection(electionId) {
    try {
      const q = query(
        collection(db, VOTES_COLLECTION),
        where("electionId", "==", electionId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching votes:", error);
      throw error;
    }
  },

  // Get recent votes across all elections
  async getRecentVotes(limit = 10) {
    try {
      const q = query(
        collection(db, VOTES_COLLECTION),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const votes = querySnapshot.docs.slice(0, limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return votes;
    } catch (error) {
      console.error("Error fetching recent votes:", error);
      throw error;
    }
  },
};

// Statistics Functions
export const statsService = {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const elections = await electionService.getAllElections();
      const recentVotes = await voteService.getRecentVotes(5);

      const activeElections = elections.filter(
        (e) => e.status === "active"
      ).length;
      const completedElections = elections.filter(
        (e) => e.status === "completed"
      ).length;
      const totalVotes = elections.reduce(
        (sum, e) => sum + (e.totalVotes || 0),
        0
      );
      const totalCandidates = elections.reduce(
        (sum, e) => sum + (e.candidates?.length || 0),
        0
      );

      return {
        totalVotes,
        activeElections,
        completedElections,
        totalCandidates,
        elections,
        recentVotes,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },
};

// Utility function to initialize sample data (for first-time setup)
export const initializeSampleData = async () => {
  try {
    // Check if elections already exist
    const existingElections = await electionService.getAllElections();
    if (existingElections.length > 0) {
      console.log("Sample data already exists");
      return;
    }

    // Create sample elections
    const sampleElections = [
      {
        title: "2025 Presidential Election",
        description: "Choose the next President of India",
        category: "National",
        constituency: "All India",
        state: "All States",
        totalVoters: 900000000,
        status: "active",
        startDate: "2025-09-01",
        endDate: "2025-09-30",
        candidates: [
          {
            id: 1,
            name: "Droupadi Murmu",
            party: "Bharatiya Janata Party (BJP)",
            description: "Current President seeking re-election",
            votes: 45000000,
            percentage: 38.5,
            color: "orange",
          },
          {
            id: 2,
            name: "Mallikarjun Kharge",
            party: "Indian National Congress",
            description: "Senior Congress leader and former minister",
            votes: 42000000,
            percentage: 35.9,
            color: "blue",
          },
          {
            id: 3,
            name: "Mamata Banerjee",
            party: "All India Trinamool Congress",
            description: "Chief Minister of West Bengal",
            votes: 25000000,
            percentage: 21.4,
            color: "green",
          },
          {
            id: 4,
            name: "Arvind Kejriwal",
            party: "Aam Aadmi Party",
            description: "Chief Minister of Delhi",
            votes: 5000000,
            percentage: 4.2,
            color: "yellow",
          },
        ],
      },
      {
        title: "2025 Maharashtra Lok Sabha - Mumbai South",
        description:
          "Choose your Member of Parliament for Mumbai South constituency",
        category: "National",
        constituency: "Mumbai South",
        state: "Maharashtra",
        totalVoters: 1450000,
        status: "active",
        startDate: "2025-09-05",
        endDate: "2025-09-25",
        candidates: [
          {
            id: 1,
            name: "Arvind Sawant",
            party: "Shiv Sena (UBT)",
            description: "Incumbent MP and former Union Minister",
            votes: 425000,
            percentage: 42.5,
            color: "orange",
          },
          {
            id: 2,
            name: "Milind Deora",
            party: "Shiv Sena",
            description: "Former Union Minister and businessman",
            votes: 380000,
            percentage: 38.0,
            color: "red",
          },
          {
            id: 3,
            name: "Meera Sanyal",
            party: "Independent",
            description: "Former banker and social activist",
            votes: 195000,
            percentage: 19.5,
            color: "green",
          },
        ],
      },
    ];

    // Add sample elections to Firestore
    for (const election of sampleElections) {
      await electionService.createElection(election);
    }

    console.log("Sample data initialized successfully");
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
};
