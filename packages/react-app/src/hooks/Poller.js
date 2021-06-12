import { useEffect, useRef } from 'react'

export default (fn, delay, extraWatch) => {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = fn
  }, [fn])

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const tick = () => {
      savedCallback.current()
    }
    if(delay !== null && delay > 0) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])

  useEffect(() => {
    fn()
  }, [extraWatch])
}