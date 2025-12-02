import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/progress";
import { usePageXP } from "@/hooks";

interface Goal {
    id: number
    name: string
    target: number
    current: number
}

export default function Goals() {
  const [ goals, setGoals ] = useState<Goal[]>([
    { id: 1,
      name: "Emergency Fund",
      target: 5000,
      current: 2500 },
    { id: 2,
      name: "New Car",
      target: 20000,
      current: 5000 },
    { id: 3,
      name: "Vacation",
      target: 3000,
      current: 1500 },
  ]);

  const [ newGoal, setNewGoal ] = useState({ name: "",
    target: "" });
  const [ showModal, setShowModal ] = useState(false);

  usePageXP("goals", 5);

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.target) {
      setGoals([ ...goals, { id: goals.length + 1,
        name: newGoal.name,
        target: Number(newGoal.target),
        current: 0 } ]);
      setNewGoal({ name: "",
        target: "" });
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Financial Goals</h2>
        <Button onClick={() => setShowModal(true)} className="h-9">Add Goal</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <CardTitle>{goal.name}</CardTitle>
              <CardDescription>Target: ${goal.target}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Progress value={(goal.current / goal.target) * 100} className="w-full h-1 bg-muted" />
                <span className="text-xs text-muted-foreground min-w-[38px] text-right">
                  {((goal.current / goal.target) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                ${goal.current} / ${goal.target}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Modal para agregar nueva meta */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Goal">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter goal name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal,
                    name: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="target">Target Amount</Label>
                <Input
                  id="target"
                  placeholder="Enter target amount"
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal,
                    target: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </CardFooter>
        </Card>
      </Modal>
    </div>
  );
}
