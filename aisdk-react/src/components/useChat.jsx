import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { CopyIcon, GlobeIcon, RefreshCcwIcon, SparklesIcon } from 'lucide-react';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { DefaultChatTransport } from 'ai';
import { Loader } from '@/components/ai-elements/loader';
import { ThemeToggle } from '@/components/ThemeToggle';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3003';

const models = [
  { name: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash' },
  { name: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-lite' },
];

const SUGGESTIONS = [
  'Explain aisdk react in simple terms',
  'Write a React custom hook',
  'Give me 5 productivity tips',
  'Summarise the history of AI',
];

const UseChat = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState(models[0].value);
  const [webSearch, setWebSearch] = useState(false);

  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_URL}/ai/chat`,
    }),
  });

  const handleSubmit = (message) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) return;
    sendMessage(
      { text: message.text || 'Please analyze and describe this file.', files: message.files },
      { body: { model, webSearch } },
    );
    setInput('');
  };

  const isEmpty = messages.length === 0;
  const isStreaming = status === 'streaming';
  const isSubmitted = status === 'submitted';

  return (
    <div className="bg-background flex h-screen w-full flex-col">
      {/* Header */}
      <header className="border-border flex shrink-0 items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="text-primary size-4" />
          <span className="text-foreground text-sm font-semibold">AI Chat</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden px-6 pb-4">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="bg-muted rounded-full p-4">
                <SparklesIcon className="text-muted-foreground size-7" />
              </div>
              <h2 className="text-foreground text-xl font-semibold">How can I help you?</h2>
              <p className="text-muted-foreground text-sm">
                Ask me anything — I'll do my best to help.
              </p>
            </div>
            <Suggestions>
              {SUGGESTIONS.map((s) => (
                <Suggestion
                  key={s}
                  suggestion={s}
                  onClick={(text) => {
                    setInput(text);
                    handleSubmit({ text });
                  }}
                />
              ))}
            </Suggestions>
          </div>
        ) : (
          <Conversation className="flex-1">
            <ConversationContent>
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'assistant' &&
                    message.parts.filter((p) => p.type === 'source-url').length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter((p) => p.type === 'source-url').length
                          }
                        />
                        {message.parts
                          .filter((p) => p.type === 'source-url')
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-src-${i}`}>
                              <Source href={part.url} title={part.url} />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}

                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <Message key={`${message.id}-${i}`} from={message.role}>
                            <MessageContent>
                              <MessageResponse>{part.text}</MessageResponse>
                            </MessageContent>
                            {message.role === 'assistant' &&
                              message.id === messages.at(-1)?.id && (
                                <MessageActions>
                                  <MessageAction onClick={() => regenerate()} label="Retry">
                                    <RefreshCcwIcon className="size-3" />
                                  </MessageAction>
                                  <MessageAction
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-3" />
                                  </MessageAction>
                                </MessageActions>
                              )}
                          </Message>
                        );

                      case 'reasoning':
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              isStreaming &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              ))}

              {isSubmitted && (
                <div className="text-muted-foreground flex items-center gap-2 py-2 text-sm">
                  <Loader size={14} />
                  <span>Thinking…</span>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}

        {/* Prompt input */}
        <PromptInput onSubmit={handleSubmit} className="mt-4 shrink-0" globalDrop multiple>
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>

          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Message AI…"
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>

              {/* <PromptInputButton
                variant={webSearch ? 'default' : 'ghost'}
                onClick={() => setWebSearch((v) => !v)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton> */}

              {/* <PromptInputSelect onValueChange={setModel} value={model}>
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {models.map((m) => (
                    <PromptInputSelectItem key={m.value} value={m.value}>
                      {m.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect> */}
            </PromptInputTools>

            <PromptInputSubmit
              disabled={!input && status !== 'streaming'}
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default UseChat;
