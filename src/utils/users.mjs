import bcrypt, { hash } from 'bcrypt';
import { hashPassword } from './hash.mjs';
import { verifyPassword } from './verify.mjs';

export const users = [
  { id: 1, username: "admin", password: "$2b$12$tBF3e1tZLPlauIiwuu.AQeyagrTuV2d2tUtnraPncFH7BLqVnDbsG" },
  { id: 2, username: "mario", password: "$2b$12$WsdwIfXpz0GHDt5rLEL6t.Aq5/Gc0EQ7DJhwW76uCqjD.CEtTyTiK" },
  { id: 3, username: "astrid", password: "$2b$12$Lp8gM6AdtbwFmIOHBjAZAeJkiHBl.buxXkNKlNVGxNcyyco05tcJW" },
  { id: 4, username: "carlos", password: "$2b$12$1qD4YQYTz1OzPNb7HQlgmujvwWthJtg2WZ5yGrrYy69YamVADAhSK" }
];

//returns a boolean
await verifyPassword('1234', users[0].password);

/*
Passwords:

admin: 1234
mario: plumber
astrid: shield
carlos: coffee
*/