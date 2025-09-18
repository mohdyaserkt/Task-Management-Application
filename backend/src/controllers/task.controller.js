import { asyncHandler } from '../utils/helpers.js'
import { 
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  importTasksFromFile,
  exportTasksToExcel,
  exportTasksToCsv
} from '../services/task.service.js'
import upload from '../config/multer.js'
import { deleteFile } from '../services/file.service.js'

const create = asyncHandler(async (req, res) => {
  const task = await createTask(req.body, req.user.id)

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
     task
  })
})


const getById = asyncHandler(async (req, res) => {
  const task = await getTaskById(req.params.id, req.user.id)

  res.status(200).json({
    success: true,
     task
  })
})

const update = asyncHandler(async (req, res) => {
  const task = await updateTask(req.params.id, req.body, req.user.id)

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
     task
  })
})

const remove = asyncHandler(async (req, res) => {
  const result = await deleteTask(req.params.id, req.user.id)

  res.status(200).json({
    success: true,
    message: result.message
  })
})

const getAll = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const sortBy = req.query.sort || 'createdAt'
  const sortOrder = req.query.order === 'asc' ? 'asc' : 'desc'

  const result = await getTasks(req.user.id, page, limit, sortBy, sortOrder)

  res.status(200).json({
    success: true,
    data: result.tasks,
    pagination: result.pagination
  })
})

const importTasks = asyncHandler(async (req, res) => {
  // Handle file upload
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    try {
      const result = await importTasksFromFile(req.file.path, req.user.id)
      
      res.status(200).json({
        success: true,
        message: `Successfully imported ${result.importedCount} tasks`,
        data: {
          importedCount: result.importedCount,
          errors: result.errors
        }
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Import failed',
        error: error.message
      })
    }
  })
})

const exportTasks = asyncHandler(async (req, res) => {
console.log("1")

  try {
    const format = req.query.format || 'excel' // 'excel' or 'csv'
    
    let result
    if (format === 'csv') {
      result = await exportTasksToCsv(req.user.id)
    } else {
      result = await exportTasksToExcel(req.user.id)
    }
    
    // Send file for download
    res.download(result.filePath, result.filename, (err) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file',
          error: err.message
        })
      }
      
      // Clean up file after download
      setTimeout(() => {
        deleteFile(result.filePath)
      }, 1000)
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Export failed',
      error: error.message
    })
  }
})

export {
  create,
  getAll,
  getById,
  update,
  remove,
  importTasks,
  exportTasks
}