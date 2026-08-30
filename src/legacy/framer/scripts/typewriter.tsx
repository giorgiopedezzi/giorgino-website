import {
  forwardRef,
  type ComponentType,
  useCallback,
  useEffect,
  useRef,
} from "react"
import { useInView } from "framer-motion"

type CharacterToken = {
  span: HTMLSpanElement
  char: string
  isSpace: boolean
  isPeriod: boolean
  headingIndex: number // Tracks which heading this character belongs to
}

// Kept the original name 'TypewriterBeliefsSound' to fix the Framer export error
export function TypewriterBeliefsSound(
  Component: ComponentType<any>
): ComponentType<any> {
  return forwardRef<any, any>(
    function TypewriterBeliefsSoundOverride(props, forwardedRef) {
      const localRef = useRef<HTMLElement | null>(null)
      const inView = useInView(localRef, { amount: 0.35 })
      const hasStartedRef = useRef(false)
      const hasCompletedRef = useRef(false)
      const isUnmountedRef = useRef(false)
      const playbackTimeoutRef = useRef<number | null>(null)
      const tokensRef = useRef<CharacterToken[]>([])
      const restoreCallbacksRef = useRef<Array<() => void>>([])
      const preparedRef = useRef(false)
      const animationIndexRef = useRef(0)

      const setRefs = useCallback(
        (node: HTMLElement | null) => {
          localRef.current = node

          if (typeof forwardedRef === "function") {
            forwardedRef(node)
          } else if (forwardedRef && "current" in forwardedRef) {
            forwardedRef.current = node
          }
        },
        [forwardedRef]
      )

      const clearPlaybackTimer = useCallback(() => {
        if (typeof window === "undefined") return
        if (playbackTimeoutRef.current !== null) {
          window.clearTimeout(playbackTimeoutRef.current)
          playbackTimeoutRef.current = null
        }
      }, [])

      const prepareBeliefsText = useCallback(() => {
        if (preparedRef.current || typeof window === "undefined") return
        const root = localRef.current
        if (!root) return

        const headings = Array.from(root.querySelectorAll("h2")).slice(
          0,
          4
        )
        if (headings.length === 0) return

        const collectedTokens: CharacterToken[] = []
        const restoreCallbacks: Array<() => void> = []

        headings.forEach((heading, headingIndex) => {
          const originalHTML = heading.innerHTML
          const originalAriaLabel = heading.getAttribute("aria-label")
          const fullText = heading.textContent ?? ""
          heading.setAttribute("aria-label", fullText)

          const walker = document.createTreeWalker(
            heading,
            NodeFilter.SHOW_TEXT
          )
          const textNodes: Text[] = []
          let currentNode = walker.nextNode()
          while (currentNode) {
            textNodes.push(currentNode as Text)
            currentNode = walker.nextNode()
          }

          textNodes.forEach((textNode) => {
            const text = textNode.nodeValue ?? ""
            if (!text) return
            const fragment = document.createDocumentFragment()

            for (const rawChar of text) {
              const isSpace = /\s/.test(rawChar)
              const isPeriod = rawChar === "."
              const span = document.createElement("span")
              span.style.visibility = "hidden"
              span.setAttribute("aria-hidden", "true")
              span.textContent = rawChar
              fragment.appendChild(span)
              collectedTokens.push({
                span,
                char: rawChar,
                isSpace,
                isPeriod,
                headingIndex,
              })
            }

            textNode.parentNode?.replaceChild(fragment, textNode)
          })

          restoreCallbacks.push(() => {
            heading.innerHTML = originalHTML
            if (originalAriaLabel === null) {
              heading.removeAttribute("aria-label")
            } else {
              heading.setAttribute(
                "aria-label",
                originalAriaLabel
              )
            }
          })
        })

        tokensRef.current = collectedTokens
        restoreCallbacksRef.current = restoreCallbacks
        preparedRef.current = true
      }, [])

      const stepReveal = useCallback(() => {
        if (isUnmountedRef.current) return

        const tokens = tokensRef.current
        const index = animationIndexRef.current
        const token = tokens[index]

        if (!token) {
          hasCompletedRef.current = true
          if (typeof window !== "undefined") {
            ;(
              window as Window & {
                __beliefsTypewriterComplete?: boolean
              }
            ).__beliefsTypewriterComplete = true
            window.dispatchEvent(
              new Event("beliefs-typewriter-complete")
            )
          }
          clearPlaybackTimer()
          return
        }

        token.span.style.visibility = "visible"
        animationIndexRef.current = index + 1

        const nextToken = tokens[index + 1]

        // Determine layout transitions
        const isNewLineTransition =
          nextToken && token.headingIndex !== nextToken.headingIndex

        // Base timing properties
        const totalCharacters = Math.max(tokens.length, 1)
        const targetDurationMs = 10000
        const baseDelay = Math.max(
          40,
          Math.min(110, targetDurationMs / totalCharacters)
        )
        const variance = (Math.random() - 0.5) * baseDelay * 0.55
        const spacePause = token.isSpace ? baseDelay * 0.75 : 0

        let calculatedDelay = baseDelay + variance + spacePause

        // Apply structural cadence overrides
        if (token.isPeriod && isNewLineTransition) {
          calculatedDelay = 1000 // Period + Line Jump combo
        } else if (token.isPeriod) {
          calculatedDelay = 300 // Mid-sentence period
        } else if (isNewLineTransition) {
          calculatedDelay = 700 // Natural paragraph/line break transition
        }

        if (typeof window !== "undefined") {
          playbackTimeoutRef.current = window.setTimeout(
            stepReveal,
            Math.max(28, calculatedDelay)
          )
        }
      }, [clearPlaybackTimer])

      const beginTypewriter = useCallback(() => {
        if (hasStartedRef.current || hasCompletedRef.current) return
        if (!preparedRef.current) prepareBeliefsText()
        if (tokensRef.current.length === 0) return
        hasStartedRef.current = true
        stepReveal()
      }, [prepareBeliefsText, stepReveal])

      useEffect(() => {
        prepareBeliefsText()
      }, [prepareBeliefsText])

      useEffect(() => {
        if (!inView || hasStartedRef.current || hasCompletedRef.current)
          return

        beginTypewriter()
      }, [beginTypewriter, inView])

      useEffect(() => {
        return () => {
          isUnmountedRef.current = true
          clearPlaybackTimer()
          for (const restore of restoreCallbacksRef.current) {
            restore()
          }
          restoreCallbacksRef.current = []
        }
      }, [clearPlaybackTimer])

      return <Component ref={setRefs} {...props} />
    }
  )
}
