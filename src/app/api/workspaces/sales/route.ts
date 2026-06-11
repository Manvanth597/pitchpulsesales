import { NextResponse } from "next/server";
import { getSalesWorkspace } from "@/agent/workspaces/get-sales-workspace";

/**
 * Exposes the fully orchestrated Sales Workspace data directly to the UI.
 * Handles server-side error mapping and standardizes the API response structure.
 */
export async function GET() {
    try {
        // TODO: Implement actual authentication context (e.g. NextAuth or Clerk)
        // Temporary mock user ID until auth framework is established
        const userId = "user-1";
        
        const workspaceData = await getSalesWorkspace(userId);
        
        return NextResponse.json(workspaceData);
    } catch (error) {
        // Ensure server-side logs are maintained without leaking trace details to the client
        console.error("Sales Workspace API Error:", error);
        
        return NextResponse.json(
            { error: "Failed to load sales workspace" },
            { status: 500 }
        );
    }
}
