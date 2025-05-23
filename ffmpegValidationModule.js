/**
 * ffmpegValidationModule.js
 *
 * This file contains all the logic for validating user inputs:
 *  - inputPath / videoOutput constraints
 *  - resolution (scale or WxH)
 *  - FPS (0..MAX_FPS)
 *  - quality (low/standard/high)
 *  - outputFormat (video vs. audio extensions)
 *  - buildValidatedParams(): final check that ties it all together
 */

const path = require("path");

// --------------------------------------------------
// A) Configuration
// --------------------------------------------------
const AUDIO_EXTENSIONS = [".mp3", ".aiff", ".aac", ".wav"];
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv"];
const MAX_RESOLUTION = 7680; // e.g. 8K limit
const MAX_FPS = 120;

// --------------------------------------------------
// B) Per-field validators
// --------------------------------------------------

/**
 * validateInputPath
 * - Must not be empty
 * - If it's audio-only extension, cannot have videoOutput=true
 */
function validateInputPath(inputPath, videoOutput) {
  if (!inputPath || inputPath.trim() === "") {
    throw new Error("inputPath is required and cannot be empty.");
  }
  const ext = path.extname(inputPath).toLowerCase();

  // If the input is an audio extension => disallow videoOutput=true
  if (AUDIO_EXTENSIONS.includes(ext) && videoOutput) {
    throw new Error(
      `Input file "${inputPath}" is audio-only, cannot set videoOutput=true.`
    );
  }
  // Video -> audio is still possible, so we don't block if it's a video extension & videoOutput=false
  return inputPath;
}

/**
 * validateResolution
 * - return { mode: "scale", value: 1 } if empty, basically assuming that user wants original resolution
 * - "WxH" or "W*H" => direct resolution => each dimension <= MAX_RESOLUTION
 * - Positive float => scale factor <= 1 => no upscaling
 */
function validateResolution(resolutionStr) {
  if (!resolutionStr) return { mode: "scale", value: 1 }; // Default to original resolution

  // Ensure it's a string before calling .trim()
  if (typeof resolutionStr !== "string") resolutionStr = String(resolutionStr);
  resolutionStr = resolutionStr.trim();

  // Check "WxH" or "W*H"
  const resRegex = /^(\d+)(x|\*)(\d+)$/i;
  const match = resolutionStr.match(resRegex);
  if (match) {
      const width = parseInt(match[1], 10);
      const height = parseInt(match[3], 10);
      if (width > 0 && height > 0) return { mode: "resolution", width, height };
  }

  // Check for a floating-point scale factor (0.1 - 1)
  const floatValue = parseFloat(resolutionStr);
  if (!isNaN(floatValue) && floatValue >= 0.1 && floatValue <= 1) {
      return { mode: "scale", value: floatValue };
  }

  // Invalid format
  throw new Error(`Invalid resolution "${resolutionStr}". Must be WxH or a float between 0.1 and 1.`);
}



/**
 * validateFps
 * - "0" or empty => keep original
 * - Must be >= 0
 * - Must not exceed MAX_FPS
 */
function validateFps(fpsStr) {
  if (!fpsStr || fpsStr === "0") {
    return 0; // keep original
  }
  const parsed = parseFloat(fpsStr);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid FPS "${fpsStr}". Must be >= 0.`);
  }
  if (parsed > MAX_FPS) {
    throw new Error(`FPS "${parsed}" too high. Max allowed is ${MAX_FPS}.`);
  }
  return parsed;
}

/**
 * validateQuality
 * - must be "low", "standard", or "high"
 */
function validateQuality(qualityStr) {
  if (!qualityStr) {
    throw new Error("Quality is required (low, standard, high).");
  }
  const lowered = qualityStr.toLowerCase();
  const allowed = ["low", "standard", "high"];
  if (!allowed.includes(lowered)) {
    throw new Error(
      `Invalid quality "${qualityStr}". Allowed: ${allowed.join(", ")}.`
    );
  }
  return lowered;
}

/**
 * validateOutputFormat
 * - if videoOutput=true => must be VIDEO_EXTENSIONS
 * - if videoOutput=false => must be AUDIO_EXTENSIONS
 * - prepend "." if missing
 */
function validateOutputFormat(formatStr, videoOutput) {
  if (!formatStr) {
    throw new Error("outputFormat is required.");
  }
  let normalized = formatStr.trim();
  if (!normalized.startsWith(".")) {
    normalized = "." + normalized;
  }

  if (videoOutput) {
    if (!VIDEO_EXTENSIONS.includes(normalized.toLowerCase())) {
      throw new Error(
        `Invalid video format "${formatStr}". Allowed: ${VIDEO_EXTENSIONS.join(
          ", "
        )}.`
      );
    }
  } else {
    if (!AUDIO_EXTENSIONS.includes(normalized.toLowerCase())) {
      throw new Error(
        `Invalid audio format "${formatStr}". Allowed: ${AUDIO_EXTENSIONS.join(
          ", "
        )}.`
      );
    }
  }
  return normalized;
}

// --------------------------------------------------
// C) buildValidatedParams: final check
// --------------------------------------------------
function buildValidatedParams(userInput) {
  // 1) videoOutput must be boolean
  if (typeof userInput.videoOutput !== "boolean") {
    throw new Error("videoOutput must be boolean (true or false).");
  }

  // 2) inputPath & videoOutput
  validateInputPath(userInput.inputPath, userInput.videoOutput);

  // 3) resolution if videoOutput=true
  let finalResolution = null;
  if (userInput.videoOutput) {
    finalResolution = validateResolution(userInput.resolution);
  }

  // 4) fps
  const finalFps = validateFps(userInput.fps);

  // 5) quality
  const finalQuality = validateQuality(userInput.quality);

  // 6) output format
  const finalFormat = validateOutputFormat(
    userInput.outputFormat,
    userInput.videoOutput
  );

  // Return final object
  return {
    inputPath: userInput.inputPath,
    videoOutput: userInput.videoOutput,
    resolution: finalResolution,
    fps: finalFps,
    quality: finalQuality,
    outputFormat: finalFormat,
  };
}

// --------------------------------------------------
// D) Export everything
// --------------------------------------------------
module.exports = {
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
  MAX_RESOLUTION,
  MAX_FPS,
  validateInputPath,
  validateResolution,
  validateFps,
  validateQuality,
  validateOutputFormat,
  buildValidatedParams,
};
