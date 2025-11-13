import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateStoryFromImage, generateSpeech } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageUtils';
import { decode, decodeAudioData } from '../utils/audioUtils';
import ImageUpload from './common/ImageUpload';
import Spinner from './common/Spinner';
import Icon from './common/Icon';

const StoryGenerator: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [story, setStory] = useState<string>('');
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // FIX: Add type casting to handle vendor-prefixed webkitAudioContext for broader browser support.
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    } else {
        setError("Your browser does not support the Web Audio API, which is needed for audio playback.");
    }

    return () => {
        audioSourceRef.current?.stop();
        audioContextRef.current?.close();
    }
  }, []);

  const generateStory = useCallback(async (file: File) => {
    setIsGeneratingStory(true);
    setError(null);
    setStory('');

    try {
      const base64Image = await fileToBase64(file);
      const result = await generateStoryFromImage(base64Image, file.type);
      setStory(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Story generation failed: ${errorMessage}`);
    } finally {
      setIsGeneratingStory(false);
    }
  }, []);

  useEffect(() => {
    if (imageFile) {
      generateStory(imageFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  const handleReadAloud = async () => {
    if (!story || isNarrating || !audioContextRef.current) return;

    setIsNarrating(true);
    setError(null);

    try {
        if(audioContextRef.current.state === 'suspended'){
            await audioContextRef.current.resume();
        }
      const base64Audio = await generateSpeech(story);
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsNarrating(false);
      source.start();
      audioSourceRef.current = source;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Narration failed: ${errorMessage}`);
      setIsNarrating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">1. Upload an Image for Inspiration</h2>
        <ImageUpload onImageSelect={setImageFile} id="story-generator-upload" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">2. Your Story's Opening Paragraph</h2>
        <div className="w-full min-h-[300px] p-4 bg-gray-800 border border-gray-700 rounded-lg relative">
           {(isGeneratingStory) && (
            <div className="absolute inset-0 bg-gray-800/70 flex justify-center items-center rounded-lg">
              <div className="text-center">
                <Spinner className="h-8 w-8 text-blue-400 mx-auto" />
                <p className="mt-2 text-gray-300">Gemini is writing...</p>
              </div>
            </div>
          )}
          {error && !isGeneratingStory && <div className="text-red-400">{error}</div>}
          {!isGeneratingStory && !story && !error && <p className="text-gray-500">Upload an image to begin.</p>}
          {story && <p className="text-gray-300 whitespace-pre-wrap">{story}</p>}
        </div>
        <button
          onClick={handleReadAloud}
          disabled={isNarrating || isGeneratingStory || !story}
          className="w-full flex justify-center items-center gap-2 bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isNarrating ? <Spinner/> : <Icon name="volume_up" />}
          <span>{isNarrating ? 'Narrating...' : 'Read Aloud'}</span>
        </button>
      </div>
    </div>
  );
};

export default StoryGenerator;
