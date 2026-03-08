require('dotenv').config();

module.exports = {
  notion: {
    token: process.env.NOTION_TOKEN,
    database_id: process.env.NOTION_DATABASE_ID,
    version: '2022-06-28',
  },
  facebook: {
    version: 'v23.0',
  },
  log_file: __dirname + '/log.txt',
};