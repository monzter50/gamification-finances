import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useGamificationContext } from "@/context/GamificationContext.tsx";

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

  const { userProgress, dispatch } = useGamificationContext();

  useEffect(() => {
    // Award XP for visiting the goals page
    dispatch({ type: "ADD_XP",
      payload: 5,
      section: "goals" });
  }, [ dispatch ]);

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.target) {
      setGoals([ ...goals, { id: goals.length + 1,
        name: newGoal.name,
        target: Number(newGoal.target),
        current: 0 } ]);
      setNewGoal({ name: "",
        target: "" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Financial Goals</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <CardTitle>{goal.name}</CardTitle>
              <CardDescription>Target: ${goal.target}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(goal.current / goal.target) * 100} className="w-full" />
              <p className="mt-2 text-sm text-muted-foreground">
                                ${goal.current} / ${goal.target} ({((goal.current / goal.target) * 100).toFixed(1)}%)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Goal</CardTitle>
        </CardHeader>
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
        <CardFooter>
          <Button onClick={handleAddGoal}>Add Goal</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Goals Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(userProgress.sections.goals.xp / 100) * 100} className="mt-2" />
          <p className="text-sm mt-2">
            Level {userProgress.sections.goals.level} - XP: {userProgress.sections.goals.xp}/100
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
