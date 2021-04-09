import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CreateRoom from './routes/CreateRoom';
import Room from './routes/Room';
import { AppBar, Toolbar, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
	header: {
		backgroundColor: 'black',
		color: 'white',
		boxShadow: '0px 0px 0px 0px',
	},
});

function App() {
	const classes = useStyles();
	return (
		<>
			<div className="App">
				<AppBar position="sticky" className={classes.header}>
					<Toolbar>
						<Typography variant="h6"> video chat app </Typography>
					</Toolbar>
				</AppBar>
			</div>
			<BrowserRouter>
				<Switch>
					<Route path="/" exact component={CreateRoom} />
					<Route path="/room/:roomID" component={Room} />
				</Switch>
			</BrowserRouter>
		</>
	);
}

export default App;
