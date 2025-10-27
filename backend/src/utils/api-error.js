class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=""
    ){
        //utilize the error class(by default provided by node)
        super(message) //super is call with message because parents class except message argument
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false
        this.error=errors


        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }


    }
}
export {ApiError}