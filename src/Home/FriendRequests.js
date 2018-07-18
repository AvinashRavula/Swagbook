import React, {Component} from 'react';
import { Grid, Row, Col } from "react-bootstrap";
import Cookies from 'universal-cookie';

import '../styles/common.css';

const DOMAIN = "https://swagbook-django.herokuapp.com/"
const BASE_URL = DOMAIN + "facebook/"
const friend_requests_url = BASE_URL + 'friends/requests/'
const users_v2_url = BASE_URL + "v2/users/"
const MEDIA_URL = "http://smartupkarimnagar.com/Newdirectory/Avinash/Swagbook/"

const cookies = new Cookies();
class UserRequest extends Component {

    state= {
        accepted:false,
        display:'block',
    }

    _confirmFriend = () =>{
        let {user} = this.props;
        let auth = cookies.get('user_token');
        fetch(BASE_URL + "friends/" + user.request_id + "/",{
            method:'put',
            body:JSON.stringify({
                status:1
            }),
            headers:{
                Accept: 'application/json',
                'Content-Type':'application/json',
                Authorization:auth
            }
        }).then(function(response) {return response.json()})
        .then(response_json =>{
            console.log(response_json);
            if('id' in response_json){
                // ToastAndroid.show("Friend Request sent");
                this.setState({
                    accepted:true,
                });
            }
        }).catch(e => console.log("Error in Friend Request Accepted", e));
    }
    
    _cancelRequest =() =>{
        let {user} = this.props;
        let auth = cookies.get('user_token');
        let url = BASE_URL + "friends/" + user.request_id+"/";
        console.log(url);
        fetch(url,{
          method:'delete',
          headers:{
            Authorization:auth
          }
        }).then((response) => {
          console.log(response);
          if (response.ok){
            this.setState({display:'none'});
          }
        }).catch(e =>console.log("Error in Friend Request Rejected" ,e));
    }


    render(){
        let {first_name, last_name, profilepicture } = this.props.user;
        let {display, accepted} = this.state;
        return(
            <div style={{display:display, marginTop:'5px'}} className="avi-white-container-h">
                <Grid>
                    <Row>
                        <Col md={3}>
                            { profilepicture ? 
                                    <img src={MEDIA_URL + profilepicture } className="small_circle" />
                                    : <i class="fa fa-user fa-size" aria-hidden="true"></i> }
                        </Col>
                        <Col md={9}>
                            <div>
                                <label className="normal_heading bold">{first_name + " "+ last_name}</label>
                                {
                                    accepted ? "You are now friends" :
                                    <div>
                                        <button className="avi-button green" onClick={this._confirmFriend}>Confirm Friend</button>
                                        <button className="avi-button red" onClick={this._cancelRequest}>Cancel</button>
                                    </div>
                                }
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export class FriendRequests extends Component {
    state = {
        users : [],
    }

    render(){
        let {users} = this.state;
        return(
            <div className="avi-black-container">
                <h6 className="normal_heading white bold">Friend Requests</h6>
                {
                    users.length > 0 ? users.map((user) => {
                        return <UserRequest user={user} key={user.id}/>
                    })
                    : <center><p className="a-small a-mt-40 white">No New Requests</p></center>
                }
            </div>
        );
    }

    componentDidMount = () =>{
        let auth = cookies.get('user_token');
        fetch(friend_requests_url,{
        method:'get',
        headers:{
            Authorization: auth
        }
        }).then(function(response) {return response.json()})
        .then(response_json =>{
            console.log(response_json);
            response_json.map((request, index) => {
            let user_url = users_v2_url + request.user + "/";
            fetch(user_url,{
                method:'get',
                headers:{
                    Authorization:auth
                }
            }).then(function(user_response) {return user_response.json()})
            .then(user =>{
                let tempUsers = this.state.users;
                user['request_id'] = request.id;
                tempUsers.push(user);
                this.setState({users:tempUsers});
                if(user.profile){
                    let profile_url = BASE_URL + "v2/profiles/" + user.profile;
                    // console.log(profile_url);
                    fetch(profile_url,{
                        method:'get',
                        headers:{
                        Authorization:auth
                        }
                    }).then(function(response1) {return response1.json()})
                    .then(response1_json =>{
                    //   console.log(response1_json);
                        if(response1_json.profilepicture){
                            // console.log("profilepicture found");
                            user['profilepicture'] = response1_json.profilepicture.image;
                            console.log("user ",user);
                            let tempUsers = this.state.users;
                            tempUsers[index] = user;
                            this.setState({users:tempUsers});
                        }
                        // this.setState({users:user});
                    }).catch(e => console.log("Error fetching the profile", e));
                }
            }) 
                
        });
        //   console.log("updated ",this.state.users);

        }).catch(e => console.log("Error fetching the User", e));
    }
}