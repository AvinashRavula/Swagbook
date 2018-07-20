import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import { Button, Grid, Row, Col } from 'react-bootstrap';

import '../styles/login.css';
import '../styles/signup.css';
import '../styles/common.css';

const HOSTNAME = 'https://swagbook-django.herokuapp.com/facebook/'
const basic_url = HOSTNAME + 'api-basictoken-auth/';
const auth_key = "Basic YXZpbmFzaDpyYXZ1bGFAMTIyOQ=="
const cookies = new Cookies();
export class Signup extends Component {

    state = {
        first_name:'',
        last_name:'',
        email:'',
        phone_num:'',
        password:'',
        date:'',
        month:'',
        year:'',
        gender:'',
    }

    validateEmail = () =>
    {
        console.log("validateEmail function called");
        fetch(`${HOSTNAME}duplicate_email/?email=${this.state.email}`,
        {
            method:'GET',
            headers:{
                Authorization: auth_key
            }
        }).then(function(response){
            return response.json()
        }).then((myJson) =>
        {
            console.log("EMail json : ", myJson);
            if( myJson.email == 'invalid'){
                this.setState({validEmail:false});
                alert("Email already exists.")
            }
            else{
                this.setState({validEmail:true});
            }
        }).catch(e => {console.log(e)});
    }

    validatePhoneNum =() =>
    {
        console.log("validatePhonenum function called");
        fetch(`${HOSTNAME}duplicate_phonenum/?phonenum=${this.state.phone_num}`,
        {
            method:'GET',
            headers:{
                Authorization:auth_key
            }
        }).then(function(response){
            return response.json()
        }).then((myJson) =>
        {
            console.log("Phonenum json : ", myJson);
            if( myJson.phonenum == 'invalid'){
                this.setState({validPhonenum:false});
                alert("Phonenum already exists.")
            }
            else{
                this.setState({validPhonenum:true});
            }
        }).catch(e => {console.log(e)});
    }

    validateForm = () => {
        let {first_name, last_name, validEmail, password, validPhonenum, date, year, month, gender} = this.state;
        if (first_name.length > 3 && last_name.length > 3 && validEmail && 
            validPhonenum && password.length >= 8 && date != '' && month != ''
            && year != '' && gender != '')
            return true;
        return false;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        console.log('signup called');
        if(this.validateForm()){
            let {first_name, last_name, email, password, phone_num, date, year, month, gender} = this.state;
            let user_id = '0';
            console.log("validateForm return true");
            var formData = new FormData();
            formData.append('username',email);
            formData.append('first_name', first_name);
            formData.append('last_name',last_name);
            formData.append('email', email);
            formData.append('password', password);
            fetch(HOSTNAME + 'users',
            {
                method:'post',
                body:formData,
                headers:{
                    Authorization:auth_key
                }
            }).then(function(response) {
                console.log(response);
                return response.json();
            })
            .then((myJson) =>{
                console.log('user fetched : ',myJson);
                if ('id' in myJson)
                {
                    user_id = myJson.id;
                    var profileData = new FormData();
                    profileData.append('nick_name', '');
                    profileData.append('dob', year + '-' + month + '-' + date);
                    profileData.append('phonenum', phone_num);
                    profileData.append('gender', gender);
                    profileData.append('born_place', '');
                    profileData.append('languages_known', '');
                    profileData.append('relationship_status', '');
                    profileData.append('user', user_id);
                    fetch(HOSTNAME + 'profiles',
                    {
                        method:'POST',
                        headers:{
                            'Authorization':auth_key
                        },
                        body:profileData,
                    }).then(function(response){
                        return response.json()
                    }).then((myJson) => {
                        console.log("profile : ",myJson);
                        var base64 = require('base-64');
                        let token = 'Basic ' + base64.encode(email + ":" + password);
                        cookies.set('user_token', token, { path: '/',expires: new Date(Date.now()+2592000) });
                        this.props.history.push('/');
                    }).catch(e => console.log("Error creating profile"));
                }
            }).catch(e => console.log("Error creating User"));
        }
        else{
            alert('Please fill all the details');
        }
        console.log('signup exited');
    }

    _saveFirstName = (event) => {
        this.setState({first_name:event.target.value})
    }
    _saveLastName = (event) => {
        this.setState({last_name:event.target.value})
    }
    _saveEmail = (event) => {
        this.setState({email:event.target.value})
    }
    _savePhoneNum = (event) => {
        this.setState({phone_num:event.target.value})
    }
    _savePassword = (event) => {
        this.setState({password:event.target.value})
    }
    _saveDate = (event) => {
        this.setState({date:event.target.value})
    }
    _saveMonth = (event) => {
        this.setState({month:event.target.value})
    }
    _saveYear = (event) => {
        this.setState({year:event.target.value})
    }
    _saveGender = (event) => {
        console.log(event.target.value);
        this.setState({gender:event.target.value})
    }

    render(){
        let days = 31, months = 12, startYear = 1905, currentYear= new Date().getFullYear();
        let currentMonth = new Date().getMonth();
        let currentDate = new Date().getDate();
        let dayOptions = [], monthOptions = [], yearOptions=[];
        for (let i = 1; i <= days; i++) {
            // if( i === currentDate)
            //     dayOptions.push(<option value={"" + (i)} selected>{i}</option>)
            // else
                dayOptions.push(<option value={"" + (i)} key={i}>{i}</option>);
        }
        for (let i = 1; i <= months; i++) {
            // if( i === currentMonth)
            //     monthOptions.push(<option value={"" + (i)} selected>{i}</option>)
            // else
                monthOptions.push(<option value={"" + (i)} key={i}>{i}</option>);
        }
        for (let i = startYear; i < currentYear; i++) {
            // if( i === currentYear - 25)
            //     yearOptions.push(<option value={"" + (i)} selected>{i}</option>)
            // else
                yearOptions.push(<option value={"" + (i)} key={i}>{i}</option>);
        }

        return(
            <div className="avi-white-container">
                <h1 className="bold normal-heading">Create an account</h1>
                
                <form method="post" onSubmit={this.handleSubmit} className="avi-black-container">
                    <div className="form-group">
                    <Row>
                        <Col md={6}>
                            <input type="text" className="avi-input" placeholder="First Name"
                                    onChange={this._saveFirstName}/>
                        </Col>
                        <Col md={6}>
                            <input type="text" className="avi-input" placeholder="Sur Name"
                                    onChange={this._saveLastName}/>
                        </Col>
                    </Row>
                    </div>
                    <div className="form-group">
                        <input type="text" className="avi-input" placeholder="Email Address"
                                onChange={this._saveEmail} onBlur={this.validateEmail}/>
                    </div>
                    <div className="form-group">
                        <input type="text" className="avi-input" placeholder="Phone Number"
                                onChange={this._savePhoneNum} onBlur={this.validatePhoneNum}/>
                    </div>
                    <div className="form-group">
                        <input type="password" className="avi-input" placeholder="New Password"
                                onChange={this._savePassword}/>
                    </div>
                    <div className="form-group">
                        <label className="white normal-heading bold">Birthday</label>
                        <table style={{ borderRight: '1px solid #e9ebee', margin:'0px'}}>
                            <tbody>
                                <tr>
                                    <td style={{ borderRight: '1px solid transparent'}}>
                                        <select name="day" onChange={this._saveDate}>
                                            <option value="">Day</option>
                                            {dayOptions}
                                        </select>
                                    </td>
                                    <td style={{ borderRight: '1px solid transparent'}}>
                                        <select name="month" onChange={this._saveMonth}>
                                            <option value="">Month</option>
                                            {monthOptions}
                                        </select>
                                    </td>
                                    <td style={{ borderRight: '1px solid transparent'}}>
                                        <select name="year" onChange={this._saveYear}>
                                            <option value="">Year</option>
                                            {yearOptions}
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <label className="white normal-heading bold">Gender</label><br/>
                        <label className="white"><input type="radio" name="gender" value="Male"
                            onChange={this._saveGender}/>Male</label>
                        &nbsp;&nbsp;&nbsp;
                        <label className="white"><input type="radio" name="gender" value="Female" 
                            onChange={this._saveGender}/>Female</label>
                        <br/>
                        <Button bsStyle="success" type="submit" style={{width:'200px',fontSize:'20px'}}>Sign Up</Button>
                    </div>
                </form>
            </div>
        );
    }
}
