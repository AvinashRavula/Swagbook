import React, { Component } from "react";
import {Grid, Row, Col} from 'react-bootstrap';
import { HomeHeader } from "../Home/HomeScreen";
import { About } from "./About";
import { Friends } from "./Friends";
import Cookies from 'universal-cookie';

import '../styles/common.css';
import '../styles/profile.css';

const cookies = new Cookies();
const DOMAIN = "https://swagbook-django.herokuapp.com/"
const BASE_URL = DOMAIN + "facebook/"
const MY_PROFILE = BASE_URL + "my_profile/"
const USER_PROFILE_URL = BASE_URL + "v2/users/"

const MEDIA_URL = "http://smartupkarimnagar.com/Newdirectory/Avinash/Swagbook/"
const proxyUrl = 'https://avi-cors.herokuapp.com/'
const UPLOAD_URL = MEDIA_URL +  "upload.php";

export class Profile extends Component {

    constructor(props) {
        super(props);
        this.inputOpenFileCoverRef = React.createRef();
        this.inputOpenFileProfileRef = React.createRef();
    }
    state={
        user:null,
        showTab:'about',
        profileImageLoading:false,
        coverImageLoading:false,
    }

    _openCoverFileDialog = (e) => {
        this.inputOpenFileCoverRef.current.click();
    }

    _openProfileFileDialog = (e) => {
        this.inputOpenFileProfileRef.current.click();
    }

    _upload = (upload_as, profile_id, file) => {
        let auth = cookies.get('user_token');
        let method = 'post'
        let url = ''
        let {coverpicture, profilepicture} = this.state.user.profile;
        console.log("upload as", upload_as);
        if(upload_as == 'cover'){
            this.setState({coverImageLoading:true})
            url = BASE_URL + 'cps/'
            if(coverpicture)
            {
                method = 'put'
                url = url + coverpicture.id + '/'
            }
        }
        else if(upload_as == 'profile'){
            this.setState({profileImageLoading:true})
            url = BASE_URL + 'dps/'
            if(profilepicture)
            {
                method = 'put'
                url = url + profilepicture.id + '/'
            }
        }
        if(url == '')
            return;
        let formBody = new FormData();
        formBody.append('fileToUpload', file);
        fetch(proxyUrl +  UPLOAD_URL,{
            method:'post',
            body:formBody
        }).then((response)=>{return response.json()})
        .then((resp_json) => {
            console.log(resp_json);
            if(!resp_json.error){
                let formData = new FormData();
                formData.append('image',resp_json.file);
                formData.append('profile', profile_id);
                fetch(url ,{
                    method:method,
                    headers:{
                        Authorization:auth
                    },
                    body:formData
                }).then((response) => {return response.json()})
                .then((resp_json) => {
                    let temp_user = this.state.user;
                    temp_user.profile[upload_as + 'picture'] = resp_json;
                    if(upload_as == 'cover'){
                        this.setState({
                            user:temp_user,
                            coverImageLoading:false
                        });
                    }
                    else{
                        this.setState({
                            user:temp_user,
                            profileImageLoading:false
                        });
                    }
                }).catch(e=>console.log("Error uploading attachment",e));
            }
        }).catch(e => {
            console.log("error in uploading attachment",e);
            alert('Technical Error: Please refresh the page and try again');
        });
       
    }
    
    _onChangeFile = (event, file_of) => {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        let {profile} = this.state.user;
        this._upload(file_of, profile.id, file);
    }

    show = (tab_name) => {
        this.setState({showTab:tab_name});
    }
    
    _fetchProfile = (user_id) => {
        let auth = cookies.get('user_token');
        if(auth === null)
            return;
        let url = ""
        if(user_id == 'my')
            url = MY_PROFILE
        else
            url = USER_PROFILE_URL + user_id + '/'
        fetch(url, {
            method:'get',
            headers:{
                Authorization:auth
            }
        }).then(function(response) {return response.json()})
        .then((resp_json) => {
            if(user_id == 'my')
                resp_json = resp_json[0]
            console.log(resp_json)
            if('id' in resp_json){
                this.setState({
                    user:resp_json
                })
            }
        }).catch(e=>console.log(e));
    }

    render(){
        let {user, showTab, profileImageLoading, coverImageLoading} = this.state;
        let {id} = this.props.match.params;
        return(
            <div style={{marginBottom:'20px'}}>
                <HomeHeader {...this.props}/>
                <Grid>
                    {user && 
                        <div>
                            <div className="cover-container">
                                <input type="file" id="file" ref={this.inputOpenFileCoverRef} style={{display:'none'}}
                                                onChange={(event) => this._onChangeFile(event, 'cover')}/>
                                {
                                    coverImageLoading ? 
                                        <img src={require('../assets/loading.gif') } className="cover-pic" />
                                        :
                                        <img src={user.profile.coverpicture ? MEDIA_URL + user.profile.coverpicture.image : require("../assets/cover.jpg")}
                                             className="cover-pic"/>
                                }
                                <button className="over-btn"  onClick={this._openCoverFileDialog}>edit</button>
                                <div className="profilepic-container">
                                    <input type="file" id="file" ref={this.inputOpenFileProfileRef} style={{display:'none'}}
                                                onChange={(event) => this._onChangeFile(event,'profile')}/>
                                    {
                                        profileImageLoading ? 
                                        <img src={require('../assets/loading.gif') } className="profile-pic" 
                                            />
                                        :
                                        <img src={user.profile.profilepicture ? MEDIA_URL + user.profile.profilepicture.image : require("../assets/profile.jpg")}
                                             className="profile-pic"/>
                                    }
                                    <button className="over-btn" onClick={this._openProfileFileDialog}>edit</button>
                                </div>
                                <label className="profile-username">
                                        {user.first_name + " " + user.last_name}
                                        <label className="profile-nickname">
                                            {user.profile && user.profile.nick_name != '' ? "(" + user.profile.nick_name + ")" : null}
                                        </label>
                                </label>
                            </div>
                            <br/><br/>
                            { showTab == 'about' ? id == 'my' ?     
                                        <About user={user} mode="edit"/> : <About user={user} />
                                        : null }
                            { showTab == 'friends' ? <Friends /> : null }
                        </div>
                    }
                </Grid>
            </div>
        );
    }

    componentDidMount = () =>{
        console.log(this.props.match.params.id);
        this._fetchProfile(this.props.match.params.id);
    }
}