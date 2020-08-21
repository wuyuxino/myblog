import React, { Component } from 'react'

export default class Outside extends Component {
	render() {
		return (
			<div
				style={{
					position: 'relative',
					width: window.innerWidth,
					height: window.innerHeight,
					background: '#f2f2f2'
				}}>
				{this.props.children}
			</div>
		);
	}
}
