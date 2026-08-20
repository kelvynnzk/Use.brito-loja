/**
 * Direção visual: Ateliê de Concreto — contato é um convite de ateliê, com blocos amplos,
 * texto humano e formulário que mantém o ritmo da navegação editorial.
 */
import { FormEvent } from "react";
import { ArrowUpRight, Instagram, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  /**
   * Mantém uma resposta visual imediata para o formulário institucional.
   * O envio de e-mail não foi conectado nesta versão e, por isso, nenhum dado é persistido aqui.
   */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    toast.success("Sua mensagem ficou registrada.", { description: "Este formulário é demonstrativo e ainda não envia e-mails." });
  };
  return (
    <div className="atelier-page bg-[#f4efe7] px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <div className="mx-auto max-w-[1440px]"><span className="atelier-coordinate right-5 top-8 md:right-10">05 / DIÁLOGO</span><div className="grid gap-10 border-b border-[#241c18]/15 pb-12 md:grid-cols-[1fr_.85fr] md:items-end"><div><p className="eyebrow">Fale com o ateliê</p><h1 className="display-font mt-3 max-w-xl text-6xl leading-[.93] tracking-[-0.05em] md:text-8xl">A conversa também faz parte do vestir.</h1></div><p className="max-w-md text-base leading-7 text-[#241c18]/70">Tem uma dúvida sobre tamanhos, combinações ou pedidos? Escreva para a gente. A boa escolha começa com uma escuta atenta.</p></div><div className="grid gap-12 py-14 md:grid-cols-[.8fr_1.2fr] md:gap-20"><section className="space-y-9"><div className="relative overflow-hidden border border-[#241c18]/15"><img src="/manus-storage/use-brito-boutique-space_2c021d4a.jpg" alt="Interior de uma boutique clara" className="aspect-[16/8] w-full object-cover" /><span className="atelier-coordinate bottom-3 left-3 bg-[#f4efe7]/90 px-2 py-1">BASE / ATELIÊ</span></div><div><p className="eyebrow">Canais</p><a href="#" className="mt-3 flex items-center justify-between border-b border-[#241c18]/15 pb-3 text-lg font-semibold transition-colors hover:text-[#b84c33]"><span className="inline-flex items-center gap-2"><MessageCircle size={18} /> WhatsApp</span><ArrowUpRight size={18} /></a><a href="#" className="mt-3 flex items-center justify-between border-b border-[#241c18]/15 pb-3 text-lg font-semibold transition-colors hover:text-[#b84c33]"><span className="inline-flex items-center gap-2"><Instagram size={18} /> Instagram</span><ArrowUpRight size={18} /></a></div><div><p className="eyebrow">Disponibilidade</p><p className="mt-3 text-sm leading-6 text-[#241c18]/70">Atendimento de segunda a sexta, das 10h às 18h. As mensagens recebidas fora desse período entram na próxima rota de resposta.</p></div><div className="border-l-2 border-[#b84c33] pl-4"><p className="text-sm font-semibold">Escolha seu tamanho, o resto a gente resolve.</p></div></section><form onSubmit={submit} className="relative bg-[#ede4da] p-6 md:p-9"><img src="/manus-storage/use-brito-mark_b2bb36b9.png" alt="" className="absolute right-7 top-7 h-10 w-10 opacity-20" /><p className="eyebrow">Escreva para nós</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><ContactField label="Seu nome" name="name" required /><ContactField label="Seu e-mail" name="email" type="email" required /><ContactField label="Assunto" name="subject" required className="sm:col-span-2" /><label className="sm:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#241c18]/60">Mensagem</span><textarea name="message" required rows={6} className="w-full resize-none border border-[#241c18]/20 bg-transparent p-3 text-sm outline-none focus:border-[#b84c33]" /></label></div><button className="btn-primary mt-7"><Send size={16} /> Enviar mensagem</button></form></div></div>
    </div>
  );
}

/** Campo reutilizável para manter rótulos, acessibilidade e estilo do formulário consistentes. */
function ContactField({ label, name, className = "", type = "text", required = false }: { label: string; name: string; className?: string; type?: string; required?: boolean }) {
  return <label className={className}><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#241c18]/60">{label}</span><input name={name} type={type} required={required} className="h-12 w-full border border-[#241c18]/20 bg-transparent px-3 text-sm outline-none focus:border-[#b84c33]" /></label>;
}
