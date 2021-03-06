'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _randomstring = require('randomstring');

var _randomstring2 = _interopRequireDefault(_randomstring);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _heroic = require('../models/heroic');

var _heroic2 = _interopRequireDefault(_heroic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Interactor {
  // Create user
  static async create(user) {
    try {
      // Fetch Heroic Settings
      let config = await _heroic2.default.query().findOne({ id: 1 });
      // Format User Data
      user = {
        username: user.username,
        password: user.password,
        mail: user.mail,
        account_created: Math.floor(new Date() / 1000),
        motto: config['user.motto'],
        look: config['user.look'],
        gender: config['user.gender'],
        rank: config['user.rank'],
        credits: config['user.credits'],
        pixels: config['user.pixels'],
        points: config['user.points'],
        ip_register: user.ip,
        ip_current: user.ip,
        home_room: config['user.home']
        // Insert Into Database
      };await _user2.default.query().insert(user);
      // Return
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // Fetch user data based on username
  static async read(query, relationships = '') {
    try {
      // Parse query
      if (query.indexOf('@') > -1) {
        query = { mail: query };
      } else {
        query = { username: query };
      }
      // Find User
      let user = await _user2.default.query().eager(`[${relationships}]`).findOne(query);
      // Does user exist?
      if (user.id !== null) {
        return Promise.resolve(user);
      } else {
        return Promise.reject(Error('MISSING'));
      }
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }

  // Update user
  static async update(user) {
    return _user2.default.query().patchAndFetchById(user.id, user);
  }

  // Delete user
  static async delete(id) {
    return _user2.default.query().where('id', id).delete();
  }

  // Fetch online users
  static async online() {
    try {
      let users = await _user2.default.query().where('online', '1');
      return Promise.resolve(users);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // Fetch top users
  static async top() {
    try {
      let users = {
        credits: await _user2.default.query().whereIn('rank', [1, 2]).orderBy('credits', 'DESC').limit(12)
      };
      return Promise.resolve(users);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // Login as user
  static async login(username, password) {
    try {
      // Fetch
      let user = await Interactor.read(username);
      // Verify Login
      if (await user.verifyPassword(password)) {
        return Promise.resolve(user);
      } else {
        return Promise.reject(Error('password'));
      }
    } catch (e) {
      return Promise.reject(Error('username'));
    }
  }

  // Generate sso
  static async client(id) {
    try {
      let user = await _user2.default.query().patchAndFetchById(id, { auth_ticket: `heroic_${_randomstring2.default.generate(25)}` });
      return Promise.resolve(user.auth_ticket);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // Is Staff
  static async staff(id) {
    try {
      let user = await _user2.default.query().eager('permission').findOne({ id: id });
      if (user.permission.rank_type === 'staff') {
        return Promise.resolve();
      } else {
        return Promise.reject(Error('User is not staff'));
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
exports.default = Interactor;