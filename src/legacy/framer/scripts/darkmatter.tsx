import {
  forwardRef,
  type ComponentType,
  useCallback,
  useEffect,
  useRef,
} from "react"

const VIEWPORT_AMOUNT = 0.4
const INITIAL_PAUSE_MS = 4000
const TYPEWRITER_INTERVAL_MS = 70
const FINAL_PAUSE_MS = 3000

const SECTION_NAME = "Dark matter"
const NARRATIVE_NAME = "Dark matter narrative"
const TRANSITION_NAME = "Dark matter transition"
const CLOSING_NAME = "Dark matter closing thought"

type PreparedText = {
  element: HTMLElement
  originalHTML: string
  originalText: string
  originalDisplay: string
}

function stripEditorialText(text: string): string {
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function hashWord(word: string): number {
  let hash = 2166136261
  for (let index = 0; index < word.length; index++) {
    hash ^= word.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function scrambleWord(word: string): string {
  const characters = Array.from(word)
  if (characters.length <= 3) return word

  let seed = hashWord(word)

  // Each distinct swap alters exactly 2 letters.
  // Capping swaps at length / 4 guarantees we never exceed the 50% limit.
  const totalSwaps = Math.floor(word.length / 4)

  const midStart = 1
  const midLength = characters.length - 2

  for (let i = 0; i < totalSwaps; i++) {
    // Pick the first random index in the middle
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const idx1 = midStart + (seed % midLength)

    let idx2 = idx1
    // Keep generating a second index until it is different from the first
    while (idx2 === idx1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      idx2 = midStart + (seed % midLength)
    }

    // Execute the guaranteed valid swap
    ;[characters[idx1], characters[idx2]] = [
      characters[idx2],
      characters[idx1],
    ]
  }

  return characters.join("")
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

const FIXED_WORD_STYLE =
  "background-color:#000;color:#fff;padding:0 0.1em;transition:background-color 0.15s ease,color 0.15s ease"

// Renders the narrative as HTML: words the cursor has fully restored get a
// black-background/white-text highlight; still-scrambled words render plain.
// The highlight is undone for free once revealFinal() swaps in the true
// original (unmarked) HTML.
function buildIntermediateHTML(strippedText: string, cursor: number): string {
  let offset = 0
  return strippedText
    .split(/(\s+)/)
    .map((part) => {
      const start = offset
      offset += part.length
      if (!part || /^\s+$/.test(part)) return part
      const scrambled = scrambleWord(part)
      const restoredCharacters = Math.max(
        0,
        Math.min(part.length, cursor - start)
      )
      const displayed =
        part.slice(0, restoredCharacters) +
        scrambled.slice(restoredCharacters)
      const isFullyFixed = restoredCharacters >= part.length
      return isFullyFixed
        ? `<span style="${FIXED_WORD_STYLE}">${escapeHtml(displayed)}</span>`
        : escapeHtml(displayed)
    })
    .join("")
}

// TARGETED FINDER: Specifically looks for Framer's .framer-text wrapper
function findTextElement(root: HTMLElement, name: string): HTMLElement | null {
  const container = root.querySelector<HTMLElement>(
    `[data-framer-name="${name}"]`
  )
  if (!container) return null

  // Framer specifically wraps text layers in a div with class "framer-text"
  const textEl = container.querySelector<HTMLElement>(".framer-text")
  return textEl ?? container
}

function restoreText(prepared: PreparedText) {
  prepared.element.innerHTML = prepared.originalHTML
  prepared.element.style.display = prepared.originalDisplay
  prepared.element.removeAttribute("aria-hidden")
}

export function handleDarkMatter(
  Component: ComponentType<any>
): ComponentType<any> {
  return forwardRef<any, any>(
    function DarkMatterOverride(props, forwardedRef) {
      const localRef = useRef<HTMLElement | null>(null)
      // The ref Framer forwards to this override is NOT reliably the
      // "Dark matter" section element itself - it's often an internal
      // wrapper div (no data-framer-name). So viewport detection must
      // observe the actual resolved section element, not this ref.
      const viewportObserverRef = useRef<IntersectionObserver | null>(
        null
      )
      const beginRef = useRef<() => void>(() => {})

      const hasStartedRef = useRef(false)
      const isUnmountedRef = useRef(false)
      const initialTimerRef = useRef<number | null>(null)
      const typewriterTimerRef = useRef<number | null>(null)
      const finalTimerRef = useRef<number | null>(null)

      const sectionRef = useRef<HTMLElement | null>(null)
      const narrativeRef = useRef<PreparedText | null>(null)
      const transitionRef = useRef<PreparedText | null>(null)
      const closingRef = useRef<PreparedText | null>(null)
      const strippedNarrativeRef = useRef("")
      const originalSectionOpacityRef = useRef("1")

      // Framer's own RichTextContainer components re-render on scroll/state
      // changes and will silently overwrite our direct DOM edits. This tracks
      // the state we intend to be on screen so we can re-apply it if Framer's
      // render reverts it.
      const guardStateRef = useRef({
        sectionOpacity: "1",
        narrativeHTML: "",
        transitionDisplay: "",
        transitionText: "",
        closingDisplay: "",
      })
      const guardObserverRef = useRef<MutationObserver | null>(null)

      const clearTimers = useCallback(() => {
        if (typeof window === "undefined") return
        if (initialTimerRef.current !== null) {
          window.clearTimeout(initialTimerRef.current)
          initialTimerRef.current = null
        }
        if (typewriterTimerRef.current !== null) {
          window.clearInterval(typewriterTimerRef.current)
          typewriterTimerRef.current = null
        }
        if (finalTimerRef.current !== null) {
          window.clearTimeout(finalTimerRef.current)
          finalTimerRef.current = null
        }
      }, [])

      const stopGuard = useCallback(() => {
        if (guardObserverRef.current) {
          guardObserverRef.current.disconnect()
          guardObserverRef.current = null
        }
      }, [])

      const startGuard = useCallback(() => {
        if (typeof MutationObserver === "undefined") return
        const section = sectionRef.current
        const narrative = narrativeRef.current
        const transition = transitionRef.current
        const closing = closingRef.current
        if (!section || !narrative || !transition || !closing) return

        const reconcile = () => {
          const state = guardStateRef.current
          if (section.style.opacity !== state.sectionOpacity) {
            section.style.opacity = state.sectionOpacity
          }
          if (narrative.element.innerHTML !== state.narrativeHTML) {
            narrative.element.innerHTML = state.narrativeHTML
          }
          if (
            transition.element.style.display !==
            state.transitionDisplay
          ) {
            transition.element.style.display =
              state.transitionDisplay
          }
          if (
            transition.element.textContent !== state.transitionText
          ) {
            transition.element.textContent = state.transitionText
          }
          if (
            closing.element.style.display !== state.closingDisplay
          ) {
            closing.element.style.display = state.closingDisplay
          }
        }

        const observer = new MutationObserver(reconcile)
        observer.observe(section, {
          attributes: true,
          attributeFilter: ["style"],
        })
        observer.observe(narrative.element, {
          childList: true,
          characterData: true,
          subtree: true,
        })
        observer.observe(transition.element, {
          childList: true,
          characterData: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style"],
        })
        observer.observe(closing.element, {
          attributes: true,
          attributeFilter: ["style"],
        })
        guardObserverRef.current = observer
      }, [])

      const revealFinal = useCallback(() => {
        const narrative = narrativeRef.current
        const transition = transitionRef.current
        const closing = closingRef.current
        if (
          !narrative ||
          !transition ||
          !closing ||
          isUnmountedRef.current
        ) {
          stopGuard()
          return
        }

        stopGuard()
        restoreText(narrative)
        restoreText(transition)
        restoreText(closing)
      }, [stopGuard])

      const prepare = useCallback(() => {
        if (typeof window === "undefined" || narrativeRef.current)
          return
        const root = localRef.current
        if (!root) return

        // Find section (check root itself first, then children)
        const sectionElement =
          root.getAttribute("data-framer-name") === SECTION_NAME
            ? root
            : (root.querySelector<HTMLElement>(
              `[data-framer-name="${SECTION_NAME}"]`
            ) ?? root)

        const narrativeElement = findTextElement(root, NARRATIVE_NAME)
        const transitionElement = findTextElement(root, TRANSITION_NAME)
        const closingElement = findTextElement(root, CLOSING_NAME)

        sectionRef.current = sectionElement
        originalSectionOpacityRef.current =
          sectionElement.style.opacity || "1"

        // SAFETY NET: If elements are missing, reveal section to prevent blank screen
        if (
          !narrativeElement ||
          !transitionElement ||
          !closingElement
        ) {
          console.warn(
            "Dark Matter Override: Missing text elements. Check data-framer-name attributes.",
            { narrativeElement, transitionElement, closingElement }
          )
          sectionElement.style.opacity = "1"
          return
        }

        narrativeRef.current = {
          element: narrativeElement,
          originalHTML: narrativeElement.innerHTML,
          originalText: narrativeElement.textContent ?? "",
          originalDisplay: narrativeElement.style.display,
        }
        transitionRef.current = {
          element: transitionElement,
          originalHTML: transitionElement.innerHTML,
          originalText: transitionElement.textContent ?? "",
          originalDisplay: transitionElement.style.display,
        }
        closingRef.current = {
          element: closingElement,
          originalHTML: closingElement.innerHTML,
          originalText: closingElement.textContent ?? "",
          originalDisplay: closingElement.style.display,
        }

        strippedNarrativeRef.current = stripEditorialText(
          narrativeRef.current.originalText
        )

        if (
          window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
        )
          return

        // Hide section initially until it enters the viewport
        sectionElement.style.opacity = "0"
        sectionElement.style.transition = "opacity 0.8s ease"

        // Prepare narrative as fully scrambled
        narrativeElement.setAttribute(
          "aria-label",
          narrativeRef.current.originalText
        )
        const scrambledNarrativeHTML = buildIntermediateHTML(
          strippedNarrativeRef.current,
          0
        )
        narrativeElement.innerHTML = scrambledNarrativeHTML

        // Hide transition and closing thoughts
        transitionElement.style.display = "none"
        transitionElement.setAttribute("aria-hidden", "true")
        closingElement.style.display = "none"
        closingElement.setAttribute("aria-hidden", "true")

        guardStateRef.current = {
          sectionOpacity: "0",
          narrativeHTML: scrambledNarrativeHTML,
          transitionDisplay: "none",
          transitionText: "",
          closingDisplay: "none",
        }
        startGuard()

        // Observe the ACTUAL section element for the 35% viewport threshold,
        // not localRef (which may point at an unrelated wrapper div).
        if (typeof IntersectionObserver !== "undefined") {
          const observer = new IntersectionObserver(
            (entries) => {
              const entry = entries[0]
              if (entry.isIntersecting) {
                observer.disconnect()
                viewportObserverRef.current = null
                beginRef.current()
              }
            },
            { threshold: VIEWPORT_AMOUNT }
          )
          observer.observe(sectionElement)
          viewportObserverRef.current = observer
        }
      }, [startGuard])

      const begin = useCallback(() => {
        if (hasStartedRef.current || isUnmountedRef.current) return
        const section = sectionRef.current
        const narrative = narrativeRef.current
        const transition = transitionRef.current
        const closing = closingRef.current

        if (!section || !narrative || !transition || !closing) {
          if (section) section.style.opacity = "1"
          return
        }

        hasStartedRef.current = true

        if (
          window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
        ) {
          section.style.opacity = "1"
          revealFinal()
          return
        }

        // Show section (label, title, and scrambled narrative appear)
        section.style.opacity = "1"
        guardStateRef.current.sectionOpacity = "1"

        // Stop for 1 second
        initialTimerRef.current = window.setTimeout(() => {
          let cursor = 0
          const totalCharacters = Math.max(
            Array.from(transition.originalText).length,
            1
          )

          // Start typewriting transition
          transition.element.style.display =
            transition.originalDisplay
          transition.element.textContent = ""
          transition.element.setAttribute(
            "aria-label",
            transition.originalText
          )
          guardStateRef.current.transitionDisplay =
            transition.originalDisplay
          guardStateRef.current.transitionText = ""

          typewriterTimerRef.current = window.setInterval(() => {
            cursor += 1

            // Type transition character by character
            const typedTransition = Array.from(
              transition.originalText
            )
              .slice(0, cursor)
              .join("")
            transition.element.textContent = typedTransition
            guardStateRef.current.transitionText = typedTransition

            // While typewriting, fix scrambled words in narrative progressively
            const narrativeCursor = Math.round(
              (cursor / totalCharacters) *
              strippedNarrativeRef.current.length
            )
            const partiallyFixedNarrativeHTML =
              buildIntermediateHTML(
                strippedNarrativeRef.current,
                narrativeCursor
              )
            narrative.element.innerHTML =
              partiallyFixedNarrativeHTML
            guardStateRef.current.narrativeHTML =
              partiallyFixedNarrativeHTML

            if (cursor < totalCharacters) return

            // Transition finished
            if (typewriterTimerRef.current !== null) {
              window.clearInterval(typewriterTimerRef.current)
              typewriterTimerRef.current = null
            }

            // Pause for 1 second, then show original narrative and closing thought
            finalTimerRef.current = window.setTimeout(() => {
              revealFinal()
            }, FINAL_PAUSE_MS)
          }, TYPEWRITER_INTERVAL_MS)
        }, INITIAL_PAUSE_MS)
      }, [revealFinal])

      const setRefs = useCallback(
        (node: HTMLElement | null) => {
          localRef.current = node
          if (node) prepare()
          if (typeof forwardedRef === "function") {
            forwardedRef(node)
          } else if (forwardedRef && "current" in forwardedRef) {
            ;(forwardedRef as any).current = node
          }
        },
        [forwardedRef, prepare]
      )

      useEffect(() => {
        beginRef.current = begin
      }, [begin])

      useEffect(() => {
        return () => {
          isUnmountedRef.current = true
          clearTimers()
          stopGuard()
          if (viewportObserverRef.current) {
            viewportObserverRef.current.disconnect()
            viewportObserverRef.current = null
          }
          if (narrativeRef.current) restoreText(narrativeRef.current)
          if (transitionRef.current)
            restoreText(transitionRef.current)
          if (closingRef.current) restoreText(closingRef.current)
          if (sectionRef.current)
            sectionRef.current.style.opacity =
              originalSectionOpacityRef.current
        }
      }, [clearTimers, stopGuard])

      return <Component ref={setRefs} {...props} />
    }
  )
}
