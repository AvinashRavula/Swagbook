import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import  Login  from "./Authentication/Login";
import Home from "./Home/HomeScreen";
import { Profile } from "./ProfileComponents/Profile";
import { Friends } from "./Messenger/Friends";
import Messenger from "./Messenger/Messenger";
import firebase from "firebase/app";
import 'firebase/database';
import { firebase_config } from "./Config";


class App extends Component {

  constructor(){
    super()
    this.app = firebase.initializeApp(firebase_config)
    console.log("app constructor");
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/login" render={(props) => 
            <Login {...props} />}/>
          <Route exact path="/" render={(props)=> 
            <Home {...props}/>}/>
          <Route exact path="/profile/:id" render={(props)=> 
            <Profile {...props}/>}/>
          <Route exact path="/messenger" render={(props)=> 
            <Messenger  {...this.props} app={this.app}/>}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
