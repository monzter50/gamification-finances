import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Transaction {
    id: number
    date: string
    description: string
    amount: number
    type: "income" | "expense"
}

export default function Transactions() {
  const [ transactions, setTransactions ] = useState<Transaction[]>([
    { id: 1,
      date: "2023-06-01",
      description: "Salary",
      amount: 3000,
      type: "income" },
    { id: 2,
      date: "2023-06-02",
      description: "Rent",
      amount: 1000,
      type: "expense" },
    { id: 3,
      date: "2023-06-03",
      description: "Groceries",
      amount: 150,
      type: "expense" },
  ]);

  const [ newTransaction, setNewTransaction ] = useState({
    date: "",
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
  });

  const handleAddTransaction = () => {
    if (newTransaction.date && newTransaction.description && newTransaction.amount) {
      setTransactions([
        ...transactions,
        {
          id: transactions.length + 1,
          date: newTransaction.date,
          description: newTransaction.description,
          amount: Number(newTransaction.amount),
          type: newTransaction.type,
        },
      ]);
      setNewTransaction({ date: "",
        description: "",
        amount: "",
        type: "expense" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Transactions</h2>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction,
                  date: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction,
                  description: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                placeholder="Enter amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction,
                  amount: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newTransaction.type}
                onValueChange={(value) => setNewTransaction({ ...newTransaction,
                  type: value as "income" | "expense" })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddTransaction}>Add Transaction</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
