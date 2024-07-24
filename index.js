import dotenv from "dotenv";
import createServer from "./src/graphql";
import sequelize from "./src/config/connect";
import passport from "passport";
import OAuth2Strategy from "passport-oauth2";
import { CrmClass } from "./src/graphql/resolvers/crm/crm.service";

dotenv.config();

const crmClass = new CrmClass();

const LEARNUPON_API_BASE_URL = 'https://devmhfa.learnupon.com';
 // Replace these with your LearnUpon OAuth2 credentials
 const clientID = 'LUC_653A1460B5DB48C188D3116F81D39D02';
 const clientSecret = 'LUS_FKG5L5-28gZdyP1s1b5oZnzoC4Qw1gw8iZSheQVLYKM=';
 const callbackURL = 'https://icaapidev.mentalhealthfirstaid.org/auth/learnupon/callback';

const start = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log("All models were synchronized successfully.");
    const app = await createServer();
    
    //passport OAUTH-2.0 logic START FROM HERE
    app.use(passport.initialize());

    passport.use(new OAuth2Strategy({
          authorizationURL: 'https://devmhfa.learnupon.com/oauth/authorize',
          tokenURL: 'https://devmhfa.learnupon.com/oauth/token',
          clientID: clientID,
          clientSecret: clientSecret,
          callbackURL: 'https://icaapidev.mentalhealthfirstaid.org/callback', 
        },
        function(accessToken, refreshToken, profile, cb) {
          console.log('%cindex.js line:30 accessToken, refreshToken, profile, cb', 'color: #007acc;', accessToken, refreshToken, profile, cb);
        }
    ));

    passport.serializeUser((user, done) => {
      done(null, user);
    });
    
    passport.deserializeUser((user, done) => {
      done(null, user);
    });

    // Authentication routes
    app.get('/auth/learnupon', passport.authenticate('oauth2', { scope: 'full offline_access' }));
    app.get('/callback',
        passport.authenticate('oauth2', { failureRedirect: '/' }),
        (req, res) => {
          console.log('%cindex.js line:44 res', 'color: #007acc;', JSON.stringify(res));
             // Successful authentication, handle user data or redirect as needed
              res.redirect('/profile');
            // res.redirect('/success');
        }
    );
    app.get("/success", (req, res) => {
      // Implement your dashboard logic here
      res.send("Authentication successful");
    });

    app.get("/get-crm-token", async (req, res) => {
      try {
        const token = await crmClass.getCrmAccessToken();
        res.status(200).json({
          token: token?.data?.access_token,
        });
      } catch (error) {
        console.log("%cindex.js line:81 error", "color: #007acc;", error);
      }
    });

    // Protected route (example)
    app.get('/profile', ensureAuthenticated, (req, res) => {
      // This route is protected and can only be accessed by authenticated users.
      res.send(`Welcome to your profile, ${req.user.displayName}`);
    });

    // Middleware to check authentication
    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/login');
    }
     //passport OAUTH-2.0 logic END HERE

    // app.get('/profile', (req, res) => {
    //   // Use the access token to make API requests to LearnUpon's User API
    //   const accessToken = req?.user?.accessToken;
    //   axios.get(`${LEARNUPON_API_BASE_URL}/users/me`, {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //   })
    //   .then((response) => {
    //     const userData = response.data;
    //     // Handle user data or render a profile page
    //     res.json(userData);
    //   })
    //   .catch(() => {
    //     // Handle errors
    //     res.status(500).json({ error: 'Failed to fetch user data' });
    //   });
    // });


    await app.listen(process.env.PORT || 4001);
    console.log(
      `🚀  GraphQL server running at port: ${process.env.PORT || 4001}`
    );
  } catch (err) {
    console.log(err);
    console.log("Not able to run GraphQL server");
  }
};

start();
