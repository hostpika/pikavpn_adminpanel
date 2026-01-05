"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, MessageCircle } from "lucide-react"

export default function SupportPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Help & Support</h1>
                <p className="text-muted-foreground">Get help with your account and VPN connection</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Support</CardTitle>
                            <CardDescription>Send us a message and we'll get back to you shortly</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="How can we help?" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Describe your issue detailed..." className="min-h-[150px]" />
                            </div>
                            <Button className="w-full">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Live Chat</CardTitle>
                            <CardDescription>Directly chat with our support team</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Start Live Chat
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                            <CardDescription>Quick answers to common questions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>How do I connect to a VPN server?</AccordionTrigger>
                                    <AccordionContent>
                                        Go to the Dashboard, select a server from the "Servers" list, and click the connect button.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Can I use my account on multiple devices?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes, Free plan supports 1 device, while Premium plan supports up to 5 simultaneous device connections.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>My connection is slow, what should I do?</AccordionTrigger>
                                    <AccordionContent>
                                        Try connecting to a server that is geographically closer to your location. Premium servers also offer higher bandwidth.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                                    <AccordionContent>
                                        You can reset your password from the login page by clicking "Forgot Password" or in your Profile settings.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
