# Queued Party
This application allows users to create an account using a username, email, and password. The user instance is created in the databse (Firebase Realtime DB) and the user is then able to link their spotify account. SPOTIFY ACCOUNT IS NECESSARY TO USE THE APPLICATION. Users then have access to a common queue that can be exported to a playlist on their connected device that will take in update to the queue. All users can add to the queue and all users can see what is added to the queue.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Recreate

Must have a Firebase Realtime database account set up. This can be done at (https://firebase.google.com).

Obtain Spotify Developer API client ID. This can be done at (https://developer.spotify.com/dashboard/applications).

Open the project from the root in a text editor of your choice.

In /src/firebase.js:
Enter your firebase databse configurations.

In /src/Home/config.js:
Enter your Spotify client ID in the "clientId" variable declaration.
If you are hosting your site publically, change the "redirectUri" variable to the root directory on the hosted server.

<br>

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

## Documents

You can view the project document here: (https://drive.google.com/file/d/1kBrGfQuQvGK149E3aM2BrT80sTSoD8Te/view?usp=sharing)


