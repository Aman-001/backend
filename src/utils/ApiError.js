class ApiError extends error {
    constructor(
        statuscode,
        message = "SOMETHING WENT WRONG",
        errors = [],
        statck = ""
    )
    {
        super(message)
        this.statuscode = statuscode
        this.errors = errors
        this.data = null
        this.message = message
    }
    }