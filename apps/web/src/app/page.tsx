import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Utensils, Zap, Shield, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface to-primary/5">
        <div className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Logo and Title */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-full shadow-card mb-6">
                  <span className="text-4xl">🤖</span>
                  <span className="text-2xl absolute -top-1 -right-1">👨‍🍳</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-ink mb-4">ROBOT</h1>
                <div className="w-24 h-1 bg-primary mx-auto lg:mx-0 rounded-full"></div>
              </div>

          {/* Main Description */}
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl md:text-2xl text-ink/80 leading-relaxed mb-8">
              <strong className="text-primary">ROBOT</strong> — твій помічник у світі ресторанного бізнесу. 
            </p>
            
            <p className="text-lg md:text-xl text-ink/70 leading-relaxed">
              Це не просто софт, а цілий <span className="text-primary font-medium">цифровий асистент</span>: 
              червоний робот у кухарській шапці, який знає, як зробити замовлення зручними, 
              оплату — швидкою, а роботу персоналу — легшою.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-primary text-white rounded-lg shadow-card hover:opacity-90 text-lg px-8 py-4"
            >
              <Link href="/login">
                Увійти
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary rounded-lg hover:bg-primary/5 text-lg px-8 py-4"
              onClick={() => {
                // TODO: Add "Learn More" functionality
                console.log('Learn more clicked');
              }}
            >
              Дізнатись більше
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary rounded-lg hover:bg-primary/5 text-lg px-8 py-4"
              onClick={() => {
                // TODO: Add "How to start" functionality
                console.log('How to start clicked');
              }}
            >
              Як розпочати?
            </Button>
          </div>

          <p className="text-sm text-ink/60 mt-6">
            Авторизація через Telegram • Безпечно та швидко
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
              Чому ROBOT?
            </h2>
            <p className="text-lg text-ink/70 max-w-2xl mx-auto">
              Автоматизуйте свій ресторан з розумним асистентом
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-6 border-0 shadow-card bg-white rounded-lg hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-ink mb-2">Управління меню</h3>
                <p className="text-sm text-ink/70">
                  Легке додавання страв, категорій та цін у кілька кліків
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-card bg-white rounded-lg hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-ink mb-2">Швидкі замовлення</h3>
                <p className="text-sm text-ink/70">
                  Автоматизація процесу прийому та обробки замовлень
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-card bg-white rounded-lg hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-ink mb-2">Безпечна оплата</h3>
                <p className="text-sm text-ink/70">
                  Інтеграція з сучасними платіжними системами
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-card bg-white rounded-lg hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-ink mb-2">Легка робота</h3>
                <p className="text-sm text-ink/70">
                  Інтуїтивний інтерфейс для швидкого навчання персоналу
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-6">
              Готові розпочати?
            </h2>
            <p className="text-lg text-ink/70 mb-8">
              Приєднуйтесь до ресторанів, які вже довіряють ROBOT
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-white rounded-lg shadow-card hover:opacity-90 text-lg px-8 py-4">
                <Link href="/login">
                  Увійти в адмін-панель
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="mt-12 p-6 bg-white rounded-lg shadow-card border border-primary/20">
              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl mr-3">🤖</span>
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <p className="text-ink/70">
                <strong className="text-primary">Червоний робот у кухарській шапці</strong> вже чекає на вас!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-primary/10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-sm">🤖</span>
            </div>
            <span className="font-bold text-primary">ROBOT</span>
          </div>
          <p className="text-sm text-ink/60">
            © 2024 ROBOT. Ваш цифровий асистент ресторану.
          </p>
        </div>
      </footer>
    </div>
  );
}
