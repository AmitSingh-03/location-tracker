import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LocationTracker from "@/pages/location-tracker";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Main location tracker page - this is our app's home page */}
      <Route path="/" component={LocationTracker} />
      
      {/* Fallback to 404 for any unmatched routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
