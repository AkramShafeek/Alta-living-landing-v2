import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"

import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home.tsx"
import Listings from "./pages/Listings.tsx"
import Navbar from "./components/Navbar.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
