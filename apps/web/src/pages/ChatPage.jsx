import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Send, User, MessageSquare, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export default function ChatPage() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Fetch all conversations initially
  useEffect(() => {
    if (!currentUser) return;

    const fetchInitialData = async () => {
      try {
        const result = await pb.collection('messages').getFullList({
          filter: `sender_id="${currentUser.id}" || receiver_id="${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        });

        // Group by partner
        const partnersMap = {};
        result.forEach(msg => {
          const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
          if (!partnersMap[partnerId]) {
            partnersMap[partnerId] = msg; // Keep latest msg
          }
        });

        // Fetch partner details
        const partnerIds = Object.keys(partnersMap);
        if (partnerIds.length > 0) {
          const filterStr = partnerIds.map(id => `id="${id}"`).join(' || ');
          const users = await pb.collection('users').getFullList({ filter: filterStr, $autoCancel: false });
          
          const convos = users.map(user => ({
            partner: user,
            latestMessage: partnersMap[user.id]
          })).sort((a, b) => new Date(b.latestMessage.created) - new Date(a.latestMessage.created));
          
          setConversations(convos);
        }
      } catch (err) {
        toast.error('Erro ao carregar conversas');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser]);

  // Load messages when active partner changes
  useEffect(() => {
    if (!activePartner || !currentUser) return;

    const loadMessages = async () => {
      try {
        const msgs = await pb.collection('messages').getFullList({
          filter: `(sender_id="${currentUser.id}" && receiver_id="${activePartner.id}") || (sender_id="${activePartner.id}" && receiver_id="${currentUser.id}")`,
          sort: 'created',
          $autoCancel: false
        });
        setMessages(msgs);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    };
    
    loadMessages();

    // Subscribe to realtime messages
    pb.collection('messages').subscribe('*', function (e) {
      if (e.action === 'create') {
        const msg = e.record;
        const isRelated = (msg.sender_id === currentUser.id && msg.receiver_id === activePartner.id) || 
                          (msg.sender_id === activePartner.id && msg.receiver_id === currentUser.id);
        if (isRelated) {
          setMessages(prev => [...prev, msg]);
          scrollToBottom();
        }
      }
    });

    return () => {
      pb.collection('messages').unsubscribe('*');
    };
  }, [activePartner, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      await pb.collection('messages').create({
        sender_id: currentUser.id,
        receiver_id: activePartner.id,
        content: content
      }, { $autoCancel: false });
      // Realtime subscription will update the UI
    } catch (err) {
      toast.error('Erro ao enviar mensagem');
      setNewMessage(content); // restore on error
    }
  };

  return (
    <>
      <Helmet>
        <title>Mensagens - EcoRent</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background h-screen overflow-hidden">
        <Header />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)]">
          <div className="bg-card border border-border/50 rounded-3xl flex h-[calc(100vh-120px)] overflow-hidden shadow-sm">
            
            {/* Sidebar List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${activePartner ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-border bg-secondary/20">
                <h2 className="text-xl font-serif font-bold">Mensagens</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-muted w-1/2 rounded"></div>
                          <div className="h-3 bg-muted w-3/4 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((c) => (
                    <button
                      key={c.partner.id}
                      onClick={() => setActivePartner(c.partner)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/30 ${activePartner?.id === c.partner.id ? 'bg-secondary/40' : ''}`}
                    >
                      <Avatar className="w-12 h-12">
                        {c.partner.avatar ? (
                          <AvatarImage src={pb.files.getUrl(c.partner, c.partner.avatar, { thumb: '100x100' })} className="object-cover" />
                        ) : (
                          <AvatarFallback>{c.partner.name?.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm truncate">{c.partner.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(c.latestMessage.created), 'dd/MM', { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{c.latestMessage.content}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                    <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm">Nenhuma conversa encontrada.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-background/50 ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
              {activePartner ? (
                <>
                  <div className="p-4 border-b border-border bg-card flex items-center gap-3">
                    <button className="md:hidden p-2 -ml-2 text-muted-foreground" onClick={() => setActivePartner(null)}>
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Avatar className="w-10 h-10">
                      {activePartner.avatar ? (
                        <AvatarImage src={pb.files.getUrl(activePartner, activePartner.avatar, { thumb: '100x100' })} className="object-cover" />
                      ) : (
                        <AvatarFallback>{activePartner.name?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{activePartner.name}</h3>
                      <span className="text-xs text-emerald-500 font-medium">Online</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === currentUser.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-secondary-foreground rounded-bl-sm'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <span className={`text-[10px] block mt-1 ${isMe ? 'text-primary-foreground/70 text-right' : 'text-secondary-foreground/50'}`}>
                              {format(new Date(msg.created), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 bg-card border-t border-border">
                    <form onSubmit={handleSend} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite uma mensagem..."
                        className="rounded-full bg-secondary/30 border-transparent focus-visible:ring-primary/20"
                      />
                      <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-primary/40" />
                  </div>
                  <p>Selecione uma conversa para começar</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}