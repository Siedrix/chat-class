var React = require('react')
var ReactDOM = require('react-dom')

var TimeCounter = React.createClass({
	getInitialState: function(){
		 return {
		 	time: new Date()
		 };
	},
	componentDidMount: function(){
		var self = this;
		setInterval(function(){
			self.setState({
				time: new Date()
			})
		}, 1000)
	},
	render: function(){
		var date = this.state.time.toString()

		return (<div>
			<p>{date}</p>
		</div>)
	}
})

var HelloWorld = React.createClass({
	render: function(){
		return (<div>Hello world</div>)
	}
})

ReactDOM.render(
	<TimeCounter/>,
	document.getElementById('time-counter')
)
