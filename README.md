# Installation Instructions

This app is essentially a web server wrapped in an Electron desktop application but you can ignore the electron aspects of the application for now. It's an application for data entry at a hotel named Rikon Hotel.

The instructions in this README will guide you through running the server application itself and viewing it on a browser.

The web application is a NodeJS application with ExpressJS in the backend and Vuejs in the frontend.

Follow these instructions to run the application. 

After cloning the repository, you should have a folder named `rikon` somewhere in your file system.

## Pre-requisites
The instructions that follow assume that you are on a UNIX based operating system like MacOs or Linux and that you have Nodejs installed. 

If you're on Windows, you have a few options
- Option 1: Use Vagrant for development. There are detailed instructions for setting up this project on a Vagrant machine on Windows below
- Option 2: Use Windows Subsystem for Linux version 2
- Option 3: Use [Git Bash for Windows](https://gitforwindows.org/) instead of the Windows Command Prompt / Powershell terminal. Git Bash this should give you most of the commands you'll need for development of this application.

You can look up instructions for installing NodeJS on your machine: 

## Development Environment
Advisable to use WebStorm or any other Intellij based IDE (Integrated development environment) for development because it makes it much more convenient to run and debug / step through the tests. If you can't get Webstorm (since it isn't free, VSCode is also okay). To learn more about using a debugger see these links:

- [Running and debugging Jest tests in Webstorm](https://www.youtube.com/watch?v=rwfW412t6ag)
- [How to use a Debugger](https://www.youtube.com/watch?v=7qZBwhSlfOo)

In addition to the IDE you use for the code, you can download and use [DB Browser for SQLite](https://sqlitebrowser.org/) in order to open up and browse through the data in the database. After running the migrations, you should be able to find the SQLite database at `rikon/desktop-server/rikon.db`

## Using Vagrant to develop on Windows OS
If you're on a Windows machine and you intend to use Vagrant to do the development, you can do the following: 

1. Create a folder anywhere on your machine called `rikon-vagrant`
2. Clone this repository - which contains a simple `Vagrantfile` [https://github.com/rukykf/vagrant-setup.git](https://github.com/rukykf/vagrant-setup.git)
3. `cd` into the `vagrant-setup` folder and then clone this rikon repository into it [https://github.com/rukykf/rikon.git](https://github.com/rukykf/rikon.git)
4. Read through the README at `vagrant-setup/README.md` to know a bit about using Vagrant. You can then `vagrant up` and `vagrant ssh` into the new vagrant machine. From there, you can proceed with the instructions for starting the application.
5. At this point, if you're running the application within the Vagrant machine created by the `Vagrantfile` I linked to, you can expect to find the application hosted at [http://192.168.33.10:3990](http://192.168.33.10:3990) and / or [http://192.168.33.10:8080](http://192.168.33.10:8080) instead of on [http://localhost:3990](http://localhost:3990). So you'll be using the IP address 192.168.33.10 instead of localhost to access the application after running it.

## Start the Application

`cd` into `rikon/desktop-server` in your terminal and then run these commands:

1. Install the `yarn` package manager, which is just like `npm` but there's some slight advantages to using `yarn` instead of `npm`. With `yarn` instead of running something like `npm install` you'd run `yarn install`

```
npm install --global yarn
```

2. Install the packages with
```
yarn install
```

If you get a permission denied error while trying to install anything  run the install command with sudo like so:

```
sudo yarn install
```

3. Run the database migrations (the database we're using here is SQLite)
```
yarn run knex migrate:latest --env=development
```
After running the applications you should see a file named `rikon.db` in the `rikon/desktop-server` directory.

4. Seed some example users and roles in the database with these commands
```
yarn run knex seed:run --specific=users.js --env=development
```

```
yarn run knex seed:run --specific=roles.js --env=development
````

5. Run the server with
```
node src/server/server.js
```

6. To kill the server process, run `Ctrl + C`. And to restart it run the same command as above: `node src/server/server.js`

7. **Frontend:** If you're working on just the backend and don't need to make any changes to the front end, you can just build the front-end and then restart the server. But if you are actively working on the frontend then you need to run the frontend in development mode instead of building it. 

8. If you choose to build the frontend, then the application should be available at [localhost:3990](http://localhost:3990)

9. If you choose to run the frontend in development mode, then the application should be available at [localhost:8080](http://localhost:8080)

10. After running the application, you can login to the app with any of these credentials:

- Username: `administrator` Password: `password`
- Username: `accountant` Password: `password`
- Username: `sales-person` Password: `password`
- Username: `supervisor` Password: `password`
- Username: `receptionist` Password: `receptionist`
- See `desktop-server/src/server/src/data-access/seed-factories/users-roles.js` for more test user login info

The administrator has the most permissions so, you will be able to see all the available interfaces in the application if you login as `administrator`. If you login as `receptionist` for example, you will only be able to see the interfaces for booking and reserving hotel rooms because that's what the receptionist does.

## Build the Frontend

To build the frontend go the `rikon/spa` directory. **Note that SPA stands for Single Page Application which you can learn more about here: [https://developer.mozilla.org/en-US/docs/Glossary/SPA](https://developer.mozilla.org/en-US/docs/Glossary/SPA)**

Go to the `rikon/spa` directory then run these commands:

```
yarn install
```

```
yarn build
```

This build command will build the Vue SPA assets and place them in the assets directory of the server folder at `rikon/desktop-server/src/server/assets`

## Run the Frontend in development mode
If you're making changes to the front-end and you don't want to re-build the frontend to see your changes after making a change, you can run the frontend by following these commands (note that you still need the server running for the application to work. So in order to avoid killing the server process you created earlier, you should run these commands in a new terminal window):

Go to the `rikon/spa` directory and then run these commands:
```
yarn install
```

```
yarn serve
```

You can kill the process using `Ctrl + C` and then restart by running `yarn serve` again.

## Run the tests
At the moment, there are unit and integration tests written with Jest only for the backend. 

To run these tests go to `rikon/desktop-server` and run these commands:

```
yarn install
```

```
yarn test
```

