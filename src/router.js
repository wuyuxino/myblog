import React from 'react'
import {
	BrowserRouter,
	Switch,
	Route
} from "react-router-dom"

import Home from './pages/Home'

export default function BasicRouter() {
	return (
		<BrowserRouter>
			<Switch>
				{/* exact 精准匹配 */}
				<Route exact path="/" component={Home}></Route>
				{/* <Route path="/about" component={About}></Route> */}
			</Switch>
		</BrowserRouter>
	)
}