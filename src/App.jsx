import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/user/UserList";
import UserView from "./pages/user/UserView";
import FormExample from "./pages/FormExample";
import ProductsPage from "./pages/product/Product";

import SignIn from "./pages/auth/Login";
import PrivateRoute from "./hoc/PrivateRoute";
import AddProductPage from "./pages/product/AddProduct";
import EditProductPage from "./pages/product/EditProduct";
import CategoryList from "./pages/category/Category";
import CategoryView from "./pages/category/ViewCategories";
import ComboProductAdd from "./pages/comboproduct/AddCombo";
import ComboProductList from "./pages/comboproduct/ComboProduct";
import ComboProductEdit from "./pages/comboproduct/EditCombo";
import Orders from "./pages/order/OrderList";
import ReturnsManagement from "./pages/return/Return";
import StockManagement from "./pages/inventory/Inventory";
import StaffManagement from "./pages/staff/StaffManagement";
import PublicRoute from "./hoc/PublicRoute";
import DealsRewards from "./pages/dealrewards/DealsRewards";
import OfferList from "./pages/dealrewards/Offers";
import CouponList from "./pages/dealrewards/CouponLisr";
import CoinSettings from "./pages/dealrewards/Coins";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ManualOrderAdd from "./pages/order/AddOrders";
import ChangePassword from "./pages/auth/ChangePassword";
import { useState } from "react";
import BusinessCard from "./components/Print";
import DealersList from "./pages/dealers/DealerList";
import AddEditDealer from "./pages/dealers/AddEditDealer";
// import PurchaseHistory from "./pages/dealers/PurchaseHistory";
import DealerOverview from "./pages/dealers/DealerOverview";
import BlogList from "./pages/blog/BlogList";
import BlogAdd from "./pages/blog/AddBlog";
import BlogEdit from "./pages/blog/EditBlog";
import SettingsPage from "./pages/settings/settingsPage";
import FlashSale from "./pages/dealrewards/FlashSale";
import Analytics from "./pages/analytics/Analytics";

export default function App() {

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
    <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    <Routes>
       <Route
        path="/login"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />
      {/* Private (Dashboard) Routes */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <div className="app-grid">
              <aside className={`sidebar ${isOpen && 'open'}`} id="sidebar">
                <Sidebar  setIsOpen={setIsOpen} isOpen={isOpen}/>
              </aside>
              <header className="topbar border-bottom">
                <Topbar setIsOpen={setIsOpen} />
              </header>
              <main className="main">

                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<UserList />} />
                  <Route path="/users/:id" element={<UserView />} />
                  <Route path="/forms" element={<FormExample />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/active" element={<ProductsPage />} />
                  <Route path="/products/add" element={<AddProductPage />} />
                  <Route path="/products/edit/:id" element={<EditProductPage />} />
                  <Route path="/categories" element={<CategoryList />} />
                  <Route path="/categories/:id" element={<CategoryView />} />
                  <Route path="/combo-products" element={<ComboProductList />} />
                  <Route path="/combo-products/add" element={<ComboProductAdd />} />
                  <Route path="/combo-products/edit/:id" element={<ComboProductEdit />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/returns" element={<ReturnsManagement />} />
                  <Route path="/inventory" element={<StockManagement />} />
                  <Route path="/staff" element={<StaffManagement />} />
                  <Route path="/deals" element={<DealsRewards/>} />
                  <Route path="/deals/offers" element={<OfferList/>} />
                  <Route path="/deals/coupons" element={<CouponList/>} />
                  <Route path="/deals/coins" element={<CoinSettings/>} />
                  <Route path="/orders/add" element={<ManualOrderAdd/>} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/dealers" element={<DealersList />} />
                  <Route path="/dealers/:id/rates" element={<DealersList />} />
                  <Route path="/dealers/add" element={<AddEditDealer />} />
                  <Route path="/dealers/:id" element={<DealerOverview />} />
                  <Route path="/dealers/edit/:id" element={<AddEditDealer />} />
                  
            
                  {/* Blog */}
                  <Route path="/blogs" element={<BlogList/>}/>
                  <Route path="/blogs/add" element={<BlogAdd/>}/>
                  <Route path="blogs/edit/:id" element={<BlogEdit/>} />

                  {/* settings */}
                  <Route path="/settings" element={<SettingsPage/>} />

                  {/* flash sale */}
                  <Route path="/deals/flash-sales" element={<FlashSale/>} />

                  {/* Analytics */}
                  <Route path="/analytics" element={<Analytics/>} />
                </Routes>
              </main>
            </div>
          </PrivateRoute>
        }
      />
    </Routes>
  
    <BusinessCard
          // order={selectedOrder}
        />
    </>
  );
}
