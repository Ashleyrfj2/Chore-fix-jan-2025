import React from 'react'

// PUBLIC DEMO ONLY: these are placeholder PINs for the UI flow.
// Client-side PIN checks are not a security boundary. Protect real data with
// Firebase Authentication and restrictive Firestore rules.
const hashPin = (pin) => {
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    hash = ((hash << 5) - hash) + pin.charCodeAt(i)
    hash = hash & hash
  }
  return hash.toString(36)
}

export const PARENT_PIN_HASH = hashPin('0000')
export const EDIT_PIN_HASH = hashPin('0000')
export const WEEK_START_ISO = '2026-01-05'

export const validatePin = (enteredPin, hashToCompare) => {
  return hashPin(enteredPin) === hashToCompare
}

export const weekDays = ['mon','tue','wed','thu','fri','sat','sun']
export const dayLabels = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }
export const dayDates = { mon: '1/5', tue: '1/6', wed: '1/7', thu: '1/8', fri: '1/9', sat: '1/10', sun: '1/11' }

// All task content and identifiers below are intentionally generic sample data.
export const everydayChores = [
  { id: 'daily-a', name: 'Example Daily Chore A', critical: true, penalty: 10, steps: ['[Example step 1]', '[Example step 2]', '[Example step 3]'] },
  { id: 'daily-b', name: 'Example Daily Chore B', critical: true, penalty: 10, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'daily-c', name: 'Example Daily Chore C', critical: true, penalty: 10, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'daily-d', name: 'Example Daily Chore D', critical: false, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'daily-e', name: 'Example Daily Chore E', critical: false, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'daily-f', name: 'Example Daily Chore F', critical: false, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'daily-g', name: 'Example Daily Chore G', critical: false, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'daily-h', name: 'Example Daily Chore H', critical: false, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] }
]

export const morningRoutine = [
  { id: 'morning-a', name: 'Example Morning Task A', needsProof: true, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'morning-b', name: 'Example Morning Task B', needsProof: true, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'morning-c', name: 'Example Morning Task C', needsProof: true, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'morning-d', name: 'Example Morning Task D', needsProof: true, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'morning-e', name: 'Example Morning Task E', needsProof: false, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] }
]

export const bedtimeRoutine = [
  { id: 'evening-a', name: 'Example Evening Task A', needsProof: true, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'evening-b', name: 'Example Evening Task B', needsProof: true, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'evening-c', name: 'Example Evening Task C', needsProof: true, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'evening-d', name: 'Example Evening Task D', needsProof: false, penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] }
]

export const sundayChores = [
  { id: 'weekend-a', name: 'Example Weekend Task A', penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'weekend-b', name: 'Example Weekend Task B', penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'weekend-c', name: 'Example Weekend Task C', penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] }
]

export const wednesdayChores = [
  { id: 'midweek-a', name: 'Example Midweek Task', penalty: 5, steps: ['[Example step 1]', '[Example step 2]'] }
]

export const requiredThisWeek = [
  { id: 'weekly-a', name: 'Example Weekly Task A', deadline: 'This week', isBonus: true, reward: 5, steps: ['[Example step 1]', '[Example step 2]'], note: '[Example bonus note]' },
  { id: 'weekly-b', name: 'Example Weekly Task B', deadline: 'Sunday EOD', penalty: { notDone: 10, poorJob: 5 }, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'weekly-c', name: 'Example Weekly Task C', deadline: 'This week', penalty: { notDone: 5, poorJob: 0 }, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'weekly-d', name: 'Example Weekly Task D', deadline: 'This week', penalty: { notDone: 5, poorJob: 0 }, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'weekly-e', name: 'Example Weekly Task E', deadline: 'This week', penalty: { notDone: 5, poorJob: 0 }, steps: ['[Example step 1]', '[Example step 2]'] }
]

export const optionalChores = [
  { id: 'bonus-a', name: 'Example Bonus Chore A', reward: 5, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'bonus-b', name: 'Example Bonus Chore B', reward: 3, steps: ['[Example step 1]', '[Example step 2]'] },
  { id: 'bonus-c', name: 'Example Bonus Chore C', reward: 1, steps: ['[Example step 1]', '[Example step 2]'] }
]

export const LemonIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className}><ellipse cx="12" cy="12" rx="8" ry="6" fill="#FDD835" stroke="#F9A825" strokeWidth="1"/><ellipse cx="12" cy="12" rx="5" ry="3" fill="#FFEB3B" opacity="0.5"/></svg>
)

export const MiniTaco = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className}><path d="M4 20 Q16 28 28 20 Q28 12 16 10 Q4 12 4 20Z" fill="#C5B358" stroke="#8B7355" strokeWidth="1"/><path d="M6 18 Q10 21 14 18 Q18 21 22 18 Q26 21 26 18" fill="#4CAF50" stroke="#2E7D32" strokeWidth="0.5"/><circle cx="10" cy="16" r="2" fill="#E53935"/><circle cx="16" cy="15" r="2" fill="#EF5350"/><circle cx="22" cy="16" r="2" fill="#E53935"/></svg>
)
