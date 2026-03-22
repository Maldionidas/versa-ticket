const isAdmin = (req, res, next) => {
    // ejemplo simple
    console.log("Middleware admin ejecutado");
    next();
};

module.exports = { isAdmin };