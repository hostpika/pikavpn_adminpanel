import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
    return <UserDashboardLayout>{children}</UserDashboardLayout>
}
