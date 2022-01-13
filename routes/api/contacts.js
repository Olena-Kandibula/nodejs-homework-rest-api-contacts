const express = require('express');
const router = express.Router();

const { NotFound, BadRequest } = require('http-errors');

const { schemaAdd, schemaUpdate, schemaUpdateFavorite } = require('../../model/contacts/joi-schemas');

const {Contact} = require('../../model');
const { authenticate } = require('../../middlewares');


router.get('/', authenticate, async (req, res, next) => {
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
})

router.get('/:contactId', authenticate, async (req, res, next) => {
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
});
  

router.post('/', authenticate, async (req, res, next) => {
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
})

router.delete('/:contactId', authenticate, async (req, res, next) => {
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
})

router.put('/:contactId', authenticate, async (req, res, next) => {
  const { contactId } = req.params;  
  const body = req.body;    
  const result = schemaUpdate.validate(body);
  
  try {
  if (result.error) {
      return res.status(400).json({ message: 'missing  fields' }) 
    }
    const contact = await Contact.
      findByIdAndUpdate(contactId, body, {new: true});  
     res.status(200).json(contact)

  } catch (error) {
    if (error.message.includes('Cast to ObjectId')) {
      error.status = 404;
    }
    next(error);
  }  
  
})

router.patch('/:contactId/favorite', authenticate, async (req, res, next) => {
 
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
})

async function updateStatusContact (contactId, body) {
  const contact = await Contact.findByIdAndUpdate(contactId, body, { new: true })
  if (!contact) {
    throw new NotFound()
  }
  return contact
}

module.exports = router;
