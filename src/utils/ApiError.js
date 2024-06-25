class ApiError extends error {
    constructor(
        statuscode,
        message = "SOMETHING WENT WRONG",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statuscode = statuscode
        this.errors = errors
        this.data = null
        this.message = message
    }
}

// Properly set the stack trace (if provided)
if (stack) {
    this.stack = stack;
} else {
    Error.captureStackTrace(this, this.constructor);
}
    
