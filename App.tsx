
import React, { useState, useMemo } from 'react';
import { View, AppState, SearchResult } from './types';
import { performFaceSearch } from './services/geminiService';
import CameraCapture from './components/CameraCapture';
import ScanningOverlay from './components/ScanningOverlay';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.HOME);
  const [state, setState] = useState<AppState>({
    isSearching: false,
    error: null,
    image: null,
    results: [],
    explanation: null,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setState(prev => ({ ...prev, image: base64, isSearching: true, error: null, results: [], explanation: null }));
    setView(View.RESULTS);

    try {
      const { text, results } = await performFaceSearch(base64);
      setState(prev => ({
        ...prev,
        isSearching: false,
        explanation: text,
        results: results,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: "Failed to perform search. Please try again with a different image."
      }));
    }
  };

  const reset = () => {
    setView(View.HOME);
    setState({
      isSearching: false,
      error: null,
      image: null,
      results: [],
      explanation: null,
    });
  };

  const getSocialIcon = (url: string) => {
    const u = url.toLowerCase();
    if (u.includes('linkedin.com')) return 'fab fa-linkedin';
    if (u.includes('instagram.com')) return 'fab fa-instagram';
    if (u.includes('twitter.com') || u.includes('x.com')) return 'fab fa-x-twitter';
    if (u.includes('facebook.com')) return 'fab fa-facebook';
    if (u.includes('tiktok.com')) return 'fab fa-tiktok';
    if (u.includes('youtube.com')) return 'fab fa-youtube';
    if (u.includes('pinterest.com')) return 'fab fa-pinterest';
    if (u.includes('github.com')) return 'fab fa-github';
    return 'fas fa-link';
  };

  const categorizedResults = useMemo(() => {
    const social: SearchResult[] = [];
    const general: SearchResult[] = [];
    
    const socialDomains = ['linkedin.com', 'instagram.com', 'twitter.com', 'x.com', 'facebook.com', 'tiktok.com', 'youtube.com', 'pinterest.com', 'github.com'];
    
    state.results.forEach(res => {
      const isSocial = socialDomains.some(domain => res.url.toLowerCase().includes(domain));
      if (isSocial) social.push(res);
      else general.push(res);
    });
    
    return { social, general };
  }, [state.results]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <nav className="border-b border-gray-800 p-4 sticky top-0 bg-gray-950/80 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={reset}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-fingerprint text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              VisionLink
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">How it works</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        {view === View.HOME && (
          <div className="py-12 md:py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Deep Search for <br />
              <span className="text-indigo-500">Social Identities</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
              Find social media profiles and web occurrences instantly. 
              The most powerful dedicated face search for digital footprint analysis.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <label className="group relative w-full md:w-auto overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <div className="px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 group-hover:-translate-y-1">
                  <i className="fas fa-cloud-upload-alt text-xl"></i>
                  Upload Photo
                </div>
              </label>

              <button 
                onClick={() => setView(View.CAMERA)}
                className="w-full md:w-auto px-8 py-5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1"
              >
                <i className="fas fa-camera text-xl"></i>
                Take a Selfie
              </button>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { icon: 'fa-user-secret', title: 'Find Social Media', desc: 'Identify Instagram, LinkedIn, X, and other profiles associated with a face.' },
                { icon: 'fa-magnifying-glass-chart', title: 'Deep Analysis', desc: 'Go beyond simple matching. Understand who is in the photo and their background.' },
                { icon: 'fa-lock', title: 'Encrypted & Safe', desc: 'Your photos are processed in memory and never stored on our servers.' }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 transition-all">
                  <i className={`fas ${feature.icon} text-3xl text-indigo-500 mb-4`}></i>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === View.CAMERA && (
          <CameraCapture 
            onCapture={processImage} 
            onClose={() => setView(View.HOME)} 
          />
        )}

        {view === View.RESULTS && (
          <div className="max-w-5xl mx-auto py-8">
            <button 
              onClick={reset}
              className="mb-8 text-indigo-400 hover:text-indigo-300 flex items-center gap-2 group transition-all"
            >
              <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              Start New Search
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Image Preview & Identity Summary */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-gray-900 border-2 border-indigo-500/30 shadow-2xl relative group">
                  {state.image && (
                    <img 
                      src={state.image} 
                      alt="Source" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  {state.isSearching && (
                    <div className="absolute inset-0 bg-indigo-600/20 animate-pulse"></div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-bold uppercase tracking-widest">Target Subject</p>
                  </div>
                </div>
                
                <div className="p-5 bg-gray-900 border border-gray-800 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Identity Brief</h3>
                  {state.isSearching ? (
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-800 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse"></div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                      {state.explanation?.split('\n')[0] || "Analysis concluded."}
                    </p>
                  )}
                </div>
              </div>

              {/* Detailed Results */}
              <div className="lg:col-span-8 space-y-8">
                {state.error ? (
                  <div className="p-8 bg-red-900/10 border border-red-500/30 rounded-2xl text-red-300">
                    <i className="fas fa-exclamation-triangle mb-3 text-2xl"></i>
                    <p className="text-lg font-bold mb-2">Search Failed</p>
                    <p>{state.error}</p>
                    <button onClick={reset} className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all font-bold">Try Another Photo</button>
                  </div>
                ) : (
                  <>
                    {/* Social Media Section */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <i className="fas fa-share-nodes text-indigo-500"></i>
                        Social Profiles Found
                      </h3>
                      {state.isSearching ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1, 2].map(i => (
                            <div key={i} className="h-20 bg-gray-900 border border-gray-800 rounded-xl animate-pulse"></div>
                          ))}
                        </div>
                      ) : categorizedResults.social.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categorizedResults.social.map((res, i) => (
                            <a 
                              key={i} 
                              href={res.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group p-5 bg-gray-900 border border-gray-800 rounded-2xl hover:border-indigo-500 hover:bg-indigo-600/5 transition-all flex items-center gap-4"
                            >
                              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                                <i className={getSocialIcon(res.url)}></i>
                              </div>
                              <div className="overflow-hidden">
                                <h4 className="font-bold text-gray-100 group-hover:text-indigo-400 transition-colors truncate">{res.title}</h4>
                                <p className="text-xs text-gray-500 truncate">{new URL(res.url).hostname}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-gray-900/50 border border-dashed border-gray-800 rounded-2xl text-gray-500">
                          <p>No direct social media handles identified.</p>
                        </div>
                      )}
                    </div>

                    {/* AI Explanation / Analysis */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <i className="fas fa-brain text-indigo-500"></i>
                        Search Analysis
                      </h3>
                      <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl">
                        {state.isSearching ? (
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-800 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse"></div>
                          </div>
                        ) : (
                          <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                            {state.explanation}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* General Web Sources */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <i className="fas fa-globe text-indigo-500"></i>
                        Other Web Appearances
                      </h3>
                      {state.isSearching ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-900 border border-gray-800 rounded-xl animate-pulse"></div>
                          ))}
                        </div>
                      ) : categorizedResults.general.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {categorizedResults.general.map((res, i) => (
                            <a 
                              key={i} 
                              href={res.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-500/50 hover:bg-gray-800 transition-all flex justify-between items-center"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-500">
                                  <i className="fas fa-file-lines text-sm"></i>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors">{res.title}</h4>
                                  <p className="text-xs text-gray-500 truncate max-w-xs md:max-w-lg">{res.url}</p>
                                </div>
                              </div>
                              <i className="fas fa-arrow-right text-gray-700 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all"></i>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-gray-900/50 border border-dashed border-gray-800 rounded-2xl text-gray-500">
                          <p>No additional web sources found.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Loading Overlay */}
      {state.isSearching && <ScanningOverlay />}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 bg-gray-950 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                <i className="fas fa-fingerprint text-white"></i>
              </div>
              <span className="font-bold text-lg">VisionLink</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs text-center md:text-left">
              Advanced facial intelligence for individual privacy management and identity verification.
            </p>
          </div>
          
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-gray-300">Technology</span>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Gemini AI</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Search Grounding</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-bold text-gray-300">Rights</span>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Opt-out</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms</a>
            </div>
          </div>

          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-all">
              <i className="fab fa-x-twitter"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-all">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-800/50 mt-12 pt-8 text-center text-xs text-gray-600">
          © 2024 VisionLink AI. Dedicated Face Search & Social Media Discovery Engine.
        </div>
      </footer>
    </div>
  );
};

export default App;
