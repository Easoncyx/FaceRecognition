import React, {Component} from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'
// import { userInfo } from 'os';

const app = new Clarifai.App({
  apiKey: '27eacd2ad55644f096f5b2925ecbfdcc'
 });
 

const particleOptions={
  particles:{
    number:{
      value:100,
      density:{
        enable:true,
        value_area: 800
      }
    }
  }
}
class App extends Component{
  constructor(){
    super();
    this.state ={
      input:'',
      imageUrl:'',
      boxes:[],
      route: 'signin',
      isSignedin: false,
      user:{
        id:'',
        name:'',
        email:'',
        entries:0,
        joined:''
      }
    }
  }

  loadUser=(data)=>{
    console.log(data)
    this.setState({user:{
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }
  calculateFaceLocation = (data) => {
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    const listOfBoxes = [];
    const numFace = data.outputs[0].data.regions.length;
    for(var i = 0; i < numFace; i++){
      const clarifaiFace = data.outputs[0].data.regions[i].region_info.bounding_box;
      listOfBoxes.push({ 
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      })
    }
    console.log(listOfBoxes);
    return listOfBoxes;
  }
  displayFaceBox = (box) =>{
    console.log(box)
    this.setState({boxes: box})
  }

  onInputChange=(event)=>{
    this.setState({input: event.target.value})
  }
  onButtonSubmit=(event)=>{
    this.setState({imageUrl:this.state.input})
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then( response => { this.displayFaceBox(this.calculateFaceLocation(response)) })
      .catch( err =>{ console.log(err)})
  }
  onRouteChange = ( route ) =>{
    if(route === 'home'){
      this.setState({isSignedin: true});
    }
    else{
      this.setState({isSignedin: false});
    }
    this.setState({route: route});
  }
  render() {
    var content;
    if(this.state.route === 'home'){
      content =
      <div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries} />
        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
        <FaceRecognition imageUrl={this.state.imageUrl} boxes={this.state.boxes} />
      </div>;
    }
    else if(this.state.route === 'register'){
      content = <Register onRouteChange={this.onRouteChange} />
    }
    else{
      content = <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
    }
    return(
      <div className="App">
        <Particles className='particles' params={particleOptions} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedin} />
        {content}
      </div>
    )
  };
}

export default App;
