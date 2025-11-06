import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StudentMarketplace from "./StudentMarketplace";
import "./index.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      retry: 1, // Retry failed requests once
      staleTime: 3000, // Data is fresh for 3 seconds
    },
  },
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <StudentMarketplace/>
  </QueryClientProvider>
);