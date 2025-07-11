import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SubdomainChecker } from "./components/SubdomainChecker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProducts from "./pages/VendorProducts";
import VendorProductNew from "./pages/VendorProductNew";
import VendorProductEdit from "./pages/VendorProductEdit";
import VendorOrders from "./pages/VendorOrders";
import VendorAnalytics from "./pages/VendorAnalytics";
import VendorReviews from "./pages/VendorReviews";
import VendorPayments from "./pages/VendorPayments";
import VendorProfile from "./pages/VendorProfile";
import VendorWithdrawals from "./pages/VendorWithdrawals";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Services from "./pages/Services";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminVendors from "./pages/AdminVendors";
import AdminVendorDetail from "./pages/AdminVendorDetail";
import AdminProducts from "./pages/AdminProducts";
import AdminProductNew from "./pages/AdminProductNew";
import AdminProductEdit from "./pages/AdminProductEdit";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAdvertisements from "./pages/AdminAdvertisements";
import AdminSettings from "./pages/AdminSettings";
import AdminReconciliation from "./pages/AdminReconciliation";
import AdminOrdersMonitoring from "./pages/AdminOrdersMonitoring";
import AdminAutoProcess from "./pages/AdminAutoProcess";
import AdminPaymentRecovery from "./pages/AdminPaymentRecovery";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import VendorStore from "./pages/VendorStore";
import StorePage from "./pages/StorePage";
import ShopsPage from "./pages/ShopsPage";
import NotFound from "./pages/NotFound";
import VendorPricing from "./pages/VendorPricing";
import VendorGuide from "./pages/VendorGuide";
import VendorSupport from "./pages/VendorSupport";
import Portfolio from "./pages/Portfolio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SubdomainChecker>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/vendor-pricing" element={<VendorPricing />} />
          <Route path="/vendor-guide" element={<VendorGuide />} />
          <Route path="/vendor-support" element={<VendorSupport />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/boutiques" element={<ShopsPage />} />
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
          <Route path="/vendor/products/:id/edit" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorProductEdit />
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
          <Route path="/vendor/withdrawals" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorWithdrawals />
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
           <Route path="/admin/vendors/:id" element={
             <ProtectedRoute requiredRole="admin">
               <AdminVendorDetail />
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
          <Route path="/admin/products/:id/edit" element={
            <ProtectedRoute requiredRole="admin">
              <AdminProductEdit />
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
          <Route path="/admin/advertisements" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAdvertisements />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/withdrawals" element={
            <ProtectedRoute requiredRole="admin">
              <AdminWithdrawals />
            </ProtectedRoute>
          } />
          <Route path="/admin/reconciliation" element={
            <ProtectedRoute requiredRole="admin">
              <AdminReconciliation />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders-monitoring" element={
            <ProtectedRoute requiredRole="admin">
              <AdminOrdersMonitoring />
            </ProtectedRoute>
          } />
          <Route path="/admin/auto-process" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAutoProcess />
            </ProtectedRoute>
          } />
          <Route path="/admin/payment-recovery" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPaymentRecovery />
            </ProtectedRoute>
          } />
          <Route path="/boutique/:storeSlug" element={<StorePage />} />
          <Route path="/store/:vendorId" element={<VendorStore />} />
          
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </SubdomainChecker>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
