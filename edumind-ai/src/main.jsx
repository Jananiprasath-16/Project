import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import "./index.css";
import Home from "./pages/Home";
import VirtualProfessor from "./pages/VirtualProfessor";
import ConceptVisualizer from "./pages/Conceptvisualizer";
import Signin from "./components/Auth/Signup";
import Login from "./components/Auth/login";
import Signup from "./components/Auth/Signup";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      {
        index: true, 
        element: <Home />,
      },
    ],
  },
  {
    path: "/virtual-professor",
    element: <App />, 
    children: [
      {
        index: true, 
        element: <VirtualProfessor />,
      },
    ],
  },
  {
    path: "/concept-visualizer",
    element: <App />, 
    children: [
      {
        index: true, 
        element: <ConceptVisualizer />,
      },
    ],
  },
  {
    path: "/signup",
    element: <Signup/>, 
  },
  {
    path: "/login",
    element: <Login />, 
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
