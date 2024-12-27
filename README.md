# Term Project

Design docs are in *images/*

## Instructions to setup and run project
When you clone this project, you are required to npm install every package which is a dependency
in order to get this up and running. To begin, install all required packages in the server and client
directories.

1. cd ./client
2. npm i

3. cd ./server
4. npm i

The first time you run the application, it is recommended you fill the mongodb instance with dummy data.
server/init.js has been created for this.

Whenever you wish to run the program, you must follow these steps:
1. run the `mongod` command
2. run `node server/server.js` to begin the server on port 8000
3. `cd` into client/ and run `npm start` to begin the app on port 3000
4. before checking the app, run `node init.js mongodb://127.0.0.1:27017/phreddit admin@cse316.org admin password123` in order
to initialize app data with an admin account ready to go.

if you want to reset the data in mongodb, heres a reminder on how to do that:

1. run `mongosh` to enter the cli
2. `use("phreddit");`
3. `db.dropDatabase();`
4. now rerun step 4 from above to repopulate it.

In order to run tests, in each directory (/client/, /server/), run `npm test`.

features:
- local instance of mongodb starts at mongodb://127.0.0.1:27017/phreddit
- server/init.js should populate mongodb if not already done so (using node)
    - must contain admin profile, details in the hw doc
    - email address, display name, and password must be commandline arguments
- the server on port 8000
- the client on port 3000

