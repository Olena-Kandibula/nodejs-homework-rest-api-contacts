const getAll = require('./getAll');
const getById = require('./getById');
const addContact = require('./addContact');
const deleteById = require('./deleteById');
const updateById = require('./updateById');
const contactFavorite = require('./contactFavorite');

module.exports = {
    getAll,
    getById,
    addContact,
    deleteById,
    updateById, 
    contactFavorite,
}