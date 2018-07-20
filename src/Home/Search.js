import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import { Redirect } from "react-router-dom";
 
const DOMAIN = "https://swagbook-django.herokuapp.com/"
const BASE_URL = DOMAIN + "facebook/"
const user_search_url = BASE_URL + "search_users/?query="
const cookies = new Cookies();
export class SearchUsers extends Component {

    state={
        users:[],
        redirectId:null,
    }

    _searchUser = (text) => {
        console.log("Text is ", text);
        let user_token = cookies.get('user_token');
        if(text == '')
        {
            this.setState({users:[]});
            return;
        }
        if(user_token != null && text != ''){
            fetch(user_search_url + text,{
                method:'get',
                headers:{
                    Authorization: user_token,
                }
            }).then(function(response) {return response.json()})
            .then((resp_json) =>{
                console.log(resp_json);
                this.setState({users:resp_json});
            }).catch(e => {console.log("Error occured at search api")});
        }
    }

    _openProfile = (id) =>{
        this.setState({
            redirectId:id
        })
    }

    render(){
        let {users, redirectId} = this.state;
        return(
            redirectId ? <Redirect to={"/profile/" + redirectId}/>
             : <div className="dropdown">
                <input type="text"  data-toggle="dropdown" 
                    onChange={(event) => this._searchUser(event.target.value)}
                    placeholder="Search..." className="avi-input"/>
                <div className="dropdown-menu">
                    {
                        users.map((user)=>{
                            return <a className="dropdown-item" onClick={() => this._openProfile(user.id)}>
                                        {user.first_name + " " + user.last_name}
                                    </a>
                        })
                    }
                </div>
            </div>
        )
    }
}