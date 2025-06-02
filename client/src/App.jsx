import React, { useEffect } from "react";
import "./App.css";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResetPassword />} />
        <Route path="/verify" element={<Index />} />
      </Routes>
    </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}
