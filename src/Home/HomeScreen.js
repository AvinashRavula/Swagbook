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
const DOMAIN = "http://127.0.0.1:8000/"
const BASE_URL = DOMAIN + "facebook/"
const MY_PROFILE = BASE_URL + "my_profile/"
const MEDIA_URL = "http://smartupkarimnagar.com/Newdirectory/Avinash/Swagbook/"

export class HomeHeader extends Component {

    state = {
        loggedIn: true
    }
    
    _logout =() => {
        cookies.remove('user_token');
        this.setState({loggedIn:false});
    }

    render(){
        let {loggedIn} = this.state;
        return(
            loggedIn ? <div className="Home-Header">
                <Grid>
                    <Row>
                        <Col md={7}  className="Row-Header">
                            <Row>
                                <Col md={4}>
                                    <Link to="/">
                                        <img src={require('../assets/swag.png')} style={{width:'50px',height:'100%'}}/>
                                    </Link>
                                </Col>  
                                <Col md={8} style={{marginTop:'3px'}}>
                                    <SearchUsers />
                                </Col>
                            </Row>
                        </Col>
                        <Col md={5}  className="Row-Header">
                            <Link to="/profile">
                                <button className="avi-button">
                                    Profile
                                </button>
                            </Link>
                            &nbsp;&nbsp;&nbsp;
                            <Link to="/messenger">
                                <button className="avi-button">
                                    Messages
                                </button>
                            </Link>
                            &nbsp;&nbsp;&nbsp;
                            <button className="avi-button" onClick={this._logout}>
                                Logout
                            </button>
                        </Col>
                    </Row>
                </Grid>
            </div> 
            : <Redirect to={{pathname:"/login", state: { from: this.props.location} }}/>
        );
    }
}

class HomeLeft extends Component {

    render(){
        let {first_name, last_name, profile} = this.props.user;
        return(
            <div className="white avi-black-container">
                <center>
                {
                    profile && profile.profilepicture ? 
                        <img src={ MEDIA_URL + profile.profilepicture.image} className="small_circle"/>
                        : <i class="fa fa-user fa-size" aria-hidden="true"></i>
                }
                
                &nbsp; <label style={{maxWidth:'100%'}}>{first_name + " " + last_name}</label>
                </center>
                <button className="avi-button" onClick={() => this.props.refresh()}>News feed</button><br/>
                <Link to="/messenger"><button className="avi-button">Messages</button></Link><br/>
            </div>
        );
    }
}


class HomeBody extends Component {

    state = {
        user:null,
        refreshCount:1
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
        let {user, refreshCount} = this.state;

        return(
            <div style={{marginTop:'20px'}}>
                {user && refreshCount && <Grid>
                    <Row>
                        <Col md={2}>
                            <HomeLeft user={user} refresh={this.props.refresh}/>
                        </Col>
                        <Col md={6}>
                            <div style={{height:'100%', width:'100%',overflow:'hidden'}}>
                                <div style={{height:'700px',overflowY:'scroll'}}>
                                    <NewPost />
                                    <AllPosts user_id={user.id} />
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <FriendRequests />
                            <br/>
                            <PeopleYouMayKnow />
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

    _refresh = () => {
        // this.setState(prevState => ({
        //    refreshCount:prevState.refreshCount + 1 
        // }));
        console.log("refreshing"); 
        this.forceUpdate();
        // location.reload();
    }


    render(){
        let auth = cookies.get('user_token');
        return (
            auth ? 
                <div>
                    <HomeHeader {...this.props}/>
                    <HomeBody {...this.props} refresh={this._refresh}/>
                </div>
            :
                <Redirect to={{pathname:"/login", state: { from: this.props.location} }}/>
        );
    }
}

export default withRouter(Home);