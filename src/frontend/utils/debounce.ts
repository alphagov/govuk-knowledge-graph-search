export default function debounce(fn: (...args: any[]) => any, ms = 100) {
  let timeoutId: ReturnType<typeof setTimeout>

  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}
