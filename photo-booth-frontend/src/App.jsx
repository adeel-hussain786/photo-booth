import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar   from "./components/Navbar";
import Footer   from "./components/Footer";
import Home     from "./pages/Home";
import Packages from "./pages/Packages";
import Gallery  from "./pages/Gallery";
import About    from "./pages/About";
import Contact  from "./pages/Contact";
import Faq      from "./pages/Faq";
import "./index.css";

export default function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/"          element={<Home/>}/>
        <Route path="/packages"  element={<Packages/>}/>
        <Route path="/gallery"   element={<Gallery/>}/>
        <Route path="/about"     element={<About/>}/>
        <Route path="/contact"   element={<Contact/>}/>
        <Route path="/faq"       element={<Faq/>}/>
      </Routes>
      <Footer/>
    </Router>
  );
}
