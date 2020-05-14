import React from 'react';
import firebase from '../../firebase';

class QueueList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      songs: []
    }
  }

  componentDidMount(){
    const queueRef = firebase.database().ref('queue');
    queueRef.on('value', snapshot => {
      const getQueue = snapshot.val();
      let ascQueue = [];
      for(let song in getQueue){
        if(getQueue[song].message !== ''){
          ascQueue.push({
            songId: getQueue[song].songId,
            songTitleAndArtist: getQueue[song].songTitleAndArtist,
          });
        }
      }
      const songs = ascQueue;
      this.setState({songs});
    });
  }

  render(){
    return(
      <div className="queueList">
        <h1>Queue</h1>
        <ul className='queue-list'>
          {this.state.songs.map(song => {
            return(
              <li key={song.songId}>
                {song.songTitleAndArtist}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default QueueList;