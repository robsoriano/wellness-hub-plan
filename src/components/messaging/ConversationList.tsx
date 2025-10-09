import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Conversation = {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
};

type ConversationListProps = {
  currentUserId: string;
  onSelectConversation: (userId: string, userName: string) => void;
  selectedUserId: string | null;
};

const ConversationList = ({ currentUserId, onSelectConversation, selectedUserId }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    // Set up realtime subscription for new messages
    const channel = supabase
      .channel('conversations-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchConversations = async () => {
    try {
      // Get all messages where user is sender or receiver
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      // Group by conversation partner
      const conversationMap = new Map<string, Conversation>();

      for (const msg of messages || []) {
        const otherUserId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        
        if (!conversationMap.has(otherUserId)) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", otherUserId)
            .single();

          conversationMap.set(otherUserId, {
            userId: otherUserId,
            userName: profile?.full_name || "Unknown User",
            userEmail: profile?.email || "",
            lastMessage: msg.message,
            lastMessageTime: msg.created_at,
            unreadCount: 0,
          });
        }

        // Count unread messages
        if (msg.receiver_id === currentUserId && !msg.read) {
          const conv = conversationMap.get(otherUserId)!;
          conv.unreadCount++;
        }
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>Your conversations</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-6 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Messages will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => (
                <Button
                  key={conv.userId}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto py-4 px-6 rounded-none",
                    selectedUserId === conv.userId && "bg-muted"
                  )}
                  onClick={() => onSelectConversation(conv.userId, conv.userName)}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{conv.userName}</p>
                      {conv.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage || "No messages"}
                    </p>
                    {conv.lastMessageTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.lastMessageTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationList;
