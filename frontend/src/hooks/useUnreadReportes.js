import { useEffect, useState } from 'react'
import client from '../api/client'

export function useUnreadReportes() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const { data } = await client.get('/reportes/unread-count')
        if (active) setCount(data.count || 0)
      } catch {
        if (active) setCount(0)
      }
    }

    load()
    const interval = setInterval(load, 30000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return count
}
