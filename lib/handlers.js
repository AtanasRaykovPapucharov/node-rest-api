/*
 * Request handlers
 *
 */

// Dependencies
var helpers = require('./helpers')
var _data = require('./data')


// Define handlers
var handlers = {}

// Users handler
handlers.users = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback)
    } else {
        callback(405, {
            'Error': 'This method is not allowed'
        })
    }
}

// Container for the users sub-methods
handlers._users = {}

// Users post
// Request data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {

    // Check that all required fields are filled out
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user does not already exist
        _data.read('users', phone, function (error, data) {
            if (error) {
                // Hash the password
                var hashPassword = helpers.hash(password)

                // Create the user object
                if (hashPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashPassword': hashPassword,
                        'tosAgreement': true
                    }

                    // Store the user
                    _data.create('users', phone, userObject, function (error) {
                        if (!error) {
                            callback(200)
                        } else {
                            console.log(error)
                            callback(500, {
                                'Error': 'Could not create the new user'
                            })
                        }
                    })
                } else {
                    callback(500, {
                        'Error': 'Could not hash the user\'s password'
                    })
                }
            } else {
                // User already exist
                callback(400, {
                    'Error': 'A users with that phone number already exists'
                })
            }
        })
    } else {
        callback(400, {
            'Error': 'Missing required fields'
        })
    }
}

// Users get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Dont let them access anyone elses
handlers._users.get = function (data, callback) {
    // Check that phone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false
    if (phone) {
        // Lookup the user
        _data.read('users', phone, function (error, data) {
            if (!error && data) {
                // Remove the hashed password from the user user object before returning it to the requester
                delete data.hashedPassword
                callback(200, data)
            } else {
                callback(404, {
                    'Error': '404: This user is not found'
                })
            }
        })
    } else {
        callback(400, {
            'Error': 'Missing required field'
        })
    }
}

// Users put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses
handlers._users.put = function (data, callback) {
    // Check for required field
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false

    // Check for optional fields
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read('users', phone, function (error, userData) {
                if (!error && userData) {
                    // Update the fields if necessary
                    if (firstName) {
                        userData.firstName = firstName
                    }

                    if (lastName) {
                        userData.lastName = lastName
                    }

                    if (password) {
                        userData.hashedPassword = helpers.hash(password)
                    }

                    // Store the new updates
                    _data.update('users', phone, userData, function (error) {
                        if (!error) {
                            callback(200)
                        } else {
                            console.log(error)
                            callback(500, {
                                'Error': 'Could not update the user'
                            })
                        }
                    })
                } else {
                    callback(400, {
                        'Error': 'Specified user does not exist'
                    })
                }
            })
        } else {
            callback(400, {
                'Error': 'Missing fields to update'
            })
        }
    } else {
        callback(400, {
            'Error': 'Missing required field'
        })
    }
}

// Users delete
// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses
// @TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function (data, callback) {
    // Check that phone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false
    if (phone) {
        // Lookup the user
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                _data.delete('users', phone, function (err) {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, {
                            'Error': 'Could not delete the specified user'
                        })
                    }
                })
            } else {
                callback(400, {
                    'Error': 'Could not find the specified user.'
                })
            }
        })
    } else {
        callback(400, {
            'Error': 'Missing required field'
        })
    }
}


// Ping handler
handlers.ping = function (data, callback) {
    // Callback http status code
    callback(200)
}

// Hello handler
handlers.hello = function (data, callback) {
    // Callback http status code
    callback(200, {
        message: "Hello World!"
    })
}

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404, {
        'Error': '404: This route is not found'
    })
}

module.exports = handlers