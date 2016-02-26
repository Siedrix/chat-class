var React = require('react')
var ReactDOM = require('react-dom')

var TimeCounter = React.createClass({
	getInitialState: function(){
		 return {
		 	time: new Date(),
		 	counter: 2
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
	componentWillUnmount: function(){

	},
	clickHandler: function(){
		this.setState({
			counter: this.state.counter + 1
		})
	},
	render: function(){
		var date = this.state.time.toString()

		return (<div>
			<p>{date}</p>
			<p>{this.state.counter}</p>
			<p><button onClick={this.clickHandler}>Click Me</button></p>
		</div>)
	}
})

var HelloWorld = React.createClass({
	render: function(){
		return (<div className="container">
			<div className="row">
				<h2>Hola mundo!!!</h2>
			</div>
		</div>)
	}
})

ReactDOM.render(
	<TimeCounter/>,
	document.getElementById('time-counter')
)



