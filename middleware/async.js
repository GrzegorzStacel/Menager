module.exports = function(handler) {
    console.log('asyncmiddleware');

    return async (req, res, next) => {
        try {
            console.log('try');
            await handler(req, res);
        } catch (error) {
            console.log('catch');
            next(error);
        }
    }
}