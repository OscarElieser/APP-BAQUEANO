import { NextResponse } from "next/server";
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

    // RBAC: Only super_admin can change roles
    if (decodedToken.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Solo los Super Admin pueden cambiar roles." }, { status: 403 });
    }

    const body = await request.json();
    const { targetUid, newRole } = body;

    if (!targetUid || !newRole) {
      return NextResponse.json({ error: "Missing targetUid or newRole" }, { status: 400 });
    }

    // Establecer Custom Claim
    await adminAuth.setCustomUserClaims(targetUid, { role: newRole });

    // Actualizar también en Firestore collection "users"
    await adminDb.collection("users").doc(targetUid).update({
      role: newRole,
      updatedAt: new Date().toISOString()
    });

    // Registrar acción en Audit Logs (ejemplo)
    await adminDb.collection("audit_logs").add({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      actorId: decodedToken.uid,
      actorEmail: decodedToken.email,
      actorRole: "super_admin",
      action: "UPDATE",
      collection: "users",
      documentId: targetUid,
      metadata: { newRole },
      createdAtIso: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: `Rol de ${targetUid} actualizado a ${newRole}` });
  } catch (error: any) {
    console.error("Error setting custom claims:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
