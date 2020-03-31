
let SIMULATE_LOADING = false

export function setSimulateLoading (value = true) {
  SIMULATE_LOADING = value
}

export async function simulateLoading (ms = 1000) {
  return new Promise(resolve => {
    if (SIMULATE_LOADING) {
      setTimeout(_ => resolve(), ms)
    } else {
      resolve()
    }
  })
}
