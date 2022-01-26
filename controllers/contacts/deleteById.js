const {Contact} = require('../../model');

const deleteById = async (req, res, next) => {
    const { contactId } = req.params;
  
    try {
        const contact = await Contact.findByIdAndRemove(contactId);
        if (!contact) {
            res.status(404).json({ message: 'Not found' })
        }
        res.json({ message: 'contact deleted' })
    
    } catch (error) {
        next(error);
    }
};

module.exports = deleteById;