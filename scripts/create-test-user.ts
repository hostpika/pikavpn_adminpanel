// Load environment variables *before* importing admin
process.loadEnvFile(".env.local");

async function createTestUser() {

    // Dynamic import to ensure env vars are loaded first
    const { adminAuth, adminFirestore } = await import("@/lib/firebase/admin");

    const email = "user@freeshieldvpn.com";
    const password = "123456";
    const displayName = "Test User";

    try {
        console.log("Initializing...");

        let uid: string;

        try {
            const userRecord = await adminAuth.getUserByEmail(email);
            uid = userRecord.uid;
            console.log(`User ${email} already exists (UID: ${uid}). Updating password...`);
            await adminAuth.updateUser(uid, {
                password: password,
                displayName: displayName,
                emailVerified: true,
            });
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`Creating user ${email}...`);
                const userRecord = await adminAuth.createUser({
                    email: email,
                    password: password,
                    displayName: displayName,
                    emailVerified: true,
                });
                uid = userRecord.uid;
                console.log(`User created (UID: ${uid}).`);
            } else {
                throw error;
            }
        }

        // Set custom claims (optional but good practice for roles)
        // await adminAuth.setCustomUserClaims(uid, { role: 'user' });

        console.log("Updating Firestore document...");
        const userRef = adminFirestore.collection("users").doc(uid);

        // Check if doc exists to not overwrite creation date if possible, but for test user we can just set/merge
        const now = new Date();

        // Based on UserData interface in lib/user-service.ts
        const userData = {
            uid: uid,
            email: email,
            name: displayName,
            status: "active",
            plan: "premium", // Requested premium tier
            registrationDate: now.toISOString(),
            updatedAt: now,
            // Default values for other required fields
            lastLogin: now.toISOString(),
            totalConnectionTime: "0",
            dataTransferred: "0",
            deviceCount: 0,
            role: "user"
        };

        // Use set with merge: true to avoid overwriting everything if we just want to update status/plan
        // But for a cleaner test user setup, we might want to ensure all fields are correct.
        // Let's use set with merge to be safe but ensure plan is premium.
        await userRef.set(userData, { merge: true });

        console.log(`Successfully configured user ${email} with Premium plan.`);
        process.exit(0);
    } catch (error) {
        console.error("Error creating test user:", error);
        process.exit(1);
    }
}

createTestUser();
