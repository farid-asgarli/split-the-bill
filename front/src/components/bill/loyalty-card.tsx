"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/components/ui";
import type { LoyaltyAccount, Reward } from "@/types/bill";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5062";

interface LoyaltyCardProps {
  restaurantId: string;
  restaurantName: string;
  paymentId?: string;
}

export function LoyaltyCard({
  restaurantId,
  restaurantName,
  paymentId,
}: LoyaltyCardProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/engagement/rewards/${restaurantId}`)
      .then((r) => r.json())
      .then(setRewards)
      .catch(() => {});
  }, [restaurantId]);

  async function handleSignup() {
    if (!email) {
      setEmailError("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    setEmailError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/engagement/loyalty/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setAccount(data);

      // Earn points for this payment
      if (paymentId) {
        const earnRes = await fetch(`${API_BASE}/api/engagement/loyalty/earn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, paymentId }),
        });
        if (earnRes.ok) {
          const earnData = await earnRes.json();
          setPointsEarned(earnData.pointsEarned);
          setAccount((prev) =>
            prev ? { ...prev, totalPoints: earnData.totalPoints } : prev
          );
        }
      }
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem(rewardId: string, title: string) {
    if (!account) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/engagement/loyalty/${account.email}/redeem`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rewardId }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setRedeemed(title);
        setAccount((prev) =>
          prev ? { ...prev, totalPoints: data.totalPoints } : prev
        );
      }
    } catch {
      // silently fail
    }
  }

  if (account) {
    return (
      <Card className="mt-3 overflow-hidden">
        {/* Points header */}
        <div className="bg-primary-700 p-4 text-white dark:bg-primary-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary-100">
                Your points
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {account.totalPoints}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          {pointsEarned !== null && (
            <p className="mt-1 text-xs text-primary-200">
              +{pointsEarned} points earned from this payment
            </p>
          )}
        </div>

        {/* Rewards list */}
        {rewards.length > 0 && (
          <div className="p-4">
            <h4 className="mb-2 text-xs font-semibold text-muted uppercase tracking-wide">
              Available Rewards at {restaurantName}
            </h4>
            <div className="space-y-2">
              {rewards.map((reward) => {
                const canRedeem = account.totalPoints >= reward.pointsCost;
                const isRedeemed = redeemed === reward.title;
                return (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex-1 pr-3">
                      <p className="text-sm font-medium text-foreground">
                        {reward.title}
                      </p>
                      {reward.description && (
                        <p className="text-xs text-muted">
                          {reward.description}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs font-medium text-primary-600">
                        {reward.pointsCost} pts
                      </p>
                    </div>
                    <Button
                      variant={isRedeemed ? "secondary" : "primary"}
                      size="sm"
                      disabled={!canRedeem || isRedeemed}
                      onClick={() => handleRedeem(reward.id, reward.title)}
                      className="shrink-0"
                    >
                      {isRedeemed ? "Redeemed" : "Redeem"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent transactions */}
        {account.recentTransactions.length > 0 && (
          <div className="border-t border-border p-4">
            <h4 className="mb-2 text-xs font-semibold text-muted uppercase tracking-wide">
              Recent Activity
            </h4>
            <div className="space-y-1.5">
              {account.recentTransactions.slice(0, 3).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted">{txn.description}</span>
                  <span
                    className={`font-medium tabular-nums ${txn.points > 0 ? "text-success" : "text-error"}`}
                  >
                    {txn.points > 0 ? "+" : ""}
                    {txn.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="mt-3 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 dark:bg-accent-900/30">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-accent-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Earn rewards
          </h3>
          <p className="text-xs text-muted">
            Join {restaurantName}&apos;s loyalty program
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            error={emailError}
            aria-label="Email for loyalty program"
            className="h-10!"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSignup}
          disabled={loading}
          className="mt-0 h-10 shrink-0"
        >
          {loading ? "..." : "Join"}
        </Button>
      </div>
    </Card>
  );
}
