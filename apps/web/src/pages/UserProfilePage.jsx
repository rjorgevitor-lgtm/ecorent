import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useUserProfile } from '@/hooks/useUserProfile.js';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export default function UserProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { profile, updating, updateProfile, updatePassword } = useUserProfile(currentUser?.id);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const updateData = { ...formData };
    if (avatarFile) {
      updateData.avatar = avatarFile;
    }

    const result = await updateProfile(updateData);
    
    if (result.success) {
      toast.success('Perfil atualizado com sucesso');
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      toast.error(result.error || 'Erro ao atualizar perfil');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    const result = await updatePassword(passwordData.oldPassword, passwordData.newPassword);
    
    if (result.success) {
      toast.success('Senha alterada com sucesso');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.error || 'Erro ao alterar senha');
    }
  };

  const avatarUrl = avatarPreview || (currentUser?.avatar 
    ? pb.files.getUrl(currentUser, currentUser.avatar, { thumb: '200x200' })
    : null);

  return (
    <>
      <Helmet>
        <title>Meu perfil - EcoRent</title>
        <meta name="description" content="Gerencie suas informações de perfil no EcoRent em Curitiba." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para dashboard
              </Button>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-3xl">Meu perfil</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Curitiba, PR</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-32 h-32">
                          {avatarUrl && <AvatarImage src={avatarUrl} alt={currentUser?.name} />}
                          <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <label 
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          <Camera className="w-5 h-5" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground">Clique no ícone para alterar a foto</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(41) 99613-2257"
                        value={formData.phone}
                        onChange={handleChange}
                        className="text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Conte um pouco sobre você..."
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={updating}>
                      {updating ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alterar senha</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Senha atual</Label>
                      <Input
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        required
                        className="text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova senha</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                        className="text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                        className="text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={updating}>
                      {updating ? 'Alterando...' : 'Alterar senha'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}