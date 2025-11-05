import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { defaultVideoAnalysisConfig, VideoAnalysisConfig } from './video-analysis.config';
import { LlamaApiService } from '../llama-api/llama-api.service';

@Injectable()
export class VideoAnalysisService {
  private readonly logger = new Logger(VideoAnalysisService.name);
  private readonly config: VideoAnalysisConfig;

  constructor(private readonly llamaApiService: LlamaApiService) {
    this.config = defaultVideoAnalysisConfig;
  }

  async analyzeVideo(videoPath: string): Promise<{
    whatYouWillLearn: string[];
    requirements: string[];
  }> {
    try {
      this.logger.log(`Starting video analysis for: ${videoPath}`);

      // Step 1: Extract audio from video
      const audioPath = await this.extractAudio(videoPath);
      
      // Step 2: Transcribe audio to text
      const transcription = await this.transcribeAudio(audioPath);
      
      // Step 3: Analyze transcription to extract learning objectives and requirements
      const analysis = await this.analyzeTranscription(transcription);
      
      // Step 4: Clean up temporary audio file
      await this.cleanupAudio(audioPath);
      
      this.logger.log('Video analysis completed successfully');
      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing video:', error);
      // Return default values if analysis fails
      return {
        whatYouWillLearn: [
          'Master the fundamentals of the subject',
          'Apply practical skills in real-world scenarios',
          'Build a strong foundation for advanced learning'
        ],
        requirements: [
          'Basic computer skills',
          'Willingness to learn',
          'No prior experience required'
        ]
      };
    }
  }

  private async extractAudio(videoPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const audioPath = videoPath.replace(/\.[^/.]+$/, `.${this.config.ffmpeg.audioFormat}`);
      
      const ffmpeg = spawn('ffmpeg', [
        '-i', videoPath,
        '-vn', // No video
        '-acodec', this.config.ffmpeg.codec, // PCM 16-bit
        '-ar', this.config.ffmpeg.sampleRate, // 16kHz sample rate
        '-ac', this.config.ffmpeg.channels, // Mono
        '-y', // Overwrite output file
        audioPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(audioPath);
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async transcribeAudio(audioPath: string): Promise<string> {
    // Try Python Whisper transcriber first (most reliable for transcription)
    try {
      this.logger.log('Attempting transcription with Python Whisper...');
      const transcription = await this.transcribeWithPython(audioPath);
      if (transcription && transcription.trim().length > 0) {
        this.logger.log('Transcription successful with Python Whisper');
        return transcription;
      }
    } catch (pyErr) {
      this.logger.warn('Python Whisper transcription failed:', pyErr);
    }
    
    // Fallback: return a generic transcription
    this.logger.warn('Using fallback generic transcription');
    return 'This is a course video that covers various topics and concepts. Students will learn important skills and techniques.';
  }

  private async transcribeWithPython(audioPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Prefer python if available, else python3
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      // Try resolving script from repo root (..\transcriber) and current (transcriber)
      const candidateA = path.resolve(process.cwd(), '..', 'transcriber', 'transcribe.py');
      const candidateB = path.resolve(process.cwd(), 'transcriber', 'transcribe.py');
      const scriptPath = fs.existsSync(candidateA) ? candidateA : candidateB;
      const args = [scriptPath, audioPath, '--model', 'base'];

      const proc = spawn(pythonCmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });

      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      proc.on('close', (code) => {
        if (code === 0) {
          // The transcriber prints lines and then the transcription text.
          // Extract everything after the marker if present
          const marker = '--- Transcription Result ---';
          const idx = stdout.indexOf(marker);
          if (idx >= 0) {
            resolve(stdout.substring(idx + marker.length).trim());
          } else {
            resolve(stdout.trim());
          }
        } else {
          reject(new Error(`Python transcriber exited with code ${code}: ${stderr}`));
        }
      });
      proc.on('error', (err) => reject(err));
    });
  }

  private async analyzeTranscription(transcription: string): Promise<{
    whatYouWillLearn: string[];
    requirements: string[];
  }> {
    try {
      const analysisPrompt = `
You are an expert course content analyzer. Analyze the following course video transcription and extract structured information.

TASK: Extract learning objectives and requirements from the course video transcription.

INSTRUCTIONS:
1. "What you will learn" - Extract ${this.config.analysis.maxLearningObjectives} specific, actionable skills, concepts, or outcomes that students will gain from this course. Focus on practical, measurable learning outcomes.
2. "Requirements" - Extract ${this.config.analysis.maxRequirements} prerequisites, technical requirements, or background knowledge needed to take this course successfully.

TRANSCRIPTION: "${transcription}"

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "whatYouWillLearn": [
    "Specific skill or concept 1",
    "Specific skill or concept 2",
    "Specific skill or concept 3"
  ],
  "requirements": [
    "Requirement or prerequisite 1",
    "Requirement or prerequisite 2"
  ]
}

IMPORTANT:
- Each learning objective should be specific and actionable
- Requirements should be realistic and clearly stated
- Do not include any text outside the JSON object
- Ensure the JSON is properly formatted and valid
`;

      const systemPrompt = 'You are an expert course content analyzer. Extract structured information from course transcriptions and return valid JSON only.';

      this.logger.log('Analyzing transcription with Llama API');

      // Use the extractJson method for structured data extraction
      const analysis = await this.llamaApiService.extractJson<{
        whatYouWillLearn: string[];
        requirements: string[];
      }>(analysisPrompt, systemPrompt, {
        temperature: this.config.analysis.temperature,
        maxTokens: this.config.analysis.maxTokens,
        topP: 0.9,
      });

      // Validate and return the response
      if (analysis.whatYouWillLearn && analysis.requirements) {
        return {
          whatYouWillLearn: analysis.whatYouWillLearn,
          requirements: analysis.requirements,
        };
      }

      // Fallback if structure is invalid
      throw new Error('Invalid response structure from API');

    } catch (error) {
      this.logger.error('Error analyzing transcription:', error);
      return {
        whatYouWillLearn: [
          'Master the fundamentals of the subject',
          'Apply practical skills in real-world scenarios',
          'Build a strong foundation for advanced learning'
        ],
        requirements: [
          'Basic computer skills',
          'Willingness to learn',
          'No prior experience required'
        ]
      };
    }
  }

  private parseAnalysisResponse(response: string): {
    whatYouWillLearn: string[];
    requirements: string[];
  } {
    const whatYouWillLearn: string[] = [];
    const requirements: string[] = [];

    // Simple parsing logic as fallback
    const lines = response.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('what you will learn') || 
          trimmedLine.toLowerCase().includes('learning objectives') ||
          trimmedLine.toLowerCase().includes('skills')) {
        currentSection = 'learn';
        continue;
      }
      
      if (trimmedLine.toLowerCase().includes('requirements') || 
          trimmedLine.toLowerCase().includes('prerequisites') ||
          trimmedLine.toLowerCase().includes('requirements')) {
        currentSection = 'requirements';
        continue;
      }

      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        const item = trimmedLine.substring(1).trim();
        if (currentSection === 'learn' && item) {
          whatYouWillLearn.push(item);
        } else if (currentSection === 'requirements' && item) {
          requirements.push(item);
        }
      }
    }

    // Ensure we have at least some default values
    if (whatYouWillLearn.length === 0) {
      whatYouWillLearn.push('Master the fundamentals of the subject');
      whatYouWillLearn.push('Apply practical skills in real-world scenarios');
    }

    if (requirements.length === 0) {
      requirements.push('Basic computer skills');
      requirements.push('Willingness to learn');
    }

    return { whatYouWillLearn, requirements };
  }

  private async cleanupAudio(audioPath: string): Promise<void> {
    try {
      await unlink(audioPath);
    } catch (error) {
      this.logger.warn('Could not delete temporary audio file:', error);
    }
  }

  /**
   * Get video duration in seconds using ffprobe
   */
  async getVideoDuration(videoPath: string): Promise<number | null> {
    return new Promise((resolve) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        videoPath
      ]);

      let stdout = '';
      let stderr = '';

      ffprobe.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ffprobe.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          const duration = parseFloat(stdout.trim());
          if (!isNaN(duration)) {
            this.logger.log(`Video duration: ${duration} seconds`);
            resolve(Math.floor(duration)); // Return duration in seconds as integer
          } else {
            this.logger.warn('Could not parse video duration');
            resolve(null);
          }
        } else {
          this.logger.warn(`ffprobe failed with code ${code}: ${stderr}`);
          resolve(null);
        }
      });

      ffprobe.on('error', (error) => {
        this.logger.error('Error running ffprobe:', error);
        resolve(null);
      });
    });
  }
} 