import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Progress } from "@/components/ui/progress.tsx";

export default function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$1,234.56</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$5,000.00</div>
          <Progress value={33} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">33% achieved</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$789.12</div>
          <p className="text-xs text-muted-foreground">12 transactions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Financial Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">85/100</div>
          <p className="text-xs text-muted-foreground">Great job! Keep it up!</p>
        </CardContent>
      </Card>
    </div>
  );
}
