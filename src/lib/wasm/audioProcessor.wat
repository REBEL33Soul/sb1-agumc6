;;; WebAssembly module for audio processing
(module
  ;; Memory for audio buffers
  (memory (export "memory") 1)

  ;; Function to process audio samples
  (func $processAudio (param $offset i32) (param $length i32)
    (local $i i32)
    (local $sample f32)
    
    ;; Loop through samples
    (loop $sample_loop
      ;; Load sample
      (local.set $sample 
        (f32.load (local.get $offset))
      )

      ;; Apply processing
      (local.set $sample 
        (call $processSample (local.get $sample))
      )

      ;; Store processed sample
      (f32.store 
        (local.get $offset)
        (local.get $sample)
      )

      ;; Increment counter
      (local.set $i 
        (i32.add (local.get $i) (i32.const 4))
      )

      ;; Continue if not done
      (br_if $sample_loop
        (i32.lt_u 
          (local.get $i)
          (local.get $length)
        )
      )
    )
  )

  ;; Helper function to process a single sample
  (func $processSample (param $sample f32) (result f32)
    ;; Apply gain
    (f32.mul 
      (local.get $sample)
      (f32.const 0.5)
    )
  )

  ;; Export functions
  (export "processAudio" (func $processAudio))
)