import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

import { Login } from "../pages/Login";
import ChatToOrder from "../pages/ChatToOrder";
import { PrivateRoute } from "./PrivateRoute";

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route element={<PrivateRoute />}>
          <Route
            path="/"
            element={<ChatToOrder />}
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}