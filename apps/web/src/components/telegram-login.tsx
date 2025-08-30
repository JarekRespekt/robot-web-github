'use client';

import { useEffect, useRef } from 'react';
import { useTelegramLogin } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { TelegramUser } from '@/types/robot';

interface TelegramLoginProps {
  botUsername?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth: (user: TelegramUser) => void;
    };
  }
}

export function TelegramLogin({ 
  botUsername, 
  onSuccess, 
  onError 
}: TelegramLoginProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const telegramLogin = useTelegramLogin();

  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    try {
      const response = await telegramLogin.mutateAsync(telegramUser);
      
      toast({
        title: 'Успішний вхід!',
        description: `Вітаємо, ${response.user.first_name}!`,
        variant: 'success',
      });

      onSuccess?.();
      router.push('/menu');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Помилка авторизації';
      
      toast({
        title: 'Помилка входу',
        description: errorMessage,
        variant: 'destructive',
      });

      onError?.(errorMessage);
    }
  };

  useEffect(() => {
    const telegram_bot_username = botUsername || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    
    if (!telegram_bot_username) {
      console.error('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME не встановлено');
      return;
    }

    if (!containerRef.current) return;

    // Set up global callback
    window.TelegramLoginWidget = {
      dataOnauth: handleTelegramAuth,
    };

    // Create Telegram Login Widget script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', telegram_bot_username);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
    script.setAttribute('data-request-access', 'write');

    containerRef.current.appendChild(script);

    return () => {
      // Cleanup
      if (containerRef.current && script.parentNode) {
        containerRef.current.removeChild(script);
      }
      delete window.TelegramLoginWidget;
    };
  }, [botUsername]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div ref={containerRef} className="telegram-login-widget" />
      
      {telegramLogin.isPending && (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-sm">Авторизація...</span>
        </div>
      )}
      
      <div className="text-center text-sm text-muted-foreground max-w-xs">
        <p>Для входу до адмін-панелі ROBOT використовуйте свій Telegram акаунт</p>
      </div>
    </div>
  );
}