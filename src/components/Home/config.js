export const authEndpoint = "https://accounts.spotify.com/authorize";

export const clientId = ""; //client ID provided by Spotify
export const redirectUri = "http://localhost:3000";
export const scopes = [
    "user-top-read",
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-modify-playback-state",
    "playlist-modify-public",
    "playlist-modify-public",
    "playlist-read-private",
    "playlist-read-collaborative"
];