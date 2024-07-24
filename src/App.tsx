import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import "./App.css";
import ForMe from "./Pages/ForMe";
import Popular from "./Pages/Popular";
import New from "./Pages/New";

function App() {
	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/for-me" element={<ForMe />} />
					<Route path="/popular" element={<Popular />} />
					<Route path="/new" element={<New />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
