import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data || !data.patientDetails) {
      return NextResponse.json(
        { error: 'Patient details are required' },
        { status: 400 }
      );
    }

    // Format the data for the Ollama prompt
    const jsonData = JSON.stringify(data);
    const prompt = `Generate a hospital discharge summary for the following patient details: ${jsonData}`;
    
    // Escape quotes for the command line
    const escapedPrompt = prompt.replace(/"/g, '\\"');
    
    // Run Ollama locally
    try {
      const { stdout, stderr } = await execPromise(`ollama run llama2 "${escapedPrompt}"`);
      
      if (stderr) {
        console.error('Ollama stderr:', stderr);
      }
      
      return NextResponse.json({ summary: stdout });
    } catch (execError: unknown) {
      console.error('Ollama execution error:', execError);
      
      // Check if Ollama is not running
      const error = execError as Error;
      const errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('command not found') || 
          errorMessage.includes('not recognized') ||
          errorMessage.includes('connection refused')) {
        return NextResponse.json(
          { error: 'Ollama is not running. Please start Ollama locally.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to generate discharge summary', details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}