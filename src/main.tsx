import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"

import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom"
import Home from "./pages/Home.tsx"
import Listings from "./pages/Listings.tsx"
import Property from "./pages/Property.tsx"
import OpsEditor from "./pages/OpsEditor.tsx"
import { OPS_ROUTE } from "./ops/route.ts"
import Navbar from "./components/Navbar.tsx"
import { ScrollToTop } from "./components/ScrollToTop.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* The editor is not a page of the site: no navbar, nothing linking
              to it, and nothing on it linking back. See ops/route.ts for what
              the opaque path does and does not protect. */}
          <Route path={OPS_ROUTE} element={<OpsEditor />} />

          <Route
            element={
              <>
                <Navbar />
                <Outlet />
              </>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:slug" element={<Property />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
