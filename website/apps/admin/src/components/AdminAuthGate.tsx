"use client";

/**
 * WHY
 * Prevents Control Center content from rendering for anonymous or unprivileged users.
 *
 * HOW
 * Uses Firebase Auth and ID token custom claims, then only renders children for admin roles.
 *
 * WHAT
 * Client-side authentication gate for the static admin shell while backend rules remain authoritative.
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getBaqueanoAuth, getFirebaseAvailability } from "@baqueano/firebase";
import { GoogleAuthProvider, onIdTokenChanged, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from "firebase/auth";
import { Lock, LogIn, ShieldCheck } from "lucide-react";

type GateState = "checking" | "missing-env" | "signed-out" | "forbidden" | "allowed";

const allowedRoles = new Set(["super_admin", "admin", "auditor"]);

export function AdminAuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const availability = useMemo(() => getFirebaseAvailability(), []);
  const [state, setState] = useState<GateState>(availability.available ? "checking" : "missing-env");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(availability.reason ?? "");

  useEffect(() => {
    if (!availability.available) return undefined;

    const auth = getBaqueanoAuth();
    return onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setState("signed-out");
        return;
      }

      try {
        const token = await nextUser.getIdTokenResult(true);
        const role = typeof token.claims.role === "string" ? token.claims.role : "";
        const isAdmin = token.claims.admin === true || allowedRoles.has(role);
        setState(isAdmin ? "allowed" : "forbidden");
        setMessage(isAdmin ? "" : "Tu cuenta existe, pero no tiene custom claims administrativos.");
      } catch (error) {
        setState("forbidden");
        setMessage(error instanceof Error ? error.message : "No se pudo verificar el token administrativo.");
      }
    });
  }, [availability.available]);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await signInWithEmailAndPassword(getBaqueanoAuth(), email, password);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
    }
  }

  async function handleGoogleLogin() {
    setMessage("");
    try {
      await signInWithPopup(getBaqueanoAuth(), new GoogleAuthProvider());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo iniciar sesion con Google.");
    }
  }

  if (state === "allowed") {
    return (
      <>
        <div className="border-b border-[#10B981]/20 bg-[#10B981]/10 px-4 py-2 text-xs text-[#9EF1D2] lg:px-8">
          <span className="font-tech uppercase">Sesion verificada:</span> {user?.email}
          <button type="button" onClick={() => void signOut(getBaqueanoAuth())} className="ml-3 rounded-md border border-[#10B981]/30 px-2 py-1 font-tech uppercase">
            Salir
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#08111f] px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-white/12 bg-white/[0.06] p-6 shadow-2xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-[#F65E01]/40 bg-[#F65E01]/15 text-[#F65E01]">
          {state === "checking" ? <ShieldCheck size={22} /> : <Lock size={22} />}
        </div>
        <p className="font-tech text-xs font-bold uppercase text-[#F4E6C1]">Control Center protegido</p>
        <h1 className="mt-2 font-display text-2xl font-black text-white">Acceso administrativo</h1>

        {state === "missing-env" ? (
          <p className="mt-4 rounded-md border border-[#F65E01]/30 bg-[#F65E01]/10 p-3 text-sm text-white/72">{message}</p>
        ) : (
          <>
            <form onSubmit={handleEmailLogin} className="mt-5 grid gap-3">
              <label className="grid gap-1 text-sm text-white/70">
                Correo
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="username" required className="rounded-md border border-white/12 bg-black/20 px-3 py-2 text-white outline-none focus:border-[#F65E01]" />
              </label>
              <label className="grid gap-1 text-sm text-white/70">
                Contrasena
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required className="rounded-md border border-white/12 bg-black/20 px-3 py-2 text-white outline-none focus:border-[#F65E01]" />
              </label>
              <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#F65E01] px-4 py-3 text-sm font-black uppercase text-white">
                <LogIn size={16} /> Entrar
              </button>
            </form>
            <button type="button" onClick={() => void handleGoogleLogin()} className="mt-3 w-full rounded-md border border-white/12 px-4 py-3 text-sm font-bold text-white">
              Entrar con Google
            </button>
            {message ? <p className="mt-4 rounded-md border border-[#F65E01]/30 bg-[#F65E01]/10 p-3 text-sm text-white/72">{message}</p> : null}
          </>
        )}
      </section>
    </main>
  );
}
