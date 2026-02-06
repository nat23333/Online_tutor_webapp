// This file tells Vercel to use the built NestJS app
const { bootstrap } = require('../dist/main');

module.exports = bootstrap();