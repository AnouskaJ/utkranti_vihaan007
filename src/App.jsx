import Home from "./page/Home/Home";
// import Invest from "./page/Invest/Invest";
import Pitch from "./page/Pitch/Pitch"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <>
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pitch" element={<Pitch />} />
          {/* <Route path="/invest" element={<Invest/>} /> */}
        </Routes>
      </Router>
    </>
  )
}