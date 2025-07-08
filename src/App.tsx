import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProducts from "./pages/VendorProducts";
import VendorProductNew from "./pages/VendorProductNew";
import VendorOrders from "./pages/VendorOrders";
import VendorAnalytics from "./pages/VendorAnalytics";
import VendorReviews from "./pages/VendorReviews";
import VendorProfile from "./pages/VendorProfile";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminVendors from "./pages/AdminVendors";
import AdminProducts from "./pages/AdminProducts";
import AdminProductNew from "./pages/AdminProductNew";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/vendor" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vendor/products" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorProducts />
            </ProtectedRoute>
          } />
          <Route path="/vendor/products/new" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorProductNew />
            </ProtectedRoute>
          } />
          <Route path="/vendor/orders" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorOrders />
            </ProtectedRoute>
          } />
          <Route path="/vendor/analytics" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/vendor/reviews" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorReviews />
            </ProtectedRoute>
          } />
          <Route path="/vendor/profile" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorProfile />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute requiredRole="customer">
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute requiredRole="customer">
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute requiredRole="customer">
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requiredRole="customer">
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/vendors" element={
            <ProtectedRoute requiredRole="admin">
              <AdminVendors />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute requiredRole="admin">
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/products/new" element={
            <ProtectedRoute requiredRole="admin">
              <AdminProductNew />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute requiredRole="admin">
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute requiredRole="admin">
              <AdminCategories />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
