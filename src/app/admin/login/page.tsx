"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="admin-shell min-h-svh flex items-center justify-center bg-charcoal text-paper px-6">
      <form action={formAction} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-display text-3xl mb-2">ADMIN LOGIN</h1>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input name="email" type="email" autoComplete="username" required className="bg-paper text-ink px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input name="password" type="password" autoComplete="current-password" required className="bg-paper text-ink px-3 py-2" />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="bg-paper text-ink font-semibold px-4 py-2 min-h-11 mt-2 disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
