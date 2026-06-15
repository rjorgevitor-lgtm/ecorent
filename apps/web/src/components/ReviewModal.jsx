import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export default function ReviewModal({ rental, isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Identify who we are reviewing
  const isOwner = currentUser.id === rental.owner_id;
  const ratedUserId = isOwner ? rental.renter_id : rental.owner_id;
  const reviewTargetRole = isOwner ? 'locatário' : 'item e proprietário';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Review
      await pb.collection('reviews').create({
        rental_id: rental.id,
        rater_id: currentUser.id,
        rated_user_id: ratedUserId,
        rating,
        comment
      }, { $autoCancel: false });

      // 2. Update Rental Status
      await pb.collection('rentals').update(rental.id, {
        status: 'Avaliado'
      }, { $autoCancel: false });

      toast.success('Avaliação enviada com sucesso!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Avaliar Experiência</DialogTitle>
          <DialogDescription>
            Como foi sua experiência com este {reviewTargetRole}? Sua opinião ajuda a comunidade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-muted-foreground/30'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground h-5">
              {rating === 1 && 'Ruim'}
              {rating === 2 && 'Regular'}
              {rating === 3 && 'Bom'}
              {rating === 4 && 'Muito Bom'}
              {rating === 5 && 'Excelente!'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Deixe um comentário (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Conte aos outros como foi..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="rounded-full">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="rounded-full">
              {loading ? 'Enviando...' : 'Enviar avaliação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}