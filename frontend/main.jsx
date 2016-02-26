window.$ = require('jquery')

var _ = window._ = require('underscore')
var React = require('react')
var ReactDOM = require('react-dom')

var Backbone = require('backbone')
var Mixins = require('backbone-react-component')

var StateModel = Backbone.Model.extend({
	defaults:{
		chat: 'show'
	}
})

var MessagesModel = Backbone.Model.extend({
	urlRoot: '/api/v1/messages',
	idAttribute: 'uuid'
})

var MessagesCollection = Backbone.Collection.extend({
	model: MessagesModel,
	url: '/api/v1/messages'
})

var messages = new MessagesCollection()

var state = new StateModel( JSON.parse( window.localStorage.getItem('state') ) || {})
state.on('change', function(){
	window.localStorage.setItem('state', JSON.stringify(window.datalayer.state.toJSON()) )
})

messages.on('add', function(model){
	console.log('Adding', model.get('uuid'))
})
messages.on('change', function(model){
	console.log('Change', model.get('uuid'))
})
var xhr = messages.fetch()

xhr.done(function () {
	console.log('messages loaded')
})

var ChatAppSimple = React.createClass({
	getInitialState: function() {
		return {
			messages: [],
			content: ''
		}
	},
	handleContentChange: function(e) {
    	this.setState({content: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();

		console.log('Adding',this.state.content)

		this.state.messages.push({
			content: this.state.content,
			uuid: _.uniqueId()
		})

		this.setState({
			content:'',
		})

		console.log('Messages',this.state.messages)
	},
	render: function() {
		var comments = this.state.messages.map(function(message){
			return <div key={message.uuid}>{message.content}</div>
		})

		return (<div className="container">
			<div className="row">
				<div className="col-lg-6">
					<form onSubmit={this.handleSubmit}>
						<div className="input-group">
							<input 
								type="text"
								className="form-control"
								placeholder="Message for..."
								onChange={this.handleContentChange}
								value={this.state.content}
							/>
							<span className="input-group-btn">
								<button 
									className="btn btn-default"
									type="submit"
								>
									Send!
								</button>
							</span>
						</div>
					</form>
				</div>
			</div>
			{comments}
		</div>)
	}
})

var ChatMessage = React.createClass({
	deleteHandler: function(){
		this.props.model.destroy()
	},
	render : function(){
		var data = this.props.model.toJSON()

		var controls;
		if(window.currentUser === data.user){
			controls = (<div className="col-xm-12" onClick={this.deleteHandler}>
				<a>Delete</a>
			</div>)
		}

		return (<div className="row">
			<div className="col-xm-12"><b>{ data.user }:</b>{ data.content }</div>
			{ controls }
		</div>)
	}	
})

var ChatApp = React.createClass({
	mixins: [Mixins],
	getInitialState: function() {
		return {
			content: ''
		}
	},
	handleContentChange: function(e) {
    	this.setState({content: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();

		var model = new MessagesModel({content:this.state.content})
		var xhr = model.save()

		xhr.done(function(data){
			var message = messages.findWhere({uuid: data.uuid})

			if(!message){
				messages.add(data)
			}
		})

		this.setState({
			content:''
		})
	},
	render: function() {
		if(this.props.model.get('chat') === 'hide'){
			return (<div></div>)
		}

		var comments = this.props.collection.map(function(message){
			var uuid = message.get('uuid')

			if(!uuid){return}

			// return <div key={message.get('uuid')}>{message.get('content')}</div>
			return <ChatMessage model={message} key={message.get('uuid')}/>
		}).reverse()

		return (<div className="container">
			<div className="row">
				<div className="col-lg-6">
					<form onSubmit={this.handleSubmit}>
						<div className="input-group">
							<input 
								type="text"
								className="form-control"
								placeholder="Message for..."
								onChange={this.handleContentChange}
								value={this.state.content}
							/>
							<span className="input-group-btn">
								<button 
									className="btn btn-default"
									type="submit"
								>
									Send!
								</button>
							</span>
						</div>
					</form>
				</div>
			</div>
			{comments}
		</div>)
	}
})

var Buttons = React.createClass({
	mixins: [Mixins],
	showHandler: function(){
		console.log('Hi')

		this.props.model.set('chat', 'show')
	},
	hideHandler: function(){
		console.log('bye')

		this.props.model.set('chat', 'hide')
	},
	render: function(){
		var button
		if( this.props.model.get('chat') === 'hide' ){
			button = <button onClick={this.showHandler}>Show chat</button>
		}else{
			button = <button onClick={this.hideHandler}>Hide chat</button>

		}

		return (<div>
			{button}
		</div>)
	}
})
 
ReactDOM.render(
	<ChatApp collection={messages} model={state}/>,
	document.getElementById('app')
)

ReactDOM.render(
	<Buttons model={state}/>,
	document.getElementById('buttons')
)

window.datalayer = {
	messages: messages,
	state:state
}

window.Data = {
	MessagesModel : MessagesModel,
	MessagesCollection : MessagesCollection
}

var socket = io.connect('http://localhost:3000');
socket.on('message', function(data){
	var message = messages.findWhere({uuid: data.uuid})

	if(message){
		message.set(data)
	}else{
		messages.add(data)
	}
})

socket.on('remove-message', function(data){
	var message = messages.findWhere({uuid: data.uuid})

	if(message){
		// message.remove()
		message.trigger('destroy', message, messages);
	}
})