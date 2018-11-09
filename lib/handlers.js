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
handlers._users.get = function (data, callback) {}

// Users put
handlers._users.put = function (data, callback) {}

// Users delete
handlers._users.delete = function (data, callback) {}


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