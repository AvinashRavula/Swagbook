import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import  Login  from "./Authentication/Login";
import Home from "./Home/HomeScreen";
import { Profile } from "./ProfileComponents/Profile";
import { Friends } from "./Messenger/Friends";

class App extends Component {
  render() {
    return (

      <Router>
        <Switch>
          <Route exact path="/login" render={(props) => 
            <Login {...props} />}/>
          <Route exact path="/" render={(props)=> 
            <Home {...props}/>}/>
          <Route exact path="/profile" render={(props)=> 
            <Profile {...props}/>}/>
          <Route exact path="/friends" render={(props)=> 
            <Friends {...props}/>}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
