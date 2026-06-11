import { NextResponse } from "next/server";
import { getExecutiveWorkspace } from "@/agent/workspaces/get-executive-workspace";

/**
 * Exposes the fully orchestrated Executive Workspace data directly to the UI.
 * Handles server-side error mapping and standardizes the API response structure.
 */
export async function GET() {
    try {
        const workspaceData = await getExecutiveWorkspace();
        
        return NextResponse.json(workspaceData);
    } catch (error) {
        // Ensure server-side logs are maintained without leaking trace details to the client
        console.error("Executive Workspace API Error:", error);
        
        return NextResponse.json(
            { error: "Failed to load executive workspace" },
            { status: 500 }
        );
    }
}
