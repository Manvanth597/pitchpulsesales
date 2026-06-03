import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/agent/dashboard/get-dashboard-data";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        // Using query parameters as a mock authentication pattern
        // In a real app, you would verify the session/JWT and extract the role & userId
        const roleParam = searchParams.get("role")?.toLowerCase();
        
        let role: "executive" | "manager" = "executive"; // default
        if (roleParam === "manager") {
            role = "manager";
        }

        // Mock userId since we don't have authentication
        const userId = searchParams.get("userId") || "mock-user-1";

        const dashboardData = await getDashboardData(role, userId);

        return NextResponse.json(dashboardData);
    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            { error: "Failed to load dashboard data", details: error.message },
            { status: 500 }
        );
    }
}
