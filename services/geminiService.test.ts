import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzePersonality } from './geminiService';
import { AnalysisInput } from '../types';

// Mock the Google GenAI module
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function() {
      return {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({
              catchphrase: 'Test catchphrase',
              summary: 'Test summary',
              scores: {
                sociability: 4,
                logic: 3,
                curiosity: 5,
                cooperation: 4,
                action: 3,
              },
              businessAptitude: {
                workStyle: 'Test work style',
                strengths: ['Strength 1', 'Strength 2'],
                suitableRoles: ['Role 1', 'Role 2'],
              },
              personCommunity: {
                socialStyle: 'Test social style',
                values: ['Value 1', 'Value 2'],
                interactionTips: 'Test tips',
                optimalPlace: 'Test place',
              },
              type: 'Test Type',
            }),
          }),
        },
      };
    }),
    Type: {
      OBJECT: 'object',
      STRING: 'string',
      NUMBER: 'number',
      ARRAY: 'array',
    },
  };
});

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('analyzes personality with text input', async () => {
    const input: AnalysisInput = {
      text: 'I am a creative person who loves problem-solving',
      files: [],
    };

    const result = await analyzePersonality(input);

    expect(result).toBeDefined();
    expect(result.catchphrase).toBe('Test catchphrase');
    expect(result.scores).toBeDefined();
    expect(result.businessAptitude).toBeDefined();
    expect(result.personCommunity).toBeDefined();
  });

  it('analyzes personality with file input', async () => {
    const input: AnalysisInput = {
      files: [
        {
          base64: 'base64data',
          mimeType: 'application/pdf',
          fileName: 'resume.pdf',
        },
      ],
    };

    const result = await analyzePersonality(input);

    expect(result).toBeDefined();
    expect(result.type).toBe('Test Type');
  });

  it('analyzes personality with combined text and file input', async () => {
    const input: AnalysisInput = {
      text: 'Additional context',
      files: [
        {
          base64: 'base64data',
          mimeType: 'application/pdf',
          fileName: 'portfolio.pdf',
        },
      ],
    };

    const result = await analyzePersonality(input);

    expect(result).toBeDefined();
    expect(result.summary).toBe('Test summary');
  });

  it('returns proper structure with all required fields', async () => {
    const input: AnalysisInput = {
      text: 'Test input',
      files: [],
    };

    const result = await analyzePersonality(input);

    expect(result).toHaveProperty('catchphrase');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('scores');
    expect(result).toHaveProperty('businessAptitude');
    expect(result).toHaveProperty('personCommunity');
    expect(result).toHaveProperty('type');

    expect(result.scores).toHaveProperty('sociability');
    expect(result.scores).toHaveProperty('logic');
    expect(result.scores).toHaveProperty('curiosity');
    expect(result.scores).toHaveProperty('cooperation');
    expect(result.scores).toHaveProperty('action');
  });
});
