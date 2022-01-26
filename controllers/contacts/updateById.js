const { Contact } = require('../../model');
const { schemaUpdate } = require('../../model/contacts/joi-schemas');

const updateById = async (req, res, next) => {
    const { contactId } = req.params;
    const body = req.body;
    const result = schemaUpdate.validate(body);
  
    try {
        if (result.error) {
            return res.status(400).json({ message: 'missing  fields' })
        }
        const contact = await Contact.
            findByIdAndUpdate(contactId, body, { new: true });
        res.status(200).json(contact)

    } catch (error) {
        if (error.message.includes('Cast to ObjectId')) {
            error.status = 404;
        }
        next(error);
    }
  
};

module.exports = updateById;
