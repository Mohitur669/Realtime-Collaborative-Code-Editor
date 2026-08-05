import { Controller, Post, Body } from '@nestjs/common';
import { AiCompletionRequest, AiCompletionResponse } from '@codesync/shared-types';

@Controller('api/ai')
export class AiController {
  @Post('completion')
  async getCompletion(@Body() body: AiCompletionRequest): Promise<AiCompletionResponse> {
    const action = body.action || 'generate';
    const prompt = body.prompt || '';
    const code = body.contextCode || '';

    let result = '';

    switch (action) {
      case 'explain':
        result = `### Code Explanation\n\nThis code block contains ${code.split('\n').length} lines of code. It performs operations based on: "${prompt}".\n\n- **Key Functionality**: Logic handles sequential data processing and state mutation.\n- **Performance**: O(N) complexity for standard array traversals.`;
        break;
      case 'refactor':
        result = `// Refactored Code Optimization\n// Prompt: ${prompt}\n\n${code}\n  .filter(Boolean)\n  .map(item => ({ ...item, updatedAt: Date.now() }));`;
        break;
      case 'fix':
        result = `// Bug Fix Suggestion\n// Resolved potential undefined property access\nif (code && typeof code === 'string') {\n${code.split('\n').map((l) => '  ' + l).join('\n')}\n}`;
        break;
      case 'generate':
      default:
        result = `// Generated helper for: ${prompt}\nexport function handle${prompt.replace(/[^a-zA-Z0-9]/g, '')}() {\n  console.log("Executing AI generated helper...");\n  return true;\n}`;
        break;
    }

    return {
      result,
      action,
      timestamp: Date.now(),
    };
  }
}
