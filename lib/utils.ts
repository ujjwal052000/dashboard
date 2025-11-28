import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to find column value (case-insensitive, handles spaces, partial matches)
export function getColumnValue(row: Record<string, any>, possibleNames: string[]): number {
  // First try exact matches (case-insensitive)
  for (const name of possibleNames) {
    const foundKey = Object.keys(row).find(key => 
      key.toLowerCase().trim() === name.toLowerCase().trim()
    )
    if (foundKey) {
      const value = row[foundKey]
      if (value !== undefined && value !== null && value !== '') {
        const numValue = Number(value)
        if (!isNaN(numValue)) {
          return numValue
        }
      }
    }
  }
  
  // If no exact match, try partial matches (contains)
  for (const name of possibleNames) {
    const foundKey = Object.keys(row).find(key => 
      key.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(key.toLowerCase())
    )
    if (foundKey) {
      const value = row[foundKey]
      if (value !== undefined && value !== null && value !== '') {
        const numValue = Number(value)
        if (!isNaN(numValue)) {
          return numValue
        }
      }
    }
  }
  
  return 0
}

// Helper function to find column name
export function findColumnName(availableColumns: string[], possibleNames: string[]): string | null {
  // First try exact matches (case-insensitive)
  for (const name of possibleNames) {
    const found = availableColumns.find(col => 
      col.toLowerCase().trim() === name.toLowerCase().trim()
    )
    if (found) return found
  }
  
  // If no exact match, try partial matches
  for (const name of possibleNames) {
    const found = availableColumns.find(col => 
      col.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(col.toLowerCase())
    )
    if (found) return found
  }
  
  return null
}
