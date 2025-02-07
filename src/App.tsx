import { Route, Routes } from "react-router";

import Layout from "@/layout";
import Dashboard from "@/pages/main/dashboard";
import { GamificationModule } from "@/pages/main/gamification";
import Goals from "@/pages/main/goals";
import Profile from "@/pages/main/profile";
import Transactions from "@/pages/main/transactions";
import Signin from "@/pages/onboarding/signin";

function App() {

  return (
    <Routes>
      <Route path="dashboard" element={<Layout />} >
        <Route index element={<Dashboard />} />
        <Route path="gamification" element={<GamificationModule />} />
        <Route path="profile" element={<Profile/>} />
        <Route path="goals" element={<Goals />} />
        <Route path="transactions" element={<Transactions/>} />
        <Route path="*" element={<div>404</div>} />
      </Route>
      <Route index element={<Signin />} />
    </Routes>
  );
}

export default App;
