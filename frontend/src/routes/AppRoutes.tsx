import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Login } from "../pages/Login";
import ChatToOrder  from "../pages/ChatToOrder";

import { PrivateRoute } from "./PrivateRoute";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ROTA PÚBLICA */}
        <Route path="/login" element={<Login />} />

        {/* ROTAS PRIVADAS */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<ChatToOrder />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}