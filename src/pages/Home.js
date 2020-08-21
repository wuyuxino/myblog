import React, { Component } from 'react'
import { Menu, Dropdown, Button } from "antd"
import MarkdownEditor from '@uiw/react-markdown-editor'
import Outside from './component/Outside'
import { Get } from 'webh5frame'

export default class Home extends Component {
	constructor(props) {
		super(props)
		this.state = {
			main_nav: [],
			nav_title: '',
			currentMapNav: [],
			currentArticle: ''
		}
	}

	/* 查询所有tab */
	getMainNav = () => {
		let $this = this
		Get(
			'http://106.13.63.7:10002/v1/graphql',
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
		this.setState({ currentMapNav: [], currentArticle: '# 暂无文章' })
		/* 设置大的导航map结构 */
		let MainNav = []
		/* 查询当前第一个的所有文件 */
		Get(
			'http://106.13.63.7:10002/v1/graphql',
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
				let isSet = false
				for (let i = 0; i < e.data.secondary_nav.length; i++) {
					let obj = {
						nav: e.data.secondary_nav[i].name,
						list: []
					}
					Get(
						'http://106.13.63.7:10002/v1/graphql',
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
							if (i == e.data.secondary_nav.length - 1) {
								isSet = true
							}
						}
					)
				}
				$this.timer = setInterval(() => {
					if (isSet) {
						$this.setState({ currentMapNav: MainNav })
						$this.getArticleContent(MainNav[0].list[0].id)
						clearInterval($this.timer)
					}
				}, 200)
			}
		)
	}

	/* 点击查询指定文章内容 */
	getArticleContent = (id) => {
		let $this = this
		Get(
			'http://106.13.63.7:10002/v1/graphql',
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
		const { main_nav, nav_title, currentMapNav, currentArticle } = this.state
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
						background: '#f2f2f2',
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
					<div
						style={{
							width: '300px',
							height: 2000,
							background: '#c4d7d6'
						}}>
						<div style={{ width: '300px', height: 50 }}></div>
						{
							currentMapNav.map((i, n) => {
								return (
									<div>
										<div
											style={{
												display: 'flex',
												width: '100%',
												height: '45px',
												background: 'red',
												alignItems: 'center',
												justifyContent: 'center'
											}}
											key={n}>
											{i.nav}
										</div>
										{
											i.list.map((is, ns) => {
												return (
													<div
														onClick={() => {
															this.getArticleContent(is.id)
														}}
														key={ns}
														style={{
															display: 'flex',
															width: '100%',
															height: '45px',
															justifyContent: 'center',
															alignItems: 'center',
															background: 'yellow'
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
						right: 0,
						width: window.innerWidth - 300,
						height: window.innerHeight,
						background: '#f3f3f3'
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
			</Outside>
		);
	}
}
