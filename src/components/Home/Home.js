import React from 'react';
import firebase from '../../firebase';
import {Link} from 'react-router-dom';

import './Home.css';

import App from './App';

class Home extends React.Component{
	constructor(props){
		super(props);
	}

	render(){
		return(
			<div className="home--container">
				<h1>Welcome to Queued Party!</h1>
				{this.props.user &&
					<div className="linkSpotifyAccount">
						<App />
					</div>
				}
				{!this.props.user && 
					<div className="disallow-queue">
						<p><Link to="/login">Login</Link> or <Link to="/register">Register</Link> to enter!</p>
					</div>
				}
			</div>
		);
	}
}

export default Home;