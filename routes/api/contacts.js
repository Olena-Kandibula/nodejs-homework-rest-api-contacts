const express = require('express');
const router = express.Router();

const { authenticate } = require('../../middlewares');
const controller = require('../../controllers/contacts')

router.get('/', authenticate, controller.getAll);


router.get('/', authenticate, controller.getById);


  
router.post('/', authenticate, controller.addContact);


router.delete('/:contactId', authenticate, controller.deleteById);



router.put('/:contactId', authenticate, controller.updateById);


router.patch('/:contactId/favorite', authenticate, controller.contactFavorite);


module.exports = router;
