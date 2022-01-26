const { Contact } = require('../../model');

const getById= async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: 'Not found' })
    } 
    res.json(contact);
    
    
  } catch (error) {
    
    if (error.message.includes('Cast to ObjectId')) {
      error.status = 404
      
    }
    next(error);
  }
};

module.exports = getById;