import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";

// Lazy load secondary pages for better performance
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const Documentation = lazy(() => import("./pages/Documentation"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const VendorProducts = lazy(() => import("./pages/VendorProducts"));
const VendorProductNew = lazy(() => import("./pages/VendorProductNew"));
const VendorOrders = lazy(() => import("./pages/VendorOrders"));
const VendorAnalytics = lazy(() => import("./pages/VendorAnalytics"));
const VendorReviews = lazy(() => import("./pages/VendorReviews"));
const VendorProfile = lazy(() => import("./pages/VendorProfile"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Orders = lazy(() => import("./pages/Orders"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminVendors = lazy(() => import("./pages/AdminVendors"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminProductNew = lazy(() => import("./pages/AdminProductNew"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancelled = lazy(() => import("./pages/PaymentCancelled"));
const VendorStore = lazy(() => import("./pages/VendorStore"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading component optimized for mobile
const MobileLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-muted-foreground text-sm">Chargement...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<MobileLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/documentation" element={<Documentation />} />
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
          <Route path="/store/:vendorId" element={<VendorStore />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
