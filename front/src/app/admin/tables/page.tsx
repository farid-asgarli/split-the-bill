"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/auth";
import { Button, Card, Input } from "@/components/ui";
import Link from "next/link";

interface TableInfo {
  id: string;
  number: number;
  hasActiveSession: boolean;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadTables = useCallback(async () => {
    const res = await fetchWithAuth("/api/admin/tables");
    if (res.ok) setTables(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetchWithAuth("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: parseInt(newTableNumber) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create table");
        return;
      }
      setNewTableNumber("");
      await loadTables();
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this table?")) return;
    const res = await fetchWithAuth(`/api/admin/tables/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete table");
      return;
    }
    await loadTables();
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Table Management
      </h1>

      {/* Add table form */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Add New Table
        </h2>
        <form onSubmit={handleAdd} className="flex items-end gap-4">
          <div className="w-48">
            <Input
              label="Table Number"
              type="number"
              min="1"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              required
              error={error || undefined}
            />
          </div>
          <Button type="submit" loading={creating} size="md">
            Add Table
          </Button>
        </form>
      </Card>

      {/* Table list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No tables yet. Add your first table above.
        </Card>
      ) : (
        <div className="space-y-3">
          {tables.map((table) => (
            <Card
              key={table.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-700">
                  {table.number}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Table {table.number}
                  </p>
                  <p className="text-sm text-gray-500">
                    {table.hasActiveSession ? "Active session" : "No session"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/tables/${table.id}/qr`}>
                  <Button variant="secondary" size="sm">
                    View QR
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(table.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
