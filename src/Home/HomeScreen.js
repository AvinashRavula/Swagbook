import React, {Component} from 'react';
import { withRouter, Link, Redirect } from "react-router-dom";
import { Grid, Row, Col } from "react-bootstrap";
import { NewPost, AllPosts } from "./Posts";
import { PeopleYouMayKnow } from "./People";
import { Profile } from "../ProfileComponents/Profile";
import { Friends } from "../Messenger/Friends";
import Cookies from "universal-cookie";
import { FriendRequests } from './FriendRequests';
import { SearchUsers } from "./Search";

import '../styles/Home.css';
import '../styles/common.css';

const cookies = new Cookies();
const DOMAIN = "https://swagbook-django.herokuapp.com/"
const BASE_URL = DOMAIN + "facebook/"
const MY_PROFILE = BASE_URL + "my_profile/"

export class HomeHeader extends Component {

    render(){
        return(
            <div className="Home-Header">
                <Grid>
                    <Row>
                        <Col md={7}  className="Row-Header">
                            <Link to="/">
                                <button className="btn-primary" >
                                    Home
                                </button>                            
                            </Link>
                           <SearchUsers />
                        </Col>
                        <Col md={5}  className="Row-Header">
                            <Link to="/profile">
                                <button className="btn-default">
                                    Profile
                                </button>
                            </Link>
                            &nbsp;&nbsp;&nbsp;
                            <Link to="/friends">
                                <button className="btn-default">
                                    Friends
                                </button>
                            </Link>
                            &nbsp;&nbsp;&nbsp;
                            <Link to="/messenger">
                                <button className="btn-default">
                                    Messages
                                </button>
                            </Link>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

class HomeLeft extends Component {

    render(){
        let {user} = this.props;
        
        return(
            <div>
                {
                    user.profilepicture ? 
                        <img src={user.profilepicture.image} className="extra-small-circle"/>
                        : <img src={require('../assets/profile.jpg')} className="extra-small-circle"/>
                }
                {user.first_name + " " + user.last_name}<br/>
                <button className="btn btn-link">News feed</button><br/>
                <button className="btn btn-link">Messages</button><br/>
            </div>
        );
    }
}


class HomeBody extends Component {

    state = {
        user:null,
    }

    _fetchProfile = () => {
        let auth = cookies.get('user_token');
        fetch(MY_PROFILE, {
            method:'get',
            headers:{
                Authorization:auth
            }
        }).then(function(response) {return response.json()})
        .then((resp_json) => {
            if('id' in resp_json[0]){
                this.setState({
                    user:resp_json[0]
                })
            }
        }).catch(e=>console.log(e));
    }

    render(){
        let {user} = this.state;
        return(
            <div style={{backgroundColor:'#e9ebee'}}>
                {user && <Grid>
                    <Row>
                        <Col md={2}>
                            <HomeLeft user={user}/>
                        </Col>
                        <Col md={6}>
                            <div style={{height:'100%', width:'100%',overflow:'hidden'}}>
                                <div style={{height:'700px',overflowY:'scroll',}}>
                                    <NewPost />
                                    <AllPosts user_id={user.id} />
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <PeopleYouMayKnow />
                            <FriendRequests />
                        </Col>
                    </Row>
                </Grid>}
            </div>
        );
    }

    componentDidMount = () => {
        this._fetchProfile();
    }
}

class Home extends Component {


    render(){
        return (
            <div>
                <HomeHeader {...this.props}/>
                <HomeBody {...this.props}/>
            </div>
        );
    }

    componentDidMount = () => {
        let auth = cookies.get('user_token');
        if(auth === null)
        {
            <Redirect to="/login"/>
        }
    }
}

export default withRouter(Home);