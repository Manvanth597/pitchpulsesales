/** 
 * @deprecated LEGACY UNIFIED DASHBOARD API
 * This endpoint is being replaced by the Workspace Architecture (/api/workspaces/...).
 * Scheduled for future removal. Retained temporarily for safe rollback.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/agent/dashboard/get-dashboard-data";
import { UserRole } from "@/agent/dashboard/types";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        
        // TODO:
        // Get authenticated user
        // Get user role from session
        const userId = "user-1";
        
        const roleParam = searchParams.get("role");
        let role: UserRole = "sales_rep"; // default
        
        if (roleParam) {
            if (roleParam === "sales_rep" || roleParam === "manager") {
                role = roleParam as UserRole;
            } else {
                return NextResponse.json(
                    { error: "Invalid role" },
                    { status: 400 }
                );
            }
        }

        const dashboardData = await getDashboardData(userId, role);

        return NextResponse.json(dashboardData);
    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            { error: "Failed to load dashboard data" },
            { status: 500 }
        );
    }
}
