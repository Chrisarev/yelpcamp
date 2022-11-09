///wrapper error handling function for async funcs
module.exports = func => {
    return (req,res,next) => {
        func(req,res,next).catch(next); ///runs function passed in and if there is error, catches and passes to next
    }
}