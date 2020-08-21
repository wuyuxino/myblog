import React from 'react';
import { Get } from 'webh5frame'
import MarkdownEditor from '@uiw/react-markdown-editor'

class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {

		}
	}

	getDate = () => {
		let $this = this
		Get(
			'http://106.13.63.7:10002/v1/graphql',
			null,
			{
				table_name: 'article',
				search_field: `{
          id,
					content,
					nj
        }`
			},
			(e) => {
				$this.setState({ markdown: e.data.article[0].content })
			}
		)
	}

	componentDidMount() {
		this.getDate()
	}

	render() {
		return (
			<div>
				<MarkdownEditor
					options={{
						autofocus: true,
						showCursorWhenSelecting: true,
					}}
					height={window.innerHeight}
					value={this.state.markdown}
					visbleEditor={false}
					toolbars={false}
					toolbarsMode={false}
				/>
			</div>
		)
	}
}

export default App;
