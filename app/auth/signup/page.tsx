
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  normalizeEmail,
  emailErrorMessage,
  passwordErrorMessage,
  MIN_SENHA,
} from "@/lib/validation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
    password: "",
    confirmPassword: "",
  });
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession() || {};

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpa o aviso enquanto o usuário corrige o e-mail
    if (name === "email") setErroEmail(null);
  };

  // Valida o e-mail ao sair do campo, antes de o usuário chegar no botão
  const handleEmailBlur = () => {
    setErroEmail(formData.email ? emailErrorMessage(formData.email) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // --- Validações
    const emailNormalizado = normalizeEmail(formData.email);
    const problemaEmail = emailErrorMessage(emailNormalizado);
    if (problemaEmail) {
      setErroEmail(problemaEmail);
      toast.error(problemaEmail);
      setIsLoading(false);
      return;
    }

    const problemaSenha = passwordErrorMessage(formData.password);
    if (problemaSenha) {
      toast.error(problemaSenha);
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (!aceitouTermos) {
      toast.error("É preciso aceitar os Termos de Uso e a Política de Privacidade.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: emailNormalizado,
          acceptedTerms: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      toast.success("Conta criada com sucesso!");

      // Auto login after signup
      const result = await signIn("credentials", {
        email: emailNormalizado,
        password: formData.password,
        redirect: false,
      });

      if (!result?.error) {
        router.push("/dashboard");
      }
      
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-14 h-14 relative">
              <Image src="/logo-ada.png" alt="A.D.A." fill className="object-contain" />
            </div>
            <span className="font-bold text-3xl text-gray-900">A.D.A.</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
          <p className="text-gray-600 mt-2">Cadastre-se para começar a usar</p>
        </div>

        {/* Signup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="João"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Sobrenome
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Silva"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleEmailBlur}
                  required
                  disabled={isLoading}
                  aria-invalid={!!erroEmail}
                  aria-describedby={erroEmail ? "erro-email" : undefined}
                  className={erroEmail ? "border-red-500 focus-visible:ring-red-500" : undefined}
                />
                {erroEmail && (
                  <p id="erro-email" className="text-xs text-red-600 mt-1">
                    {erroEmail}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                  Profissão
                </label>
                <Input
                  id="profession"
                  name="profession"
                  placeholder="Massagista, Fisioterapeuta, etc."
                  value={formData.profession}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={MIN_SENHA}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo de {MIN_SENHA} caracteres, com pelo menos uma letra e um número.
                </p>
              </div>

              {/* Aceite dos termos — obrigatório (LGPD) */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  id="aceitouTermos"
                  name="aceitouTermos"
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  disabled={isLoading}
                  required
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="aceitouTermos" className="text-xs text-gray-600 leading-relaxed">
                  Li e aceito os{" "}
                  <Link
                    href="/termos"
                    target="_blank"
                    className="font-medium text-blue-600 hover:text-blue-500 underline"
                  >
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link
                    href="/privacidade"
                    target="_blank"
                    className="font-medium text-blue-600 hover:text-blue-500 underline"
                  >
                    Política de Privacidade
                  </Link>
                  , e autorizo o tratamento dos meus dados pessoais para criação e uso da conta,
                  conforme a Lei Geral de Proteção de Dados.
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !aceitouTermos}>
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Entre aqui
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Voltar ao início
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
