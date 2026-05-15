// middleware/auth.js
function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // user logged in, continue
    } else {
        return res.redirect('/login'); // not logged in, redirect to login
    }
}

module.exports = ensureAuthenticated;
