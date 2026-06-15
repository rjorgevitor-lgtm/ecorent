import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { HelpCircle, Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient';

const faqs = [
  {
    question: "Como funciona o aluguel na EcoRent?",
    answer: "Você pesquisa o item desejado, seleciona as datas e envia um pedido de reserva. O proprietário tem até 24h para aceitar. Após a aceitação, você combina a entrega pelo chat e realiza o pagamento seguro pela plataforma."
  },
  {
    question: "O que acontece se o item for danificado?",
    answer: "O locatário é responsável por devolver o item nas mesmas condições em que o recebeu. Em caso de danos, o valor do reparo ou substituição poderá ser cobrado do locatário. Recomendamos sempre tirar fotos do item no momento da entrega e devolução."
  },
  {
    question: "Como funciona a entrega dos itens?",
    answer: "A entrega é combinada diretamente entre locador e locatário através do nosso chat. O locador é responsável pela segurança do item até que ele seja entregue em mãos ao locatário."
  },
  {
    question: "Posso cancelar uma reserva?",
    answer: "Sim, você pode cancelar gratuitamente até 48 horas antes do início do aluguel. Cancelamentos com menos de 48 horas podem estar sujeitos a uma taxa de retenção de 50% do valor."
  },
  {
    question: "Como recebo o pagamento pelos meus itens alugados?",
    answer: "Os pagamentos são processados de forma segura e liberados na sua conta bancária cadastrada 48 horas após o início bem-sucedido do período de aluguel."
  }
];

export default function HelpSupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await pb.collection('contact_support').create(formData, { $autoCancel: false });
      toast.success('Mensagem enviada com sucesso! Retornaremos em breve.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente mais tarde.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Ajuda e Suporte - EcoRent</title>
        <meta name="description" content="Encontre respostas para suas dúvidas ou entre em contato com a equipe de suporte da EcoRent." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero Section */}
        <section className="bg-secondary/30 py-16 md:py-24 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Como podemos ajudar?</h1>
            <p className="text-lg text-muted-foreground">
              Encontre respostas rápidas nas perguntas frequentes ou envie uma mensagem direta para nossa equipe.
            </p>
          </div>
        </section>

        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
              
              {/* FAQ Section */}
              <div>
                <h2 className="text-2xl font-bold mb-8">Perguntas Frequentes</h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50 py-2">
                      <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Contact Form & Info */}
              <div className="space-y-10">
                <Card className="rounded-3xl border-border/50 shadow-lg shadow-primary/5">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-6">Envie uma mensagem</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input 
                          id="name" 
                          required 
                          className="rounded-xl bg-muted/50"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          required 
                          className="rounded-xl bg-muted/50"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input 
                          id="subject" 
                          required 
                          className="rounded-xl bg-muted/50"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem</Label>
                        <Textarea 
                          id="message" 
                          required 
                          rows={5} 
                          className="rounded-xl bg-muted/50 resize-none"
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                      </div>
                      <Button type="submit" className="w-full rounded-xl h-12 text-base" disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar mensagem
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Outros canais de atendimento</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50">
                      <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone / WhatsApp</p>
                        <p className="font-medium">(41) 99613-2257</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50">
                      <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">E-mail</p>
                        <p className="font-medium">suporte@ecorent.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50">
                      <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Endereço</p>
                        <p className="font-medium">Curitiba, PR - Brasil</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}