# Realtime Collaborative Code Editor
This is a realtime collaborative (multiple users) code editor built using React, Node.js, Express and Socket.io.

## Features
- Multiple users can join a room and edit code together
- Changes are reflected in real time
- Copy button to copy the room id to clipboard
- Leave button to leave the room
- Supports syntax highlighting
- Users can leave the room and rejoin later to continue editing
- Joining & leaving of users is also reflected in real time

## Run Locally
- Clone this repository and cd into it
- Run `npm install` to install the dependencies
- To start the server run `yarn server:dev` in another terminal
- Then run `yarn start` to run the application
- Go to `http://localhost:3000` to view the app
- To join as an another user open another browser or incognito tab and go to `http://localhost:3000`
- Enter the same room id to join the same room

Now both your editor will be synced and you can see the changes in real time. Try opening the same room in multiple tabs and see the changes.

## Demo
[![Watch the video](public/Code%20Sync%20Thumbnail.png)](https://youtu.be/mIfwBf06Cng)