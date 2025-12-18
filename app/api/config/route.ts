import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase/admin";
import { getAdminFromRequest } from "@/lib/auth-helper";
import { logAdminAction } from "@/lib/logger";

const CONFIG_COLLECTION = "config";
// New document keys
const DOC_KEYS = ["features", "vpn", "ui", "ads", "version"];

export async function GET() {
    try {
        const configCollection = adminFirestore.collection(CONFIG_COLLECTION);

        // 1. Check for legacy 'general' doc
        const oldDocRef = configCollection.doc("general");
        const oldDoc = await oldDocRef.get();

        if (oldDoc.exists) {
            console.log("Legacy config found. Migrating to split documents...");
            const data = oldDoc.data() || {};

            // Prepare migration batch
            const batch = adminFirestore.batch();

            // Split data into separate docs
            // 'features' -> config/features
            if (data.features) batch.set(configCollection.doc("features"), data.features);
            // 'vpn' -> config/vpn
            if (data.vpn) batch.set(configCollection.doc("vpn"), data.vpn);
            // 'ui' -> config/ui
            if (data.ui) batch.set(configCollection.doc("ui"), data.ui);
            // 'version' -> config/version
            if (data.version) batch.set(configCollection.doc("version"), data.version);

            // 'ads' -> config/ads (Structure remains "flat" for now in migration, 
            // but we will wrap it in a default profile structure if needed or just save as is 
            // and let frontend handle migration to profiles. 
            // FOR NOW: Save as is, but under 'settings' key + create a default profile? 
            // ACTUALLY: Let's do a smart migration for ads.

            if (data.ads) {
                const adsData = data.ads;
                // Create a default profile from existing keys
                const defaultProfile = {
                    id: "default-profile",
                    name: "Default Profile",
                    provider: adsData.activeProvider || "admob",
                    admob: {
                        appId: adsData.admobAppId || "",
                        bannerId: adsData.admobBannerId || "",
                        interstitialId: adsData.admobInterstitialId || "",
                        nativeId: adsData.admobNativeId || "",
                        openAppId: adsData.admobOpenAppId || "",
                        rewardedId: adsData.admobRewardedId || "",
                    },
                    facebook: {
                        appId: adsData.fanAppId || "",
                        bannerId: adsData.fanBannerId || "",
                        interstitialId: adsData.fanInterstitialId || "",
                        nativeId: adsData.fanNativeId || "",
                        rewardedId: adsData.fanRewardedId || "",
                    }
                };

                const newAdsConfig = {
                    activeProfileId: "default-profile",
                    profiles: [defaultProfile],
                    settings: {
                        adFrequency: adsData.adFrequency || 3,
                        bannerPosition: adsData.bannerPosition || "bottom",
                        rewardedVideoReward: adsData.rewardedVideoReward || "24h",
                    }
                };
                batch.set(configCollection.doc("ads"), newAdsConfig);
            }

            // Delete old doc
            batch.delete(oldDocRef);

            await batch.commit();
            console.log("Migration complete.");

            // Re-fetch to return clean data (or just fetch individually now)
            // But for efficiency, we can just return what we just prepared, 
            // but fetching ensures we have what's in DB.
        }

        // Fetch all docs in parallel
        const docs = await Promise.all(DOC_KEYS.map(key => configCollection.doc(key).get()));

        const fullConfig: any = {};
        docs.forEach((doc, index) => {
            if (doc.exists) {
                fullConfig[DOC_KEYS[index]] = doc.data();
            }
        });

        return NextResponse.json(fullConfig);
    } catch (error) {
        console.error("Error fetching config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const configCollection = adminFirestore.collection(CONFIG_COLLECTION);
        const batch = adminFirestore.batch();

        // Iterate over keys in body and update corresponding docs
        // body should look like { features: {...}, ads: {...}, ui: {...} }
        for (const key of Object.keys(body)) {
            if (DOC_KEYS.includes(key)) {
                const docRef = configCollection.doc(key);
                batch.set(docRef, {
                    ...body[key],
                    updatedAt: new Date().toISOString(),
                }, { merge: true });
            }
        }

        await batch.commit();

        const admin = await getAdminFromRequest(request);
        await logAdminAction(admin?.uid || "sys", admin?.email || "sys", "UPDATE", "CONFIG", "Updated system configuration");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
