import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Check, Star, DollarSign, Calendar, Sun, Moon, AlertTriangle, Lock, Shield, X, AlertCircle } from 'lucide-react'
import useWeekDoc from '../hooks/useWeekDoc'
import { PARENT_PIN_HASH, EDIT_PIN_HASH, validatePin, weekDays, dayLabels, dayDates, everydayChores, morningRoutine, bedtimeRoutine, wednesdayChores, sundayChores, requiredThisWeek, optionalChores, LemonIcon, MiniTaco, WEEK_START_ISO } from '../data/choresData.jsx'

const PinModal = ({ isOpen, onClose, onSuccess, action, requiredPinHash }) => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      setError(false)
      if (newPin.length === 4) {
        setTimeout(() => {
          if (validatePin(newPin, requiredPinHash)) {
            onSuccess()
            setPin('')
            onClose()
          } else {
            setError(true)
            setPin('')
          }
        }, 200)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-600" />
            <h3 className="font-bold text-lg text-stone-700">Parent PIN</h3>
          </div>
          <button onClick={() => { onClose(); setPin(''); setError(false) }} className="p-1 hover:bg-stone-100 rounded-full">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>
        <p className="text-sm text-stone-500 mb-4 text-center">{action}</p>
        <div className="flex justify-center gap-3 mb-4">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${error ? 'border-red-400 bg-red-50 animate-pulse' : pin.length > i ? 'border-green-400 bg-green-50' : 'border-stone-200'}`}>
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm text-center mb-4 font-semibold">❌ Wrong PIN!</p>}
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6,7,8,9,null,0,'del'].map((num, idx) => (
            num === null ? <div key={idx} /> : num === 'del' ? (
              <button key={idx} onClick={() => setPin(prev => prev.slice(0,-1))} className="h-14 rounded-xl bg-red-100 hover:bg-red-200 font-bold text-red-600 transition-all">←</button>
            ) : (
              <button key={idx} onClick={() => handleKeyPress(num.toString())} className="h-14 rounded-xl bg-stone-100 hover:bg-amber-100 font-bold text-xl text-stone-700 transition-all active:scale-95">{num}</button>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChoreTracker() {
  const {
    todayIndex,
    completedSteps,
    parentApproved,
    requiredStatus,
    optionalStatus,
    updateTodayIndex,
    setCompletedStep,
    setParentApprovedField,
    setRequiredField,
    setOptionalField,
    loading
  } = useWeekDoc(WEEK_START_ISO)

  const [expandedTasks, setExpandedTasks] = useState({})
  const [currentDay, setCurrentDay] = useState('mon')
  const [pinModal, setPinModal] = useState({ open: false, action: '', callback: null })
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('choreTrackerUnlocked') === 'true'
  })

  const unlock = () => {
    setPinModal({
      open: true,
      action: 'Enter PIN to edit',
      requiredPinHash: EDIT_PIN_HASH,
      callback: () => {
        setIsUnlocked(true)
        sessionStorage.setItem('choreTrackerUnlocked', 'true')
      }
    })
  }

  const lock = () => {
    setIsUnlocked(false)
    sessionStorage.removeItem('choreTrackerUnlocked')
  }

  const toggleExpand = (taskId) => setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))

  const toggleStep = (category, day, taskId, stepIndex) => {
    if (!isUnlocked) return unlock()
    const key = `${category}-${day}-${taskId}-${stepIndex}`
    setCompletedStep(key, !completedSteps[key])
  }

  const getTaskProgress = (category, day, taskId, totalSteps) => {
    let completed = 0
    for (let i = 0; i < totalSteps; i++) {
      if (completedSteps[`${category}-${day}-${taskId}-${i}`]) completed++
    }
    return completed
  }

  const isApproved = (category, day, taskId) => parentApproved[`${category}-${day}-${taskId}`] === true

  const requestApproval = (category, day, taskId, taskName) => {
    if (!isUnlocked) return unlock()
    setPinModal({
      open: true,
      action: `Approve "${taskName}"?`,
      requiredPinHash: PARENT_PIN_HASH,
      callback: () => setParentApprovedField(`${category}-${day}-${taskId}`, true)
    })
  }

  const calculateEarnings = () => {
    let base = 15, totalPenalties = 0, bonusEarned = 0, optionalEarned = 0
    let missedTasks = []

    for (let i = 0; i < todayIndex; i++) {
      const day = weekDays[i]

      everydayChores.forEach(chore => {
        if (!isApproved('everyday', day, chore.id)) {
          totalPenalties += chore.penalty
          missedTasks.push({ day: dayLabels[day], task: chore.name, penalty: chore.penalty })
        }
      })

      morningRoutine.forEach(task => {
        if (!isApproved('morning', day, task.id)) {
          totalPenalties += task.penalty
          missedTasks.push({ day: dayLabels[day], task: `${task.name} (AM)`, penalty: task.penalty })
        }
      })

      bedtimeRoutine.forEach(task => {
        if (!isApproved('bedtime', day, task.id)) {
          totalPenalties += task.penalty
          missedTasks.push({ day: dayLabels[day], task: `${task.name} (PM)`, penalty: task.penalty })
        }
      })

      if (day === 'wed') {
        wednesdayChores.forEach(chore => {
          if (!isApproved('wednesday', day, chore.id)) {
            totalPenalties += chore.penalty
            missedTasks.push({ day: dayLabels[day], task: chore.name, penalty: chore.penalty })
          }
        })
      }
      if (day === 'sun') {
        sundayChores.forEach(chore => {
          if (!isApproved('sunday', day, chore.id)) {
            totalPenalties += chore.penalty
            missedTasks.push({ day: dayLabels[day], task: chore.name, penalty: chore.penalty })
          }
        })
      }
    }

    if (requiredStatus['weekly-a'] === 'great') bonusEarned += 5

    Object.entries(requiredStatus).forEach(([id, status]) => {
      const task = requiredThisWeek.find(t => t.id === id)
      if (task?.penalty) {
        if (status === 'not-done') totalPenalties += task.penalty.notDone
        else if (status === 'poor') totalPenalties += task.penalty.poorJob
      }
    })

    Object.entries(optionalStatus).forEach(([id, done]) => {
      if (done) {
        const chore = optionalChores.find(c => c.id === id)
        if (chore) optionalEarned += chore.reward
      }
    })

    return { base, totalPenalties, bonusEarned, optionalEarned, total: base + bonusEarned + optionalEarned - totalPenalties, missedTasks }
  }

  const TaskCard = ({ task, category, day, showCritical = false, showProof = false }) => {
    const isExpanded = expandedTasks[`${category}-${day}-${task.id}`]
    const progress = getTaskProgress(category, day, task.id, task.steps.length)
    const complete = progress === task.steps.length
    const approved = isApproved(category, day, task.id)
    const isPast = weekDays.indexOf(day) < todayIndex
    const missed = isPast && !approved

    return (
      <div className={`rounded-2xl border-2 transition-all shadow-sm ${approved ? 'border-green-400 bg-linear-to-r from-green-50 to-emerald-50' : missed ? 'border-red-400 bg-linear-to-r from-red-50 to-orange-50' : 'border-amber-200 bg-white hover:border-amber-400'}`}>
        <button onClick={() => toggleExpand(`${category}-${day}-${task.id}`)} className="w-full p-3 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${approved ? 'bg-green-500' : missed ? 'bg-red-500' : 'bg-amber-100'}`}>
              {approved ? <Shield className="w-6 h-6 text-white" /> : missed ? <X className="w-6 h-6 text-white" /> : <span className="text-sm font-bold text-amber-700">{progress}/{task.steps.length}</span>}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-bold text-sm ${approved ? 'text-green-700' : missed ? 'text-red-700' : 'text-stone-700'}`}>{task.name}</span>
                {approved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Approved</span>}
                {missed && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">-${task.penalty} MISSED</span>}
                {!approved && !missed && showCritical && task.critical && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">-${task.penalty}</span>}
                {showProof && task.needsProof && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold">📸</span>}
              </div>
              <div className="w-28 h-2 bg-stone-200 rounded-full mt-1.5 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${approved ? 'bg-green-500' : missed ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: approved ? '100%' : `${(progress / task.steps.length) * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-stone-100">
            {isExpanded ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
          </div>
        </button>

        {isExpanded && (
          <div className="px-3 pb-3 space-y-1.5">
            {task.steps.map((step, idx) => {
              const checked = completedSteps[`${category}-${day}-${task.id}-${idx}`]
              return (
                <button key={idx} onClick={() => !approved && toggleStep(category, day, task.id, idx)} disabled={approved} className={`w-full flex items-start gap-2 p-2 rounded-lg transition-all text-left text-sm ${approved ? 'bg-green-100 text-green-700' : checked ? 'bg-green-100 text-green-800' : 'bg-amber-50 hover:bg-amber-100 text-stone-700'}`}>
                  <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center mt-0.5 ${(approved || checked) ? 'border-green-500 bg-green-500' : 'border-amber-300 bg-white'}`}>
                    {(approved || checked) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={(approved || checked) ? 'line-through opacity-70' : ''}><span className="font-bold text-amber-600 mr-1">{idx + 1}.</span>{step}</span>
                </button>
              )
            })}

            {!approved && complete && (
              <button onClick={() => requestApproval(category, day, task.id, task.name)} className="w-full mt-2 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg text-sm">
                <Lock className="w-4 h-4" /> Request Parent Approval
              </button>
            )}
            {!approved && !complete && <div className="text-center text-xs text-stone-400 mt-2">Complete all steps first</div>}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="min-h-screen bg-[#C5B358] flex items-center justify-center"><p className="text-white font-bold text-xl">Loading...</p></div>
  }

  const earnings = calculateEarnings()
  const isNegative = earnings.total < 0

  return (
    <div className="min-h-screen bg-[#C5B358] p-2">
      <PinModal isOpen={pinModal.open} onClose={() => setPinModal({ open: false, action: '', callback: null })} onSuccess={() => pinModal.callback?.()} action={pinModal.action} requiredPinHash={pinModal.requiredPinHash} />

      <div className="relative bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-3 min-h-screen" style={{ boxShadow: 'inset 0 0 0 3px #8B7355, inset 0 0 0 6px #C5B358, inset 0 0 0 9px #4CAF50' }}>
        <div className="absolute top-1 left-1"><MiniTaco className="w-6 h-6" /></div>
        <div className="absolute top-1 right-1 flex gap-2 items-center">
          {isUnlocked ? (
            <button onClick={lock} className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-all shadow-lg">
              <Lock className="w-3.5 h-3.5" /> Lock
            </button>
          ) : (
            <button onClick={unlock} className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-all shadow-lg">
              <Shield className="w-3.5 h-3.5" /> Unlock to Edit
            </button>
          )}
          <LemonIcon className="w-6 h-6" />
        </div>

        <div className="max-w-2xl mx-auto pt-2">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-black bg-linear-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">🌮 Sample Household Chore Tracker</h1>
            <p className="text-stone-500 text-sm font-medium">Example week</p>
          </div>

          <div className={`rounded-2xl p-4 mb-4 shadow-xl border-2 ${isNegative ? 'bg-linear-to-r from-red-100 to-red-50 border-red-400' : 'bg-linear-to-r from-amber-100 via-orange-100 to-yellow-100 border-amber-400'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${isNegative ? 'bg-red-500' : 'bg-linear-to-br from-yellow-400 to-amber-500'}`}>
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-stone-600 font-medium">Weekly Total</p>
                  <p className={`text-3xl font-black ${isNegative ? 'text-red-600' : 'text-green-600'}`}>${earnings.total}</p>
                </div>
              </div>
              <div className="text-right text-xs space-y-0.5 bg-white/60 rounded-lg p-2">
                <p>Base: <span className="text-green-600 font-bold">$15</span></p>
                <p>Bonus: <span className="text-amber-600 font-bold">+${earnings.bonusEarned}</span></p>
                <p>Optional: <span className="text-blue-600 font-bold">+${earnings.optionalEarned}</span></p>
                <p>Penalties: <span className="text-red-600 font-bold">-${earnings.totalPenalties}</span></p>
              </div>
            </div>

            {isNegative && (
              <div className="mt-3 p-3 bg-red-200 rounded-xl border-2 border-red-400">
                <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span>Example consequence applies next week.</span>
                </div>
              </div>
            )}

            {earnings.missedTasks.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs text-red-600 cursor-pointer font-semibold">📋 {earnings.missedTasks.length} missed tasks (-${earnings.totalPenalties})</summary>
                <div className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                  {earnings.missedTasks.map((m, i) => (
                    <div key={i} className="flex justify-between bg-red-100 p-1.5 rounded">
                      <span>{m.day}: {m.task}</span>
                      <span className="text-red-600 font-bold">-${m.penalty}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          <div className="mb-4 p-2 bg-stone-100 rounded-xl text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-stone-600">📅 Set Today:</span>
              {weekDays.map((d, i) => (
                <button key={d} onClick={() => isUnlocked ? updateTodayIndex(i) : unlock()} className={`px-2 py-1 rounded font-semibold ${todayIndex === i ? 'bg-amber-500 text-white' : 'bg-white text-stone-600'}`}>
                  {dayLabels[d].slice(0, 3)}
                </button>
              ))}
            </div>
            <p className="text-stone-500 mt-1">↑ Change this as days pass. Past days auto-penalize unapproved tasks.</p>
          </div>

          <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
            {weekDays.map((day, i) => {
              const isPast = i < todayIndex
              const isToday = i === todayIndex
              const isSpecial = day === 'wed' || day === 'sun'
              return (
                <button key={day} onClick={() => setCurrentDay(day)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border ${currentDay === day ? 'bg-amber-500 text-white border-amber-600' : isPast ? 'bg-stone-200 text-stone-500 border-stone-300' : isToday ? 'bg-green-100 text-green-700 border-green-400' : 'bg-white text-stone-600 border-stone-200'}`}>
                  {dayLabels[day].slice(0, 3)} {dayDates[day]}
                  {isSpecial && <Star className="w-2.5 h-2.5 inline ml-0.5 fill-current" />}
                  {isToday && <span className="ml-1">●</span>}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 mb-3 bg-white rounded-lg p-2 border border-amber-200">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-stone-700">{dayLabels[currentDay]} {dayDates[currentDay]}</h2>
            {weekDays.indexOf(currentDay) < todayIndex && <span className="text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full ml-auto">Past</span>}
            {weekDays.indexOf(currentDay) === todayIndex && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto">Today</span>}
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2"><Sun className="w-5 h-5 text-amber-500" /><h3 className="font-bold text-stone-700">Morning Routine</h3></div>
            <div className="space-y-2">{morningRoutine.map(task => <TaskCard key={task.id} task={task} category="morning" day={currentDay} showProof={true} />)}</div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2"><span className="text-lg">🧹</span><h3 className="font-bold text-stone-700">Daily Chores</h3><span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Critical tasks = -$10</span></div>
            <div className="space-y-2">{everydayChores.map(task => <TaskCard key={task.id} task={task} category="everyday" day={currentDay} showCritical={true} />)}</div>
          </div>

          {currentDay === 'wed' && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2"><span className="text-lg">⭐</span><h3 className="font-bold text-stone-700">Wednesday - Special Task</h3></div>
              <div className="space-y-2">{wednesdayChores.map(task => <TaskCard key={task.id} task={task} category="wednesday" day={currentDay} />)}</div>
            </div>
          )}

          {currentDay === 'sun' && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2"><span className="text-lg">✨</span><h3 className="font-bold text-stone-700">Sunday Specials</h3></div>
              <div className="space-y-2">{sundayChores.map(task => <TaskCard key={task.id} task={task} category="sunday" day="sun" />)}</div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2"><Moon className="w-5 h-5 text-indigo-500" /><h3 className="font-bold text-stone-700">Bedtime Routine</h3></div>
            <div className="space-y-2">{bedtimeRoutine.map(task => <TaskCard key={task.id} task={task} category="bedtime" day={currentDay} showProof={true} />)}</div>
          </div>

          <div className="mb-4 p-3 bg-red-50 rounded-2xl border-2 border-red-200">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-red-500" /><h3 className="font-bold text-red-700">REQUIRED This Week</h3></div>
            <div className="space-y-2">
              {requiredThisWeek.map(task => (
                <div key={task.id} className="bg-white rounded-xl p-3 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-stone-700 text-sm">{task.name}</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{task.deadline}</span>
                  </div>
                  {task.isBonus ? (
                    <div className="flex gap-1">
                      <button onClick={() => isUnlocked ? setRequiredField(task.id, requiredStatus[task.id] === 'great' ? null : 'great') : unlock()} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${requiredStatus[task.id] === 'great' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>🌟 Great +$5</button>
                      <button onClick={() => isUnlocked ? setRequiredField(task.id, requiredStatus[task.id] === 'not-great' ? null : 'not-great') : unlock()} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${requiredStatus[task.id] === 'not-great' ? 'bg-stone-400 text-white' : 'bg-stone-100 text-stone-600'}`}>Not Great $0</button>
                    </div>
                  ) : (
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => isUnlocked ? setRequiredField(task.id, requiredStatus[task.id] === 'done' ? null : 'done') : unlock()} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${requiredStatus[task.id] === 'done' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>✓ Done</button>
                      {task.penalty?.poorJob > 0 && <button onClick={() => isUnlocked ? setRequiredField(task.id, requiredStatus[task.id] === 'poor' ? null : 'poor') : unlock()} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${requiredStatus[task.id] === 'poor' ? 'bg-amber-400 text-white' : 'bg-amber-100 text-amber-700'}`}>Tried -${task.penalty.poorJob}</button>}
                      <button onClick={() => isUnlocked ? setRequiredField(task.id, requiredStatus[task.id] === 'not-done' ? null : 'not-done') : unlock()} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${requiredStatus[task.id] === 'not-done' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>Not Done -${task.penalty?.notDone}</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 p-3 bg-green-50 rounded-2xl border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2"><span className="text-lg">🌟</span><h3 className="font-bold text-green-700">BONUS Chores</h3></div>
            <div className="space-y-2">
              {optionalChores.map(chore => (
                <div key={chore.id} className="bg-white rounded-xl p-3 border border-green-200 flex items-center justify-between">
                  <span className="font-semibold text-stone-700 text-sm">{chore.name}</span>
                  <button onClick={() => isUnlocked ? setOptionalField(chore.id, !optionalStatus[chore.id]) : unlock()} className={`px-4 py-1.5 rounded-lg text-sm font-bold ${optionalStatus[chore.id] ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
                    {optionalStatus[chore.id] ? '✓ Done!' : `+$${chore.reward}`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-xs text-stone-400 pb-4">
            <p>🔒 Demo PIN required to approve tasks</p>
            <p>⚠️ Unapproved past tasks = automatic penalty</p>
            <p className="text-red-500 font-semibold mt-1">Example consequence applies next week.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
