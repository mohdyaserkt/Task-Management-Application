import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'
import { createObjectCsvWriter } from 'csv-writer'
import { parse } from 'csv-parse/sync'

const parseExcelFile = async (filePath) => {
  try {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    
    const worksheet = workbook.getWorksheet(1)
    const tasks = []
    
  
    const headerRow = worksheet.getRow(1)
    const headers = {}
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value
    })
    
    // Process data rows
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i)
      const taskData = {}
      
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber]
        if (header) {
          taskData[header] = cell.value
        }
      })
      
      // Map different column names to standard fields
      const title = taskData['Task Title'] || taskData['title'] || taskData['Title'] || ''
      const description = taskData['Description'] || taskData['description'] || taskData['Task Description'] || ''
      const effortDays = taskData['Effort To Complete(In Days)'] || taskData['effortDays'] || taskData['EffortDays'] || null
      const dueDate = taskData['Due Date'] || taskData['dueDate'] || taskData['DueDate'] || ''
      
      if (title && dueDate) {
        tasks.push({
          title: title.toString().trim(),
          description: description.toString().trim(),
          effortDays: effortDays ? parseInt(effortDays) : null,
          dueDate: new Date(dueDate)
        })
      }
    }
    
    return tasks
  } catch (error) {
    throw new Error(`Error parsing Excel file: ${error.message}`)
  }
}

const parseCsvFile = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })
    
    const tasks = records.map(row => {
      // Map different column names to standard fields
      const title = row['Task Title'] || row['title'] || row['Title'] || ''
      const description = row['Description'] || row['description'] || row['Task Description'] || ''
      const effortDays = row['Effort To Complete(In Days)'] || row['effortDays'] || row['EffortDays'] || null
      const dueDate = row['Due Date'] || row['dueDate'] || row['DueDate'] || ''
      
      return {
        title: title.toString().trim(),
        description: description.toString().trim(),
        effortDays: effortDays ? parseInt(effortDays) : null,
        dueDate: new Date(dueDate)
      }
    }).filter(task => task.title && task.dueDate && !isNaN(task.dueDate.getTime()))
    
    return tasks
  } catch (error) {
    throw new Error(`Error parsing CSV file: ${error.message}`)
  }
}

const generateExcelFile = async (tasks, filename = 'tasks_export.xlsx') => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Tasks')
    
    // Define columns
    worksheet.columns = [
      { header: 'Task Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Effort To Complete(In Days)', key: 'effortDays', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ]
    
    // Add data
    tasks.forEach(task => {
      worksheet.addRow({
        title: task.title,
        description: task.description || '',
        effortDays: task.effortDays || '',
        dueDate: task.dueDate.toISOString().split('T')[0],
        createdAt: task.createdAt.toISOString().split('T')[0]
      })
    })
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    // Generate file path
    const filePath = path.join(uploadsDir, filename)
    
    // Write to file
    await workbook.xlsx.writeFile(filePath)
    
    return filePath
  } catch (error) {
    throw new Error(`Error generating Excel file: ${error.message}`)
  }
}

const generateCsvFile = async (tasks, filename = 'tasks_export.csv') => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    const filePath = path.join(uploadsDir, filename)
    
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'title', title: 'Task Title' },
        { id: 'description', title: 'Description' },
        { id: 'effortDays', title: 'Effort To Complete(In Days)' },
        { id: 'dueDate', title: 'Due Date' },
        { id: 'createdAt', title: 'Created At' }
      ]
    })
    
    const records = tasks.map(task => ({
      title: task.title,
      description: task.description || '',
      effortDays: task.effortDays || '',
      dueDate: task.dueDate.toISOString().split('T')[0],
      createdAt: task.createdAt.toISOString().split('T')[0]
    }))
    
    await csvWriter.writeRecords(records)
    
    return filePath
  } catch (error) {
    throw new Error(`Error generating CSV file: ${error.message}`)
  }
}

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.warn(`Could not delete file ${filePath}: ${error.message}`)
  }
}

export {
  parseExcelFile,
  parseCsvFile,
  generateExcelFile,
  generateCsvFile,
  deleteFile
}