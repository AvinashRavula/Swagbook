import Cookies from "universal-cookie";
import { url } from "inspector";

const DOMAIN = "https://swagbook-django.herokuapp.com/"
const BASE_URL = DOMAIN + "facebook/"
const posts_url = BASE_URL + "posts/"
const attachments_url = BASE_URL + 'files/'
const cookies = new Cookies();

const fetchJson = async (url, method, body, headers) => {
    try{
        let response =  await fetch(url, {method:method,headers:headers, body:body});
        return { error : false, data: response.json()}
    }catch(e){
        console.log(e);
        return { error:true, cause:e};
    }
}

const _updatePost = (id, body) => {
    let auth = cookies.get('user_token');
    if( auth === null)
        return null;
    return fetchJson(posts_url + id + '/','put',body, {Authorization:auth})
}

export class M_Post {
    
    _deleteAttachment = (id) => {
        let auth = cookies.get('user_token');
        if( auth === null)
            return null;
        let response =  fetch(attachments_url + id + '/','delete', {Authorization:auth})
        return response.ok;
    }    
}


function _deleteAttachment(id) {
    let auth = cookies.get('user_token');
    if( auth === null)
        return null;
    let response =  fetch(attachments_url + id + '/','delete', {Authorization:auth})
    return response.ok;
}

export {_deleteAttachment}