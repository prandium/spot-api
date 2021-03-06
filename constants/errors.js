var ERRORS = {
    SERVICE:                        { Text: "Was an error. Try later.", Code: 0, Type: "Service" },
    USERNAME_PASS_EMPTY:            { Text: "Username or password are empty.", Code: 1, Type: "User" },
    PASSWORDS_DIFF:                 { Text: "Password and confirm password are differents.", Code: 2, Type: "User" },
    FIRST_LAST_NAME_EMPTY:          { Text: "First or last name are empty.", Code: 3, Type: "User" },
    USERNAME_NOT_AVAILABLE:         { Text: "Username already exist.", Code: 4, Type: "User" },
    USER_SUCCESSFULLY:              { Text: "User created successfully.", Code: 5, Type: "User" },
    AUTH_FAILED:                    { Text: "Authentication failed.", Code: 6, Type: "User" },
    AUTH_USER_NOT_FOUND:            { Text: "Authentication failed. User not found.", Code: 7, Type: "User" },
    AUTH_WRONG_PASSWORD:            { Text: "Authentication failed. Wrong password.", Code: 8, Type: "User" },    
    EDIT_USER_SUCCESSFULLY:         { Text: "User was updated successfully.", Code: 9, Type: "User" },
    NO_TOKEN:                       { Text: "No token provided", Code: 10, Type: "Service" },
    REQUEST_FAILED:                 { Text: "Invalid request", Code: 11, Type: "Service" },
    INVALID_TOKEN:                  { Text: "Invalid token", Code: 12, Type: "Service" },
    NOT_SUPERADMIN:                 { Text: "Access is denied", Code: 13, Type: "Service" },
    // IS NOT AN ERROR, PENDING CHANGE THIS (iva)
    IVA:                            16
}

module.exports = ERRORS