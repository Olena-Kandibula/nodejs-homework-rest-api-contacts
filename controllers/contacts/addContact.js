const { Contact } = require('../../model');
const {  BadRequest } = require('http-errors');
const { schemaAdd } = require('../../model/contacts/joi-schemas');



const addContact = async (req, res, next) => {
    try {
        const body = req.body;
    
        const { error } = schemaAdd.validate(body)
        if (error) {
            throw new BadRequest(error.message)
        }
   
        if (!Object.keys(body).includes('favorite')) {
            body.favorite = false;
        }

        const { _id } = req.user;
    
        const newContact = await Contact.create({ ...req.body, owner: _id });
        res.status(201).json(newContact);

    } catch (error) {
        if (error.message.includes('validation failed')) {
            error.status = 400
        }

        next(error);
    }
};

module.exports = addContact;