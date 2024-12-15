const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Use session middleware
app.use(
    "/customer",
    session({
        secret: "fingerprint_customer", // Secret for signing session IDs
        resave: true,
        saveUninitialized: true,
    })
);

// Authentication middleware for customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session contains a valid access token
    if (req.session && req.session.accessToken) {
        try {
            // Verify the JWT token stored in the session
            const decoded = jwt.verify(req.session.accessToken, "secretkey");
            req.user = decoded; // Attach user information to the request object
            next(); // Continue to the next middleware or route handler
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    } else {
        return res.status(403).json({ message: "Unauthorized access" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
