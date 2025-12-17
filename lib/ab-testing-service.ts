import { db } from "./firebase"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  getDoc,
} from "firebase/firestore"

export interface ABTest {
  id?: string
  name: string
  description: string
  status: "draft" | "active" | "paused" | "completed"
  variants: ABTestVariant[]
  targetAudience: {
    segment: string
    percentage: number
    filters?: any
  }
  metrics: string[]
  startDate?: Date
  endDate?: Date
  results?: ABTestResults
  createdBy: string
  createdAt: Date
}

export interface ABTestVariant {
  id: string
  name: string
  description: string
  config: Record<string, any>
  allocation: number // percentage
}

export interface ABTestResults {
  [variantId: string]: {
    exposures: number
    conversions: number
    conversionRate: number
    avgSessionDuration: number
    revenue: number
    metrics: Record<string, number>
  }
}

export const abTestingService = {
  async createTest(test: Omit<ABTest, "id" | "createdAt">): Promise<string> {
    try {
      const testRef = await addDoc(collection(db, "ab_tests"), {
        ...test,
        createdAt: serverTimestamp(),
        status: "draft",
      })
      return testRef.id
    } catch (error) {
      console.error("Error creating A/B test:", error)
      throw error
    }
  },

  async getTests(): Promise<ABTest[]> {
    try {
      const testsSnapshot = await getDocs(collection(db, "ab_tests"))
      return testsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ABTest)
    } catch (error) {
      console.error("Error fetching A/B tests:", error)
      return []
    }
  },

  async getActiveTests(): Promise<ABTest[]> {
    try {
      const q = query(collection(db, "ab_tests"), where("status", "==", "active"))
      const testsSnapshot = await getDocs(q)
      return testsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ABTest)
    } catch (error) {
      console.error("Error fetching active tests:", error)
      return []
    }
  },

  async updateTest(testId: string, updates: Partial<ABTest>): Promise<void> {
    try {
      await updateDoc(doc(db, "ab_tests", testId), updates as any)
    } catch (error) {
      console.error("Error updating A/B test:", error)
      throw error
    }
  },

  async startTest(testId: string): Promise<void> {
    try {
      await updateDoc(doc(db, "ab_tests", testId), {
        status: "active",
        startDate: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error starting test:", error)
      throw error
    }
  },

  async pauseTest(testId: string): Promise<void> {
    try {
      await updateDoc(doc(db, "ab_tests", testId), {
        status: "paused",
      })
    } catch (error) {
      console.error("Error pausing test:", error)
      throw error
    }
  },

  async completeTest(testId: string, results: ABTestResults): Promise<void> {
    try {
      await updateDoc(doc(db, "ab_tests", testId), {
        status: "completed",
        endDate: serverTimestamp(),
        results,
      })
    } catch (error) {
      console.error("Error completing test:", error)
      throw error
    }
  },

  async deleteTest(testId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "ab_tests", testId))
    } catch (error) {
      console.error("Error deleting test:", error)
      throw error
    }
  },

  async promoteVariant(testId: string, variantId: string): Promise<void> {
    try {
      // Get test data
      const testDoc = await getDoc(doc(db, "ab_tests", testId))
      if (!testDoc.exists()) throw new Error("Test not found")

      const test = testDoc.data() as ABTest
      const winningVariant = test.variants.find((v) => v.id === variantId)

      if (!winningVariant) throw new Error("Variant not found")

      // Update remote config with winning variant's values
      const configRef = doc(db, "config", "remote_config")
      await updateDoc(configRef, {
        ...winningVariant.config,
        lastModified: serverTimestamp(),
      })

      // Mark test as completed
      await this.completeTest(testId, test.results || {})
    } catch (error) {
      console.error("Error promoting variant:", error)
      throw error
    }
  },
}
