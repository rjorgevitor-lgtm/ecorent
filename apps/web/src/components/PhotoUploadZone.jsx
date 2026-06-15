import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PhotoUploadZone({ photos, onChange, maxFiles = 5 }) {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const totalFiles = (photos?.length || 0) + files.length;

    if (totalFiles > maxFiles) {
      alert(`Você pode fazer upload de no máximo ${maxFiles} fotos`);
      return;
    }

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
    onChange([...(photos || []), ...files]);
  }, [photos, onChange, maxFiles]);

  const handleRemove = (index) => {
    const isExistingPhoto = index < (photos?.length || 0) - previews.length;
    
    if (isExistingPhoto) {
      const newPhotos = [...photos];
      newPhotos.splice(index, 1);
      onChange(newPhotos);
    } else {
      const previewIndex = index - ((photos?.length || 0) - previews.length);
      const newPreviews = [...previews];
      URL.revokeObjectURL(newPreviews[previewIndex].url);
      newPreviews.splice(previewIndex, 1);
      setPreviews(newPreviews);
      
      const newPhotos = [...photos];
      newPhotos.splice(index, 1);
      onChange(newPhotos);
    }
  };

  const totalPhotos = (photos?.length || 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos?.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
            {typeof photo === 'string' ? (
              <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
            ) : (
              <img 
                src={previews.find(p => p.file === photo)?.url} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            )}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {totalPhotos < maxFiles && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/50 hover:bg-muted">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Adicionar foto</span>
            <span className="text-xs text-muted-foreground">{totalPhotos}/{maxFiles}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      
      {totalPhotos === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/30">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma foto adicionada ainda</p>
          <p className="text-xs text-muted-foreground mt-1">Adicione até {maxFiles} fotos do item</p>
        </div>
      )}
    </div>
  );
}