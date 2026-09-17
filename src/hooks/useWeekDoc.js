import { useEffect, useState, useCallback } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc, updateDoc, deleteField, getDoc } from 'firebase/firestore'
import { WEEK_START_ISO } from '../data/choresData.jsx'

export default function useWeekDoc(weekId = WEEK_START_ISO) {
  const [todayIndex, setTodayIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState({})
  const [parentApproved, setParentApproved] = useState({})
  const [requiredStatus, setRequiredStatus] = useState({})
  const [optionalStatus, setOptionalStatus] = useState({})

  useEffect(() => {
    const ref = doc(db, 'weeks', weekId)

    let unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        // initialize document with defaults
        await setDoc(ref, {
          weekId,
          todayIndex: 0,
          completedSteps: {},
          parentApproved: {},
          requiredStatus: {},
          optionalStatus: {}
        }, { merge: true })
        return
      }

      const data = snap.data()
      setTodayIndex(data.todayIndex ?? 0)
      setCompletedSteps(data.completedSteps ?? {})
      setParentApproved(data.parentApproved ?? {})
      setRequiredStatus(data.requiredStatus ?? {})
      setOptionalStatus(data.optionalStatus ?? {})
    })

    return () => unsub()
  }, [weekId])

  const ensureDoc = useCallback(async () => {
    const ref = doc(db, 'weeks', weekId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, { weekId, todayIndex: 0, completedSteps: {}, parentApproved: {}, requiredStatus: {}, optionalStatus: {} })
    }
    return ref
  }, [weekId])

  const updateTodayIndex = useCallback(async (value) => {
    const ref = await ensureDoc()
    await updateDoc(ref, { todayIndex: value })
  }, [ensureDoc])

  const setCompletedStep = useCallback(async (key, value) => {
    const ref = await ensureDoc()
    if (value) {
      await updateDoc(ref, { [`completedSteps.${key}`]: true })
    } else {
      await updateDoc(ref, { [`completedSteps.${key}`]: deleteField() })
    }
  }, [ensureDoc])

  const setParentApprovedField = useCallback(async (key, value) => {
    const ref = await ensureDoc()
    if (value) await updateDoc(ref, { [`parentApproved.${key}`]: true })
    else await updateDoc(ref, { [`parentApproved.${key}`]: deleteField() })
  }, [ensureDoc])

  const setRequiredField = useCallback(async (id, value) => {
    const ref = await ensureDoc()
    if (value == null) await updateDoc(ref, { [`requiredStatus.${id}`]: deleteField() })
    else await updateDoc(ref, { [`requiredStatus.${id}`]: value })
  }, [ensureDoc])

  const setOptionalField = useCallback(async (id, value) => {
    const ref = await ensureDoc()
    if (value) await updateDoc(ref, { [`optionalStatus.${id}`]: true })
    else await updateDoc(ref, { [`optionalStatus.${id}`]: deleteField() })
  }, [ensureDoc])

  return {
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
  }
}
