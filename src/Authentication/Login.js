import React, { Component } from "react";
import '../styles/login.css';
import { Button, Grid, Row, Col } from 'react-bootstrap';
import { withRouter } from "react-router-dom";
import Cookies from 'universal-cookie';
import { Signup } from "./Signup";

const HOSTNAME = 'http://127.0.0.1:8000/facebook/'
const basic_url = HOSTNAME + 'api-basictoken-auth/';
const cookies = new Cookies();

class LoginHeader extends Component{

    state = {
        username:'',
        password:'',
    }

    _login = ({username, password}) => {
        if(username != '' && password != ''){
            console.log("username", username, "password", password);
            var formData  = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            fetch(basic_url, {
                method: 'post',
                body: formData,
                // headers:{
                //     "Access-Control-Allow-Origin": '*',
                //     "Access-Control-Allow-Origin":'Origin, X-Requested-With, Content-Type, Accept',
                // }
              }) .then(function(response) {
                return response.json();
            })
            .then((myJson) => {
                console.log(myJson);
                if ('token' in myJson){
                    // SecureStore.setItemAsync("user_token",myJson.token)
                    // .then((response) => {
                    //         console.log("navigating to mainscreen");
                    //         this.props.history.push('/');
                    // })
                    // .catch(e => console.log("Error at securestore", e));
                    var base64 = require('base-64');
                    let token = 'Basic ' + base64.encode(this.state.username + ":" + this.state.password);
                    const current = new Date();
                    const nextYear = new Date();
                    nextYear.setFullYear(current.getFullYear() + 1);
                    cookies.set('user_token', token, { path: '/', expires: nextYear });
                    this.props.history.push('/');
                    // navigate("MainScreen",{auth:token, user_id:myJson.user});           
                }
                else{
                    alert("Invalid Credentials");
                }
            })
            .catch(e => {
                console.log("Error occured in logging in..", e);});
        }
    }

    _saveUsername = (event) => {
        const {target : {value}}  = event;
        this.setState({
            username : value
        })
    }

    _savePassword = (event) => {
        const {target : {value}} = event;
        this.setState({
            password : value
        })
    }


    render(){
        return (
            <Row >
                <Col md={7}>
                    <h1 className="header-name"><i>Swagbook</i>
                    </h1>
                </Col>
                <Col md={5}>
                    <div >
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label className="label-normal">Email or Phone</label>
                                </td>
                                <td>
                                    <label className="label-normal">Password</label>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <input type="username" name="username" id="username" tabIndex="1" className="avi-input"
                                        onChange={(text) => this._saveUsername(text)}/>
                                </td>
                                <td>
                                    <input type="password" name="pass" id="pass" tabIndex="2" className="avi-input"
                                        onChange={(text) => this._savePassword(text)}/>
                                </td>
                                <td>
                                    <button className="btn-default" onClick={() => this._login(this.state)}>Login</button>
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>
                                    <a href="#">Forgotten account?</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                </Col>
            </Row>
        );
    }
}



class LoginSignup extends Component {
    
    render(){
        return(
            <div style={{height:'100%'}}>
                <br/>
                <Row>
                    <Col md={7}>
                    </Col>
                    <Col md={5}>
                        <center>
                            <Signup {...this.props}/>
                        </center>
                    </Col>
                </Row>
            </div>
        );
    }
}

class Login extends Component{

    render(){
        return(
            <Grid>
                <LoginHeader {...this.props}/>
                <LoginSignup  {...this.props}/>
            </Grid>   
        );
    }

    componentDidMount = () => {
        console.log('mounted');
        let auth = cookies.get('user_token');
        if(auth != null){
            this.props.history.push('/');
        }
    }
}

export default withRouter(Login);