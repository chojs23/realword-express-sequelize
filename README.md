# ![RealWorld Example App](logo.png)

> ### [Express.js + sequelize] codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

### [Demo](https://demo.realworld.io/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)

This codebase was created to demonstrate a fully fledged fullstack application built with **[Express.js +sequelize]** including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the **[Express.js + sequelize]** community styleguides & best practices.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

# How it works

- node ^14.15.1
- express ^4.18.2
- sequelize ^6.26.0

# Getting started

In util/database.js file, you need to specify the type of database, database name, username and password.
Initially, the database is set to mysql. If you want to use another database, you need to install the corresponding driver.
The database name is set to realworld. If you want to use another database name, you need to create a database first.

## Installation

```bash
$ git clone
$ cd realworld-express-sequelize
$ npm install
```

## Running the app

```bash
# In local development
$ npm run dev
```
