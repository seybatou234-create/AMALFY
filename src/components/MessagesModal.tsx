import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Clock, User as UserIcon, Mic, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Conversation, Message } from '../types/index.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  directTarget?: {
    userId: string;
    userName: string;
    itemTitle?: string;
  } | null;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({ isOpen, onClose, directTarget }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  // Web Speech API Voice Dictation
  const {
    isListening,
    errorMessage: speechError,
    toggleListening: toggleVoiceDictation
  } = useSpeechRecognition({
    lang: 'fr-FR',
    onTranscript: (spokenText) => {
      setInputText((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${spokenText.trim()}` : spokenText.trim();
      });
    }
  });

  useEffect(() => {
    if (!isOpen || !user) return;

    const loadConversations = async () => {
      try {
        const convs = await api.getConversations(user.id);
        setConversations(convs);

        if (directTarget) {
          // Open or start conversation with directTarget
          const existing = convs.find((c) => c.participantIds.includes(directTarget.userId));
          if (existing) {
            setActiveConv(existing);
          } else {
            const created = await api.startConversation({
              currentUserId: user.id,
              targetUserId: directTarget.userId,
              currentUserName: user.name,
              targetUserName: directTarget.userName,
              itemTitle: directTarget.itemTitle
            });
            setConversations([created, ...convs]);
            setActiveConv(created);
          }
        } else if (convs.length > 0 && !activeConv) {
          setActiveConv(convs[0]);
        }
      } catch (err) {
        console.error('Erreur conversations', err);
      }
    };

    loadConversations();
  }, [isOpen, user, directTarget]);

  useEffect(() => {
    if (!activeConv) return;
    const loadMessages = async () => {
      try {
        const msgs = await api.getMessages(activeConv.id);
        setMessages(msgs);
      } catch (err) {
        console.error('Erreur messages', err);
      }
    };
    loadMessages();
  }, [activeConv]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !inputText.trim() || !user) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(activeConv.id, user.id, user.name, inputText.trim());
      setMessages([...messages, msg]);
      setInputText('');
      // update conversation snippet
      activeConv.lastMessage = msg.text;
    } catch (err) {
      console.error('Erreur envoi message', err);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipantName = (conv: Conversation) => {
    const otherId = conv.participantIds.find((id) => id !== user?.id);
    return (otherId && conv.participantNames[otherId]) || 'Interlocuteur AMALFY';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full h-[92vh] sm:h-[620px] shadow-2xl border border-slate-200 flex overflow-hidden animate-in fade-in zoom-in-95">
        {/* Left column: Conversations list */}
        <div
          className={`border-r border-slate-100 flex flex-col bg-slate-50 transition-all ${
            activeConv ? 'hidden md:flex md:w-80 shrink-0' : 'w-full md:w-80 shrink-0'
          }`}
        >
          <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
            <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Messagerie</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {conversations.length}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Aucune conversation active.
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = activeConv?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConv(c)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-2.5 cursor-pointer ${
                      isSelected ? 'bg-white shadow-xs' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {getOtherParticipantName(c).charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {getOtherParticipantName(c)}
                        </span>
                      </div>
                      {c.itemTitle && (
                        <p className="text-[10px] text-emerald-600 font-semibold truncate">
                          {c.itemTitle}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Chat active thread */}
        <div
          className={`flex-1 flex flex-col justify-between bg-white ${
            !activeConv ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Thread header with mobile back button */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveConv(null)}
                    className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer shrink-0"
                    title="Retour à la liste"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {getOtherParticipantName(activeConv)}
                    </h4>
                    {activeConv.itemTitle && (
                      <p className="text-[10px] text-slate-400 truncate">Objet : {activeConv.itemTitle}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs ${
                          isMine
                            ? 'bg-slate-900 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input with Voice Dictation */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex flex-col gap-1.5">
                {isListening && (
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-bold px-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span>Dictée vocale active... Parlez dans votre micro</span>
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <div className="relative flex-1">
                    <textarea
                      rows={2}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Écrivez ou dictez votre message (Entrée pour envoyer)..."
                      className="w-full px-3.5 py-2.5 pr-20 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none transition-all"
                    />

                    {/* Bouton Dicter dans le textarea */}
                    <button
                      type="button"
                      onClick={toggleVoiceDictation}
                      title={isListening ? 'Arrêter la dictée vocale' : 'Dicter votre message par reconnaissance vocale (Web Speech)'}
                      className={`absolute bottom-2.5 right-2 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer ${
                        isListening
                          ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-md shadow-rose-600/30'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300'
                      }`}
                    >
                      <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce text-white' : 'text-emerald-600'}`} />
                      <span>{isListening ? 'Arrêter' : 'Dicter'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="px-4 py-2.5 h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 self-end mb-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </div>
                {speechError && (
                  <p className="text-[10px] text-rose-600 px-1 font-semibold">
                    ⚠️ {speechError}
                  </p>
                )}
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-200 mb-2" />
              <p className="text-xs">Sélectionnez une discussion pour afficher les messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
