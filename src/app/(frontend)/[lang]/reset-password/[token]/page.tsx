"use client";

import { use, useState } from "react";
import styles from "@/styles/document.module.css";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/businessUsers/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.errors?.[0]?.message || "Token is invalid or has expired."
        );
      }

      setStatus("success");
      setMessage("Your password has been reset successfully.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <div className={`grid ${styles.wrapper}`}>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <h2>Reset Password</h2>
        </div>

        <div className={styles.spacer} />

        {status === "success" ? (
          <>
            <p className="body">{message}</p>
            <a
              href="com.fotura.giveamealbusiness://"
              style={{
                display: "inline-block",
                marginTop: 24,
                padding: "12px 24px",
                borderRadius: "var(--border-radius-xs)",
                background: "var(--color-button-primary)",
                color: "var(--color-white)",
                fontSize: 16,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Open app
            </a>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="body_s" htmlFor="password" style={{ display: "block", marginBottom: 6 }}>
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--border-radius-xs)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-white)",
                }}
              />
            </div>

            <div>
              <label className="body_s" htmlFor="confirmPassword" style={{ display: "block", marginBottom: 6 }}>
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--border-radius-xs)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-white)",
                }}
              />
            </div>

            {status === "error" && (
              <p className="body_s" style={{ color: "red" }}>{message}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                padding: "12px 24px",
                borderRadius: "var(--border-radius-xs)",
                border: "none",
                background: "var(--color-button-primary)",
                color: "var(--color-white)",
                fontSize: 16,
                fontWeight: 500,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.6 : 1,
                alignSelf: "flex-start",
              }}
            >
              {status === "loading" ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
