import React, { Component } from "react";
import '../styles/common.css';
import '../styles/profile.css';
import { HomeHeader } from "../Home/HomeScreen";
import { About } from "./About";
import { Friends } from "./Friends";
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const DOMAIN = "http://127.0.0.1:8000/"
const BASE_URL = DOMAIN + "facebook/"
const MY_PROFILE = BASE_URL + "my_profile/"

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
        showTab:'about'
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
            url = BASE_URL + 'cps/'
            if(coverpicture)
            {
                method = 'put'
                url = url + coverpicture.id + '/'
            }
        }
        else if(upload_as == 'profile'){
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
                    this.setState({user:temp_user});
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
    
    _fetchProfile = () => {
        let auth = cookies.get('user_token');
        fetch(MY_PROFILE, {
            method:'get',
            headers:{
                Authorization:auth
            }
        }).then(function(response) {return response.json()})
        .then((resp_json) => {
            console.log(resp_json[0])
            if('id' in resp_json[0]){
                this.setState({
                    user:resp_json[0]
                })
            }
        }).catch(e=>console.log(e));
    }

    render(){
        let {user, showTab} = this.state;
        return(
            <div style={{marginBottom:'20px'}}>
                <HomeHeader {...this.props}/>
                <div>
                    {user && 
                        <div className="a-container">
                            <div className="avi-container">
                                <input type="file" id="file" ref={this.inputOpenFileCoverRef} style={{display:'none'}}
                                                onChange={(event) => this._onChangeFile(event, 'cover')}/>
                                <img src={user.profile.coverpicture ? MEDIA_URL + user.profile.coverpicture.image : require("../assets/cover.jpg")}
                                        className="cover-pic"/>
                                <button className="over-btn"  onClick={this._openCoverFileDialog}>edit</button>
                            </div>
                            <div className="row">
                                <div style={{width:'50%'}}>
                                    <input type="file" id="file" ref={this.inputOpenFileProfileRef} style={{display:'none'}}
                                                onChange={(event) => this._onChangeFile(event,'profile')}/>
                                    <img src={user.profile.profilepicture ? MEDIA_URL + user.profile.profilepicture.image : require("../assets/profile.jpg")} width="128px" height="128px" 
                                        className="a-profile"/>
                                    <label className="a-profile-name a-mt-40">
                                        {user.first_name + " " + user.last_name}
                                    </label>
                                </div>
                                <div style={{width:'50%'}}>
                                    <button className="a-mt-40" onClick={() => this.show('about')}>About</button>
                                    &nbsp;&nbsp;&nbsp;  
                                    <button className="a-mt-40" onClick={() => this.show('friends')}>Friends</button>
                                </div>
                            </div>
                            <button className="bt-n btn-link btn-profile-edit" onClick={this._openProfileFileDialog}>edit</button>

                            { showTab == 'about' ? <About user={user}/> : null }
                            { showTab == 'friends' ? <Friends /> : null }
                        </div>
                    }
                </div>
            </div>
        );
    }

    componentDidMount = () =>{
        this._fetchProfile();
    }
}