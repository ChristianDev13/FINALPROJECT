import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollReveal() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        target.scrollIntoView()
        return
      }
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])

  useEffect(() => {
    const elements = document.querySelectorAll('[data-scroll-reveal]')
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('scroll-revealed'))
      return undefined
    }

    let previousScrollY = window.scrollY
    let scrollDirection = 'down'
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      document.querySelectorAll('[data-sticky-nav]').forEach((navigation) => {
        navigation.classList.toggle('nav-scrolled', currentScrollY > 8)
      })
      if (currentScrollY !== previousScrollY) {
        scrollDirection = currentScrollY < previousScrollY ? 'up' : 'down'
        previousScrollY = currentScrollY
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-scroll-direction', scrollDirection)
          entry.target.classList.add('scroll-revealed')
        } else {
          entry.target.classList.remove('scroll-revealed')
        }
      })
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -28px 0px',
    })

    elements.forEach((element) => observer.observe(element))
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pathname])

  return null
}

export default ScrollReveal
