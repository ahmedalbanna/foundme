import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { VirtualTryOn } from './pages/VirtualTryOn';
import { CelebrityLooks } from './pages/CelebrityLooks';
import { Marketplace } from './pages/Marketplace';
import { Closet } from './pages/Closet';
import { AddProduct } from './pages/AddProduct';
import { ProductDetail } from './pages/ProductDetail';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="closet" element={<Closet />} />
          <Route path="closet/:userId" element={<Closet />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="try-on" element={<VirtualTryOn />} />
          <Route path="celebrity-looks" element={<CelebrityLooks />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
