import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { MessageSquare, Send, Search, Phone, Video, Check, CheckCheck, Pin, Loader2 } from "lucide-react";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Conversation {
  id: number; name: string; role: string; lastMessage: string; time: string; unread: number; online: boolean; avatar: string; pinned: boolean;
}

const demoConversations: Conversation[] = [
  { id: 1, name: 'إدارة بوليفارد وورلد', role: 'مدير العمليات', lastMessage: 'تم تحديث مخطط المنطقة A بنجاح', time: "10:30", unread: 2, online: true, avatar: "B", pinned: true },
  { id: 2, name: 'شركة الريادة التجارية', role: 'مستأجر وحدة B-03', lastMessage: 'نرغب بتجديد العقد 6 أشهر', time: "09:15", unread: 1, online: true, avatar: "R", pinned: true },
  { id: 3, name: 'فريق ماهام AI', role: 'شريك تقني', lastMessage: 'التقرير الشهري جاهز', time: 'أمس', unread: 0, online: false, avatar: "M", pinned: false },
  { id: 4, name: 'شركة التقنية المتقدمة', role: 'طلب حجز وحدة A-04', lastMessage: 'بانتظار الموافقة على الحجز', time: "أمس", unread: 0, online: false, avatar: "T", pinned: false },
  { id: 5, name: 'المستشار القانوني', role: 'مستشار', lastMessage: 'تمت مراجعة العقد', time: 'الأحد', unread: 0, online: true, avatar: "L", pinned: false },
];

export default function Communications() {
  const { theme } = useTheme();
  const { t, locale, isRTL } = useLanguage();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [selectedConvId, setSelectedConvId] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  const goldColor = 'var(--gold)';
  const greenColor = '#4CAF50';

  // Fetch real messages from API
  const messagesQuery = trpc.messages.list.useQuery(undefined, { enabled: !!user });
  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      messagesQuery.refetch();
      setNewMessage("");
      toast.success("تم إرسال الرسالة");
    }
  });

  // Build conversations from real messages
  const realMessages = messagesQuery.data || [];
  const conversations: Conversation[] = demoConversations;

  // Build chat messages from real data
  const chatMessages = realMessages.length > 0 ? realMessages.map((msg: any) => ({
    id: msg.id,
    sender: msg.senderId === user?.id ? "me" as const : "other" as const,
    content: msg.content,
    time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : "",
    read: msg.isRead,
    subject: msg.subject,
  })) : [
    { id: 1, sender: "other" as const, content: "السلام عليكم، أود إبلاغكم أنه تم تحديث مخطط المنطقة A حسب طلبكم", time: "10:15", read: true, subject: "" },
    { id: 2, sender: "me" as const, content: "شكراً لكم. هل تم تعديل مساحة الوحدة A-03 كما طلبنا؟", time: "10:18", read: true, subject: "" },
    { id: 3, sender: "other" as const, content: "نعم، تم توسيع المساحة إلى 50 متر مربع وتعديل التصميم الداخلي. سأرسل لكم المخطط المحدث", time: "10:22", read: true, subject: "" },
    { id: 4, sender: "other" as const, content: "تم تحديث مخطط المنطقة A بنجاح. يمكنكم مراجعته من خلال لوحة التحكم", time: "10:30", read: false, subject: "" },
    { id: 5, sender: "me" as const, content: "ممتاز. سأراجعه الآن وأعود إليكم بالملاحظات", time: "10:32", read: true, subject: "" },
  ];

  const selectedConv = conversations.find(c => c.id === selectedConvId) || conversations[0];
  const filteredConvs = conversations.filter(c => c.name.includes(search) || search === "");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMutation.mutate({ receiverId: 2, subject: "رسالة جديدة", content: newMessage });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '140px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.networking1} alt="مركز الاتصالات" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)' }} />
        </div>
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5" style={{ color: goldColor }} />
            <span className="text-[10px] font-bold tracking-[0.25em] text-white/80">COMMUNICATIONS HUB</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{t("dashboard.communications.title")}</h1>
          <p className="text-sm mt-1 text-white/60">{t('communications.directCommunication')}</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-2xl overflow-hidden nour-card" style={{ height: '500px' }}>
        {/* Conversations List */}
        <div className="lg:col-span-1 flex flex-col" style={{ borderLeft: `1px solid var(--border)` }}>
          <div className="p-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في المحادثات..."
                className="w-full pr-9 pl-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map((conv) => (
              <div key={conv.id} onClick={() => setSelectedConvId(conv.id)} className="flex items-center gap-3 p-3 cursor-pointer transition-all hover:opacity-80"
                style={{
                  background: selectedConvId === conv.id ? 'var(--gold-bg)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--gold-bg)', color: goldColor }}>{conv.avatar}</div>
                  {conv.online && <div className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full" style={{ background: greenColor, border: '2px solid var(--card)' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {conv.pinned && <Pin className="w-2.5 h-2.5" style={{ color: goldColor }} />}
                      <h3 className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{conv.name}</h3>
                    </div>
                    <span className="text-[8px] shrink-0" style={{ color: 'var(--text-secondary)' }}>{conv.time}</span>
                  </div>
                  <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-white" style={{ background: greenColor }}>{conv.unread}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--gold-bg)', color: goldColor }}>{selectedConv.avatar}</div>
                {selectedConv.online && <div className="absolute bottom-0 left-0 w-2 h-2 rounded-full" style={{ background: greenColor, border: '2px solid var(--card)' }} />}
              </div>
              <div>
                <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{selectedConv.name}</h3>
                <p className="text-[9px]" style={{ color: selectedConv.online ? greenColor : 'var(--text-secondary)' }}>{selectedConv.online ? 'متصل الآن' : 'غير متصل'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-bg)' }}>
                <Phone className="w-3.5 h-3.5" style={{ color: goldColor }} />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-bg)' }}>
                <Video className="w-3.5 h-3.5" style={{ color: goldColor }} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-[70%] rounded-xl p-3" style={{
                  background: msg.sender === 'me' ? 'var(--gold-bg)' : 'var(--background)',
                  border: '1px solid var(--border)',
                }}>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[8px]" style={{ color: 'var(--text-secondary)' }}>{msg.time}</span>
                    {msg.sender === 'me' && (msg.read ? <CheckCheck className="w-3 h-3" style={{ color: greenColor }} /> : <Check className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--border)' }}>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="اكتب رسالتك..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <button onClick={handleSend} disabled={sendMutation.isPending} className="glass-btn-gold glass-btn-ripple w-10 h-10 flex items-center justify-center !rounded-xl !p-0">
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
