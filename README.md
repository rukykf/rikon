# Installation Instructions

This app was originally built as an Electron application but you can ignore the electron aspects of the application for now. This app is a NodeJS application with ExpressJS in the backend and Vuejs in the frontend.

Follow these instructions to run the application. 

After cloning the repository, you should have a folder named `rikon` somewhere in your file system.

## Development Environment
Advisable to use WebStorm or any other Intellij based IDE for development because it makes it much more convenient to run and debug / step through the tests. If you can't get Webstorm (since it isn't free, VSCode is also okay). To learn more about using a debugger see these links:

- [Running and debugging Jest tests in Webstorm](https://www.youtube.com/watch?v=rwfW412t6ag)
- [How to use a Debugger](https://www.youtube.com/watch?v=7qZBwhSlfOo)
- 

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

## Build the Frontend

To build the frontend go the `rikon/spa` directory. **Note that SPA stands for single page application which you can learn more about here: [https://developer.mozilla.org/en-US/docs/Glossary/SPA](https://developer.mozilla.org/en-US/docs/Glossary/SPA)**

Go to the `rikon/spa` directory then run these commands:

```
yarn install
```

```
yarn build
```

This build command will build the Vue SPA assets and place them in the assets directory of the server folder at `rikon/desktop-server/src/server/assets`

## Run the Frontend in development mode
If you're making changes to the front-end and you don't want to re-build the frontend to see your changes after making a change, you can run the frontend by following these commands:

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
