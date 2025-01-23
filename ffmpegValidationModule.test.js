const {
    validateInputPath,
    validateResolution,
    validateFps,
    validateQuality,
    validateOutputFormat,
    buildValidatedParams,
    AUDIO_EXTENSIONS,
    VIDEO_EXTENSIONS,
    MAX_RESOLUTION,
    MAX_FPS,
  } = require('./ffmpegValidationModule.js');
  
  describe('ffmpegValidationModule Tests', () => {
    // Test validateInputPath
    describe('validateInputPath', () => {
      test('throws an error when inputPath is empty', () => {
        expect(() => validateInputPath('', true)).toThrow(/inputPath is required/);
      });
  
      test('throws an error when inputPath is audio-only and videoOutput is true', () => {
        expect(() => validateInputPath('file.mp3', true)).toThrow(/cannot set videoOutput=true/);
      });
  
      test('returns inputPath for valid video file with videoOutput=true', () => {
        expect(validateInputPath('file.mp4', true)).toBe('file.mp4');
      });
    });
  
    // Test validateResolution
    describe('validateResolution', () => {
      test('throws an error when resolution is empty', () => {
        expect(() => validateResolution('')).toThrow(/Resolution cannot be empty/);
      });
  
      test('throws an error for invalid resolution format', () => {
        expect(() => validateResolution('invalid')).toThrow(/Invalid resolution/);
      });
  
      test('returns resolution object for valid WxH format', () => {
        expect(validateResolution('1920x1080')).toEqual({
          mode: 'resolution',
          width: 1920,
          height: 1080,
        });
      });
  
      test('throws an error when resolution exceeds MAX_RESOLUTION', () => {
        expect(() => validateResolution(`${MAX_RESOLUTION + 1}x1080`)).toThrow(/exceeds max/);
      });
  
      test('returns scale object for valid scale factor', () => {
        expect(validateResolution('0.5')).toEqual({ mode: 'scale', value: 0.5 });
      });
  
      test('throws an error for scale factor > 1', () => {
        expect(() => validateResolution('1.5')).toThrow(/Upscaling not allowed/);
      });
    });
  
    // Test validateFps
    describe('validateFps', () => {
      test('returns 0 for empty or "0"', () => {
        expect(validateFps('')).toBe(0);
        expect(validateFps('0')).toBe(0);
      });
  
      test('throws an error for invalid FPS', () => {
        expect(() => validateFps('invalid')).toThrow(/Invalid FPS/);
      });
  
      test('throws an error for FPS greater than MAX_FPS', () => {
        expect(() => validateFps((MAX_FPS + 1).toString())).toThrow(/too high/);
      });
  
      test('returns valid FPS value', () => {
        expect(validateFps('60')).toBe(60);
      });
    });
  
    // Test validateQuality
    describe('validateQuality', () => {
      test('throws an error when quality is empty', () => {
        expect(() => validateQuality('')).toThrow(/Quality is required/);
      });
  
      test('throws an error for invalid quality value', () => {
        expect(() => validateQuality('ultra')).toThrow(/Invalid quality/);
      });
  
      test('returns valid quality value', () => {
        expect(validateQuality('low')).toBe('low');
        expect(validateQuality('standard')).toBe('standard');
        expect(validateQuality('high')).toBe('high');
      });
    });
  
    // Test validateOutputFormat
    describe('validateOutputFormat', () => {
      test('throws an error when outputFormat is empty', () => {
        expect(() => validateOutputFormat('', true)).toThrow(/outputFormat is required/);
      });
  
      test('throws an error for invalid video format', () => {
        expect(() => validateOutputFormat('.txt', true)).toThrow(/Invalid video format/);
      });
  
      test('throws an error for invalid audio format', () => {
        expect(() => validateOutputFormat('.avi', false)).toThrow(/Invalid audio format/);
      });
  
      test('returns valid outputFormat for video', () => {
        expect(validateOutputFormat('.mp4', true)).toBe('.mp4');
      });
  
      test('returns valid outputFormat for audio', () => {
        expect(validateOutputFormat('.mp3', false)).toBe('.mp3');
      });
    });
  
    // Test buildValidatedParams
    describe('buildValidatedParams', () => {
      test('throws an error when videoOutput is not boolean', () => {
        expect(() =>
          buildValidatedParams({ videoOutput: 'true', inputPath: 'file.mp4' })
        ).toThrow(/videoOutput must be boolean/);
      });
  
      test('validates all fields and returns final params object', () => {
        const userInput = {
          inputPath: 'file.mp4',
          videoOutput: true,
          resolution: '1920x1080',
          fps: '30',
          quality: 'high',
          outputFormat: '.mp4',
        };
  
        const expectedOutput = {
          inputPath: 'file.mp4',
          videoOutput: true,
          resolution: { mode: 'resolution', width: 1920, height: 1080 },
          fps: 30,
          quality: 'high',
          outputFormat: '.mp4',
        };
  
        expect(buildValidatedParams(userInput)).toEqual(expectedOutput);
      });
    });
  });
  