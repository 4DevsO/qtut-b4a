//----------------- Cloud Code for User Functions -----------------//

/**
 * @name userSignUp
 * @description resolve user sign up
 * @param {string} username
 * @param {string} email
 * @param {string} password
 */
Parse.Cloud.define('userSignUp', (request, response) => {
  const username = request.params.username;
  const email = request.params.email;
  const password = request.params.password;

  const user = new Parse.User();

  user.setUsername(username);
  user.setEmail(email);
  user.setPassword(password);
  user.set('premium', false);

  user
    .signUp(null)
    .then((user) => {
      response.success(user.toJSON());
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name userSignIn
 * @description resolve user sign in
 * @param {string} username
 * @param {string} password
 */
Parse.Cloud.define('userSignIn', (request, response) => {
  const username = request.params.username;
  const password = request.params.password;

  Parse.User.logIn(username, password)
    .then((user) => {
      response.success(user.toJSON());
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name userUpdate
 * @description create/update value for field in user
 * @param {User{objectId, [params]}} user
 */
Parse.Cloud.define('userUpdate', (request, response) => {
  const user = request.params.user;

  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('objectId', user.objectId);
  userQuery
    .first({ useMasterKey: true })
    .then((userToBeUpdated) => {
      if (userToBeUpdated != undefined) {
        Object.keys(user).forEach((field) => {
          userToBeUpdated.set(field, user[field]);
        });
        userToBeUpdated
          .save(null, { useMasterKey: true })
          .then((result) => {
            response.success(result.toJSON());
          })
          .catch((err) => {
            response.error(err.code, err.message);
          });
      } else {
        response.error(404, `User not found for ${user.objectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name userGet
 * @description get User
 * @param {string} userObjectId
 */
Parse.Cloud.define('userGet', (request, response) => {
  const userObjectId = request.params.userObjectId;
  const query = new Parse.Query(Parse.User);
  query.equalTo('objectId', userObjectId);
  query
    .first({ useMasterKey: true })
    .then((user) => {
      if (user != undefined) {
        response.success(user.toJSON());
      } else {
        response.error(404, `User not found for ${userObjectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name userResetPassword
 * @description send request to reset user password
 * @param {string} email
 */
Parse.Cloud.define('userResetPassword', (request, response) => {
  const email = request.params.email;

  Parse.User.requestPasswordReset(email)
    .then((result) => {
      response.success('Password reset request was sent');
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name userDelete
 * @description delete user
 * @param {string} userObjectId
 */
Parse.Cloud.define('userDelete', (request, response) => {
  const userObjectId = request.params.userObjectId;

  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('objectId', userObjectId);
  userQuery
    .first({ useMasterKey: true })
    .then((user) => {
      if (user != undefined) {
        user
          .destroy({ useMasterKey: true })
          .then((result) => {
            response.success('User was deleted');
          })
          .catch((err) => {
            response.error(err.code, err.message);
          });
      } else {
        response.error(404, `User not found for ${userObjectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name userSetAcls
 * @description set acls for current user
 */

Parse.Cloud.define('userSetAcls', (request, response) => {
  const currentUser = request.user;
  currentUser.setACL(new Parse.ACL(currentUser));
  currentUser
    .save(null, { useMasterKey: true })
    .then((object) => {
      response.success('Acls Updated');
    })
    .catch((object, error) => {
      response.error('Got an error ' + error.code + ' : ' + error.description);
    });
});

/**
 * @name userGetByFilter
 * @description get users by filter
 * @param {filter{...string : any}} filter
 */
Parse.Cloud.define('userGetByFilter', (request, response) => {
  const filter = request.params.filter;

  const userQuery = new Parse.Query(Parse.User);
  Object.keys(filter).forEach((field) => {
    if (typeof filter[field] == typeof 'string') {
      userQuery.contains(field, filter[field]);
    } else if (typeof filter[field] == typeof []) {
      userQuery.containedIn(field, filter[field]);
    } else {
      userQuery.equalTo(field, filter[field]);
    }
  });
  userQuery
    .find({ useMasterKey: true })
    .then((users) => {
      if (users.length > 0) {
        const usersJSON = users.map((user) => user.toJSON());
        response.success(usersJSON);
      } else {
        response.error(
          404,
          `No users were found for the filter ${JSON.stringify(filter)}`
        );
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});
