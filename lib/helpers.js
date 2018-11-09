/*
 * Helpers for various tasks
 *
 */

// Dependencies
var crypto = require('crypto')
var config = require('../config')

// Container for all the helpers
var helpers = {}

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = function (str) {
    try {
        var obj = JSON.parse(str)
        return obj
    } catch (error) {
        return {}
    }
}

// Create a SHA256 hash
helpers.hash = function (str) {
    if (typeof (str) == 'string' && str.length > 0) {
        try {
            var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
            return hash
        } catch (error) {
            console.log('Hashing error: ' + error)
        }
    } else {
        return false
    }
}

module.exports = helpers