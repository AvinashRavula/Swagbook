import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import { Redirect, withRouter } from "react-router-dom";
import { Grid, Row, Col } from "react-bootstrap";
import { HomeHeader } from "../Home/HomeScreen";
import firebase from "firebase/app";
import 'firebase/database';
import { firebase_config } from "../Config";

import '../styles/common.css'
import '../styles/posts.css'

const BASE_URL = "https://swagbook-django.herokuapp.com/facebook/"
const FRIENDS_URL = BASE_URL + "my_friends/"
const PROFILE_URL = BASE_URL + "my_profile/"
const MEDIA_URL = "http://smartupkarimnagar.com/Newdirectory/Avinash/Swagbook/"

const cookies = new Cookies();

const Friend = (props) => {
    let {item, user_id, setSelectedFriend} = props; 
    let user= item.user;
    if(item.user.id == user_id)
        user = item.friend
    let {profilepicture} = user.profile

    return (
        user && <div className="avi-white-container" style={{cursor:'pointer', marginBottom:'5px'}}
                        onClick={() => setSelectedFriend(item, user_id)}>
            { profilepicture ? <img src={ MEDIA_URL + profilepicture.image} className="extra-small-circle"/>
            : <i className="fa fa-user" aria-hidden="true"></i>}
            &nbsp;&nbsp;&nbsp;
            {user.first_name + " " + user.last_name}
        </div>
    )
}

class AllFriends extends Component {
    constructor(){
        super()
        this.state = {
            friends:[],
            isLoggedIn:true,
            user_id:null
        }
        // this.app = firebase.initializeApp(firebase_config)
        // var base64 = require('base-64');
        // let token = base64.encode("avinashravula1@gmail.com");
        // this.database = this.app.database().ref().child(token);
        // this.state ={
        //     value:10
        // }
    }

    render(){
        let {friends, isLoggedIn, user_id} = this.state;
        let {setSelectedFriend} = this.props;
        return(
            isLoggedIn ? 
                <div className="avi-black-container"> 
                    <label className="white bold">Friends </label>
                    {
                        friends.length > 0 ? friends.map((friend) => {
                            return <Friend item={friend} user_id={user_id} key={friend.id} 
                                        setSelectedFriend={setSelectedFriend}/>
                        })   
                        : <div><label className="white">You dont have any friends</label></div>
                    }
                </div>
            : <Redirect to={{pathname:"/login", state: { from: this.props.location} }}/>
        )
    }

    componentDidMount() {
        // this.database.on('value', span => {
        //     console.log(span.val())
        //     this.setState({
        //         value: span.val().mytest
        //     })
        // })
        // this.database.push().set({
        //     id:2,
        //     msg: 'hello'
        // });
        let auth = cookies.get('user_token');
        fetch(PROFILE_URL,{
            method:'get',
            headers:{
                Authorization:auth
            }
        }).then((response) => {
            return response.json()
        })
        .then((resp_json) => {
            console.log("profile url",resp_json[0]);
            if('id' in resp_json[0]){
                this.setState({
                    user_id:resp_json[0].id
                })
                fetch(FRIENDS_URL, {
                    method:'get',
                    headers:{
                        Authorization: auth
                    }
                }).then((response) => {return response.json()})
                .then((resp_json) => {
                    console.log(resp_json);
                    this.setState({
                        friends:resp_json
                    })
                }).catch(e => console.log(e));
            }
            else{
                this.setState({
                    isLoggedIn: false
                })
            }
        }).catch(e => console.log(e));
    }
}

const ChatElement = (props) => {
    // let {message} = props;
    // if(message.id)
    if(props.user_id != props.element.id){
        return (
            <label className="recieved-message">{props.element.message}</label>
        );
    }
    else{
        return (
            <label className="sent-message">{props.element.message}</label>
        );
    }
}

class ChatBox extends Component {

    constructor(props){
        super(props)
        console.log('constructor')
        this.app = props.app;
        console.log("firebase apps length",firebase.apps.length);
        if(firebase.apps.length == 0)
            this.app = firebase.initializeApp(firebase_config);
        else
            this.app = firebase.apps[0];
        this.state = {
            message:'',
            chat:[],
            shouldLoad:false
        }
        this.listRef = React.createRef();
    }

    _saveMessage = (event) => {
        this.setState({
            message:event.target.value
        })
    }

    _sendMessage = () => {
        let {user_id} = this.props;
        let message = this.state.message;
        if(message == "")
            return;
        let encoded_token = this.getEncodedToken();
        let database = this.app.database().ref().child(encoded_token);
        database.push().set({
            id: user_id,
            message: message.trim()
        });
        this.setState({
            message:''
        })
    }

    getEncodedToken(){
        let normal_token = ""
        let {friend, user} = this.props.friend;
        if( friend.id < user.id)
            normal_token = friend.email + user.email
        else if(friend.id > user.id)
            normal_token = user.email + friend.email
        else
            alert('two users are same');
        var base64 = require('base-64');
        let encoded_token = base64.encode(normal_token);
        // return this.app.database().ref().child(encoded_token);
        return encoded_token;
    }

    firebaseListener = () => {
        let token = this.getEncodedToken();
        let chatsRef = this.app.database().ref(token);
        let chat = this.state.chat;
        let key = ""
        chatsRef.on('child_added', function(snapshot, prevChildName) {
            // console.log("hehe",snapshot.val());
            chat.push(snapshot.val())
            key = snapshot.key
        })
        console.log(chat);
        this.setState({
            chat: chat,
            key:key
        });
    }

    _loadChat() {
        let token = this.getEncodedToken();
        let chatsRef = this.app.database().ref(token);
        chatsRef.on('value', snapshot => {
            let chat = [], key="";
            snapshot.forEach(element => {
                // console.log(element.key);
                key = element.key;
                chat.push(element.val());
            });
            this.setState({
                chat:chat,
                key:key
            })
        })
    }

    _handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this._sendMessage();
        }
    }
    

    render(){
        let {friend, user_id} = this.props;
        let user = friend.user.id == user_id ? friend.friend : friend.user;
        let {profilepicture} = user.profile
        let {message, chat} = this.state;
        console.log("rendering ",chat);
        return(
            <div>
                <div className="post-top" style={{padding:'20px'}}>
                    { profilepicture ? <img src={ MEDIA_URL + profilepicture.image} className="extra-small-circle"/>
                        : <i className="fa fa-user" aria-hidden="true"></i>}
                    &nbsp;&nbsp;&nbsp;{user.first_name + " " + user.last_name}
                </div>
                <div className="post-middle" style={{height:'450px', overflow:'auto'}} ref={this.listRef}>
                {
                    chat.map((element, index) => {
                        return <Row key={index}><ChatElement element={element} user_id={user_id} key={index}/></Row>
                    })
                }
                </div>
                <div className="post-bottom" style={{padding:'20px'}}> 
                    <Row>
                        <Col md={11}>
                            <input type="text" className="avi-input" placeholder="Enter message"
                                    onChange={this._saveMessage} value={message}
                                    onKeyPress={this._handleKeyPress}/>
                        </Col>
                        <Col md={1}>
                            <button className="avi-button" onClick={this._sendMessage}> Send </button>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
    componentDidMount(){
        this._loadChat();
        // this.firebaseListener();
    }

    getSnapshotBeforeUpdate(prevProps, prevState){
        if(this.props.friend.id != prevProps.friend.id){
            this._loadChat();
            // this.firebaseListener();
        }
        if (prevState.chat.length < this.state.chat.length) {
            const list = this.listRef.current;
            return list.scrollHeight - list.scrollTop;
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // If we have a snapshot value, we've just added new items.
        // Adjust scroll so these new items don't push the old ones out of view.
        // (snapshot here is the value returned from getSnapshotBeforeUpdate)
        if (snapshot !== null) {
          const list = this.listRef.current;
          list.scrollTop = list.scrollHeight - snapshot;
        }
    }
}


class Messenger extends Component {
    state = {
        friend : null,
        user_id:null,
    }

    setSelectedFriend = (friend, my_id) => {
        this.setState({
            friend:friend,
            user_id:my_id
        })
    }

    render(){
        let {friend, user_id} = this.state;
        return (
            <div>
                <HomeHeader {...this.props}/>
                <Grid>
                    <Row>
                        <Col md={4}>
                            <AllFriends setSelectedFriend={this.setSelectedFriend}/>
                        </Col>
                        <Col md={8}>
                            { friend ? <ChatBox friend={friend} user_id={user_id}/>
                             :  <div className="avi-white-container">
                                    <p>
                                        Select a friend to open the chat box
                                    </p>
                                </div>}
                        </Col>
                    </Row>
                </Grid>
            </div>
        )
    }
}

export default withRouter(Messenger);