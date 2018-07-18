import React, {Component} from 'react';
import '../styles/common.css';
import {Grid, Row, Col} from 'react-bootstrap';
import Cookies from 'universal-cookie';

const HOSTNAME = "https://swagbook-django.herokuapp.com/facebook/"
const people_you_may_know_url = HOSTNAME + "peopleyoumayknow/"
const MEDIA_URL = "http://smartupkarimnagar.com/Newdirectory/Avinash/Swagbook/"
const cookies = new Cookies();

class User extends Component {
    
    state= {
        requested:false,
        display:'block'
    }

    _addFriend = () =>{
        let {user} = this.props;
        let auth = cookies.get('user_token');
        fetch(HOSTNAME + "friends/",{
            method:'post',
            body:JSON.stringify({
                friend:user.id,
                status:0
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
                this.setState({requested:true, request_id:response_json.id});
            }
        }).catch(e => console.log("Error in Adding Friend Request", e));
    }

    _cancelRequest =() =>{
        
        let {request_id, requested} = this.state;
        if(requested){
            let auth = cookies.get('user_token');
            let url = HOSTNAME + "friends/" + request_id +"/";
            console.log(url);
            fetch(url,{
            method:'delete',
            headers:{
                Authorization:auth
            }
            }).then((response) => {
            if (response.ok){
                this.setState({requested:false});
            }
            }).catch(e =>console.log("Error in Friend Request Cancel" ,e));
        }
        else{
            this.setState({display:'none'});
        }
    }
    
    render(){
        let {first_name, last_name, profilepicture } = this.props.user;
        let {display} = this.state;
        return(
            <div style={{display: display, marginTop:'5px'}} className="avi-white-container-h">
                <Grid>
                    <Row>
                        <Col md={3}>
                        
                        { profilepicture ?
                            <img src={ MEDIA_URL + profilepicture} className="small_circle" />
                            : <i class="fa fa-user fa-size" aria-hidden="true"></i>
                        }
                        </Col>
                        <Col md={9}>
                            <div>
                                <label className="normal_heading bold">{first_name + " "+ last_name}</label>
                                <div>
                                    { this.state.requested ?
                                        "Request sent"     :
                                        <button className="avi-button green" onClick={this._addFriend}>Add Friend</button>
                                    }   
                                    <button className="avi-button red" onClick={this._cancelRequest}>Cancel</button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export class PeopleYouMayKnow extends Component {

    state = {
        users : [],
    }

    render(){
        return(
            <div className="avi-black-container">
                <h6 className="normal_heading white bold">People You May Know</h6>
                {
                    this.state.users.map((user, index) => {
                        if(index < 5)
                            return <User user={user} key={user.id}/>
                    })
                }
            </div>
        );
    }

    componentDidMount = () =>{
        fetch(people_you_may_know_url, {
            method:'get',
            headers:{
                Authorization: cookies.get('user_token') 
            }
        }).then(function(response) {return response.json()})
        .then((resp_json) => {
            console.log(resp_json);
            this.setState({users: resp_json})
        }).catch(e => console.log(e));
    }
}