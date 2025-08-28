import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Plus, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">🤖</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Вітаємо в <span className="text-primary">ROBOT</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ефективна система управління завданнями для вашої команди. 
            Організовуйте роботу, відстежуйте прогрес та досягайте результатів.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button size="lg" asChild>
              <Link href="/tasks">
                <Plus className="mr-2 h-5 w-5" />
                Почати роботу
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" asChild>
              <Link href="/tasks">
                <BarChart3 className="mr-2 h-5 w-5" />
                Переглянути завдання
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Створювати завдання</CardTitle>
            <CardDescription>
              Легко додавайте нові завдання з описом та пріоритетами
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Відстежувати прогрес</CardTitle>
            <CardDescription>
              Моніторьте статус завдань від створення до завершення
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Досягати результатів</CardTitle>
            <CardDescription>
              Завершуйте проєкти в строк та аналізуйте продуктивність
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Quick Stats */}
      <section className="bg-muted/50 rounded-2xl p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Готові розпочати?</h2>
          <p className="text-muted-foreground">
            Приєднуйтеся до тисяч команд, які вже використовують ROBOT для управління завданнями
          </p>
          <Button asChild size="lg">
            <Link href="/tasks">
              Переглянути всі завдання
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
