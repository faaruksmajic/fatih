"use client";

import { useActionState } from "react";
import { AfMark } from "@/components/AfMark";
import { IconAlert } from "../icons";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="a-shell admin-shell a-login">
      <form action={formAction} className="a-login-card">
        <AfMark line={16} className="a-login-mark" />
        <div>
          <h1 className="a-title">Sign in</h1>
          <p className="a-sub">Backoffice for fatiharch.online</p>
        </div>
        {state.error && (
          <p className="a-banner" role="alert" style={{ margin: 0 }}>
            <IconAlert />
            {state.error}
          </p>
        )}
        <label className="a-field">
          <span className="a-label">Email</span>
          <input name="email" type="email" autoComplete="username" required className="a-input" />
        </label>
        <label className="a-field">
          <span className="a-label">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="a-input"
          />
        </label>
        <button type="submit" disabled={pending} className="a-btn a-btn-primary">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
