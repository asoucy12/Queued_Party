import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";
import Player from "./Player";
import QueueList from "./QueueList";
import "./App.css";
import firebase from '../../firebase';

class App extends Component {
  constructor() {
    super();
    this.state = {
      userId: '',
      playlistId: '',
      songSearchText: '',
      songIdToAdd: '',
      songSearchResults: [],
      queue: [],
      currentSongDBUID: null,
      nextSongDBUID: null,
      token: null,
      device: '',
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms: 0
      },
      is_playing: "Paused",
      progress_ms: 0
    };
    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
      this.getUserID(_token);
      //load the queue
      this.getQueue(_token);
      //get device
      this.getCurrentDevice(_token);

      //this.updateQueue(_token);
      this.getCurrentlyPlaying(_token);
    }

    this.interval = window.setInterval(
      (function () {
        if (_token) {
          // Set token
          this.setState({
            token: _token
          });
          //this.updateQueue(_token);
          //set song to first in the queue
          this.getCurrentlyPlaying(_token);
        }
        console.log(this.state.item.duration_ms);
      }).bind(this),
      5000
    )
  }

  getCurrentlyPlaying(token) {
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        if (data != undefined){
          this.setState({
            item: data.item,
            is_playing: data.is_playing,
            progress_ms: data.progress_ms
          });
        }
        else {
          this.state = {
            token: null,
            item: {
              album: {
                images: [{ url: "" }]
              },
              name: "",
              artists: [{ name: "" }],
              duration_ms: 0
            },
            is_playing: "Paused",
            progress_ms: 0
          };
        }
      }
    });
  }

  getCurrentDevice(token){
    $.ajax({
      url: "https://api.spotify.com/v1/me/player/devices",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        if (data != undefined){
          console.log(data);
          if(data.devices.length > 0){
            console.log(data.devices[0].id);
            this.setState({
              device: data.devices[0].id
            });
          }
        }
      }
    });
  }

  getUserID(token){
    $.ajax({
      url: "https://api.spotify.com/v1/me",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        if (data != undefined){
          this.setState({
            userId: data.id
          });
        }
      }
    });
  }

  getQueue(token){
    const queueRef = firebase.database().ref('queue');

    queueRef.on('value', snapshot => {
      const getQueue = snapshot.val();
      console.log(getQueue);
      let ascQueue = [];
      for(let song in getQueue){
        console.log(getQueue[song].songTitleAndArtist);
        if(getQueue[song] !== undefined){
          ascQueue.push({
            //add this song to ascQueue
            songId: getQueue[song].songId,
            songTitleAndArtist: getQueue[song].songTitleAndArtist
          });
        }
      }
      this.setState({queue: ascQueue});
      console.log("Queue: " + this.state.queue[0].songTitleAndArtist)
    });
  }

  setFirstSong(token){
    $.ajax({
      url: "https://api.spotify.com/v1/me/player/play?device_id=" + this.state.device + "",
      type: "PUT",
      data: "{\"uris\":[\"spotify:track:" + this.state.queue[0].songId + "\"],\"position_ms\":0}",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        if (data != undefined){
          console.log("success: " + data);
        }
        else {
          
        }
      }
    });
  }

  updateQueue(token){
    //console.log("token: " + token);
    const queueRef = firebase.database().ref('queue');

    queueRef.on('value', snapshot => {
      const getQueue = snapshot.val();
      let ascQueue = [];
      for(let song in getQueue){
        if(getQueue[song] !== undefined){
          ascQueue.push({
            //add this song to ascQueue
            songId: getQueue[song].songId,
            songTitleAndArtist: getQueue[song].songTitleAndArtist
          });
        }
      }
      this.setState({queue: ascQueue});
    });
  }

  addSong = e =>{
    e.preventDefault();
    console.log("Add Song clicked. ID: " + e.target.title);
    //add the song to the queue
    const queueRef = firebase.database().ref('queue');
    const newSong = {
      songTitleAndArtist: e.target.innerText,
      songId: e.target.title
    }
    queueRef.push(newSong);
    //Remove children from the search list
    var ul = document.getElementById("resultsList");
    //remove all children first
    while(ul.firstChild) ul.removeChild(ul.firstChild);
    //add song to playlist
    //this.addOneSongToPlaylist(e.target.title);
    if (this.state.playlistId !== undefined && this.state.playlistId !== ''){
      this.addPlaylistSongs(this.state.token);
    }
  }

  handleSearch = e => {
    this.setState({[e.target.name]: e.target.value});
  }

  handleSearchSubmit = e => {
    e.preventDefault();
    if(this.state.songSearchText !== ''){
      //search for the song
      //set results to results
      //update the list
      $.ajax({
        url: "https://api.spotify.com/v1/search?q=" + this.state.songSearchText + "&type=track&limit=10",
        type: "GET",
        beforeSend: xhr => {
          xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
        },
        success: data => {
          if (data != undefined){
            console.log(data.tracks.items[0].id);
            let ascResults = [];
            for (var i = 0; i < 10; i++){
              ascResults.push({
                songTitle: data.tracks.items[i].name,
                songArtist: data.tracks.items[i].artists[0].name,
                songId: data.tracks.items[i].id
              })
            }
            this.setState({songSearchResults: ascResults});
            console.log(this.state.songSearchResults);

            //Now show a list of the results
            let songs = this.state.songSearchResults;
            var ul = document.getElementById("resultsList");
            //remove all children first
            while(ul.firstChild) ul.removeChild(ul.firstChild);
            for (var i = 0; i < 10; i++){
              var li = document.createElement("li");
              li.setAttribute("id", "songResult");
              li.setAttribute("title", songs[i].songId);
              li.addEventListener("click", this.addSong);
              li.appendChild(document.createTextNode(songs[i].songTitle + " by " + songs[i].songArtist));
              ul.appendChild(li);
            }

            // this.setState({
            //   item: data.item,
            //   is_playing: data.is_playing,
            //   progress_ms: data.progress_ms
            // });
          }
          else {
            //it didn't work
          }
        }
      });

      //reset search field
      this.setState({songSearchText: ''});
    }
  }

  handleCreatePlaylistClick = () => {
    console.log("Create Playlist Click");

    //create a playlist
    $.ajax({
      url: "https://api.spotify.com/v1/users/" + this.state.userId + "/playlists",
      type: "POST",
      data: "{\"name\":\"Queued Party Playlist\",\"description\":\"Queued Party\",\"public\":true}",
      beforeSend: xhr => {
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      },
      success: data => {
        if (data != undefined){
          this.setState({playlistId: data.id});
          this.addPlaylistSongs(this.state.token);
        }
      }
    });
  }

  addPlaylistSongs(token){
    this.updateQueue(token);

    //create list for adding tracks
    var tracks = '';

    this.state.queue.map((song) => 
      tracks = tracks + "spotify%3Atrack%3A" + song.songId + ","
    )

    $.ajax({
      url: "https://api.spotify.com/v1/playlists/" + this.state.playlistId + "/tracks?uris=" + tracks,
      type: "PUT",
      beforeSend: xhr => {
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      },
      success: data => {
        if (data != undefined){
          console.log(data);
        }
      }
    });
  }

  addOneSongToPlaylist(newSongId){
    $.ajax({
      url: "https://api.spotify.com/v1/playlists/" + this.state.playlistId + "/tracks?uris=spotify%3Atrack%" + newSongId,
      type: "POST",
      beforeSend: xhr => {
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
      },
      success: data => {
        if (data != undefined){
          console.log(data);
        }
      }
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {!this.state.token && (
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          )}
          {this.state.token && (
            <div>
              <Player
                item={this.state.item}
                is_playing={this.state.is_playing}
                progress_ms={this.progress_ms}
              />
              {"\n"}
              <div className="addPlaylist">
                <button className="btn btn--loginApp-link" onClick={this.handleCreatePlaylistClick}>
                  Create Playlist
                </button>
              </div>
              {"\n"}
              <QueueList />
              {"\n"}
              <div className="searchsong">
                <div className="main-wrapper">
                  <h1>Add a song:</h1>
                  {"\n"}
                  <form className="send-song" onSubmit={this.handleSearchSubmit}>
                    <input type="text" name="songSearchText" id="searchText" value={this.state.songSearchText} onChange={this.handleSearch} placeholder='Search for a song' />
                  </form>
                  {"\n"}
                  <div className="container">
                    <ul className='result-list' id='resultsList'>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
      </div>
    );
  }
}

export default App;