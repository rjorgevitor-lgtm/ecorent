import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Termos de Serviço - EcoRent</title>
        <meta name="description" content="Termos de Serviço da plataforma EcoRent. Leia atentamente as regras e condições de uso." />
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
              <h1>Termos de Serviço</h1>
              <p className="text-sm text-muted-foreground mb-12">Última atualização: 01 de Junho de 2026</p>

              <h2>1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar a plataforma EcoRent, você concorda em cumprir e estar vinculado a estes Termos de Serviço. 
                Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
              </p>

              <h2>2. Responsabilidades do Usuário</h2>
              <p>Como usuário da EcoRent, você concorda em:</p>
              <ul>
                <li>Fornecer informações precisas, atuais e completas durante o registro.</li>
                <li>Manter a segurança de sua senha e identificação.</li>
                <li>Ser o único responsável por todas as atividades que ocorram sob sua conta.</li>
                <li>Não usar a plataforma para qualquer finalidade ilegal ou não autorizada.</li>
              </ul>

              <h2>3. Acordos e Condições de Aluguel</h2>
              <p>
                A EcoRent atua como um intermediário conectando locadores e locatários. O contrato de aluguel real é 
                diretamente entre o locador e o locatário. Ambas as partes devem concordar com os termos específicos 
                do aluguel, incluindo datas, preços e condições de entrega, antes de confirmar a transação.
              </p>

              <h2>4. Seguro e Responsabilidade por Danos</h2>
              <p>
                <strong>Atenção:</strong> Os locatários são inteiramente responsáveis pela condição do item durante o período de aluguel. 
                Qualquer dano, perda ou roubo que ocorra enquanto o item estiver em posse do locatário deverá ser ressarcido ao locador.
              </p>
              <p>
                <strong>Entrega:</strong> O locador é responsável pela entrega segura do item. Danos, furtos ou extravios que ocorram 
                durante o processo de entrega (antes de o item chegar às mãos do locatário) são de responsabilidade exclusiva do locador.
              </p>

              <h2>5. Atividades Proibidas</h2>
              <p>Você não pode acessar ou usar a plataforma para qualquer finalidade diferente daquela para a qual a disponibilizamos. Atividades proibidas incluem:</p>
              <ul>
                <li>Alugar itens ilegais, perigosos ou roubados.</li>
                <li>Assediar, intimidar ou ameaçar outros usuários.</li>
                <li>Tentar contornar as taxas da plataforma realizando transações fora do sistema.</li>
                <li>Fazer upload de vírus ou códigos maliciosos.</li>
              </ul>

              <h2>6. Processo de Resolução de Disputas</h2>
              <p>
                Em caso de disputa entre locador e locatário, encorajamos as partes a tentarem resolver o problema amigavelmente 
                através do nosso sistema de chat. Se uma resolução não puder ser alcançada, a EcoRent pode, a seu critério, 
                oferecer mediação, mas não é legalmente obrigada a resolver disputas entre usuários.
              </p>

              <h2>7. Limitação de Responsabilidade</h2>
              <p>
                A EcoRent não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, 
                incluindo perda de lucros, dados ou uso, resultantes de sua capacidade ou incapacidade de usar o serviço ou de 
                qualquer conduta de terceiros na plataforma.
              </p>

              <h2>8. Encerramento de Conta</h2>
              <p>
                Podemos encerrar ou suspender sua conta e barrar o acesso ao serviço imediatamente, sem aviso prévio ou 
                responsabilidade, sob nosso exclusivo critério, por qualquer motivo, incluindo, sem limitação, a violação dos Termos.
              </p>

              <h2>9. Informações de Contato</h2>
              <p>
                Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco:
              </p>
              <ul>
                <li><strong>Telefone:</strong> (41) 99613-2257</li>
                <li><strong>E-mail:</strong> suporte@ecorent.com</li>
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