import { SignJWT, jwtVerify } from "jose"

const secret = process.env.JWT_SECRET
if (!secret || secret.length === 0) {
    throw new Error("FATAL: JWT_SECRET is not defined in environment variables.")
}
const JWT_SECRET = new TextEncoder().encode(secret)

export async function createToken(payload: { uid: string; role: string; plan: string;[key: string]: any }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h") // Strictly 1 hour as per spec
        .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload
    } catch (error) {
        return null
    }
}
