const { Contact } = require('../../model');
const { schemaUpdateFavorite } = require('../../model/contacts/joi-schemas');
const { NotFound } = require('http-errors');

const contactFavorite = async (req, res, next) => {
    
    const { contactId } = req.params;
    const body = req.body;
    const result = schemaUpdateFavorite.validate(body);
    console.log(body.favorite)
    try {
        if (result.error) {
            return res.status(400).json({ message: 'missing  fields favorite' })
        }
        const contact = await updateStatusContact(contactId, body)
        res.json(contact)
    
    } catch (error) {
        if (error.message.includes('Cast to ObjectId')) {
            error.status = 404;
        }
        next(error);
    }
};

async function updateStatusContact (contactId, body) {
  const contact = await Contact.findByIdAndUpdate(contactId, body, { new: true })
  if (!contact) {
    throw new NotFound()
  }
  return contact
}

module.exports = contactFavorite;