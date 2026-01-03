"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, WifiOff, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3f] to-[#0f0f2a] p-4 text-white overflow-hidden relative">
            {/* Background Mesh (similar to login) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-background/0 to-background/0" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative mb-8"
                >
                    <div className="w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                            <WifiOff className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        </div>
                    </div>

                    {/* Glitch Effect Text */}
                    <div className="absolute -top-4 -right-4 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-mono border border-yellow-500/30">
                        Error 404
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                >
                    Connection Lost
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-lg text-slate-400 mb-8 leading-relaxed"
                >
                    It seems you've ventured into unencrypted territory. The page you are looking for has been disconnected or moved to a secure location.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                            <Link href="/dashboard">
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Return to Safety
                            </Link>
                        </Button>

                        <Button asChild variant="outline" size="lg" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go Back Home
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Floating elements for atmosphere */}
            <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500/50 rounded-full blur-[2px]"
            />
            <motion.div
                animate={{ y: [15, -15, 15] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-500/40 rounded-full blur-[4px]"
            />
        </div>
    )
}
