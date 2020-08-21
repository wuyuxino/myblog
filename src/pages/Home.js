import React, { Component } from 'react'
import { Get } from 'webh5frame'
import { Menu, Dropdown, Button } from "antd"
import MarkdownEditor from '@uiw/react-markdown-editor'

import Images from '../images/index'
import Outside from './component/Outside'


export default class Home extends Component {
	constructor(props) {
		super(props)
		this.state = {
			main_nav: [],
			nav_title: '',
			currentMapNav: [],
			currentArticle: '',
			isopen_nav: [],
			current_nav: 0,
			current_nav_list: [0, 0]
		}
	}

	/* 查询所有tab */
	getMainNav = () => {
		let $this = this
		Get(
			'http://loveit.cool:10002/v1/graphql',
			null,
			{
				table_name: 'main_nav',
				search_field: `{
          id,
					name
        }`
			},
			(e) => {
				if (e.data.main_nav) {
					this.getSecondaryNavList(e.data.main_nav[0].id)
					$this.setState({ main_nav: e.data.main_nav, nav_title: e.data.main_nav[0].name })
				} else {
					$this.setState({ main_nav: [] })
				}
			}
		)
	}

	/* 查询当前tab下的分组以及分组文章名称 */
	getSecondaryNavList = (main_nav_id) => {
		let $this = this
		/* 初始化数据 */
		this.setState({
			currentMapNav: [],
			currentArticle: '### 该分类下暂无文章内容！',
			current_nav: 0,
			current_nav_list: [0, 0],
			isopen_nav: []
		})
		/* 设置大的导航map结构 */
		let MainNav = []
		let openNav = []
		/* 查询当前第一个的所有文件 */
		Get(
			'http://loveit.cool:10002/v1/graphql',
			null,
			{
				table_name: 'secondary_nav',
				search_field: `(where: { main_nav_id: {_eq: ${JSON.stringify(main_nav_id)} }}
				){
					id,
					name
				}`
			},
			(e) => {
				let isSet = []
				for (let j = 0; j < e.data.secondary_nav.length; j++) {
					isSet.push(false)
				}
				for (let i = 0; i < e.data.secondary_nav.length; i++) {
					let obj = {
						nav: e.data.secondary_nav[i].name,
						list: [],
						isopen: true
					}
					let obj_open = {
						isopen: true,
						list: []
					}
					Get(
						'http://loveit.cool:10002/v1/graphql',
						null,
						{
							table_name: 'article',
							search_field: `(where: { secondary_nav_id: {_eq: ${JSON.stringify(e.data.secondary_nav[i].id)} }}
							){
								id,
								name
							}`
						},
						(es) => {
							obj.list = es.data.article
							MainNav.push(obj)
							for (let is = 0; is < es.data.article.length; is++) {
								obj_open.list.push(false)
							}
							openNav.push(obj_open)
							isSet[i] = true
						}
					)
				}
				$this.timer = setInterval(() => {
					if (isSet.includes(false) !== true) {
						if (openNav.length !== 0) { openNav[0].list[0] = true }
						$this.setState({ isopen_nav: openNav, currentMapNav: MainNav })
						if (openNav.length !== 0) {
							$this.getArticleContent(MainNav[0].list[0] ? MainNav[0].list[0].id : null)
						}
						clearInterval($this.timer)
					}
				}, 200)
			}
		)
	}

	/* 点击查询指定文章内容 */
	getArticleContent = (id) => {
		if (id == null) { return }
		let $this = this
		Get(
			'http://loveit.cool:10002/v1/graphql',
			null,
			{
				table_name: 'article',
				search_field: `(where: { id: {_eq: ${JSON.stringify(id)} }}
				){
					id,
					name,
					content
				}`
			},
			(e) => {
				$this.setState({ currentArticle: e.data.article[0].content })
			}
		)
	}

	componentDidMount() {
		this.getMainNav()
		/* 页面尺寸变化 */
		window.addEventListener('resize', () => {
			this.setState({ refresh: true })
		})
	}

	render() {
		const { main_nav, nav_title, currentMapNav, currentArticle, isopen_nav, current_nav, current_nav_list } = this.state
		return (
			<Outside>
				{/* 左侧导航 */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: '320px',
						height: window.innerHeight,
						background: '#fffef8',
						overflowY: 'scroll',
						overflowX: 'hidden'
					}}>
					{/* 顶部标题 */}
					<div
						style={{
							display: 'flex',
							position: 'fixed',
							top: 0,
							width: '300px',
							height: 50,
							background: '#161823',
							alignItems: 'center',
							justifyContent: 'center'
						}}>
						<Dropdown
							overlay={
								<Menu
									onClick={(e) => {
										this.setState({ nav_title: e.item.props.children[1] })
										/* 获取导航数据 */
										this.getSecondaryNavList(e.key)
									}}>
									{
										main_nav.map((i, n) => {
											return (
												<Menu.Item key={i.id}>
													{i.name}
												</Menu.Item>
											)
										})
									}
								</Menu>
							}
							onVisibleChange={(e) => {
							}}
							placement="bottomCenter">
							<Button>{nav_title}</Button>
						</Dropdown>
					</div>
					{/* 二级导航 */}
					<div>
						<div style={{ width: '300px', height: 50 }}></div>
						{
							currentMapNav.map((i, n) => {
								return (
									<div>
										<div
											onClick={() => {
												if (isopen_nav[n].isopen) {
													isopen_nav[n].isopen = false
												} else {
													isopen_nav[n].isopen = true
												}
												this.setState({ isopen_nav })
											}}
											style={{
												position: 'relative',
												display: 'flex',
												width: '100%',
												color: '#000',
												height: '45px',
												fontSize: '14px',
												letterSpacing: '2px',
												background: '#fff',
												fontWeight: '500',
												alignItems: 'center',
												justifyContent: 'flex-start',
												cursor: 'pointer',
												paddingLeft: '20px',
												borderBottom: '1px solid #f2f2f2'
											}}
											key={n}>
											{i.nav}
											<img
												style={{
													position: 'absolute',
													right: 30
												}}
												src={isopen_nav[n].isopen ? Images.up : Images.down}
												width={20}
												height={20} />
										</div>
										{
											i.list.map((is, ns) => {
												return (
													<div
														onClick={() => {
															if (current_nav_list[0] === n && current_nav_list[1] === ns) { return }
															this.getArticleContent(is.id)
															isopen_nav[current_nav_list[0]].list[current_nav_list[1]] = false
															isopen_nav[n].list[ns] = true
															this.setState({ current_nav: n }, () => {
																this.setState({ isopen_nav, current_nav_list: [n, ns] })
															})
														}}
														key={ns}
														style={{
															display: isopen_nav[n].isopen ? 'flex' : 'none',
															width: '100%',
															color: isopen_nav[n].list[ns] && n == current_nav ? 'yellow' : '#000',
															height: '45px',
															fontSize: '14px',
															letterSpacing: '2px',
															justifyContent: 'flex-start',
															alignItems: 'center',
															background: isopen_nav[n].list[ns] && n == current_nav ? 'rgba(0,0,0,.6)' : '#fff',
															cursor: 'pointer',
															paddingLeft: '40px',
															borderBottom: '1px solid #f2f2f2'
														}}>
														{is.name}
													</div>
												)
											})
										}
									</div>
								)
							})
						}
					</div>
				</div>
				{/* 右侧展示 */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						right: -30,
						paddingRight: '30px',
						width: window.innerWidth - 270,
						height: window.innerHeight,
						background: '#f3f3f3',
						overflowX: 'hidden'
					}}>
					<MarkdownEditor
						options={{
							autofocus: true,
							showCursorWhenSelecting: true,
						}}
						height={window.innerHeight}
						value={currentArticle}
						visbleEditor={false}
						toolbars={false}
						toolbarsMode={false}
					/>
				</div>
			</Outside >
		)
	}
}
