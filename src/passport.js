// passport.use(new SamlStrategy(
//     {
//       path: '/login/callback', // The callback URL that LearnUpon will redirect to.
//       entryPoint: 'https://devmhfa.learnupon.com/sso/saml', // LearnUpon SSO URL.
//       issuer: 'passport-saml', // Your app's identifier.
//       // cert: 'your-certificate-or-shared-secret', // Your certificate or shared secret.
//     },
//     (profile, done) => {
//       console.log('%cindex.js line:52 profile, done', 'color: #007acc;', profile, done);
//       // Validate the user's profile received from LearnUpon.
//       // Typically, you'd check if the user exists in your system.
//       // If the user is authenticated, call done(null, user) to serialize the user.
//       // Otherwise, call done(null, false) or done(error) to handle authentication failure.
//     }
//   ));

//   // Route to initiate SSO.
//   app.get('/login',
//     passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
//     (req, res) => {
//       res.redirect('/');
//     });

//   // Callback route for SSO response.
//   app.post('/login/callback',
//       passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
//       (req, res) => {
//         res.redirect('/');
//       });
