import { Route, Routes } from "react-router";

import Dashboard from "@/pages/main/dashboard";
import { GamificationModule } from "@/pages/main/gamification";
import Signin from "@/pages/onboarding/signin";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/gamification" element={<GamificationModule />} />
      <Route path="/signin" element={<Signin />} />
    </Routes>

  );
}

export default App;
