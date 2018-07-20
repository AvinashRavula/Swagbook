import React, { Component } from "react";
import { Button, Grid, Row, Col } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { withRouter } from "react-router-dom";
import Cookies from 'universal-cookie';
import { Signup } from "./Signup";

import '../styles/login.css';
import '../styles/common.css';
import { InputLabelField } from "../ProfileComponents/About";

const HOSTNAME = 'https://swagbook-django.herokuapp.com/facebook/'
const basic_url = HOSTNAME + 'api-basictoken-auth/';
const auth_key = "Basic YXZpbmFzaDpyYXZ1bGFAMTIyOQ=="

const cookies = new Cookies();

const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
};

Modal.setAppElement('#root')


class LoginHeader extends Component{

    constructor() {
        super();
    
        this.state = {
            username:'',
            password:'',
            modalIsOpen: false
        };
    
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }
    
    afterOpenModal() {
        // references are now sync'd and can be accessed.
        this.subtitle.style.color = '#f00';
    }

    closeModal() {
        this.setState({modalIsOpen: false});
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

    findUser = () =>
    {
        let url = HOSTNAME + "findUser?key="+this.state.email_or_phonenum
        console.log(url);
        fetch(url,{
        method:'get',
        headers:{
            Authorization: auth_key
        }
        }).then(function(response) {return response.json()})
        .then((myJson) => {
            console.log(myJson);
            if('id' in myJson){
                this.setState({username : myJson.username})
            }
            else{
                alert("User not found");
            }
        }).catch(e =>{
        console.log(e);
        });
    }

    _saveNewPassword = (event) => {
        this.setState({new_pwd: event.target.value});
    }

    _saveForgetEmail =(event) => {
        this.setState({email_or_phonenum: event.target.value});
    }

    changePassword = () =>
    {
        
        let url = HOSTNAME + "users/"+this.state.username
        console.log(url);
        var formData = new FormData();
        formData.append('password',this.state.new_pwd);
        formData.append('username',this.state.username);
        console.log(formData);
        fetch(url,{
            method:'put',
            body:formData,
            headers:{
            Authorization: auth_key
            }
        }).then(function(response) {return response.json()})
        .then((myJson) => {
            if('id' in myJson){
                alert("Successfully changed password");
            }
            else{
                alert("Cannot change the password");
            }
            this.closeModal();
        }).catch(e =>{
            console.log(e);
        });
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
                                    <a href="#" onClick={this.openModal}>Forgotten account?</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <Modal
                        isOpen={this.state.modalIsOpen}
                        onAfterOpen={this.afterOpenModal}
                        onRequestClose={this.closeModal}
                        style={customStyles}
                        contentLabel="Example Modal"
                        >
                        <h2 ref={subtitle => this.subtitle = subtitle} className="black">Forgot Password</h2>
                        <div className="avi-black-container">
                            {/* <button onClick={this.closeModal}>close</button> */}
                            <label>Email</label>
                            <input type="text" className="avi-input" onBlur={this.findUser}
                                onChange={this._saveForgetEmail}/>
                            <label>Password</label>
                            <input type="password" className="avi-input" onChange={this._saveNewPassword}/>
                            <button className="btn btn-success" onClick={this.changePassword}>Update</button>
                        </div>
                    </Modal>
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