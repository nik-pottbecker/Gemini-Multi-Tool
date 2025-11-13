import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageUtils';
import ImageUpload from './common/ImageUpload';
import Spinner from './common/Spinner';
import Icon from './common/Icon';

const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!imageFile || !prompt.trim()) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await analyzeImage(base64Image, imageFile.type, prompt);
      setResponse(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">1. Upload Image</h2>
        <ImageUpload onImageSelect={setImageFile} id="image-analyzer-upload" />
        
        <h2 className="text-xl font-semibold text-white pt-4">2. Ask a Question</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., What is in this image? Describe the main subject."
          className="w-full h-28 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 transition"
          disabled={isLoading}
        />
        
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !imageFile || !prompt.trim()}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Spinner /> : <Icon name="visibility" />}
          <span>{isLoading ? 'Analyzing...' : 'Analyze Image'}</span>
        </button>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">3. Analysis Result</h2>
        <div className="w-full min-h-[300px] p-4 bg-gray-800 border border-gray-700 rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner className="h-8 w-8 text-blue-400" />
            </div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : response ? (
            <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
          ) : (
            <p className="text-gray-500">The analysis from Gemini will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
