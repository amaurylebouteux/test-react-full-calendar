// const jwt = require('jsonwebtoken');
// // const { User, RefreshToken } = require('./models');
// const config = require('./conf');
// const express = require('express');
// const router = express.Router();
// let RefreshToken = ''
 
// router.post('/', async (req, res, next) => {
//   try {
//     /* 1. On récupère le nom d'utilisateur et le mot de passe dans la requête */
//     // const { username, password } = req.body;
//     const {User} = req.body;
 
//     /* 2. On envoie une erreur au client si le paramètre username est manquant */
//     if (!User.username) {
//       return res.status(400).json({ message: 'missing_required_parameter', info: 'username' });
//     }
//     /* 3. On envoie une erreur au client si le paramètre password est manquant */
//     if (!User.password) {
//       return res.status(400).json({ message: 'missing_required_parameter', info: 'password' });
//     }
 
//     /* 4. On authentifie l'utilisateur */
//     const user = await User.authenticate(username, password);
 
//     /* 5. On envoie une erreur au client si les informations de connexion sont erronées */
//     if (!user) {
//       return res.status(401).json({
//         message: 'Username or password is incorrect'
//       });
//     }
 
//     /* 6. On créer le JWT */
//     const accessToken = jwt.sign(
//       { firstName: user.firstName, lastName: user.lastName },
//       config.accessToken.secret,
//       {
//         algorithm: config.accessToken.algorithm,
//         audience: config.accessToken.audience,
//         expiresIn: config.accessToken.expiresIn / 1000,
//         issuer: config.accessToken.issuer,
//         subject: user.id.toString()
//       }
//     );
//      /* 7. On créer le refresh token et on le stocke en BDD */
//      const refreshToken = crypto.randomBytes(128).toString('base64');
 
//      await RefreshToken.create({
//        userId: user.id,
//        token: refreshToken,
//        expiresAt: Date.now() + config.refreshToken.expiresIn
//      });
  
//      /* 7. On envoie au client le JWT et le refresh token */
//      return res.json({
//        accessToken,
//        tokenType: config.accessToken.type,
//        accessTokenExpiresIn: config.accessToken.expiresIn,
//        refreshToken,
//        refreshTokenExpiresIn: config.refreshToken.expiresIn
//      });
//    } catch (err) {
//      return res.status(500).json({ message: 'Internal server error' });
//    }
//  });

// module.exports = router;