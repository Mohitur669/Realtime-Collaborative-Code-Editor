# Sync Code: Realtime Collaborative Code Editor

## Introduction

Are you tired of sending code snippets back and forth, struggling to debug and collaborate with your team? Look no further! **Sync Code** is here to revolutionize the way you code together. This powerful and intuitive collaborative code editor is designed to empower developers, and teams to work seamlessly in real-time, regardless of their location. With **Sync Code**, you can code together, debug together, and ship faster, together.

## Features

- Multiple users can join a room and edit code together
- Changes are reflected in real time
- Copy button to copy the room id to clipboard
- Leave button to leave the room
- Supports syntax highlighting for different programming languages
- Users can choose theme based on their preferences
- Users can leave the room and rejoin later to continue editing
- Joining & leaving of users is also reflected in real time

### Prerequisites

#### For running via Docker

- Docker (25.0.4)
- Docker Compose (1.29.2)

#### For running locally

- Node.js (v20.11.1)
- npm (10.2.4)
- pm2 (5.3.1) : run `npm i -g pm2` to install pm2 globally

**Note:** I have used nvm (v0.39.7) to manage my node versions. View nvm official [documentation](https://github.com/nvm-sh/nvm) to install it.

## Tech Stack

- React.js
- Node.js
- Express.js
- Socket.io
- CodeMirror
- React-Toastify

## Installation

### Running via Docker Image (highly recommended)

To run the docker image, follow the steps below:

1. Install [Docker](https://www.docker.com/) on your machine.
2. Pull the docker image from the docker hub by running `docker pull mohitur/code-editor`
3. Run the docker image by running `docker run -p 8000:8000 -p 3000:3000 -p 5000:5000 mohitur/code-editor`
4. Go to `http://localhost:3000` to view the app
5. Create a room by clicking on the `create new room` button and put a username of your choice
   5 . Copy the room id by clicking on the `Copy ROOM ID` button
6. To join as an another user open another browser/browser-window or an incognito tab and go to `http://localhost:3000`
7. Enter the same room id to join the same room

Now both your editor will be synced and you can see the changes in real time. Try opening the same room in multiple browsers/browsers-windows and see the changes.

**Note:** If you are using docker in wsl2/linux then add `sudo` before the docker commands.

### Running via building your own Docker Image

To run the app using docker, follow the steps below:

1. Install [Docker](https://www.docker.com/) on your machine.
2. Clone the project repository and Navigate to the project directory.
3. Also you have to change ENV values in the Dockerfile
4. Replace your username in docker-compose.yml file.
5. Run the Docker Compose command: `docker-compose up -d`
6. Go to `http://localhost:3000` to view the app
7. Follow the steps 5-7 from the [Running via Docker Image](https://github.com/Mohitur669/Realtime-Collaborative-Code-Editor?tab=readme-ov-file#running-via-docker-image) section to create and join a room

### Running Locally

1. Clone this repository and cd into it
2. Run `npm install` to install the dependencies
3. Create .env file in the root folder and copy paste the content of example.env, and add necessary credentials.
4. To start the react app client run `npm start` in one terminal
5. To start the server run `npm server:dev` or `pm2 start server.js` in another terminal
6. Go to `http://localhost:3000` to view the app
7. Follow the steps 4-7 from the [Running via Docker Image](https://github.com/Mohitur669/Realtime-Collaborative-Code-Editor?tab=readme-ov-file#running-via-docker-image) section to create and join a room

**Note:** To stop your server, press `Ctrl+c` or if you used "pm2", then use `pm2 stop server.js` in the terminal.

## Project Video

https://github.com/Mohitur669/Realtime-Collaborative-Code-Editor/assets/79283402/14c17cc7-d23a-4d39-8af3-ef9e9fa8ef45

**Note:** If you find any bugs, create an Issue [here](https://github.com/Mohitur669/Realtime-Collaborative-Code-Editor/issues). I will try to fix it as soon as possible :) <br>
In case you want to fix it yourself, feel free to make a pull request.

## Future Scope

1. [x] Added syntax highlighting for multiple languages
2. [x] Added support for multiple themes
3. [x] Added support for saving the last theme and language selected by the user in local storage
4. [x] Add support to accept or reject new users trying to join the room
5. [ ] Add to implement video and voice chat feature inside the editor
6. [ ] Add support for local code file uploading

## Open Source Contribution

If you want to make contribution to this projects, follow the steps below:

1. Fork this repository
2. Clone the forked repository <br>

```
git clone https://github.com/your-github_username/Realtime-Collaborative-Code-Editor.git
```

3. cd into the cloned repository
4. Create a new branch <br>

```
git checkout -b your_branch_name
```

5.  Make your changes
6.  Commit and push your changes <br>

```
git add . <br>
git commit -m "your commit message" <br>
git push origin your_branch_name
```

7. Finally, create a pull request by visiting your forked repository on GitHub

**Note:** Please make sure to use your own branch when contributing.

## About Me

I am Mohd Mohitur Rahaman, a tech geek, currently pursuing a Master's in Computer Applications (Final Year) from KIIT, Bhubaneswar. And with a deep passion for coding and a strong love for science & technology, I am dedicated to honing my skills and achieving proficiency as a developer.

## Connect with me

- [LinkedIn](https://www.linkedin.com/in/mohitur02/)
- [GitHub](https://www.github.com/Mohitur669/)
