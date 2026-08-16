import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"

import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home.tsx"
import Listings from "./pages/Listings.tsx"
import Property from "./pages/Property.tsx"
import Navbar from "./components/Navbar.tsx"
import { ScrollToTop } from "./components/ScrollToTop.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:slug" element={<Property />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
