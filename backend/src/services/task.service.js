import prisma from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'
import { 
  parseExcelFile, 
  parseCsvFile, 
  generateExcelFile, 
  generateCsvFile, 
  deleteFile 
} from './file.service.js'
import path from 'path'


const createTask = async (taskData, userId) => {
  const task = await prisma.task.create({
    data: {
      id: uuidv4(),
      userId,
      ...taskData,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
    },
  });

  return task;
};


const getTasks = async (userId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => {
  const skip = (page - 1) * limit

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where: { userId },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: skip,
      take: limit
    }),
    prisma.task.count({
      where: { userId }
    })
  ])

  return {
    tasks,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  }
}

const getTaskById = async (taskId, userId) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
      userId
    }
  })

  if (!task) {
    throw new Error('Task not found')
  }

  return task
}

const updateTask = async (taskId, taskData, userId) => {
  // Check if task exists and belongs to user
  const existingTask = await prisma.task.findUnique({
    where: {
      id: taskId,
      userId
    }
  })

  if (!existingTask) {
    throw new Error('Task not found')
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {...taskData, dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null}
  })

  return task
}

const deleteTask = async (taskId, userId) => {
  // Check if task exists and belongs to user
  const existingTask = await prisma.task.findUnique({
    where: {
      id: taskId,
      userId
    }
  })

  if (!existingTask) {
    throw new Error('Task not found')
  }

  await prisma.task.delete({
    where: { id: taskId }
  })

  return { message: 'Task deleted successfully' }
}

const importTasksFromFile = async (filePath, userId) => {
  try {
    let tasksData = []
    
    // Determine file type and parse accordingly
    const fileExtension = path.extname(filePath).toLowerCase()
    
    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      tasksData = await parseExcelFile(filePath)
    } else if (fileExtension === '.csv') {
      tasksData = parseCsvFile(filePath)
    } else {
      throw new Error('Unsupported file format')
    }

    // Validate tasks data
    const validTasks = tasksData.filter(task => {
      return task.title && 
             task.dueDate && 
             !isNaN(task.dueDate.getTime()) &&
             task.title.trim().length > 0
    })

    if (validTasks.length === 0) {
      throw new Error('No valid tasks found in the file')
    }

    // Create tasks in database
    const createdTasks = []
    const errors = []

    for (const taskData of validTasks) {
      try {
        const task = await prisma.task.create({
          data: {
            id: uuidv4(),
            userId,
            title: taskData.title,
            description: taskData.description || '',
            effortDays: taskData.effortDays || null,
            dueDate: taskData.dueDate
          }
        })
        createdTasks.push(task)
      } catch (error) {
        errors.push({
          task: taskData.title,
          error: error.message
        })
      }
    }

    // Clean up uploaded file
    deleteFile(filePath)

    return {
      importedCount: createdTasks.length,
      errors,
      tasks: createdTasks
    }
  } catch (error) {
    // Clean up uploaded file even if there's an error
    deleteFile(filePath)
    throw error
  }
}

const exportTasksToExcel = async (userId) => {
  try {
    // Get all tasks for the user
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (tasks.length === 0) {
      throw new Error('No tasks found to export')
    }

    // Generate Excel file
    const filename = `tasks_export_${userId}_${Date.now()}.xlsx`
    const filePath = await generateExcelFile(tasks, filename)

    return {
      filePath,
      filename,
      taskCount: tasks.length
    }
  } catch (error) {
    throw new Error(`Export failed: ${error.message}`)
  }
}

const exportTasksToCsv = async (userId) => {
  try {
    // Get all tasks for the user
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (tasks.length === 0) {
      throw new Error('No tasks found to export')
    }

    // Generate CSV file
    const filename = `tasks_export_${userId}_${Date.now()}.csv`
    const filePath = await generateCsvFile(tasks, filename)

    return {
      filePath,
      filename,
      taskCount: tasks.length
    }
  } catch (error) {
    throw new Error(`Export failed: ${error.message}`)
  }
}

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  importTasksFromFile,
  exportTasksToExcel,
  exportTasksToCsv
}