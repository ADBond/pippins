import * as ort from 'onnxruntime-web/wasm'

ort.env.wasm.wasmPaths = new URL(
  'wasm/',
  window.location.origin + import.meta.env.BASE_URL
).toString()

ort.env.wasm.simd = true
