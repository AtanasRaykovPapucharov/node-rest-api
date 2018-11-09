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

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function (strLength) {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false
    if (strLength) {
        // Define all the possible characters that could go into a string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        // Start the final string
        var finalString = ''
        for (i = 1; i <= strLength; i++) {
            // Get a random character from the possibleCharacters string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
            // Append this character to the string
            finalString += randomCharacter
        }
        // Return the final string
        return finalString
    } else {
        return false
    }
}

module.exports = helpers