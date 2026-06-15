import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PhotoUploadZone from '@/components/PhotoUploadZone.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const categories = [
  'Bicicletas',
  'Ferramentas',
  'Equipamentos esportivos',
  'Camping',
  'Eletrônicos',
  'Videogames',
  'Roupas',
  'Fantasias',
  'Instrumentos musicais',
  'Itens para festas',
  'Veículos',
  'Utensílios domésticos',
  'Equipamentos de fotografia'
];

const conditions = ['Novo', 'Como novo', 'Bom', 'Razoável'];
const statuses = ['Disponível', 'Indisponível', 'Alugado'];

export default function ListingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    daily_price: '',
    status: 'Disponível',
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const item = await pb.collection('items').getOne(id, { $autoCancel: false });
      
      if (item.owner_id !== currentUser.id) {
        toast.error('Você não tem permissão para editar este anúncio');
        navigate('/my-listings');
        return;
      }

      const existingPhotos = item.photos?.map(photo => pb.files.getUrl(item, photo)) || [];
      
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        daily_price: item.daily_price.toString(),
        status: item.status,
        photos: existingPhotos
      });
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('Erro ao carregar anúncio');
      navigate('/my-listings');
    } finally {
      setFetchingItem(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotosChange = (photos) => {
    setFormData(prev => ({ ...prev, photos }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('daily_price', parseFloat(formData.daily_price));
      data.append('status', formData.status);
      data.append('owner_id', currentUser.id);

      formData.photos.forEach((photo) => {
        if (photo instanceof File) {
          data.append('photos', photo);
        }
      });

      if (isEditMode) {
        await pb.collection('items').update(id, data, { $autoCancel: false });
        toast.success('Anúncio atualizado com sucesso');
      } else {
        await pb.collection('items').create(data, { $autoCancel: false });
        toast.success('Anúncio criado com sucesso');
      }

      navigate('/my-listings');
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(isEditMode ? 'Erro ao atualizar anúncio' : 'Erro ao criar anúncio');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingItem) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${isEditMode ? 'Editar' : 'Criar'} anúncio - EcoRent`}</title>
        <meta name="description" content={`${isEditMode ? 'Edite' : 'Crie'} seu anúncio de item para aluguel no EcoRent.`} />
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
              <Button variant="ghost" onClick={() => navigate('/my-listings')} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para meus anúncios
              </Button>

              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">
                    {isEditMode ? 'Editar anúncio' : 'Criar novo anúncio'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do anúncio</Label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="Ex: Bicicleta mountain bike aro 29"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Descreva o item em detalhes..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                          <SelectTrigger id="category" className="text-foreground">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="condition">Condição</Label>
                        <Select value={formData.condition} onValueChange={(value) => handleSelectChange('condition', value)}>
                          <SelectTrigger id="condition" className="text-foreground">
                            <SelectValue placeholder="Selecione a condição" />
                          </SelectTrigger>
                          <SelectContent>
                            {conditions.map(condition => (
                              <SelectItem key={condition} value={condition}>
                                {condition}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="daily_price">Preço por dia (R$)</Label>
                        <Input
                          id="daily_price"
                          name="daily_price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.daily_price}
                          onChange={handleChange}
                          required
                          className="text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                          <SelectTrigger id="status" className="text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map(status => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Fotos do item (máximo 5)</Label>
                      <PhotoUploadZone photos={formData.photos} onChange={handlePhotosChange} maxFiles={5} />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? 'Salvando...' : isEditMode ? 'Atualizar anúncio' : 'Criar anúncio'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => navigate('/my-listings')}>
                        Cancelar
                      </Button>
                    </div>
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