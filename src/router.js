import React from 'react'
import {
	HashRouter,
	Switch,
	Route,
	Link
} from "react-router-dom"

import Home from './pages/Home'

export default function BasicRouter() {
	return (
		<HashRouter>
			{/* HashRouter里面一定要有一个根节点，不能直接写Route */}
			<div>
				{/* exact 精准匹配 */}
				<Route exact path="/" component={Home}></Route>
				{/* <Route path="/about" component={About}></Route> */}
				{/* <Route path="/topics" component={Topics}></Route> */}
			</div>
		</HashRouter>
	)
}