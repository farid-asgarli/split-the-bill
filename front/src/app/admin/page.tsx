"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithAuth } from "@/lib/auth";
import { Card } from "@/components/ui";
import Link from "next/link";

interface TableInfo {
  id: string;
  number: number;
  hasActiveSession: boolean;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/admin/tables")
      .then((res) => res.json())
      .then(setTables)
      .finally(() => setLoading(false));
  }, []);

  const activeSessions = tables.filter((t) => t.hasActiveSession).length;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-500">Restaurant</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {user?.fullName || "—"}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-500">Total Tables</p>
          <p className="mt-1 text-3xl font-bold text-teal-700">
            {loading ? "—" : tables.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-500">Active Sessions</p>
          <p className="mt-1 text-3xl font-bold text-teal-700">
            {loading ? "—" : activeSessions}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link href="/admin/tables">
          <Card className="p-6 transition-shadow hover:shadow-lg cursor-pointer">
            <p className="text-lg font-semibold text-gray-900">Manage Tables</p>
            <p className="mt-1 text-sm text-gray-500">
              Add, remove, and manage your restaurant tables
            </p>
          </Card>
        </Link>
        <Link href="/admin/qr-codes">
          <Card className="p-6 transition-shadow hover:shadow-lg cursor-pointer">
            <p className="text-lg font-semibold text-gray-900">QR Codes</p>
            <p className="mt-1 text-sm text-gray-500">
              View and download QR codes for all tables
            </p>
          </Card>
        </Link>
        <Link href="/admin/analytics">
          <Card className="p-6 transition-shadow hover:shadow-lg cursor-pointer">
            <p className="text-lg font-semibold text-gray-900">Analytics</p>
            <p className="mt-1 text-sm text-gray-500">
              Revenue, tips, satisfaction scores, and table metrics
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
