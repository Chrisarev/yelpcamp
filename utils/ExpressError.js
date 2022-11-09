///Custom error handling that we can throw anywhere we want in our main app 
class ExpressError extends Error{
    constructor(message, status){
        super(); ///calls Error constructor
        this.message = message;
        this.status = status; 
    }
}
module.exports = ExpressError;