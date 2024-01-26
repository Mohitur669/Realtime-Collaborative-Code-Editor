# Sync Code: Realtime Collaborative Code Editor

## Introduction
Are you tired of sending code snippets back and forth, struggling to debug and collaborate with your team? Look no further! **Sync Code** is here to revolutionize the way you code together. This powerful and intuitive collaborative code editor is designed to empower developers, and teams to work seamlessly in real-time, regardless of their location. With **Sync Code**, you can code together, debug together, and ship faster, together.

## Features
- Multiple users can join a room and edit code together
- Changes are reflected in real time
- Copy button to copy the room id to clipboard
- Leave button to leave the room
- Supports syntax highlighting (currently only for JavaScript)
- Users can leave the room and rejoin later to continue editing
- Joining & leaving of users is also reflected in real time

### Prerequisites
- Node.js (v20.11.0)
- yarn (v1.22.21)

I have used nvm (v0.39.7) to manage my node versions. View nvm official [documentation](https://github.com/nvm-sh/nvm) to install it.

## Tech Stack
- React.js
- Node.js
- Express.js
- Socket.io
- CodeMirror
- React-Toastify

## Run Locally
This project is not currently live on any server. But to use the demo version, follow the steps below:
- Clone this repository and cd into it
- Run `yarn` to install the dependencies
- To start the react app client run `yarn start` in one terminal
- To start the server run `yarn server:dev` in another terminal
- Go to `http://localhost:3000` to view the app
- Create a room by clicking on the `create new room` button and put a username of your choice
- Copy the room id by clicking on the `Copy ROOM ID` button
- To join as an another user open another browser/browser-window or an incognito tab and go to `http://localhost:3000`
- Enter the same room id to join the same room

Now both your editor will be synced and you can see the changes in real time. Try opening the same room in multiple browsers/browsers-windows and see the changes.

## Project Video
https://github.com/Mohitur669/Realtime-Collaborative-Code-Editor/assets/79283402/14c17cc7-d23a-4d39-8af3-ef9e9fa8ef45

**Note:** If you find any bugs, create an Issue [here](https://github.com/Mohitur669/Realtime-Collaborative-Code-Editor/issues). I will try to fix it as soon as possible :) <br>
In case you want to fix it yourself, feel free to make a pull request.

## Future Scope
- Add support to accept or reject new users trying to join the room
- Add to implement video and voice chat feature inside the editor
- Add syntax highlighting for multiple languages
- Add support for multiple themes (currently using Dracula theme)

## Open Source Contribution
If you want to make contribution to this projects, follow the steps below:
- Fork this repository
- Clone the forked repository
- Create a new branch
- Make your changes
- Commit and push your changes
- Create a pull request

**Note:** Please make sure to use your own branch when contributing.

## About Me
I am Mohd Mohitur Rahaman, a tech geek, currently pursuing a Master's in Computer Applications (Final Year) from KIIT, Bhubaneswar. And with a deep passion for coding and a strong love for science & technology, I am dedicated to honing my skills and achieving proficiency as a developer.

## Connect with me
- [LinkedIn](https://www.linkedin.com/in/mohitur02/)
- [GitHub](https://www.github.com/Mohitur669/)