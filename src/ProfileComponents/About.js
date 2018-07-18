import React,{ Component } from "react";
import { Row, Col , Grid} from "react-bootstrap";
import Cookies from "universal-cookie";

const DOMAIN = "http://127.0.0.1:8000/"
const BASE_URL = DOMAIN + "facebook/"
const profile_url = BASE_URL + "v2/profiles/"
const cookies = new Cookies();

const InputLabelField = (props) => {

    return(
            <Row>
                <Col md={4}>
                    <label for={props.for ? props.for : 'input'}>{props.label}</label>
                </Col>
                <Col md={8}>
                    <input type={props.type} width="100%" 
                        onBlur={props.onBlur ? props.onBlur : null} 
                        onChange={props.onChange ? props.onChange : null }
                        value={props.value ? props.value : ''}/>
                </Col>
            </Row>
    )
}

export class About extends Component {

    state = {
        nick_name : '',
        dob:'',
        born_place:'',
        languages_known:''
    }

    _saveNickName = (event) => {
        this.setState({nick_name: event.target.value});
    }

    _saveDob = (event) => {
        this.setState({dob: event.target.value});
    }

    _saveBornPlace = (event) => {
        this.setState({born_place: event.target.value});
    }

    _saveLanguagesKnown = (event) => {
        this.setState({languages_known: event.target.value});
    }

    _saveAbout = () => {
        let {nick_name, dob, born_place, languages_known} = this.state;
        console.log(nick_name, dob, born_place, languages_known);
        let auth = cookies.get('user_token');
        let {profile} = this.props.user;
        let url = profile_url + profile.id + '/';
        console.log(url);
        fetch(url, {
            method:'put',
            body: JSON.stringify({
                nick_name:nick_name,
                languages_known:languages_known,
                dob:dob,
                born_place:born_place
            }),
            headers:{
                Accept: 'application/json',
                'Content-Type':'application/json',
                Authorization:auth
            }
        }).then((response) => {return response.json()})
        .then((resp_json) => {
            console.log(resp_json);
            if('id' in resp_json){
                alert('updated');
            }
        })
    }

    render() {
        let {nick_name, dob, born_place, languages_known} = this.state
        return (
            <center>
                <div style={{width:'50%'}}>
                    <InputLabelField label="Nick Name" type="text" value={nick_name}
                        onChange={this._saveNickName}/>
                    <InputLabelField label="Date Of Birth" type="text" value={dob}
                        onChange={this._saveDob}/>
                    <InputLabelField label="Born Place" type="text" value={born_place}
                        onChange={this._saveBornPlace}/>
                    <InputLabelField label="Languages Known" type="text" value={languages_known}
                        onChange={this._saveLanguagesKnown}/>
                    <button className="btn btn-success a-small" style={{float:'right'}}
                        onClick={this._saveAbout}>Save changes</button>
                </div>
            </center>
        );
    }

    componentDidMount = () => {
        let {nick_name, dob, born_place, languages_known} = this.props.user.profile
        this.setState({
            nick_name:nick_name,
            dob:dob,
            born_place:born_place,
            languages_known:languages_known
        })
    }
}