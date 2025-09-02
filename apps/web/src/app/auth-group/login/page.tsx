import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TelegramLogin } from '@/components/telegram-login';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-robot-surface p-4">
      <Card className="w-full max-w-md robot-card-shadow">
        <CardHeader className="text-center space-y-4">
          {/* ROBOT Logo */}
          <div className="mx-auto w-16 h-16 bg-robot-primary rounded-robot-md flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold robot-ink">
              ROBOT Admin
            </CardTitle>
            <CardDescription className="mt-2">
              Увійдіть до адміністративної панелі ресторану
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <TelegramLogin />
          
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>Доступ тільки для авторизованих адміністраторів</p>
            <p>Ваші дані захищені та не зберігаються на сторонніх серверах</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}