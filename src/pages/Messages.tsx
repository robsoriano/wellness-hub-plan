import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ConversationList from "@/components/messaging/ConversationList";
import MessageThread from "@/components/messaging/MessageThread";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Messages = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) setUserName(profile.full_name);
    };

    fetchUser();
  }, [navigate]);

  const handleSelectConversation = (userId: string, name: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(name);
  };

  if (!currentUserId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userName={userName} />
      
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with your patients or nutritionist</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ConversationList
              currentUserId={currentUserId}
              onSelectConversation={handleSelectConversation}
              selectedUserId={selectedUserId}
            />
          </div>
          <div className="md:col-span-2">
            {selectedUserId ? (
              <MessageThread
                currentUserId={currentUserId}
                otherUserId={selectedUserId}
                otherUserName={selectedUserName}
              />
            ) : (
              <div className="h-[600px] border rounded-lg flex items-center justify-center text-muted-foreground">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
