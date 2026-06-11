import { NextResponse } from "next/server";
import { getManagerWorkspace } from "@/agent/workspaces/get-manager-workspace";

/**
 * Exposes the fully orchestrated Manager Workspace data directly to the UI.
 * Handles server-side error mapping and standardizes the API response structure.
 */
export async function GET() {
    try {
        const workspaceData = await getManagerWorkspace();
        
        return NextResponse.json(workspaceData);
    } catch (error) {
        // Ensure server-side logs are maintained without leaking trace details to the client
        console.error("Manager Workspace API Error:", error);
        
        return NextResponse.json(
            { error: "Failed to load manager workspace" },
            { status: 500 }
        );
    }
}
