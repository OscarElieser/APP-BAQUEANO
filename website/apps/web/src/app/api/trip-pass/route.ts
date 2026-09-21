/**
 * POR QUE
 * El Trip Pass debe probar integridad, vigencia y pertenencia sin exponer datos
 * financieros ni usar identificadores predecibles como unica proteccion.
 *
 * COMO
 * Emite referencias HMAC-SHA256 solo a llamadas internas autorizadas y valida
 * firma/expiracion con comparacion constante. La clave vive solo en servidor.
 *
 * QUE
 * POST interno para emision y GET publico para validacion criptografica.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

interface Claims { tripId: string; explorerId: string; issuedAt: string; expiresAt: string; }
const encode = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const decode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

function secrets() {
  const signingKey = process.env.BAQUEANO_TRIP_PASS_SIGNING_KEY;
  const internalKey = process.env.BAQUEANO_INTERNAL_API_KEY;
  return { signingKey, internalKey };
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function verifyToken(token: string, key: string): Claims | null {
  try {
    const [payload, provided] = token.split(".");
    if (!payload || !provided) return null;
    const expected = sign(payload, key);
    const left = Buffer.from(provided);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
    const claims = JSON.parse(decode(payload)) as Claims;
    if (!claims.tripId || !claims.explorerId || Date.parse(claims.expiresAt) <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { signingKey, internalKey } = secrets();
  if (!signingKey || !internalKey) return NextResponse.json({ error: "Trip Pass no configurado." }, { status: 503 });
  if (request.headers.get("x-baqueano-internal-key") !== internalKey) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await request.json().catch(() => null) as { tripId?: string; explorerId?: string; expiresAt?: string; eligible?: boolean } | null;
  if (!body?.tripId || !body.explorerId || !body.expiresAt || body.eligible !== true || Date.parse(body.expiresAt) <= Date.now()) {
    return NextResponse.json({ error: "Viaje no elegible para emitir pase." }, { status: 400 });
  }
  const claims: Claims = { tripId: body.tripId, explorerId: body.explorerId, issuedAt: new Date().toISOString(), expiresAt: body.expiresAt };
  const payload = encode(JSON.stringify(claims));
  return NextResponse.json({ token: `${payload}.${sign(payload, signingKey)}`, claims });
}

export async function GET(request: Request) {
  const { signingKey } = secrets();
  if (!signingKey) return NextResponse.json({ valid: false, error: "Trip Pass no configurado." }, { status: 503 });
  const token = new URL(request.url).searchParams.get("token");
  const claims = token ? verifyToken(token, signingKey) : null;
  return claims ? NextResponse.json({ valid: true, claims }) : NextResponse.json({ valid: false, error: "Pase invalido o vencido." }, { status: 400 });
}
