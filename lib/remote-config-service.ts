import { db } from "./firebase"
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, getDocs } from "firebase/firestore"

export interface RemoteConfigValue {
  value: any
  type: "boolean" | "string" | "number" | "json"
  lastModified: Date
  modifiedBy: string
}

export interface RemoteConfigData {
  [key: string]: RemoteConfigValue
}

export const remoteConfigService = {
  async getConfig(): Promise<RemoteConfigData> {
    try {
      const configDoc = await getDoc(doc(db, "config", "remote_config"))
      if (configDoc.exists()) {
        return configDoc.data() as RemoteConfigData
      }
      return {}
    } catch (error) {
      console.error("Error fetching remote config:", error)
      throw error
    }
  },

  async updateConfig(key: string, value: any, type: string, adminEmail: string): Promise<void> {
    try {
      const configRef = doc(db, "config", "remote_config")
      await updateDoc(configRef, {
        [key]: {
          value,
          type,
          lastModified: serverTimestamp(),
          modifiedBy: adminEmail,
        },
      })
    } catch (error) {
      console.error("Error updating remote config:", error)
      throw error
    }
  },

  async publishChanges(changes: Record<string, any>, adminEmail: string): Promise<void> {
    try {
      const configRef = doc(db, "config", "remote_config")
      const updates: any = {}

      Object.entries(changes).forEach(([key, value]) => {
        updates[key] = {
          value,
          type: typeof value,
          lastModified: serverTimestamp(),
          modifiedBy: adminEmail,
        }
      })

      await updateDoc(configRef, updates)

      // Log publish event
      await setDoc(
        doc(collection(db, "config_history")),
        {
          changes: updates,
          publishedBy: adminEmail,
          publishedAt: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (error) {
      console.error("Error publishing config changes:", error)
      throw error
    }
  },

  async getConfigHistory(): Promise<any[]> {
    try {
      const historySnapshot = await getDocs(collection(db, "config_history"))
      return historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error("Error fetching config history:", error)
      return []
    }
  },
}
