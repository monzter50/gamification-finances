"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGamificationContext } from "@/context/GamificationContext";
import { usePageXP, useSnackbar } from "@/hooks";

interface Expense {
    id: number
    date: string
    description: string
    amount: number
    category: string
}

const EXPENSE_CATEGORIES = [ "Food", "Transportation", "Housing", "Utilities", "Entertainment", "Healthcare", "Other" ];

const COLORS = [ "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B" ];

export default function Expenses() {
  const [ expenses, setExpenses ] = useState<Expense[]>([
    { id: 1,
      date: "2023-06-01",
      description: "Groceries",
      amount: 100,
      category: "Food" },
    { id: 2,
      date: "2023-06-02",
      description: "Gas",
      amount: 50,
      category: "Transportation" },
    { id: 3,
      date: "2023-06-03",
      description: "Movie tickets",
      amount: 30,
      category: "Entertainment" },
  ]);

  const [ newExpense, setNewExpense ] = useState({
    date: "",
    description: "",
    amount: "",
    category: "",
  });

  const { userProgress, dispatch } = useGamificationContext();
  const snackbar = useSnackbar();
  usePageXP("expenses", 5);

  const handleAddExpense = () => {
    if (newExpense.date && newExpense.description && newExpense.amount && newExpense.category) {
      setExpenses([
        ...expenses,
        {
          id: expenses.length + 1,
          date: newExpense.date,
          description: newExpense.description,
          amount: Number(newExpense.amount),
          category: newExpense.category,
        },
      ]);
      setNewExpense({ date: "",
        description: "",
        amount: "",
        category: "" });
      // Award XP for adding a new expense
      dispatch({ type: "ADD_XP",
        payload: 10,
        section: "expenses" });

      snackbar.success({
        title: "Expense added!",
        description: `Successfully added expense: ${newExpense.description}`,
      });
    } else {
      snackbar.warning({
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const expensesByCategory = EXPENSE_CATEGORIES.map((category) => ({
    name: category,
    value: expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0),
  })).filter((item) => item.value > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Expenses</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense,
                    date: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense,
                    description: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  placeholder="Enter amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense,
                    amount: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense,
                    category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-4">Total: ${totalExpenses.toFixed(2)}</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expenses Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(userProgress?.sections?.expenses?.xp ?? 0 / 100) * 100} className="mt-2" />
          <p className="text-sm mt-2">
                        Level {userProgress?.sections?.expenses?.level ?? 0} - XP: {userProgress?.sections?.expenses?.xp ?? 0}/100
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
