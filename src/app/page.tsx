'use client';
import React, { useState, useEffect } from 'react';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from '@/components/ai-elements/web-preview';
import { Loader } from '@/components/ai-elements/loader';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';
import { Play } from 'lucide-react';

interface Chat {
  id: string;
  demo: string;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chatHistory, setChatHistory] = useState<
    Array<{
      type: 'user' | 'assistant';
      content: string;
    }>
  >([]);

  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory));
    }
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);
    const formData = new FormData();
    formData.append('message', userMessage);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    if (currentChat) {
      formData.append('chatId', currentChat.id);
    }

    setChatHistory((prev: Array<{ type: 'user' | 'assistant'; content: string }>) => [
      ...prev,
      { type: 'user', content: userMessage },
    ]);
    if (!currentChat) {
      setCurrentChat({ id: 'local', demo: '' });
    }

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let detail = '';
        try {
          const data = await response.json();
          detail = data?.error || JSON.stringify(data);
        } catch (_) {
          try {
            detail = await response.text();
          } catch (_) {
            detail = '';
          }
        }
        throw new Error(`Failed to create chat (${response.status}): ${detail}`);
      }

      const data = await response.json();
      const aiText = (data && (data.content as string)) || 'No response from Gemini.';
      setChatHistory((prev: Array<{ type: 'user' | 'assistant'; content: string }>) => [
        ...prev,
        { type: 'assistant', content: aiText },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory((prev: Array<{ type: 'user' | 'assistant'; content: string }>) => [
        ...prev,
        {
          type: 'assistant',
          content:
            `Sorry, Gemini request failed. ${(error as Error)?.message || ''}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden">
      <div className="flex h-full">
        {/* Main */}
        <main className="flex-1 relative overflow-hidden">
          {/* Background image and overlays */}
          <div
            className="absolute inset-0 bg-center bg-cover flag-wave"
            style={{ backgroundImage: "url('/maya-bg.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-teal-900/30" />
          <div className="earth-overlay" />
          <div className="flag-mix-germany" />
          <div className="absolute inset-0 circuit-overlay pointer-events-none" />
          <div className="holo-grid" />

          {!currentChat ? (
            <div className="relative h-full w-full p-6">
              {/* Left Sidebar */}
              <aside className="hidden md:flex absolute left-0 top-0 h-full w-64 flex-col justify-between py-8 pl-6 pr-4">
                <div className="space-y-8">
                  <div className="text-2xl font-extrabold select-none mexico-gradient-text">Maya AI</div>
                  <nav className="glass rounded-xl p-4 text-emerald-200/90">
                    <ul className="space-y-4 text-sm">
                      {[
                        {label:'Home', icon:'🏠'},
                        {label:'Generate', icon:'▶️'},
                        {label:'Settings', icon:'⚙️'},
                        {label:'Help', icon:'❓'},
                        {label:'Info', icon:'ℹ️'},
                      ].map((i) => (
                        <li key={i.label} className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center size-6 rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40">{i.icon}</span>
                          <span className="hover:text-white transition-colors">{i.label}</span>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
                <div className="text-xs text-white/50">Hecho en México</div>
              </aside>

              {/* Center Stage */}
              <div className="md:ml-64 h-full flex flex-col items-center">
                {/* Heading */}
                <div className="mt-10 mb-6 text-center">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    <span className="mexico-gradient-text">Maya AI</span>
                  </h1>
                  <p className="text-white/70 mt-1">Enter your prompt to generate a custom application</p>
                </div>

                {/* Textarea with counter */}
                <form onSubmit={handleSendMessage} className="w-full max-w-3xl flex flex-col items-center gap-4">
                  <div className="glass rounded-xl w-full p-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                      maxLength={500}
                      placeholder="Enter your prompt here..."
                      className="w-full h-36 resize-none bg-transparent outline-none placeholder:text-emerald-200/50 text-emerald-50"
                    />
                    <div className="mt-1 text-right text-xs text-emerald-200/70">{message.length}/500</div>
                  </div>

                  {/* Generate ring button */}
                  <button type="submit" className="ring-button flex items-center justify-center" aria-label="Generate">
                    <Play className="h-6 w-6 text-white" />
                  </button>
                  <div className="text-emerald-300 font-medium -mt-2">Generate</div>
                </form>

                {/* Holographic Monitor (right of prompt) */}
                <div className="holo-monitor" aria-hidden>
                  <div className="screen">
                    <div
                      className="flag-window"
                      style={{ backgroundImage: "url('/maya-bg.png')" }}
                    />
                    <div className="flag-window-germany" />
                  </div>
                  <div className="side left" />
                  <div className="side right" />
                  <div className="side back" />
                </div>

                {/* Prompt Suggestions */}
                <div className="w-full max-w-6xl mt-10">
                  <div className="flex items-center gap-2 text-emerald-200/90 mb-3">
                    <span className="inline-block size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                    <span className="font-semibold">Prompt Suggestions</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      'Create a fitness tracking app with workout plans and progress monitoring',
                      'Design a task management app with priority labels and deadline reminders',
                      'Build a recipe collection app with ingredient lists and cooking instructions',
                      'Create a budget tracking app with expense categories and monthly reports',
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => setMessage(s)}
                        className="glass-strong rounded-lg px-4 py-3 text-left text-sm text-emerald-100 hover:bg-white/5"
                      >
                        “{s}”
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-full flex">
              {/* Readability overlay when chat is open */}
              <div className="absolute inset-0 bg-black/35 md:bg-black/25 pointer-events-none z-0" />
              {/* Chat Panel */}
              <div className={(currentChat ? 'w-full lg:w-1/2 ' : 'w-full ') + 'flex flex-col bg-black/30 backdrop-blur-[1px] relative z-10'}>
                <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-[2px] border-b border-white/10">
                  <div>
                    <h2 className="text-lg font-semibold">Maya AI - Generate full scale Apps</h2>
                    <p className="text-sm text-white/60">Hecho en México</p>
                  </div>
                  <button
                    onClick={() => {
                      setChatHistory([]);
                      localStorage.removeItem('chatHistory');
                    }}
                    className="px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/5"
                  >
                    Clear Chat
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-black/40 backdrop-blur-[2px] border border-white/10 rounded-lg p-3">
                    <Conversation>
                      <ConversationContent>
                        {chatHistory.map((msg, index) => (
                          <Message from={msg.type} key={index}>
                            <MessageContent>{msg.content}</MessageContent>
                          </Message>
                        ))}
                      </ConversationContent>
                    </Conversation>
                  </div>
                  {isLoading && (
                    <Message from="assistant">
                      <MessageContent>
                        <div className="flex items-center gap-2">
                          <Loader />
                          Creating your app...
                        </div>
                      </MessageContent>
                    </Message>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-white/10 p-4 bg-black/45 backdrop-blur-[2px]">
                  {!currentChat && (
                    <Suggestions>
                      <Suggestion
                        onClick={() => setMessage('Create a responsive navbar with Tailwind CSS')}
                        suggestion="Create a responsive navbar with Tailwind CSS"
                      />
                      <Suggestion
                        onClick={() => setMessage('Build a todo app with React')}
                        suggestion="Build a todo app with React"
                      />
                      <Suggestion
                        onClick={() => setMessage('Make a landing page for a coffee shop')}
                        suggestion="Make a landing page for a coffee shop"
                      />
                    </Suggestions>
                  )}
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer p-2 border border-white/10 rounded-md whitespace-nowrap hover:bg-white/5"
                    >
                      {selectedFile ? selectedFile.name : 'Upload Image'}
                    </label>
                    <PromptInput onSubmit={handleSendMessage} className="w-full max-w-2xl mx-auto relative ml-2">
                      <PromptInputTextarea onChange={(e) => setMessage(e.target.value)} value={message} className="pr-12 min-h-[60px]" />
                      <PromptInputSubmit className="absolute bottom-1 right-1" disabled={!message && !selectedFile} status={isLoading ? 'streaming' : 'ready'} />
                    </PromptInput>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              {currentChat && (
                <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-6 relative z-10">
                  <div className="w-full max-w-4xl h-[70vh] bg-black/70 border border-white/10 rounded-xl p-4 shadow-[0_0_60px_-15px_rgba(34,197,94,0.5)]">
                    <WebPreview>
                      <WebPreviewNavigation>
                        <WebPreviewUrl readOnly placeholder="Your app here..." value={currentChat?.demo} />
                      </WebPreviewNavigation>
                      <WebPreviewBody src={currentChat?.demo} />
                    </WebPreview>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
