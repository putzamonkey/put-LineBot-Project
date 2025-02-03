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

/**
 * C) Export
 */
module.exports = {
  spawnPythonScript,
  processMedia,   // use this
};
