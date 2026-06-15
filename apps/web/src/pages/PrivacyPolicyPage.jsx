import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Política de Privacidade - EcoRent</title>
        <meta name="description" content="Política de Privacidade da plataforma EcoRent. Saiba como coletamos, usamos e protegemos seus dados." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-12 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <article className="legal-prose">
              <h1>Política de Privacidade</h1>
              <p className="text-sm text-muted-foreground mb-12">Última atualização: 01 de Junho de 2026</p>

              <h2>1. Introdução</h2>
              <p>
                Bem-vindo à EcoRent. Nós respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais. 
                Esta Política de Privacidade explica como coletamos, usamos, divulgamos e salvaguardamos suas informações 
                quando você visita nosso site e utiliza nossa plataforma de aluguel de itens.
              </p>

              <h2>2. Coleta de Dados</h2>
              <p>Podemos coletar informações sobre você de várias maneiras. As informações que podemos coletar incluem:</p>
              <ul>
                <li><strong>Dados Pessoais:</strong> Nome, endereço de e-mail, número de telefone e endereço físico.</li>
                <li><strong>Dados de Transação:</strong> Histórico de aluguéis, itens anunciados e avaliações.</li>
                <li><strong>Dados de Uso:</strong> Informações sobre como você usa nosso site, incluindo endereço IP, tipo de navegador e páginas visitadas.</li>
              </ul>

              <h2>3. Uso dos Dados</h2>
              <p>Ter informações precisas sobre você nos permite fornecer uma experiência suave, eficiente e personalizada. Especificamente, podemos usar as informações coletadas para:</p>
              <ul>
                <li>Criar e gerenciar sua conta.</li>
                <li>Processar transações e enviar avisos relacionados.</li>
                <li>Melhorar nosso site e serviços.</li>
                <li>Responder a solicitações de atendimento ao cliente e fornecer suporte.</li>
                <li>Monitorar e analisar o uso e as tendências para melhorar sua experiência.</li>
              </ul>

              <h2>4. Armazenamento e Segurança de Dados</h2>
              <p>
                Usamos medidas de segurança administrativas, técnicas e físicas para ajudar a proteger suas informações pessoais. 
                Embora tenhamos tomado medidas razoáveis para proteger as informações pessoais que você nos fornece, esteja ciente 
                de que, apesar de nossos esforços, nenhuma medida de segurança é perfeita ou impenetrável.
              </p>

              <h2>5. Seus Direitos</h2>
              <p>Você tem o direito de:</p>
              <ul>
                <li>Acessar as informações pessoais que mantemos sobre você.</li>
                <li>Solicitar a correção de dados incorretos ou incompletos.</li>
                <li>Solicitar a exclusão de seus dados pessoais (sujeito a certas exceções legais).</li>
                <li>Retirar seu consentimento para o processamento de dados a qualquer momento.</li>
              </ul>

              <h2>6. Cookies e Rastreamento</h2>
              <p>
                Podemos usar cookies, web beacons, pixels de rastreamento e outras tecnologias de rastreamento no site para ajudar 
                a personalizar o site e melhorar sua experiência. Você pode configurar seu navegador para recusar todos ou alguns 
                cookies do navegador, ou para alertá-lo quando os sites definirem ou acessarem cookies.
              </p>

              <h2>7. Serviços de Terceiros</h2>
              <p>
                Podemos compartilhar suas informações com terceiros que realizam serviços para nós ou em nosso nome, incluindo 
                processamento de pagamentos, análise de dados, entrega de e-mail, serviços de hospedagem e atendimento ao cliente.
              </p>

              <h2>8. Informações de Contato</h2>
              <p>
                Se você tiver dúvidas ou comentários sobre esta Política de Privacidade, entre em contato conosco:
              </p>
              <ul>
                <li><strong>Telefone:</strong> (41) 99613-2257</li>
                <li><strong>E-mail:</strong> privacidade@ecorent.com</li>
                <li><strong>Endereço:</strong> Curitiba, PR, Brasil</li>
              </ul>
            </article>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}