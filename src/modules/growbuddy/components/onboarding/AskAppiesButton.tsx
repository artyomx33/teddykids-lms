import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Use placeholder SVG instead of imported image
const appiesMascot = '/placeholder.svg';

export const AskAppiesButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'appies', message: string }>>([]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setConversation(prev => [...prev, { type: 'user', message: userMessage }]);
    setMessage('');

    // Simulate Appies response
    setTimeout(() => {
      const responses = [
        "Hi there! I'm Appies, your friendly guide. What can I help you with today? 🧸",
        "That's a great question! Let me help you with that. For specific procedures, check the Safety & Conduct module!",
        "Welcome to the Teddy family! If you need help with any module, just ask me and I'll point you in the right direction.",
        "Remember, at Teddy Kids, children always come first! Need help finding specific information?",
        "I'm here to help make your onboarding smooth and fun! What would you like to know more about?",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setConversation(prev => [...prev, { type: 'appies', message: randomResponse }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary shadow-elegant hover:scale-105 transition-all duration-200 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-96 bg-card border shadow-elegant z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <img src={appiesMascot} alt="Appies" className="w-8 h-8 rounded-full" />
              <div>
                <h3 className="font-semibold text-sm">Ask Appies</h3>
                <Badge variant="secondary" className="text-xs">AI Helper</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {conversation.length === 0 && (
              <div className="flex items-start gap-3">
                <img src={appiesMascot} alt="Appies" className="w-6 h-6 rounded-full mt-1" />
                <div className="bg-primary/10 rounded-lg p-3 max-w-xs">
                  <p className="text-sm">Hi! I'm Appies 🧸 Ask me anything about your onboarding!</p>
                </div>
              </div>
            )}
            
            {conversation.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.type === 'appies' && (
                  <img src={appiesMascot} alt="Appies" className="w-6 h-6 rounded-full mt-1" />
                )}
                <div className={`rounded-lg p-3 max-w-xs ${
                  msg.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-primary/10'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask Appies anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" variant="default">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
