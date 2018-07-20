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
        let {id} = this.props.request;
        let auth = cookies.get('user_token');
        fetch(BASE_URL + "friends/" + id + "/",{
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
        let {id} = this.props.request;
        let auth = cookies.get('user_token');
        let url = BASE_URL + "friends/" + id+"/";
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
        let {first_name, last_name, profile } = this.props.request.user;
        let {display, accepted} = this.state;
        return(
            <div style={{display:display, marginTop:'5px'}} className="avi-white-container-h">
                <Grid>
                    <Row>
                        <Col md={3}>
                            { profile && profile.profilepicture ? 
                                    <img src={MEDIA_URL + profile.profilepicture } className="small_circle" />
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
        requests : [],
    }

    render(){
        let {requests} = this.state;
        return(
            <div className="avi-black-container">
                <h6 className="normal_heading white bold">Friend Requests</h6>
                {
                    requests.length > 0 ? requests.map((request) => {
                        return <UserRequest request={request} key={request.id}/>
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
            this.setState({
                requests:response_json
            })
        }).catch(e => console.log("Error fetching the User", e));
    }
}