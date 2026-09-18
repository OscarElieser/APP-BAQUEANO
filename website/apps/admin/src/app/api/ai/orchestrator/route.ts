import { NextResponse } from "next/server";
import { orchestrator, OrchestratorTask } from "@baqueano/ai-core";
import { adminAuth, adminDb } from "../../../../lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Role verification - only admins can use Orchestrator
    if (decodedToken.role !== "super_admin" && decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: No tienes permisos para usar BAQUEANO AI." }, { status: 403 });
    }

    const body = await request.json();
    const { taskType, resourceId } = body;

    if (!taskType || !resourceId) {
      return NextResponse.json({ error: "Missing taskType or resourceId" }, { status: 400 });
    }

    // Context Gathering: Extract data from Firestore based on the resource type
    let contextData = {};
    if (taskType === "REVIEW_DESTINATION") {
      const doc = await adminDb.collection("destinations").doc(resourceId).get();
      contextData = doc.data() || { notice: "Destination not found in DB" };
    } else if (taskType === "REVIEW_BUSINESS") {
      const doc = await adminDb.collection("businesses").doc(resourceId).get();
      contextData = doc.data() || { notice: "Business not found in DB" };
    }

    const task: OrchestratorTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      taskType: taskType as any,
      resourceId,
      adminUid: decodedToken.uid,
      contextData
    };

    // Execute Multiagent Orchestration via Genkit/Gemini
    const result = await orchestrator.executeTask(task);

    // Audit Log for AI execution
    await adminDb.collection("audit_logs").add({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      actorId: decodedToken.uid,
      actorEmail: decodedToken.email,
      actorRole: decodedToken.role,
      action: "AI_ORCHESTRATOR_EXECUTION",
      collection: taskType === "REVIEW_DESTINATION" ? "destinations" : "businesses",
      documentId: resourceId,
      metadata: { 
        taskType,
        actionRecommended: result.actionRecommended 
      },
      createdAtIso: new Date().toISOString()
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[AI Orchestrator Route] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
