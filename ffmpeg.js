/**
 * ffmpeg.js
 *
 * Demonstrates how you can:
 *  1) Import the validation logic from ffmpegValidationModule.js
 *  2) Validate user inputs
 *  3) Spawn the Python script (ffmpegProcessor.py)
 *  4) Return or log success/error
 *
 * USAGE:
 *   node ffmpeg.js
 *
 * Make sure ffmpegProcessor.py is in the same directory and is correct.
 */

const { spawn } = require("child_process");
const {
  buildValidatedParams,
  // you could also import the individual validators if you want step-by-step
} = require("./ffmpegValidationModule.js");

/**
 * A) spawnPythonScript
 *    - Actually runs ffmpegProcessor.py with the validated params
 */
function spawnPythonScript(params) {
  return new Promise((resolve, reject) => {
    console.log("[JS] Spawning Python script with params:", params);

    // Launch the python script
    const pythonProcess = spawn("python3", ["ffmpegProcessor.py"]);

    let stdoutData = "";
    let stderrData = "";

    // Collect stdout
    pythonProcess.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });
    // Collect stderr
    pythonProcess.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    // On exit
    pythonProcess.on("close", (code) => {
      console.log("[JS] Python script closed. Exit code:", code);
      if (stderrData) {
        console.log("[JS] Python script stderr:\n", stderrData);
      }

      if (code === 0) {
        try {
          // We expect the script to return JSON with { processedFilePath: "..." } or { error: "..."}
          const parsed = JSON.parse(stdoutData);
          if (parsed.error) {
            return reject(`Python error: ${parsed.error}`);
          }
          if (!parsed.processedFilePath) {
            return reject(
              `No "processedFilePath" in Python output. Full output:\n${stdoutData}`
            );
          }
          resolve(parsed.processedFilePath);
        } catch (err) {
          reject(
            `Failed to parse JSON from Python.\nstdout:\n${stdoutData}\nError: ${err.message}`
          );
        }
      } else {
        reject(`Python script exited with code ${code}. Stderr:\n${stderrData}`);
      }
    });

    // Send params as JSON to python via stdin
    pythonProcess.stdin.write(JSON.stringify(params));
    pythonProcess.stdin.end();
  });
}

/**
 * B) processMedia
 *    - Combines final validation + spawning python
 *    - Returns { success: true, processedFilePath } or { success: false, error }
 */
async function processMedia(userInput) {
  try {
    // 1) Validate inputs
    const validatedParams = buildValidatedParams(userInput);

    // 2) Run Python
    const processedFilePath = await spawnPythonScript(validatedParams);

    // 3) Return success
    return {
      success: true,
      processedFilePath,
    };
  } catch (err) {
    // Return error
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------
// C) Example Test
// ---------------------------------------------------------
// (async () => {
//   // Example user input
//   const userInput = {
//     inputPath: "./download/video.mp4",    // Must exist
//     videoOutput: false,                   // true for video ouput, false for audio output | if the the input format is audio, the value cannot be set to true
//     resolution: "",                       // input "0" or "1" for default value | to use scale mode input a float value in 0-1 range, sth like "0.75" | to use set resolution mode input sth like "1920x1080" or "1920*1080" | can be left empty entirely if videoOutput = false
//     fps: "",                              // left empty or input "0" for default value | fps cannot exceed 120
//     quality: "high",                      // use 'low', 'standard', or 'high'
//     outputFormat: ".mp3",                 // ".mp3", ".aiff", ".aac", ".wav" for audio | ".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv" for video
//   };

//   console.log("Testing with userInput:", userInput);

//   const result = await processMedia(userInput);

//   if (result.success) {
//     console.log("[JS] SUCCESS! Processed file at:", result.processedFilePath);
//   } else {
//     console.error("[JS] ERROR:", result.error);
//   }
// })();

/**
 * D) Export if needed, e.g. for a bot file that reuses processMedia
 */
module.exports = {
  spawnPythonScript,
  processMedia,   // use this
};
