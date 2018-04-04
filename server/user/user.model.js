'use strict';

const bcrypt = require('bcrypt');
const { auth: config = {} } = require('../config');
const jwt = require('jsonwebtoken');
const pick = require('lodash/pick');
const { role } = require('../../common/config');

const { Model } = require('sequelize');

class User extends Model {
  static fields(DataTypes) {
    return {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true, notEmpty: true },
        unique: { msg: 'This email address is already in use.' }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true, len: [5, 100] }
      },
      role: {
        type: DataTypes.ENUM(role.ADMIN, role.STUDENT),
        defaultValue: role.STUDENT
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name'
      },
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name'
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      }
    };
  }

  static options() {
    return {
      modelName: 'user',
      timestamps: true,
      paranoid: true,
      underscored: true,
      freezeTableName: true
    };
  }

  static hooks() {
    return {
      beforeCreate(user) {
        return user.encryptPassword();
      },
      beforeUpdate(user) {
        if (user.changed('password')) {
          return user.encryptPassword();
        }
      },
      beforeBulkCreate(users) {
        return Promise.all(users.map(it => it.encryptPassword()));
      }
    };
  }

  async encryptPassword() {
    this.password = await bcrypt.hash(this.password, config.saltRounds);
    return this;
  }

  async authenticate(password) {
    const result = await bcrypt.compare(password, this.password);
    return result && this;
  }

  createToken(options = {}) {
    const payload = pick(this, ['id', 'email']);
    return jwt.sign(payload, config.secret, options);
  }
}

module.exports = User;
