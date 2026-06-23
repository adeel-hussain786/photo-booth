import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar   from "./components/Navbar";
import Footer   from "./components/Footer";
import Home     from "./pages/Home";
import Packages from "./pages/Packages";
import Gallery  from "./pages/Gallery";
import Store    from "./pages/Store";
import About    from "./pages/About";
import Contact  from "./pages/Contact";
import Faq      from "./pages/Faq";
import AdminLogin       from "./pages/AdminLogin";
import AdminDashboard   from "./pages/AdminDashboard";
import CustomerGallery  from "./pages/CustomerGallery";
import PrivateAdminRoute from "./components/PrivateAdminRoute";
import "./index.css";

// The public marketing site, wrapped in the shared navbar/footer chrome.
function MarketingSite() {
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/"          element={<Home/>}/>
        <Route path="/packages"  element={<Packages/>}/>
        <Route path="/gallery"   element={<Gallery/>}/>
        <Route path="/store"     element={<Store/>}/>
        <Route path="/about"     element={<About/>}/>
        <Route path="/contact"   element={<Contact/>}/>
        <Route path="/faq"       element={<Faq/>}/>
      </Routes>
      <Footer/>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Standalone routes — no marketing navbar/footer */}
        <Route path="/admin/login" element={<AdminLogin/>}/>
        <Route
          path="/admin/dashboard"
          element={
            <PrivateAdminRoute>
              <AdminDashboard/>
            </PrivateAdminRoute>
          }
        />
        <Route path="/g/:folderId" element={<CustomerGallery/>}/>

        {/* Everything else renders the marketing site */}
        <Route path="/*" element={<MarketingSite/>}/>
      </Routes>
    </Router>
  );
}
