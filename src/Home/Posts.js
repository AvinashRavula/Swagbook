import React, { Component } from "react";
import Cookies from "universal-cookie";
import { Row, Col, Grid, DropdownButton, MenuItem } from "react-bootstrap";
import InfiniteScroll from 'react-infinite-scroller';
import '../styles/posts.css'
import '../styles/common.css'

const HOSTNAME = "http://127.0.0.1:8000/facebook/"
const POSTS_URL = HOSTNAME + "posts/"
const FILE_URL = HOSTNAME + "files/"

const DOMAIN = "http://127.0.0.1:8000/"
const BASE_URL = DOMAIN + "facebook/"
const ATTACHMENTS_URL = BASE_URL + 'files/'
const MEDIA_URL = "http://smartupkarimnagar.com/Newdirectory/Avinash/Swagbook/"
const proxyUrl = 'https://avi-cors.herokuapp.com/'
const UPLOAD_URL = MEDIA_URL +  "upload.php";
const cookies = new Cookies();

export class NewPost extends Component {

    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
    }

    state= {
        files:[],
        caption:'',
    }

    _openFileDialog = (e) => {
        this.inputOpenFileRef.current.click();
    }

    _uploadAttachment = (file) => {
        let auth = cookies.get('user_token');
        if(auth !== null){
            let formBody = new FormData();
            formBody.append('fileToUpload', file);
            fetch(proxyUrl +  UPLOAD_URL,{
                method:'post',
                body:formBody
            }).then((response)=>{return response.json()})
            .then((resp_json) => {
                console.log(resp_json);
                if(!resp_json.error){
                    let temp = this.state.files;
                    let newFile = {
                        uri: resp_json.file,
                        type:file.type
                    }
                    temp.push(newFile);
                    this.setState({files:temp});
                }
            }).catch(e => {
                console.log("error in uploading attachment",e);
                alert('Technical Error: Please refresh the page and try again');
            });
        }
    }

    _onChangeFile = (event) => {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        console.log(file);
        this._uploadAttachment(file);
    }

    _saveCaption = (event) => {
        this.setState({caption: event.target.value});
    }
    
    _submitPost = () => {
        let {caption} = this.state;
        let auth = cookies.get('user_token');
        fetch(POSTS_URL, {
            method:'post',
            body:JSON.stringify({
            captions: caption
            }),
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json',
                Authorization : auth
            }
        }).then(function(response){  return response.json()})
        .then((myJson) =>{
            console.log('post response in new post ',myJson)
            if ('id' in myJson){
            // if(this.state.files.length > 0){
                this.state.files.map((file) =>{
                    console.log("file is ", file);
                    let fileBody = new FormData();
                    fileBody.append('file', file.uri);
                    fileBody.append('type', file.type);
                    fileBody.append('post', myJson.id);
                    fetch( FILE_URL , {
                        method: 'post',
                        headers: {
                            Authorization: auth
                        },
                        body: fileBody,
                    }).then(function(response) {
                        return response.json()
                    }).then((resp) => {
                        console.log("resp ",resp);
                        alert("posted file");        
                    }).catch(e => console.log(e));
                })
            // }
            // else{
                alert("Posted");
            // }
            }
            else{
                alert("failed to create a post");
            }
        }).catch(e => { console.log("POST", e)})
    }

    render(){
        let {files} = this.state;
        return(
            <div style={{marginBottom:'10px'}}>
                <div className="avi-black-container">
                    <label className="white bold">Compose Post</label>
                    <div className="form-group">
                        <div className="" style={{marginTop:'5px'}}>
                            <textarea className="avi-input" rows="2" id="comment" onChange={this._saveCaption}
                                placeholder="Write something here...">
                            </textarea>
                            {
                                files && files.map((file, index) => {
                                    return <img src={MEDIA_URL + file.uri} width="56px" height="56px" style={{margin:'5px'}} key={index}/>
                                })  
                            }
                        </div>
                        <Grid>
                            <Row>
                                <Col md={10}>
                                    <input type="file" id="file" ref={this.inputOpenFileRef} style={{display:'none'}}
                                        onChange={this._onChangeFile}/>
                                    <button className="avi-button" onClick={this._openFileDialog}>+Add Photo/Video</button>
                                </Col>
                                <Col md={2}>
                                    <button className="avi-button" onClick={this._submitPost}>POST</button>
                                </Col>
                            </Row>
                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}

const VideoComponent = (props) => {
    return (
        <video width="400" controls>
            <source src="mov_bbb.mp4" type="video/mp4"/>
            <source src="mov_bbb.ogg" type="video/ogg"/>
            Your browser does not support HTML5 video.
        </video>
    );
}

class Attachment extends Component {

    state = {
        display: true
    }
    printAuthError = () => {
        console.log('Auth is null');
    }

    _deleteAttachment = (id) => {
        let auth = cookies.get('user_token');
        if( auth === null){
            this.printAuthError();
            return;
        }
        let response =  fetch(ATTACHMENTS_URL + id + '/',{
            method:'delete', 
            headers:{Authorization:auth},
        }).then((response) => {
            if(response.ok)
                this.setState({display:false});   
            else 
                console.log("attachment not deleted")
        }).catch(e => console.log(e));
    }    

 
    render(){
        let {attachment, editMode} = this.props;
        let {display} = this.state;
        return(
            <div style={{marginTop:'5px', display: display? 'block': 'none'}}>
                {
                    editMode ? 
                        <button className="btn btn-link" onClick={() => this._deleteAttachment(attachment.id)}>Delete </button>
                        : null
                }
                
                {
                attachment.type.includes('image') ?
                    <img src={ MEDIA_URL + attachment.file} width={'100%'}height={'100%'}/>
                    :
                    // <p>Video</p>
                    <video width="400" controls width={'100%'}height={'100%'}>
                        <source src={MEDIA_URL + attachment.file} type={attachment.type}/>
                        Your browser does not support HTML5 video.
                    </video>
                }
            </div>
        );
    }
}

class Post extends Component{
    
    constructor(props) {
        super(props);
        this.inputOpenFileRef = React.createRef();
    }

    state = {
        displayValue: 'block',
        editMode: false,
        attachments:[],
        captions:'',
        isLiked:false,
        showCommentSection:false,
        likes_ids:'',
        comments:[]
    }

    _openFileDialog = (e) => {
        this.inputOpenFileRef.current.click();
    }

    _deletePost = () =>
    {
        let {post} = this.props;
        let auth_token = cookies.get('user_token');
        fetch(POSTS_URL + post.id + '/' ,{
            method:'delete',
            headers:{
                Authorization : auth_token
            }
        })
        .then((response) => { 
            if (response.ok){
                alert("Deleted");
                this.setState({displayValue:'none'});
            }
        })
        .catch(e=>{console.log('Error in deleting the post', e)});
    }

    _uploadAttachment = (id, file) => {
        let auth = cookies.get('user_token');
        if(auth !== null){
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
                    formData.append('file',resp_json.file);
                    formData.append('type',file.type);
                    formData.append('post', id);
                    fetch(ATTACHMENTS_URL ,{
                        method:'post',
                        headers:{
                            Authorization:auth
                        },
                        body:formData
                    }).then((response) => {return response.json()})
                    .then((resp_json) => {
                        if('id' in resp_json){
                            let attachments = this.state.attachments;
                            attachments = attachments.concat(resp_json);
                            this.setState({attachments:attachments});
                        }
                    }).catch(e=>console.log("Error uploading attachment",e));
                }
            }).catch(e => {
                console.log("error in uploading attachment",e);
                alert('Technical Error: Please refresh the page and try again');
            });
        }
    }
    
    _onChangeFile = (event) => {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        console.log(file);
        let {post} = this.props;
        this._uploadAttachment(post.id, file);
    }
    
    _editPost = () => {
        this.setState({editMode: true});
    }

    _changeMode = () => {
        console.log('changing mode to ', ! this.state.editMode)
        this.setState((prevState) => ({
            editMode: !prevState.editMode
        }));
    }
 
    _saveCaption = (event) => {
        console.log(event.target.value);
        this.setState({captions: event.target.value});
    }

    _uploadCaption = (id) => {
        let auth = cookies.get('user_token');
        fetch(POSTS_URL + id + '/',{
            method:'put',
            headers:{
                Accept : 'application/json',
                'Content-Type': 'application/json',
                Authorization:auth
            },
            body : JSON.stringify({
                captions: this.state.captions
            })
        }).then(function(response) {return response.json()})
        .then((resp_json) => {
            if('id' in resp_json){
                console.log("caption updated");
            }
        }).catch(e => console.log("Error at updating caption", e));
    }

    _like_unlike = () =>
    {
        let {post} = this.props;
        let auth_token = cookies.get('user_token');
        let url = ""
        if (!this.state.isLiked){
            url = HOSTNAME + "posts/" + post.id + "/like";
        }
        else{
            url = HOSTNAME + "posts/" + post.id + "/unlike";
        }
        fetch(url,{
            method:'PUT',
            headers:{
                Authorization : auth_token
            }
        }).then(function(response){return response.json()})
        .then((response_json) => {
            console.log(response_json);
            if ('id' in response_json){
                this.setState((prevState) => ({
                    likes_ids:response_json.likes_ids,
                    comments: response_json.comments,
                    captions:response_json.captions,
                    isLiked:!prevState.isLiked
                }))
                // this.props.updateLikes(post_index,response_json.likes_ids);
                console.log("Thanks for liking");
            }
            else{
                console.log("Like Operation failed");
            }
        }).catch(e => console.log(e));
    }

    _comment = () =>
    {
        let {post} = this.props;
        let auth_token = cookies.get('user_token');
        let url = HOSTNAME + "comments/";
        fetch(url,{
            method:'post',
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
                Authorization:auth_token
            },
            body:JSON.stringify({
                comment_text:this.state.comment_text,
                post:post.id
            })
        }).then(function(response) {return response.json()})
        .then((response_json) => {
            console.log(response_json);
            if ('id' in response_json)
            {
                console.log("Comment added");
                this.setState({showCommentSection:false});
            }
            else{
                console.log("Comment adding failed");
            }
        }).catch(e=> console.log(e));
    }

    _showComment = () => {
        this.setState((prevState) => ({showCommentSection:!prevState.showCommentSection}))
    }

    _share = () =>  
    {
        alert("Oops! This feature is under development");
    }

    _saveCommentText = (event) => {
        this.setState({comment_text: event.target.value});
    }

    render(){
        let {post, user_id} = this.props;
        let {displayValue, editMode, attachments, captions, isLiked, comments,
             showCommentSection, likes_ids} = this.state;
        return(
              <div style={{marginBottom:'10px',display:displayValue}}>
                <div>
                    <div className="post-top">
                        <Row>
                            <Col md={7}>
                                <img src={MEDIA_URL + post.profile_picture} className="extra-small-circle"/>
                                &nbsp;&nbsp;&nbsp;
                                {post.first_name + " "+ post.last_name}
                                {editMode ? "(editing)" : ""}
                            </Col>
                            <Col md={5}>
                                {
                                    (post.user == user_id) ? editMode ? 
                                        <center>
                                            <button className="btn btn-success a-small" onClick={this._changeMode} >Done</button>
                                            &nbsp;&nbsp;&nbsp;
                                            <input type="file" id="file" ref={this.inputOpenFileRef} style={{display:'none'}}
                                                onChange={this._onChangeFile}/>
                                            <button className="btn btn-info a-small" onClick={this._openFileDialog} >Add Photo/Video</button>
                                        </center>
                                        :   
                                        <div className="dropdown">
                                            <p className="a-drop-button" data-toggle="dropdown">...</p>
                                            <div className="dropdown-menu">
                                                <a className="dropdown-item" onClick={this._editPost}>Edit</a>
                                                <a className="dropdown-item" onClick={this._deletePost}>Delete</a>
                                            </div>
                                        </div>
                                        : null
                                }
                                
                            </Col>
                        </Row>
                    </div>
                    <div className="post-middle" style={{paddingBottom:'0px'}}>
                        {
                            editMode ? 
                                <textarea className="avi-input" rows="2" id="caption" onChange={this._saveCaption}
                                    placeholder="Write something here..." onBlur={() => this._uploadCaption(post.id)}>
                                    {captions}
                                </textarea>
                                :   
                                <p>{captions}</p>
                        }
                        {
                            // Newly added attachments on Edit Post
                            attachments.map((attachment)=>{
                                return <Attachment attachment={attachment} key={attachment.id} editMode={editMode}/>
                            })
                        }
                        {
                            //Already added attachments of current post
                            post && post.attachments.map((attachment) =>{
                                return <Attachment attachment={attachment} key={attachment.id} editMode={editMode}/>
                            })
                        }
                        
                    
                    {
                        <div style={{margin:'10px', marginBottom:'0px'}}>
                            <label className="a-small">
                                { likes_ids ? likes_ids.split(',').length + " Likes" : 'Be the first to Like'}
                            </label>
                            <label style={{float:'right', marginBottom:'0px'}} className="a-small">
                            {
                                comments.length + " Comments"
                            }
                            </label>
                        </div>
                    }
                    </div> 
                    <div className="post-bottom">
                        <Row>
                            <Col md={4}>
                                <center>
                                    <button className="btn btn-link a-small" onClick={this._like_unlike}>
                                    {
                                        isLiked ? "Liked" : "Like"
                                    }
                                    </button>
                                </center>
                            </Col>
                            <Col md={4}>
                                <center>
                                    <button className="btn btn-link a-small" onClick={this._showComment}>Comment</button>
                                </center>
                            </Col>
                            <Col md={4}>
                                <center>
                                    <button className="btn btn-link a-small" onClick={this._share}>Share</button>
                                </center>
                            </Col>
                        </Row>
                        
                            {
                                showCommentSection ? 
                                    <div className="post-bottom comment-section">
                                        <center>
                                            <input type="text" style={{width:'90%'}} placeholder="Enter comment"
                                                onChange={this._saveCommentText} className="avi-input"/>
                                        </center>
                                        <button className="btn btn-success a-small" style={{float:'right', margin:'5px'}} 
                                            onClick={this._comment}>Add Comment</button>
                                    </div>
                                    :
                                    null
                            }
                            
                        
                    </div>
                    
                </div>
            </div>
        );
    }

    componentDidMount = () =>{
        let {post, user_id} = this.props;
        let temp_likes_ids = post.likes_ids ? post.likes_ids.split(',') : [];
        let isLiked = temp_likes_ids.indexOf(user_id.toString()) >= 0;
        this.setState({
            captions: post.captions,
            likes_ids: post.likes_ids,
            comments:post.comments,
            isLiked: isLiked
        });
    }
}

export class AllPosts extends Component {

    state = {
        posts: []
    }

    _fetchPosts = (url) => {
        let auth = cookies.get('user_token');
        if(url !== null){
            fetch(url,{
                method:'get',
                headers:{
                    Authorization: auth
                }
            }).then(function(response) {return response.json()})
            .then((resp_json) =>{
                console.log(resp_json);
                let tempPosts = this.state.posts;
                tempPosts = tempPosts.concat(resp_json.results);
                this.setState({
                    posts: tempPosts,
                    next:resp_json.next,
                    previous: resp_json.previous,
                })
            }).catch(e => console.log("Error at fetching posts", e));
        }
    }

    _refreshPosts = () => {
        this.setState((prevState) => ({
            posts: []
        }));
        this._fetchPosts(POSTS_URL);
    }

    render(){
        let {user_id} = this.props;
        let {posts} = this.state;
        return(
            // <div style={{marginBottom:'10px'}}>
            // {
            //     posts && posts.map((post) =>{
            //         return <Post post={post} key={post.id}/>
            //     })
            // }
            // </div>
            
                <InfiniteScroll
                    pageStart={0}
                    loadMore= {() => this._fetchPosts(this.state.next)}
                    hasMore={true || false}
                    loader={<div className="loader" key={0}>Loading ...</div>}
                    useWindow={false}
                >
                    {
                        posts && posts.map((post) =>{
                            return <Post post={post} key={post.id} user_id={user_id}/>
                        })
                    }
                </InfiniteScroll>
            
        );
    }

    componentDidMount = () => {
        this._refreshPosts();
    }
}