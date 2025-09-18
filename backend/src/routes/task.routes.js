import express from 'express'
import { validate } from '../middleware/validation.middleware.js'
import { protect } from '../middleware/auth.middleware.js'
import { 
  create,
  getAll,
  getById,
  update,
  remove,
  importTasks,
  exportTasks
} from '../controllers/task.controller.js'
import { 
  taskSchema,
  updateTaskSchema
} from '../utils/validation.js'

const router = express.Router()
router.route('/')
  .post(protect, validate(taskSchema), create)
  .get(protect, getAll)

router.route('/export')
  .get(protect, exportTasks)
router.route('/:id')
  .get(protect, getById)
  .put(protect, validate(updateTaskSchema), update)
  .delete(protect, remove)

// Import/Export routes
router.route('/import')
  .post(protect, importTasks)



export default router