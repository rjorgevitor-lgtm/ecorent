import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { User, Mail, Phone, MapPin, Calendar, Camera, LogOut, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    password: '',
    passwordConfirm: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const record = await pb.collection('users').getOne(currentUser.id, { $autoCancel: false });
        setUser(record);
        setFormData({
          name: record.name || '',
          email: record.email || '',
          phone: record.phone || '',
          bio: record.bio || '',
          location: record.location || ''
        });
        if (record.avatar) {
          setAvatarPreview(pb.files.getUrl(record, record.avatar));
        }
      } catch (error) {
        toast.error('Erro ao carregar perfil: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchUser();
    }
  }, [currentUser?.id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('bio', formData.bio);
      data.append('location', formData.location);
      
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const updatedRecord = await pb.collection('users').update(currentUser.id, data, { $autoCancel: false });
      setUser(updatedRecord);
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.passwordConfirm) {
      toast.error('As novas senhas não coincidem.');
      return;
    }
    
    setSavingPassword(true);
    try {
      await pb.collection('users').update(currentUser.id, {
        oldPassword: passwordData.oldPassword,
        password: passwordData.password,
        passwordConfirm: passwordData.passwordConfirm
      }, { $autoCancel: false });
      
      setPasswordData({ oldPassword: '', password: '', passwordConfirm: '' });
      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      toast.error('Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Meu Perfil - EcoRent</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Sidebar */}
              <div className="w-full md:w-1/3 space-y-6">
                <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                  <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20"></div>
                  <CardContent className="px-6 pb-6 pt-0 relative">
                    <div className="flex justify-center -mt-12 mb-4">
                      <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-secondary text-2xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold">{user?.name}</h2>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      {user?.location && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-3 text-primary" />
                          {user.location}
                        </div>
                      )}
                      {user?.phone && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-4 h-4 mr-3 text-primary" />
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-3 text-primary" />
                        Membro desde {format(new Date(user?.created || Date.now()), 'MMMM yyyy', { locale: ptBR })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  variant="destructive" 
                  className="w-full rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da conta
                </Button>
              </div>

              {/* Main Content */}
              <div className="w-full md:w-2/3 space-y-8">
                
                {/* Profile Info / Edit Form */}
                <Card className="rounded-2xl border-border/50 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                    <div>
                      <CardTitle className="text-xl">Informações Pessoais</CardTitle>
                      <CardDescription>Gerencie seus dados públicos e de contato.</CardDescription>
                    </div>
                    <Button 
                      variant={isEditing ? "outline" : "default"} 
                      onClick={() => setIsEditing(!isEditing)}
                      className="rounded-xl"
                    >
                      {isEditing ? 'Cancelar' : 'Editar Perfil'}
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isEditing ? (
                      <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="flex items-center gap-6">
                          <Avatar className="w-20 h-20 border">
                            {avatarPreview ? (
                              <AvatarImage src={avatarPreview} className="object-cover" />
                            ) : (
                              <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <Label htmlFor="avatar" className="cursor-pointer inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                              <Camera className="w-4 h-4 mr-2" />
                              Alterar foto
                            </Label>
                            <Input 
                              id="avatar" 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleAvatarChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input 
                              id="name" 
                              value={formData.name} 
                              onChange={(e) => setFormData({...formData, name: e.target.value})} 
                              required 
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">E-mail (Não editável)</Label>
                            <Input 
                              id="email" 
                              value={formData.email} 
                              disabled 
                              className="rounded-xl bg-muted"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input 
                              id="phone" 
                              value={formData.phone} 
                              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Localização (Cidade, Estado)</Label>
                            <Input 
                              id="location" 
                              value={formData.location} 
                              onChange={(e) => setFormData({...formData, location: e.target.value})} 
                              className="rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Sobre mim</Label>
                          <Textarea 
                            id="bio" 
                            value={formData.bio} 
                            onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                            rows={4}
                            className="rounded-xl resize-none"
                            placeholder="Conte um pouco sobre você para outros usuários..."
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" disabled={saving} className="rounded-xl">
                            {saving ? 'Salvando...' : 'Salvar alterações'}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Nome completo</p>
                            <p className="text-foreground">{user?.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">E-mail</p>
                            <p className="text-foreground">{user?.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Telefone</p>
                            <p className="text-foreground">{user?.phone || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Localização</p>
                            <p className="text-foreground">{user?.location || 'Não informada'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Sobre mim</p>
                          <p className="text-foreground whitespace-pre-wrap">{user?.bio || 'Nenhuma biografia adicionada.'}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Security / Password */}
                <Card className="rounded-2xl border-border/50 shadow-sm">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Segurança
                    </CardTitle>
                    <CardDescription>Atualize sua senha de acesso.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="oldPassword">Senha atual</Label>
                        <Input 
                          id="oldPassword" 
                          type="password" 
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova senha</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          value={passwordData.password}
                          onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                          required
                          minLength={8}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={passwordData.passwordConfirm}
                          onChange={(e) => setPasswordData({...passwordData, passwordConfirm: e.target.value})}
                          required
                          minLength={8}
                          className="rounded-xl"
                        />
                      </div>
                      <Button type="submit" disabled={savingPassword} className="rounded-xl mt-2">
                        {savingPassword ? 'Atualizando...' : 'Atualizar senha'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}