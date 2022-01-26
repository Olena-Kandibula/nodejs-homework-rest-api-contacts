const {Contact} = require('../../model');


const getAll = async (req, res, next) => {
  try {     
    const { _id } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const contacts = await Contact.find(
      { owner: _id },
      '_id name email phone favorite',
      { skip, limit: +limit },
    );    
    res.json(contacts)   
 } catch (error) {
    next(error);
  }
}

module.exports = getAll;