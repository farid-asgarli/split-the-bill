import { Button, Card, CurrencyDisplay, Badge, Divider } from "@/components/ui";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Split the Bill</h1>
        <p className="mt-1 text-sm text-muted">
          Scan, split, and pay in seconds
        </p>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Total</span>
          <CurrencyDisplay amount={12765} size="lg" />
        </div>
        <Divider className="my-4" />
        <div className="flex items-center gap-2">
          <Badge variant="success">Paid</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="neutral">3 items</Badge>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button variant="primary" size="lg">
          Pay Full Bill
        </Button>
        <Button variant="secondary">Split the Bill</Button>
        <Button variant="ghost" size="sm">
          No tip
        </Button>
      </div>
    </main>
  );
}
