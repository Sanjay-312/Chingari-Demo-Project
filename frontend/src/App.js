import Home from "./Components/Home";
import Feed from "./Components/Feed";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/userFeed" element={<Feed />} />
        <Route path="*" element={<Navigate to={"/"} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
