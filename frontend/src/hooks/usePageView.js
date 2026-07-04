import { useEffect, useRef } from 'react'
import client from '../api/client'

export default function usePageView(evento) {
  const sent = useRef(false)

  useEffect(() => {
    if (!evento || sent.current) return
    sent.current = true
    client.post('/stats/track', { evento }).catch(() => {})
  }, [evento])
}
